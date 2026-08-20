import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { getEditInstruction, getEditPrompt, getSegmentPrompt, getMetaPrompt, getEditLanguageLock } from "@/lib/promptConfig";
import {
  mergeBudgetReductionWithAiExplanations,
  parseBudgetReductionPercent,
} from "@/lib/budgetOptimize";
import {
  mergeSwotPreservingExplanations,
  normalizePlanResult,
  planNeedsExplanationFill,
} from "@/lib/normalizePlanResult";
import { fillMissingPlanExplanations } from "@/lib/fillMissingPlanExplanations";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { isAdminEmail } from "@/lib/adminEmails";
import {
  FREE_TONE_EDIT_LIMIT,
  isFreeToneKey,
  isProToneKey,
  normalizeToneKey,
} from "@/lib/toneQuota";
import { consumeRateLimit } from "@/lib/apiRateLimit";
import { hasUnlimitedProEdits, proPackLimitMessage } from "@/lib/proPackQuota";
import {
  consumeProPackEditQuotas,
  ensureLegacyProPackQuotas,
  proPackConsumeForEdit,
  refundProPackEditQuotas,
  type ProPackConsumeKind,
} from "@/lib/proPackQuotaAdmin";

export const maxDuration = 60;

const apiKey = process.env.GEMINI_API_KEY?.trim() || "";
const ai = new GoogleGenAI({ apiKey });

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const HOUR_MS = 60 * 60 * 1000;

const PRO_EDIT_ACTIONS = new Set([
  "eu_funds_optimization",
  "investor_ready",
  "optimize_budget",
  "add_sections",
  "shorten_for_export",
]);

const ALLOWED_EDIT_ACTIONS = new Set([
  ...PRO_EDIT_ACTIONS,
  "professional_tone",
]);

type EditAuthOk = {
  uid: string;
  refundFreeTone: boolean;
  packConsume: ProPackConsumeKind;
};

function hasStandardEntitlement(data: any, email?: string | null): boolean {
  return !!(
    isAdminEmail(email) ||
    data?.isPaid ||
    data?.standardPackageActive ||
    data?.promoCodeUnlocked ||
    data?.subscriptionActive ||
    data?.euFundsUnlocked ||
    data?.promoCodeTier === "standard" ||
    data?.promoCodeTier === "eu-funds" ||
    data?.promoCodeTier === "full-access"
  );
}

function hasProEntitlement(data: any, email?: string | null): boolean {
  return !!(
    isAdminEmail(email) ||
    data?.subscriptionActive ||
    data?.euFundsUnlocked ||
    data?.promoCodeTier === "eu-funds" ||
    data?.promoCodeTier === "full-access"
  );
}

type Locale = "ro" | "en" | "es";

/**
 * Bearer required — no guest edits.
 * Free tones: formal|creative + server freeToneEditCount (Standard+ skips).
 * Pro tones / tools → Pro pack quotas (unless subscription unlimited).
 */
