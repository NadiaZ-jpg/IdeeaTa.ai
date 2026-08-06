import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User } from 'firebase/auth';
import {
  FREE_ACCOUNT_PLAN_LIMIT,
  readDeletedPlanIds,
  resetGuestDemoCounterOnLogin,
} from '@/lib/planQuota';

function planNameKey(plan: any): string {
  return String(plan?.nume || "")
    .trim()
    .toLowerCase();
}

/**
 * Migrates locally saved plans (from Demo guest) to the user's Firebase account upon login.
 * - Nu reîncarcă planurile șterse (deleted_plan_ids_{uid})
 * - Nu creează duplicate pe același nume
 * - Respectă FREE_ACCOUNT_PLAN_LIMIT (nu umple contul peste cotă)
 */
export const migrateLocalPlansToFirebase = async (user: User) => {
  if (!user) return;

  try {
    resetGuestDemoCounterOnLogin();

    const deletedIds = readDeletedPlanIds(user.uid);
    let localPlans: any[] = [];

    const singlePlanStr = localStorage.getItem('current_generated_plan');
    if (singlePlanStr) {
      try {
        const singlePlan = JSON.parse(singlePlanStr);
        if (singlePlan && typeof singlePlan === 'object') {
          if (!singlePlan.id) {
            const safeName = singlePlan.nume?.replace(/[^a-zA-Z0-9]/g, '_') || 'Plan';
            singlePlan.id = `${safeName}_${Date.now()}`;
          }
          if (!deletedIds.has(String(singlePlan.id))) {
            const nameKey = planNameKey(singlePlan);
            if (!nameKey || !deletedIds.has(`name:${nameKey}`)) {
              localPlans.push(singlePlan);
            }
          }
        }
      } catch (e) {
        console.error("Eroare la parsarea current_generated_plan:", e);
      }
    }

    const plansListStr = localStorage.getItem('demo_plans_list');
    if (plansListStr) {
      try {
        const plansList = JSON.parse(plansListStr);
        if (Array.isArray(plansList)) {
          plansList.forEach((plan, index) => {
            if (plan && typeof plan === 'object') {
              if (!plan.id) {
                const safeName = plan.nume?.replace(/[^a-zA-Z0-9]/g, '_') || 'Plan';
                plan.id = `${safeName}_${Date.now()}_${index}`;
              }
              if (deletedIds.has(String(plan.id))) return;
              const nameKey = planNameKey(plan);
              if (nameKey && deletedIds.has(`name:${nameKey}`)) return;
              const exists = localPlans.some(
                (p) => p.id === plan.id || planNameKey(p) === nameKey
              );
              if (!exists) {
                localPlans.push(plan);
              }
            }
          });
        }
      } catch (e) {
        console.error("Eroare la parsarea demo_plans_list:", e);
      }
    }

    // Curățăm mereu lista locală după ce am citit-o — altfel refresh Dashboard
    // reîncărca planuri vechi / duplicate la fiecare vizită.
    localStorage.removeItem('demo_plans_list');

    if (localPlans.length === 0) {
      localStorage.setItem('migration_completed_for_uid', user.uid);
      return;
    }

    const plansSnap = await getDocs(collection(db, 'users', user.uid, 'plans'));
    const existingNames = new Set<string>();
    let existingCount = 0;
    plansSnap.forEach((d) => {
      existingCount += 1;
      const name = planNameKey(d.data());
      if (name) existingNames.add(name);
    });

    let slotsLeft = Math.max(0, FREE_ACCOUNT_PLAN_LIMIT - existingCount);
    // Paid users: still migrate, but without inventing unlimited free quota abuse —
    // if already at/over free limit we only skip when free; for simplicity always
    // respect the free cap for migration (paid can generate more via Studio).
    if (slotsLeft <= 0) {
      localStorage.setItem('migration_completed_for_uid', user.uid);
      console.log(
        `[migrate] Skip upload — already ${existingCount} plans (limit ${FREE_ACCOUNT_PLAN_LIMIT}).`
      );
      return;
    }

    for (const plan of localPlans) {
      if (!plan || !plan.id) continue;
      if (deletedIds.has(String(plan.id))) continue;
      const name = planNameKey(plan);
      if (name && deletedIds.has(`name:${name}`)) continue;
      if (slotsLeft <= 0) break;

      if (name && existingNames.has(name)) {
        console.log(`[migrate] Skip duplicate name: ${plan.nume}`);
        continue;
      }

      try {
        const planRef = doc(db, 'users', user.uid, 'plans', plan.id);
        const planSnap = await getDoc(planRef);

        if (!planSnap.exists()) {
          await setDoc(planRef, {
            ...plan,
            isPaid: false,
            isGeneratedFromDemo: true,
            createdAt: plan.createdAt || new Date().toISOString(),
            migratedAt: new Date().toISOString(),
          });
          existingCount += 1;
          slotsLeft -= 1;
          if (name) existingNames.add(name);
          console.log(`Plan ${plan.id} migrated to Firebase successfully.`);
        } else if (name) {
          existingNames.add(name);
        }
      } catch (e) {
        console.error(`Eroare la migrarea planului ${plan.id || 'necunoscut'}:`, e);
      }
    }

    localStorage.setItem('migration_completed_for_uid', user.uid);
    console.log(`Migrare planuri locale finalizată pentru ${user.uid}.`);
  } catch (error) {
    console.error("Eroare la migrarea planurilor din localStorage:", error);
  }
};
