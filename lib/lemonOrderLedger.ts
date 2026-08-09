/**
 * Lemon webhook idempotency + order grant ledger (Admin SDK only).
 * Collection: lemon_orders/{orderId}
 */

import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import {
  PRO_PACK_COMBINE_GRANT,
  PRO_PACK_EDIT_GRANT,
  PRO_PACK_GENERATE_GRANT,
  PRO_TOPUP_COMBINE_GRANT,
  PRO_TOPUP_EDIT_GRANT,
  PRO_TOPUP_GENERATE_GRANT,
  proPackGrantFields,
  proTopupGrantFields,
} from "@/lib/proPackQuota";
import type { CheckoutTier } from "@/lib/lemonCheckout";

export type LemonOrderGrant = {
  userId: string;
  tier: CheckoutTier;
  eventName: string;
  customerId?: string | number | null;
  planName?: string | null;
  planId?: string | null;
  grants?: {
    generate: number;
    edit: number;
    combine: number;
  };
  createdAt: string;
  refundedAt?: string | null;
};

function orderRef(orderId: string) {
  return adminDb.collection("lemon_orders").doc(String(orderId));
}

/** Returns true if this order was already processed (skip grant). */
export async function claimLemonOrderOrSkip(opts: {
  orderId: string;
  userId: string;
  tier: CheckoutTier;
  eventName: string;
  customerId?: string | number | null;
  planName?: string | null;
  planId?: string | null;
}): Promise<"skip" | "claim"> {
  const ref = orderRef(opts.orderId);
  return adminDb.runTransaction(async (tx: any) => {
    const snap = await tx.get(ref);
    if (snap.exists) {
      return "skip";
    }
    const grants =
      opts.tier === "eu-funds"
        ? {
            generate: PRO_PACK_GENERATE_GRANT,
            edit: PRO_PACK_EDIT_GRANT,
            combine: PRO_PACK_COMBINE_GRANT,
          }
        : opts.tier === "pro-topup"
          ? {
              generate: PRO_TOPUP_GENERATE_GRANT,
              edit: PRO_TOPUP_EDIT_GRANT,
              combine: PRO_TOPUP_COMBINE_GRANT,
            }
          : undefined;

    const doc: LemonOrderGrant = {
      userId: opts.userId,
      tier: opts.tier,
      eventName: opts.eventName,
      customerId: opts.customerId ?? null,
      planName: opts.planName ?? null,
      planId: opts.planId ?? null,
      grants,
      createdAt: new Date().toISOString(),
      refundedAt: null,
    };
    tx.set(ref, doc);
    return "claim";
  });
}

export async function applyOrderGrantToUser(opts: {
  userId: string;
  tier: CheckoutTier;
  customerId?: string | number | null;
  planName?: string | null;
  planId?: string | null;
  existingUnlockedPlans?: string[];
  existingUnlockedPlanIds?: string[];
}): Promise<void> {
  const userRef = adminDb.collection("users").doc(opts.userId);
  const customerId = opts.customerId ?? null;

  if (opts.tier === "standard") {
    const planName = opts.planName || "Plan";
    const planId = opts.planId ? String(opts.planId) : null;
    const unlocked = opts.existingUnlockedPlans || [];
    const unlockedIds = opts.existingUnlockedPlanIds || [];
    const updatedPlans = !unlocked.includes(planName) ? [...unlocked, planName] : unlocked;
    const updatedIds =
      planId && !unlockedIds.includes(planId) ? [...unlockedIds, planId] : unlockedIds;
    await userRef.set(
      {
        standardPackageActive: true,
        unlockedPlans: updatedPlans,
        unlockedPlanIds: updatedIds,
        lemonSqueezyCustomerId: customerId,
      },
      { merge: true }
    );
    return;
  }

  if (opts.tier === "eu-funds") {
    await userRef.set(
      {
        ...proPackGrantFields((n) => FieldValue.increment(n)),
        lemonSqueezyCustomerId: customerId,
      },
      { merge: true }
    );
    return;
  }

  if (opts.tier === "pro-topup") {
    await userRef.set(
      {
        ...proTopupGrantFields((n) => FieldValue.increment(n)),
        lemonSqueezyCustomerId: customerId,
      },
      { merge: true }
    );
    return;
  }

  if (opts.tier === "pro") {
    await userRef.set(
      {
        subscriptionActive: true,
        isPaid: true,
        lemonSqueezyCustomerId: customerId,
      },
      { merge: true }
    );
  }
}