async function assertEditEntitlement(
  req: NextRequest,
  action: string,
  customStyle: string | undefined,
  isCombine: boolean,
  locale: Locale
): Promise<NextResponse | EditAuthOk> {
  if (!ALLOWED_EDIT_ACTIONS.has(action)) {
    return NextResponse.json(
      { error: "Forbidden", code: "UNKNOWN_ACTION" },
      { status: 403 }
    );
  }

  if (action === "professional_tone" && !normalizeToneKey(customStyle)) {
    return NextResponse.json(
      { error: "Invalid tone", code: "UNKNOWN_TONE" },
      { status: 400 }
    );
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Unauthorized", code: "AUTH_REQUIRED" },
      { status: 401 }
    );
  }

  try {
    const decoded = await adminAuth.verifyIdToken(authHeader.substring(7));
    const uid = decoded.uid;
    const adminUser = isAdminEmail(decoded.email);
    const needsPro =
      PRO_EDIT_ACTIONS.has(action) ||
      (action === "professional_tone" && isProToneKey(customStyle));
    const isFreeTone =
      action === "professional_tone" && isFreeToneKey(customStyle);

    if (
      !adminUser &&
      !(await consumeRateLimit(`edit:user:${uid}`, needsPro ? 40 : 20, HOUR_MS))
    ) {
      return NextResponse.json(
        { error: "Too many requests", code: "RATE_LIMIT" },
        { status: 429 }
      );
    }

    const userRef = adminDb.collection("users").doc(uid);
    const userDoc = await userRef.get();
    let data = userDoc.exists ? userDoc.data() : {};
    data = await ensureLegacyProPackQuotas(uid, data || {});

    const unlimitedEdits = hasUnlimitedProEdits({
      isAdmin: adminUser,
      subscriptionActive: !!data?.subscriptionActive,
    });

    // Combine on one-time Pro pack always counts toward Combine quota
    const packConsume = proPackConsumeForEdit({
      needsProEdit: needsPro,
      isCombine: isCombine && !!data?.euFundsUnlocked && !unlimitedEdits,
      unlimited: unlimitedEdits,
    });

    // Standard Combine (no Pro pack): allow free-tone combine without pack counters
    if (isCombine && !data?.euFundsUnlocked && !unlimitedEdits && !needsPro) {
      // formal/creative combine under Standard — no pack consume
    } else if (isCombine && !hasProEntitlement(data, decoded.email) && needsPro) {
      return NextResponse.json(
        { error: "Forbidden", code: "PRO_REQUIRED" },
        { status: 403 }
      );
    }

    if (needsPro) {
      if (!hasProEntitlement(data, decoded.email)) {
        return NextResponse.json(
          { error: "Forbidden", code: "PRO_REQUIRED" },
          { status: 403 }
        );
      }
      try {
        await consumeProPackEditQuotas(uid, packConsume);
      } catch (e: any) {
        const code = e?.message;
        if (code === "PRO_PACK_EDIT_LIMIT" || code === "PRO_PACK_COMBINE_LIMIT") {
          return NextResponse.json(
            {
              error:
                code === "PRO_PACK_COMBINE_LIMIT"
                  ? proPackLimitMessage(locale, "combine")
                  : proPackLimitMessage(locale, "edit"),
              code,
            },
            { status: 403 }
          );
        }
        throw e;
      }
      return { uid, refundFreeTone: false, packConsume };
    }

    // Free/Standard tone — optional Combine consume for Pro pack users
    if (isCombine && packConsume.consumeCombine) {
      try {
        await consumeProPackEditQuotas(uid, {
          consumeEdit: false,
          consumeCombine: true,
        });
      } catch (e: any) {
        if (e?.message === "PRO_PACK_COMBINE_LIMIT") {
          return NextResponse.json(
            {
              error: proPackLimitMessage(locale, "combine"),
              code: "PRO_PACK_COMBINE_LIMIT",
            },
            { status: 403 }
          );
        }
        throw e;
      }
      if (isFreeTone && !hasStandardEntitlement(data, decoded.email)) {
        // still need free tone quota for free users who somehow combine — rare
      } else {
        return {
          uid,
          refundFreeTone: false,
          packConsume: { consumeEdit: false, consumeCombine: true },
        };
      }
    }

    if (isFreeTone && !hasStandardEntitlement(data, decoded.email)) {
      try {
        await adminDb.runTransaction(async (tx: any) => {
          const snap = await tx.get(userRef);
          const d = snap.exists ? snap.data() || {} : {};
          const count =
            typeof d.freeToneEditCount === "number" ? d.freeToneEditCount : 0;
          if (count >= FREE_TONE_EDIT_LIMIT) throw new Error("TONE_LIMIT");
          tx.set(
            userRef,
            {
              freeToneEditCount: count + 1,
              email: decoded.email || d.email || null,
            },
            { merge: true }
          );
        });
        return {
          uid,
          refundFreeTone: true,
          packConsume: { consumeEdit: false, consumeCombine: false },
        };
      } catch (e: any) {
        if (e?.message === "TONE_LIMIT") {
          return NextResponse.json(
            { error: "Tone limit reached", code: "TONE_LIMIT" },
            { status: 403 }
          );
        }
        throw e;
      }
    }

    return {
      uid,
      refundFreeTone: false,
      packConsume: { consumeEdit: false, consumeCombine: false },
    };
  } catch (err) {
    console.error("[edit] auth/entitlement failed:", err);
    return NextResponse.json(
      { error: "Unauthorized", code: "AUTH_REQUIRED" },
      { status: 401 }
    );
  }
}

