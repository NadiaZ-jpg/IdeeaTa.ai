import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User } from 'firebase/auth';

/**
 * Migrates locally saved plans (from Demo) to the user's Firebase account upon login.
 */
export const migrateLocalPlansToFirebase = async (user: User) => {
  if (!user) return;
  
  try {
    let localPlans: any[] = [];
    
    // Check 'current_generated_plan' which contains the active plan
    const singlePlanStr = localStorage.getItem('current_generated_plan');
    if (singlePlanStr) {
      try {
        const singlePlan = JSON.parse(singlePlanStr);
        if (singlePlan && typeof singlePlan === 'object') {
          // If the plan has no ID, generate a unique ID
          if (!singlePlan.id) {
            const safeName = singlePlan.nume?.replace(/[^a-zA-Z0-9]/g, '_') || 'Plan';
            singlePlan.id = `${safeName}_${Date.now()}`;
          }
          localPlans.push(singlePlan);
        }
      } catch (e) {
        console.error("Eroare la parsarea current_generated_plan:", e);
      }
    }

    // Check 'demo_plans_list' which contains other generated plans
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
              // Evităm duplicatele în localPlans bazat pe ID sau Nume
              const exists = localPlans.some((p) => p.id === plan.id || p.nume === plan.nume);
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

    if (localPlans.length === 0) {
      // Chiar dacă nu avem planuri locale de migrat, setăm flagul pentru a preveni alte sync-uri redundante
      localStorage.setItem('migration_completed_for_uid', user.uid);
      return;
    }

    let allMigrated = true;
    for (const plan of localPlans) {
      if (!plan || !plan.id) continue;
      
      try {
        const planRef = doc(db, 'users', user.uid, 'plans', plan.id);
        const planSnap = await getDoc(planRef);
        
        if (!planSnap.exists()) {
          await setDoc(planRef, {
            ...plan,
            isPaid: false,
            isGeneratedFromDemo: true,
            createdAt: plan.createdAt || new Date().toISOString(),
            migratedAt: new Date().toISOString()
          });
          console.log(`Plan ${plan.id} migrated to Firebase successfully.`);
        }
      } catch (e) {
        allMigrated = false;
        console.error(`Eroare la migrarea planului ${plan.id || 'necunoscut'}:`, e);
      }
    }

    // Curățăm storage-ul local DOAR după migrare completă cu succes a tuturor planurilor
    if (allMigrated) {
      localStorage.removeItem('current_generated_plan');
      localStorage.removeItem('demo_plans_list');
      localStorage.setItem('migration_completed_for_uid', user.uid);
      console.log(`Toate planurile locale au fost migrate. Flag-ul migration_completed_for_uid setat.`);
    }
  } catch (error) {
    console.error("Eroare la migrarea planurilor din localStorage:", error);
  }
};
