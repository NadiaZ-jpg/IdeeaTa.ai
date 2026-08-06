/**
 * Normalize AI-generated business plan payloads so EditForm / exports
 * always see canonical Romanian keys (titlu, explicatie_tehnica, explicatie).
 * Models often invent aliases (ES/EN) or omit fields on later array items.
 */

function firstNonEmptyString(...candidates: unknown[]): string {
  for (const c of candidates) {
    if (c === null || c === undefined) continue;
    if (typeof c === "object") {
      const vals = Object.values(c as object);
      if (vals.length > 0) {
        const nested = firstNonEmptyString(vals[0]);
        if (nested) return nested;
      }
      continue;
    }
    const s = String(c).trim();
    if (s) return s;
  }
  return "";
}

export function getSwotItemExplanation(item: any): string {
  if (!item || typeof item === "string") return "";
  return firstNonEmptyString(
    item.explicatie_tehnica,
    item.explicacion_tecnica,
    item.explicacion,
    item.explicatie,
    item.descripcion,
    item.descriere,
    item.description,
    item.detalii,
    item.details,
    item.texto,
    item.text
  );
}

export function getBudgetItemExplanation(item: any): string {
  if (!item || typeof item !== "object") return "";
  return firstNonEmptyString(
    item.explicatie,
    item.detalii,
    item.justificare,
    item.justificacion,
    item.justification,
    item.descripcion,
    item.descriere,
    item.description,
    item.necesitate,
    item.necesidad,
    item.reason,
    item.motivacion
  );
}

function normalizeSwotItem(item: any): { titlu: string; explicatie_tehnica: string } {
  if (item === null || item === undefined) {
    return { titlu: "", explicatie_tehnica: "" };
  }
  if (typeof item === "string") {
    return { titlu: item, explicatie_tehnica: "" };
  }

  const titlu = firstNonEmptyString(
    item.titlu,
    item.titulo,
    item.title,
    item.name,
    item.nume
  );

  return { titlu, explicatie_tehnica: getSwotItemExplanation(item) };
}

function normalizeBudgetItem(item: any): any {
  if (!item || typeof item !== "object") return item;

  const explicatie = getBudgetItemExplanation(item);
  const cost = firstNonEmptyString(item.cost, item.coste, item.precio, item.price, item.suma);
  const name = firstNonEmptyString(item.item, item.nume, item.nombre, item.name, item.titlu, item.titulo);

  return {
    ...item,
    item: name || item.item || "",
    cost: cost || item.cost || "",
    explicatie,
  };
}

function normalizeSwotCategory(arr: unknown): Array<{ titlu: string; explicatie_tehnica: string }> | unknown {
  if (!Array.isArray(arr)) return arr;
  return arr.map(normalizeSwotItem);
}

const SWOT_KEYS = ["puncte_tari", "puncte_forte", "puncte_slabe", "oportunitati", "amenintari"] as const;

/** Canonical operational keys + common ES/EN aliases the model invents. */
const OPERATIONAL_FIELD_ALIASES: Record<string, string[]> = {
  descriere_flux: [
    "descriere_flux",
    "descripcion_flujo",
    "descripcion_del_flujo",
    "flujo_operativo",
    "flujo_tecnologico",
    "workflow",
    "workflow_description",
    "operations_description",
    "descripcion_operaciones",
  ],
  resurse_umane: [
    "resurse_umane",
    "recursos_humanos",
    "recursos_humanos_organigrama",
    "organigrama",
    "human_resources",
    "hr",
    "staffing",
  ],
  locatie_dotari: [
    "locatie_dotari",
    "ubicacion_instalaciones",
    "ubicacion_e_instalaciones",
    "ubicacion_e_instalaciones_requeridas",
    "ubicacion_y_equipamiento",
    "ubicacion_equipamiento",
    "ubicacion",
    "instalaciones",
    "instalaciones_requeridas",
    "equipamiento",
    "location_facilities",
    "location_equipment",
    "location_and_facilities",
    "facilities",
    "premises",
  ],
};

const OPERATIONAL_CANONICAL_FIELDS = ["descriere_flux", "resurse_umane", "locatie_dotari"] as const;

function coercePlanText(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) {
    return value
      .map((v) => coercePlanText(v))
      .filter(Boolean)
      .join("\n");
  }
  if (typeof value === "object") {
    // Prefer common nested content keys
    const o = value as Record<string, unknown>;
    const nested = firstNonEmptyString(
      o.continut,
      o.contenido,
      o.content,
      o.text,
      o.texto,
      o.descriere,
      o.descripcion,
      o.description
    );
    if (nested) return nested;
    return Object.values(o)
      .map((v) => coercePlanText(v))
      .filter(Boolean)
      .join("\n");
  }
  return "";
}