async function refundFreeToneEdit(uid: string) {
  try {
    const userRef = adminDb.collection("users").doc(uid);
    await adminDb.runTransaction(async (tx: any) => {
      const snap = await tx.get(userRef);
      if (!snap.exists) return;
      const count = snap.data()?.freeToneEditCount || 0;
      tx.update(userRef, { freeToneEditCount: Math.max(0, count - 1) });
    });
  } catch (e) {
    console.warn("[edit] free-tone refund failed:", e);
  }
}

// Returns only the subset of the plan needed for a given action
function extractRelevantSection(result: any, action: string) {
  switch (action) {
    case "optimize_budget":
      return { plan_financiar: result.plan_financiar };
      case "professional_tone":
      case "eu_funds_optimization":
      case "investor_ready":
        return {
          viziune_strategie: result.viziune_strategie,
          analiza_pietei: result.analiza_pietei,
          plan_operational: result.plan_operational,
          plan_financiar: { strategie_financiara: result.plan_financiar?.strategie_financiara },
          analiza_swot: result.analiza_swot,
        };
    case "shorten_for_export":
      return {
        viziune_strategie: result.viziune_strategie,
        analiza_pietei: result.analiza_pietei,
        analiza_swot: result.analiza_swot,
        plan_operational: result.plan_operational,
        plan_financiar: { strategie_financiara: result.plan_financiar?.strategie_financiara },
      };
    case "add_sections":
      return {
        nume_afacere: result.nume_afacere,
        viziune_strategie: result.viziune_strategie
      };
    default:
      return result;
  }
}

