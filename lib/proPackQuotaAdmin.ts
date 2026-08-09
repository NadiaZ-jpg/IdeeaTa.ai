import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { FREE_ACCOUNT_PLAN_LIMIT, hasUnlimitedGenerateAccess } from "@/lib/planQuota";
import {
  PRO_PACK_COMBINE_GRANT,
  PRO_PACK_EDIT_GRANT,
  PRO_PACK_GENERATE_GRANT,
  PRO_PACK_QUOTA_VERSION,
  proPackLimitMessage,
  type ProPackLocale,
} from "@/lib/proPackQuota";

/** Legacy buyers with euFundsUnlocked but no counters get one pack grant. */
export async function ensureLegacyProPackQuotas(
  userId: string,
  userData: any
): Promise<any> {
  if (!userData?.euFundsUnlocked || userData?.proPackQuotaInitialized) {
    return userData;
  }
  const userRef = adminDb.collection("users").doc(userId);
  await userRef.set(
    {
      proPackQuotaInitialized: true,
      proPackQuotaVersion: PRO_PACK_QUOTA_VERSION,
      standardPackageActive: true,
      proPackGenerateRemaining: FieldValue.increment(
        typeof userData.proPackGenerateRemaining === "number"
          ? 0
          : PRO_PACK_GENERATE_GRANT
      ),
      proPackEditRemaining: FieldValue.increment(
        typeof userData.proPackEditRemaining === "number" ? 0 : PRO_PACK_EDIT_GRANT
      ),
      proPackCombineRemaining: FieldValue.increment(
        typeof userData.proPackCombineRemaining === "number"
          ? 0
          : PRO_PACK_COMBINE_GRANT
      ),
    },
    { merge: true }
  );
  const fresh = await userRef.get();
  return fresh.exists ? fresh.data() : userData;
}

export type GenerateQuotaResult =
  | { ok: true }
  | { ok: false; code: string; message: string };

/**
 * Free lifetime → then Pro pack generations. Unlimited for subscription/legacy isPaid/admin.
 */
export async function assertAndConsumeGenerateQuota(opts: {
  userId: string;
  isAdmin?: boolean;
  locale: ProPackLocale;
}): Promise<GenerateQuotaResult> {
  const userRef = adminDb.collection("users").doc(opts.userId);
  const [userDoc, plansSnap] = await Promise.all([
    userRef.get(),
    userRef.collection("plans").get(),
  ]);

  let userData = userDoc.exists ? userDoc.data() || {} : {};
  userData = await ensureLegacyProPackQuotas(opts.userId, userData);

  if (
    opts.isAdmin ||
    hasUnlimitedGenerateAccess({
      isPaid: !!userData?.isPaid,
      subscriptionActive: !!userData?.subscriptionActive,
    })
  ) {
    return { ok: true };
  }

  const lifetime =
    typeof userData?.lifetimePlanCount === "number"
      ? userData.lifetimePlanCount
      : plansSnap.size;

  const packRemaining =
    typeof userData?.proPackGenerateRemaining === "number"
      ? userData.proPackGenerateRemaining
      : 0;

  if (lifetime >= FREE_ACCOUNT_PLAN_LIMIT && packRemaining <= 0) {
    return {
      ok: false,
      code: "PRO_PACK_GENERATE_LIMIT",
      message: proPackLimitMessage(opts.locale, "generate"),
    };
  }

  if (lifetime < FREE_ACCOUNT_PLAN_LIMIT) {
    await userRef.set({ lifetimePlanCount: lifetime + 1 }, { merge: true });
    return { ok: true };
  }

  try {
    await adminDb.runTransaction(async (tx: any) => {
      const snap = await tx.get(userRef);
      const d = snap.exists ? snap.data() || {} : {};
      const left =
        typeof d.proPackGenerateRemaining === "number"
          ? d.proPackGenerateRemaining
          : 0;
      if (left <= 0) throw new Error("PRO_PACK_GENERATE_LIMIT");
      tx.set(userRef, { proPackGenerateRemaining: left - 1 }, { merge: true });
    });
    return { ok: true };
  } catch (e: any) {
    if (e?.message === "PRO_PACK_GENERATE_LIMIT") {
      return {
        ok: false,
        code: "PRO_PACK_GENERATE_LIMIT",
        message: proPackLimitMessage(opts.locale, "generate"),
      };
    }
    throw e;
  }
}

export type ProPackConsumeKind = {
  consumeEdit: boolean;
  consumeCombine: boolean;
};

export function proPackConsumeForEdit(opts: {
  needsProEdit: boolean;
  isCombine: boolean;
  unlimited: boolean;
}): ProPackConsumeKind {
  if (opts.unlimited) return { consumeEdit: false, consumeCombine: false };
  return {
    consumeEdit: opts.needsProEdit,
    consumeCombine: opts.isCombine,
  };
}

/**
 * Atomically consume Pro pack edit/combine quotas.
 * Throws Error with code message PRO_PACK_EDIT_LIMIT | PRO_PACK_COMBINE_LIMIT.
 */
export async function consumeProPackEditQuotas(
  userId: string,
  kind: ProPackConsumeKind
): Promise<void> {
  if (!kind.consumeEdit && !kind.consumeCombine) return;
  const userRef = adminDb.collection("users").doc(userId);
  await adminDb.runTransaction(async (tx: any) => {
    const snap = await tx.get(userRef);
    const d = snap.exists ? snap.data() || {} : {};
    const updates: Record<string, number> = {};

    if (kind.consumeCombine) {
      const left =
        typeof d.proPackCombineRemaining === "number"
          ? d.proPackCombineRemaining
          : 0;
      if (left <= 0) throw new Error("PRO_PACK_COMBINE_LIMIT");
      updates.proPackCombineRemaining = left - 1;
    }
    if (kind.consumeEdit) {
      const left =
        typeof d.proPackEditRemaining === "number" ? d.proPackEditRemaining : 0;
      if (left <= 0) throw new Error("PRO_PACK_EDIT_LIMIT");
      updates.proPackEditRemaining = left - 1;
    }
    tx.set(userRef, updates, { merge: true });
  });
}

export async function refundProPackEditQuotas(
  userId: string,
  kind: ProPackConsumeKind
): Promise<void> {
  if (!kind.consumeEdit && !kind.consumeCombine) return;
  try {
    const userRef = adminDb.collection("users").doc(userId);
    await adminDb.runTransaction(async (tx: any) => {
      const snap = await tx.get(userRef);
      if (!snap.exists) return;
      const d = snap.data() || {};
      const updates: Record<string, number> = {};
      if (kind.consumeCombine) {
        const left =
          typeof d.proPackCombineRemaining === "number"
            ? d.proPackCombineRemaining
            : 0;
        updates.proPackCombineRemaining = left + 1;
      }
      if (kind.consumeEdit) {
        const left =
          typeof d.proPackEditRemaining === "number" ? d.proPackEditRemaining : 0;
        updates.proPackEditRemaining = left + 1;
      }
      tx.set(userRef, updates, { merge: true });
    });
  } catch (e) {
    console.warn("[proPack] refund failed:", e);
  }
}