function pickOperationalField(op: Record<string, unknown>, canonical: string): string {
  const aliases = OPERATIONAL_FIELD_ALIASES[canonical] || [canonical];
  for (const key of aliases) {
    if (op[key] === undefined) continue;
    const text = coercePlanText(op[key]);
    if (text) return text;
  }
  // Fuzzy: any remaining key that looks like the canonical concept
  const fuzzy =
    canonical === "locatie_dotari"
      ? /ubicacion|instalacion|location|facilit|equipamient|dotar|premises/i
      : canonical === "resurse_umane"
      ? /recurso|human|organigram|staff|hr/i
      : /flujo|workflow|operacion|descriere_flux|operations/i;
  for (const [key, val] of Object.entries(op)) {
    if (aliases.includes(key)) continue;
    if (!fuzzy.test(key)) continue;
    const text = coercePlanText(val);
    if (text) return text;
  }
  return "";
}

function normalizePlanOperational(op: any): Record<string, any> {
  if (!op || typeof op !== "object") {
    return { descriere_flux: "", resurse_umane: "", locatie_dotari: "" };
  }
  const src = { ...op };
  const next = { ...src };
  for (const field of OPERATIONAL_CANONICAL_FIELDS) {
    const resolved = pickOperationalField(src, field);
    next[field] = resolved || coercePlanText(src[field]) || "";
  }
  return next;
}

/**
 * Returns a shallow-cloned plan with SWOT + budget fields normalized to canonical keys.
 */
export function normalizePlanResult<T = any>(plan: T): T {
  if (!plan || typeof plan !== "object") return plan;

  const next: any = { ...(plan as any) };

  if (next.analiza_swot && typeof next.analiza_swot === "object") {
    const swot = { ...next.analiza_swot };

    // Legacy alias used in older payloads
    if (!swot.puncte_tari && swot.puncte_forte) {
      swot.puncte_tari = swot.puncte_forte;
    }

    for (const key of SWOT_KEYS) {
      if (swot[key] !== undefined) {
        swot[key] = normalizeSwotCategory(swot[key]);
      }
    }

    next.analiza_swot = swot;
  }

  if (next.plan_financiar && typeof next.plan_financiar === "object") {
    const pf = { ...next.plan_financiar };
    if (Array.isArray(pf.buget_investitii)) {
      pf.buget_investitii = pf.buget_investitii.map(normalizeBudgetItem);
    }
    // ES/EN models often rename strategie_financiara
    const strategie = firstNonEmptyString(
      pf.strategie_financiara,
      pf.estrategia_financiera,
      pf.financial_strategy,
      pf.estrategia_financiera_flujo,
      pf.cash_flow
    );
    if (strategie) pf.strategie_financiara = strategie;
    next.plan_financiar = pf;
  }

  if (next.plan_operational && typeof next.plan_operational === "object") {
    next.plan_operational = normalizePlanOperational(next.plan_operational);
  }

  return next as T;
}

/** True when SWOT/budget explanations OR operational text fields are missing. */
export function planNeedsExplanationFill(plan: any): boolean {
  if (!plan || typeof plan !== "object") return false;
  const swot = plan.analiza_swot;
  if (swot) {
    for (const key of SWOT_KEYS) {
      const arr = swot[key];
      if (!Array.isArray(arr)) continue;
      for (const item of arr) {
        const titlu = typeof item === "string" ? item : item?.titlu;
        const expl = typeof item === "string" ? "" : getSwotItemExplanation(item);
        if (titlu && String(titlu).trim() && !expl) return true;
      }
    }
  }
  const budget = plan.plan_financiar?.buget_investitii;
  if (Array.isArray(budget)) {
    for (const b of budget) {
      const name = b?.item || b?.nume || "";
      if (name && String(name).trim() && !getBudgetItemExplanation(b)) return true;
    }
  }
  // Empty operational sections (common in ES when model renames keys or skips locatie_dotari)
  const op = normalizePlanOperational(plan.plan_operational || {});
  for (const field of OPERATIONAL_CANONICAL_FIELDS) {
    if (!String(op[field] || "").trim()) return true;
  }
  if (
    plan.plan_financiar &&
    !firstNonEmptyString(
      plan.plan_financiar.strategie_financiara,
      plan.plan_financiar.estrategia_financiera,
      plan.plan_financiar.financial_strategy
    )
  ) {
    return true;
  }
  return false;
}