export async function POST(req: NextRequest) {
  let authOk: EditAuthOk | null = null;
  try {
    const {
      result,
      action,
      customStyle,
      targetSection,
      locale: rawLocale,
      isRetry,
      currency,
      isCombine,
    } = await req.json();

    const locale: Locale =
      rawLocale === "en" || rawLocale === "es" ? rawLocale : "ro";

    const entitlement = await assertEditEntitlement(
      req,
      action,
      customStyle,
      !!isCombine,
      locale
    );
    if (entitlement instanceof NextResponse) return entitlement;
    authOk = entitlement;

    const isEn = locale === "en" || locale === "es";
    let instruction = getEditInstruction(action, locale, customStyle, targetSection, currency);
    instruction += "\n\n" + getEditLanguageLock(locale || "ro");


    if (isRetry) {
      if (locale === "en") {
        instruction += "\nCRITICAL RETRY LIMIT: Minimize information density. For each section, write only 1 short paragraph (max 2 sentences). Do not generate detailed bullet points or long structural narratives. Keep it ultra-condensed to process instantly.";
      } else if (locale === "es") {
        instruction += "\nLÍMITE CRÍTICO DE REINTENTO: Minimice la densidad de información. Para cada sección, escriba solo 1 párrafo corto (máx. 2 oraciones). No genere explicaciones detalladas. Manténgalo ultra condensado para procesarlo al instante.";
      } else {
        instruction += "\nLIMITARE CRITICĂ REÎNCEARCARE: Minimizează densitatea de informații. Pentru fiecare secțiune, scrie doar 1 singur paragraf scurt (maximum 2 propoziții). Nu genera liste detaliate sau narațiuni lungi. Păstrează conținutul ultra-concis pentru procesare instantanee.";
      }
    }

    // Use only the relevant section for most actions to reduce token usage
    const inputData = extractRelevantSection(result, action);

    const prompt = getEditPrompt(locale, inputData, instruction);

    const callGemini = async (sysPrompt: string) => {
      let retries = 3;
      while (retries > 0) {
        try {
          const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: sysPrompt,
            config: { responseMimeType: "application/json" }
          });
          return response.text || "";
        } catch (e: any) {
          console.error(`Eroare Gemini:`, e.message);
          retries--;
          if (retries === 0) throw e;
          await sleep(1500);
        }
      }
      return "";
    };

    const cleanJsonString = (raw: string) => {
      let t = raw.replace(/^```(json)?\n?/i, '').replace(/\n?```$/i, '').trim();
      const firstBrace = t.indexOf('{');
      const lastBrace = t.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace >= firstBrace) {
        t = t.substring(firstBrace, lastBrace + 1);
      }
      t = t.replace(/,\s*([}\]])/g, '$1');
      t = t.replace(/"((?:[^"\\]|\\.)*)"/g, (_match: string, inner: string) => {
        return '"' + inner.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t') + '"';
      });
      return t;
    };

    let parsed: any = {};
    const isBigAction = action === "eu_funds_optimization" || action === "investor_ready" || action === "professional_tone";

    if (isBigAction) {
      const pViziune = { viziune_strategie: result.viziune_strategie };
      const pPiata = { analiza_pietei: result.analiza_pietei };
      const pOperational = { plan_operational: result.plan_operational };
      const pSwot = { analiza_swot: result.analiza_swot };
      const pFinanciar = { plan_financiar: { strategie_financiara: result.plan_financiar?.strategie_financiara } };

      const buildPrompt = (segment: any) => getSegmentPrompt(locale, segment, instruction);
      const buildMetaPrompt = () => getMetaPrompt(locale, result);

      const [resViz, resPiata, resOp, resSwot, resFin] = await Promise.all([
        callGemini(buildPrompt(pViziune)).catch(e => { console.error("Edit segment Viz failed:", e); return ""; }),
        callGemini(buildPrompt(pPiata)).catch(e => { console.error("Edit segment Piata failed:", e); return ""; }),
        callGemini(buildPrompt(pOperational)).catch(e => { console.error("Edit segment Op failed:", e); return ""; }),
        callGemini(buildPrompt(pSwot)).catch(e => { console.error("Edit segment Swot failed:", e); return ""; }),
        callGemini(buildPrompt(pFinanciar)).catch(e => { console.error("Edit segment Fin failed:", e); return ""; })
      ]);
      const resMeta = ""; // We no longer call buildMetaPrompt for tone rewrites to save tokens and prevent budget loss
      
      const txtViz = cleanJsonString(resViz);
      const txtPiata = cleanJsonString(resPiata);
      const txtOp = cleanJsonString(resOp);
      const txtSwot = cleanJsonString(resSwot);
      const txtFin = cleanJsonString(resFin);
      const txtMeta = cleanJsonString(resMeta);

      let parsedViz: any = {};
      try { if (txtViz) parsedViz = JSON.parse(txtViz); } catch (e) { console.error("Error parsing Viz:", e, txtViz); }
      let parsedPiata: any = {};
      try { if (txtPiata) parsedPiata = JSON.parse(txtPiata); } catch (e) { console.error("Error parsing Piata:", e, txtPiata); }
      let parsedOp: any = {};
      try { if (txtOp) parsedOp = JSON.parse(txtOp); } catch (e) { console.error("Error parsing Op:", e, txtOp); }
      let parsedSwot: any = {};
      try { if (txtSwot) parsedSwot = JSON.parse(txtSwot); } catch (e) { console.error("Error parsing Swot:", e, txtSwot); }
      let parsedFin: any = {};
      try { if (txtFin) parsedFin = JSON.parse(txtFin); } catch (e) { console.error("Error parsing Fin:", e, txtFin); }
      let parsedMeta: any = {};
      try { if (txtMeta) parsedMeta = JSON.parse(txtMeta); } catch (e) { console.error("Error parsing Meta:", e, txtMeta); }

      parsed = {
        nume: parsedMeta.nume || result.nume,
        slogan: parsedMeta.slogan || result.slogan,
        date_generale: parsedMeta.date_generale || result.date_generale,
        viziune_strategie: Object.keys(parsedViz).length > 0 ? (parsedViz.viziune_strategie || parsedViz) : {},
        analiza_pietei: Object.keys(parsedPiata).length > 0 ? (parsedPiata.analiza_pietei || parsedPiata) : {},
        plan_operational: Object.keys(parsedOp).length > 0 ? (parsedOp.plan_operational || parsedOp) : {},
        analiza_swot: Object.keys(parsedSwot).length > 0 ? (parsedSwot.analiza_swot || parsedSwot) : {},
        plan_financiar: {
          ...result.plan_financiar,
          strategie_financiara: Object.keys(parsedFin).length > 0
            ? (typeof (parsedFin.plan_financiar?.strategie_financiara || parsedFin.strategie_financiara) === 'string'
                ? (parsedFin.plan_financiar?.strategie_financiara || parsedFin.strategie_financiara)
                : result.plan_financiar?.strategie_financiara)
            : result.plan_financiar?.strategie_financiara,
          buget_investitii: (Array.isArray(parsedMeta.buget_investitii) && parsedMeta.buget_investitii.length > 0) ? parsedMeta.buget_investitii : (result.plan_financiar?.buget_investitii || [])
        }
      };

      const successCount = [parsedViz, parsedPiata, parsedOp, parsedSwot, parsedFin, parsedMeta].filter(p => Object.keys(p).length > 0).length;
      if (successCount === 0) {
        if (authOk?.refundFreeTone) await refundFreeToneEdit(authOk.uid);
        if (authOk?.packConsume) await refundProPackEditQuotas(authOk.uid, authOk.packConsume);
        return NextResponse.json({ error: "Sistemul a returnat un răspuns nevalid sau gol. Te rugăm să încerci din nou." }, { status: 400 });
      }
    } else {
      const res = await callGemini(prompt);
      const text = cleanJsonString(res);
      
      try {
        parsed = JSON.parse(text);
      } catch (parseErr: any) {
        if (parseErr.message.includes('Unexpected non-whitespace character') || parseErr.message.includes('Unexpected token')) {
          try {
            const arrayFixed = '[' + text.replace(/\}\s*\{/g, '},{').replace(/\]\s*\[/g, '],[') + ']';
            const parsedArray = JSON.parse(arrayFixed);
            if (Array.isArray(parsedArray) && parsedArray.length > 0) {
              parsed = parsedArray[0];
            } else {
              throw parseErr;
            }
          } catch {
            console.error("JSON PARSE ERROR:", parseErr, text);
            if (authOk?.refundFreeTone) await refundFreeToneEdit(authOk.uid);
            if (authOk?.packConsume) await refundProPackEditQuotas(authOk.uid, authOk.packConsume);
            return NextResponse.json({ error: "Eroare formatare: " + parseErr.message + "\n\nFragment primit: " + text.substring(0, 150) }, { status: 400 });
          }
        } else {
          console.error("JSON PARSE ERROR:", parseErr, text);
          if (authOk?.refundFreeTone) await refundFreeToneEdit(authOk.uid);
          if (authOk?.packConsume) await refundProPackEditQuotas(authOk.uid, authOk.packConsume);
          return NextResponse.json({ error: "Eroare formatare: " + parseErr.message + "\n\nFragment primit: " + text.substring(0, 150) }, { status: 400 });
        }
      }
      
      // Safety checks for add_sections in case Gemini returns an array or raw object
      if (action === "add_sections") {
        if (Array.isArray(parsed)) {
          parsed = { sectiuni_aditionale: parsed };
        } else if (parsed.titlu && parsed.continut) {
          parsed = { sectiuni_aditionale: [parsed] };
        } else if (parsed.sectiuni_aditionale && !Array.isArray(parsed.sectiuni_aditionale)) {
          parsed.sectiuni_aditionale = [parsed.sectiuni_aditionale];
        } else if (!parsed.sectiuni_aditionale) {
          for (const key of Object.keys(parsed)) {
            if (Array.isArray(parsed[key])) {
              parsed = { sectiuni_aditionale: parsed[key] };
              break;
            }
          }
        }
      }
    }

      let mergedResult = { ...result, ...parsed };
      if (parsed.plan_financiar) mergedResult.plan_financiar = { ...result.plan_financiar, ...parsed.plan_financiar };
      if (parsed.analiza_swot) mergedResult.analiza_swot = { ...result.analiza_swot, ...parsed.analiza_swot };
      if (parsed.viziune_strategie) mergedResult.viziune_strategie = { ...result.viziune_strategie, ...parsed.viziune_strategie };
      if (parsed.analiza_pietei) mergedResult.analiza_pietei = { ...result.analiza_pietei, ...parsed.analiza_pietei };
      if (parsed.plan_operational) mergedResult.plan_operational = { ...result.plan_operational, ...parsed.plan_operational };
      if (parsed.sectiuni_aditionale) {
        mergedResult.sectiuni_aditionale = result.sectiuni_aditionale 
          ? [...result.sectiuni_aditionale, ...parsed.sectiuni_aditionale]
          : parsed.sectiuni_aditionale;
      }

      // Deterministic budget math — never trust Gemini for the percentage cut
      if (action === "optimize_budget") {
        const percent = parseBudgetReductionPercent(targetSection);
        if (percent) {
          const planCurrency =
            currency ||
            result?.selectedCurrency ||
            (locale === "en" || locale === "es" ? "EUR" : "RON");
          const originalItems = result?.plan_financiar?.buget_investitii;
          const aiItems = mergedResult?.plan_financiar?.buget_investitii;
          mergedResult.plan_financiar = {
            ...mergedResult.plan_financiar,
            buget_investitii: mergeBudgetReductionWithAiExplanations(
              originalItems,
              aiItems,
              percent,
              locale || "ro",
              planCurrency
            ),
          };
        }
      }

      // Language-safe normalize + never wipe SWOT explanations on rewrite tools
      mergedResult = normalizePlanResult(mergedResult);
      if (result?.analiza_swot && mergedResult?.analiza_swot) {
        mergedResult.analiza_swot = mergeSwotPreservingExplanations(
          result.analiza_swot,
          mergedResult.analiza_swot
        );
      }
      if (planNeedsExplanationFill(mergedResult)) {
        mergedResult = await fillMissingPlanExplanations(
          mergedResult,
          (locale === "en" || locale === "es" ? locale : "ro") as "ro" | "en" | "es",
          45000
        );
      }

    return NextResponse.json({ 
      updatedResult: JSON.stringify(mergedResult),
      editedPlan: mergedResult
    });
  } catch (error: any) {
    console.error("Error editing content:", error);
    if (authOk?.refundFreeTone) await refundFreeToneEdit(authOk.uid);
    if (authOk?.packConsume) await refundProPackEditQuotas(authOk.uid, authOk.packConsume);

    const isServiceUnavailable = error?.status === 503 || error?.message?.includes('503') || error?.message?.includes('UNAVAILABLE');
    const isRateLimited = error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('RESOURCE_EXHAUSTED');

    let errorMessage = "Nu s-a putut edita documentul. Te rugăm să încerci din nou.";
    let statusCode = 500;

    if (isServiceUnavailable) {
      errorMessage = "Sistemul este momentan solicitat. Te rugăm să încerci din nou.";
      statusCode = 503;
    } else if (isRateLimited) {
      errorMessage = "Limită de utilizare depășită. Te rugăm să aștepți un minut.";
      statusCode = 429;
    }

    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}