import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User } from 'firebase/auth';
import { isAdminEmail } from '@/lib/adminEmails';
import {
  FREE_ACCOUNT_PLAN_LIMIT,
  appendGuestPlanToLocalList,
  hasUnlimitedGenerateAccess,
  readDeletedPlanIds,
  resetGuestDemoCounterOnLogin,
} from '@/lib/planQuota';

function ensurePlanId(plan: any, index = 0): any {
  if (!plan || typeof plan !== 'object') return plan;
  if (plan.id) return plan;
  const safeName =
    String(plan.nume || 'Plan').replace(/[^a-zA-Z0-9]/g, '_') || 'Plan';
  return {
    ...plan,
    id: `${safeName}_${Date.now()}_${index}`,
  };
}

/**
 * Collect guest local plans for migration. Dedupe by **id only** (Sesiunea A2).
 * Same business name must NOT drop a distinct plan.
 */
function collectLocalPlansForMigration(deletedIds: Set<string>): any[] {
  const byId = new Map<string, any>();

  const consider = (raw: any, index: number) => {
    if (!raw || typeof raw !== 'object') return;
    const plan = ensurePlanId({ ...raw }, index);
    const id = String(plan.id);
    if (!id || deletedIds.has(id)) return;
    // Name tombstones only block exact re-import when id was also deleted;
    // A2: do not skip a different id just because the name matches a deleted plan.
    if (!byId.has(id)) byId.set(id, plan);
  };

  try {
    const singlePlanStr = localStorage.getItem('current_generated_plan');
    if (singlePlanStr) {
      consider(JSON.parse(singlePlanStr), 0);
    }
  } catch (e) {
    console.error('Eroare la parsarea current_generated_plan:', e);
  }

  try {
    const plansListStr = localStorage.getItem('demo_plans_list');
    if (plansListStr) {
      const plansList = JSON.parse(plansListStr);
      if (Array.isArray(plansList)) {
        plansList.forEach((plan, index) => consider(plan, index + 1));
      }
    }
  } catch (e) {
    console.error('Eroare la parsarea demo_plans_list:', e);
  }

  return Array.from(byId.values());
}

/**
 * Migrates locally saved plans (from Demo guest) to the user's Firebase account upon login.
 * - Nu reîncarcă planurile șterse (deleted_plan_ids_{uid} pe **id**)
 * - Nu pierde planuri distincte cu același nume (A2 — dedupe / skip doar pe id)
 * - Respectă FREE_ACCOUNT_PLAN_LIMIT pentru cont gratuit; paid/admin fără plafon artificial la migrare
 */
export const migrateLocalPlansToFirebase = async (user: User) => {
  if (!user) return;

  try {
    resetGuestDemoCounterOnLogin();

    // A2 harden: fold current plan into demo_plans_list before collect (race signup).
    try {
      const singlePlanStr = localStorage.getItem('current_generated_plan');
      if (singlePlanStr) {
        const singlePlan = JSON.parse(singlePlanStr);
        if (singlePlan && typeof singlePlan === 'object') {
          appendGuestPlanToLocalList(singlePlan);
        }
      }
    } catch {
      /* ignore */
    }

    const deletedIds = readDeletedPlanIds(user.uid);
    const localPlans = collectLocalPlansForMigration(deletedIds);

    if (localPlans.length === 0) {
      localStorage.removeItem('demo_plans_list');
      localStorage.setItem('migration_completed_for_uid', user.uid);
      return;
    }

    let unlimitedSlots = false;
    try {
      const userSnap = await getDoc(doc(db, 'users', user.uid));
      const uData = userSnap.exists() ? userSnap.data() || {} : {};
      unlimitedSlots = hasUnlimitedGenerateAccess({
        isPaid: !!uData.isPaid,
        subscriptionActive: !!uData.subscriptionActive,
        isAdmin: isAdminEmail(user.email),
      });
    } catch {
      unlimitedSlots = isAdminEmail(user.email);
    }

    const plansSnap = await getDocs(collection(db, 'users', user.uid, 'plans'));
    const existingIds = new Set<string>();
    let existingCount = 0;
    plansSnap.forEach((d) => {
      existingCount += 1;
      existingIds.add(d.id);
    });

    let slotsLeft = unlimitedSlots
      ? Number.POSITIVE_INFINITY
      : Math.max(0, FREE_ACCOUNT_PLAN_LIMIT - existingCount);

    if (!unlimitedSlots && slotsLeft <= 0) {
      localStorage.setItem('demo_plans_list', JSON.stringify(localPlans));
      localStorage.setItem('migration_completed_for_uid', user.uid);
      console.log(
        `[migrate] Skip upload — already ${existingCount} plans (limit ${FREE_ACCOUNT_PLAN_LIMIT}). Kept ${localPlans.length} local plan(s).`
      );
      return;
    }

    const remaining: any[] = [];
    for (const plan of localPlans) {
      if (!plan || !plan.id) continue;
      const id = String(plan.id);
      if (deletedIds.has(id)) continue;

      if (existingIds.has(id)) {
        // Already in Firestore — treat as migrated.
        continue;
      }

      if (slotsLeft <= 0) {
        remaining.push(plan);
        continue;
      }

      try {
        const planRef = doc(db, 'users', user.uid, 'plans', id);
        const planSnap = await getDoc(planRef);

        if (!planSnap.exists()) {
          await setDoc(planRef, {
            ...plan,
            isPaid: false,
            isGeneratedFromDemo: true,
            createdAt: plan.createdAt || new Date().toISOString(),
            migratedAt: new Date().toISOString(),
          });
          existingIds.add(id);
          existingCount += 1;
          if (Number.isFinite(slotsLeft)) slotsLeft -= 1;
          console.log(`Plan ${id} migrated to Firebase successfully.`);
        } else {
          existingIds.add(id);
        }
      } catch (e) {
        console.error(`Eroare la migrarea planului ${plan.id || 'necunoscut'}:`, e);
        remaining.push(plan);
      }
    }

    if (remaining.length > 0) {
      localStorage.setItem('demo_plans_list', JSON.stringify(remaining));
      console.log(`[migrate] Kept ${remaining.length} unmigrated local plan(s).`);
    } else {
      localStorage.removeItem('demo_plans_list');
    }

    localStorage.setItem('migration_completed_for_uid', user.uid);
    console.log(`Migrare planuri locale finalizată pentru ${user.uid}.`);
  } catch (error) {
    console.error('Eroare la migrarea planurilor din localStorage:', error);
  }
};