export function buildFillMissingExplanationsPrompt(plan: any, locale: "ro" | "en" | "es"): string {
  const lang =
    locale === "en" ? "English" : locale === "es" ? "Spanish" : "Romanian";

  const op = normalizePlanOperational(plan?.plan_operational || {});
  const payload = {
    nume: plan?.nume,
    analiza_swot: plan?.analiza_swot,
    buget_investitii: plan?.plan_financiar?.buget_investitii || [],
    plan_operational: {
      descriere_flux: op.descriere_flux || "",
      resurse_umane: op.resurse_umane || "",
      locatie_dotari: op.locatie_dotari || "",
    },
    strategie_financiara: plan?.plan_financiar?.strategie_financiara || "",
  };

  return `You are fixing an incomplete business plan JSON.
Language for ALL new text values: ${lang}.

Task:
1) Fill EVERY empty "explicatie_tehnica" in analiza_swot items and every empty "explicatie" in buget_investitii.
2) Fill EVERY empty plan_operational field: descriere_flux, resurse_umane, locatie_dotari (exact key names — never translate keys to ubicacion/location/etc.).
3) Fill empty strategie_financiara if missing.
Rules:
- Keep JSON KEY names exactly: titlu, explicatie_tehnica, item, cost, explicatie, descriere_flux, resurse_umane, locatie_dotari, strategie_financiara
- Do NOT translate or change keys
- Keep existing non-empty text unchanged
- Keep titles, costs, and item names unchanged
- Each new SWOT/budget explanation must be 2-4 complete sentences
- Each operational field must be 3-6 complete sentences when filled
- CRITICAL: For each SWOT category, return the SAME number of items as received, in the SAME order. Do not drop items.
- Return ONLY valid JSON with this shape:
{
  "analiza_swot": { "puncte_tari": [...], "puncte_slabe": [...], "oportunitati": [...], "amenintari": [...] },
  "buget_investitii": [ { "item": "...", "cost": "...", "explicatie": "..." } ],
  "plan_operational": { "descriere_flux": "...", "resurse_umane": "...", "locatie_dotari": "..." },
  "strategie_financiara": "..."
}

Current incomplete data:
${JSON.stringify(payload)}`;
}

/** Merge a fill-pass payload back into the full plan — never drop existing SWOT/budget rows. */
export function mergeFilledExplanations(plan: any, filled: any): any {
  if (!plan || !filled) return plan;
  const next = normalizePlanResult({ ...plan });

  if (filled.analiza_swot && typeof filled.analiza_swot === "object") {
    const incomingRaw = filled.analiza_swot;
    const baseSwot = { ...(next.analiza_swot || {}) };

    for (const key of SWOT_KEYS) {
      const original = Array.isArray(baseSwot[key]) ? baseSwot[key] : [];
      const incoming = Array.isArray(incomingRaw[key]) ? incomingRaw[key] : [];
      if (original.length === 0 && incoming.length === 0) continue;

      const source = original.length > 0 ? original : incoming;
      const byTitle = new Map<string, { titlu: string; explicatie_tehnica: string }>();
      for (const row of incoming) {
        const n = normalizeSwotItem(row);
        if (n.titlu) byTitle.set(n.titlu.trim().toLowerCase(), n);
      }

      const sameLength = incoming.length === source.length && incoming.length > 0;

      baseSwot[key] = source.map((item: any, idx: number) => {
        const base = normalizeSwotItem(item);
        const fromTitle = base.titlu
          ? byTitle.get(base.titlu.trim().toLowerCase())
          : undefined;
        const fromIndex =
          sameLength && incoming[idx] ? normalizeSwotItem(incoming[idx]) : undefined;
        const fill = fromTitle || fromIndex;
        return {
          titlu: base.titlu || fill?.titlu || "",
          explicatie_tehnica: base.explicatie_tehnica || fill?.explicatie_tehnica || "",
        };
      });
    }

    next.analiza_swot = baseSwot;
  }

  if (Array.isArray(filled.buget_investitii) && filled.buget_investitii.length > 0) {
    const incomingBudget = normalizePlanResult({
      plan_financiar: { buget_investitii: filled.buget_investitii },
    }).plan_financiar.buget_investitii;

    if (!next.plan_financiar) next.plan_financiar = {};
    const original = Array.isArray(next.plan_financiar.buget_investitii)
      ? next.plan_financiar.buget_investitii
      : [];

    const baseList = original.length > 0 ? original : incomingBudget;
    const byName = new Map<string, any>();
    for (const row of incomingBudget) {
      const name = String(row?.item || "").trim().toLowerCase();
      if (name) byName.set(name, row);
    }
    const sameLength = incomingBudget.length === baseList.length;

    next.plan_financiar.buget_investitii = baseList.map((row: any, idx: number) => {
      const name = String(row?.item || "").trim().toLowerCase();
      const fill =
        (name && byName.get(name)) ||
        (sameLength ? incomingBudget[idx] : null);
      return {
        ...row,
        item: row.item || fill?.item || "",
        cost: row.cost || fill?.cost || "",
        explicatie: getBudgetItemExplanation(row) || getBudgetItemExplanation(fill) || "",
      };
    });
  }

  if (filled.plan_operational && typeof filled.plan_operational === "object") {
    const baseOp = normalizePlanOperational(next.plan_operational || {});
    const fillOp = normalizePlanOperational(filled.plan_operational);
    next.plan_operational = {
      ...baseOp,
      descriere_flux: baseOp.descriere_flux || fillOp.descriere_flux || "",
      resurse_umane: baseOp.resurse_umane || fillOp.resurse_umane || "",
      locatie_dotari: baseOp.locatie_dotari || fillOp.locatie_dotari || "",
    };
  }

  const filledStrategie = firstNonEmptyString(
    filled.strategie_financiara,
    filled.plan_financiar?.strategie_financiara
  );
  if (filledStrategie) {
    if (!next.plan_financiar) next.plan_financiar = {};
    next.plan_financiar.strategie_financiara =
      firstNonEmptyString(next.plan_financiar.strategie_financiara) || filledStrategie;
  }

  return normalizePlanResult(next);
}