/**
 * Reverse a prior order grant (refund). Idempotent if already refunded.
 */
export async function refundLemonOrder(orderId: string): Promise<{
  ok: boolean;
  reason?: string;
}> {
  const ref = orderRef(orderId);
  const snap = await ref.get();
  if (!snap.exists) {
    return { ok: false, reason: "ORDER_NOT_FOUND" };
  }
  const data = snap.data() as LemonOrderGrant;
  if (data.refundedAt) {
    return { ok: true, reason: "ALREADY_REFUNDED" };
  }

  const userRef = adminDb.collection("users").doc(data.userId);
  const userSnap = await userRef.get();
  const userData = userSnap.exists ? userSnap.data() || {} : {};

  if (data.tier === "eu-funds" || data.tier === "pro-topup") {
    const g = data.grants || {
      generate:
        data.tier === "eu-funds" ? PRO_PACK_GENERATE_GRANT : PRO_TOPUP_GENERATE_GRANT,
      edit: data.tier === "eu-funds" ? PRO_PACK_EDIT_GRANT : PRO_TOPUP_EDIT_GRANT,
      combine:
        data.tier === "eu-funds" ? PRO_PACK_COMBINE_GRANT : PRO_TOPUP_COMBINE_GRANT,
    };
    const gen = Math.max(0, Number(userData.proPackGenerateRemaining ?? 0) - g.generate);
    const edit = Math.max(0, Number(userData.proPackEditRemaining ?? 0) - g.edit);
    const combine = Math.max(0, Number(userData.proPackCombineRemaining ?? 0) - g.combine);
    const updates: Record<string, unknown> = {
      proPackGenerateRemaining: gen,
      proPackEditRemaining: edit,
      proPackCombineRemaining: combine,
    };
    // Full pack refund: drop unlock if no remaining pack gens from other purchases
    // Keep euFundsUnlocked if user still has positive any quota or other packs —
    // conservative: only clear unlock when all three hit 0 after clawback and tier was eu-funds
    if (data.tier === "eu-funds" && gen === 0 && edit === 0 && combine === 0) {
      updates.euFundsUnlocked = false;
    }
    await userRef.set(updates, { merge: true });
  } else if (data.tier === "standard") {
    const planName = data.planName || "Plan";
    const planId = data.planId ? String(data.planId) : null;
    const unlocked = Array.isArray(userData.unlockedPlans)
      ? userData.unlockedPlans.filter((p: string) => p !== planName)
      : [];
    const unlockedIds = Array.isArray(userData.unlockedPlanIds)
      ? planId
        ? userData.unlockedPlanIds.filter((id: string) => id !== planId)
        : userData.unlockedPlanIds
      : [];
    await userRef.set(
      {
        unlockedPlans: unlocked,
        unlockedPlanIds: unlockedIds,
        ...(unlocked.length === 0 && unlockedIds.length === 0
          ? { standardPackageActive: false }
          : {}),
      },
      { merge: true }
    );
  } else if (data.tier === "pro") {
    await userRef.set(
      {
        subscriptionActive: false,
        isPaid: false,
        subscriptionId: null,
      },
      { merge: true }
    );
  }

  await ref.set({ refundedAt: new Date().toISOString() }, { merge: true });
  return { ok: true };
}

export async function deleteLemonOrderClaim(orderId: string): Promise<void> {
  try {
    await orderRef(orderId).delete();
  } catch (e) {
    console.warn("[lemonOrderLedger] failed to delete claim after grant error", e);
  }
}

export function lemonOrderIdFromPayload(payload: any): string | null {
  const id = payload?.data?.id;
  if (id === undefined || id === null) return null;
  return String(id);
}
