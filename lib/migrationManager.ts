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

    if (localPlans.length === 0) return;

    for (const plan of localPlans) {
      if (!plan || !plan.id) continue;
      
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
    }
  } catch (error) {
    console.error("Eroare la migrarea planurilor din localStorage:", error);
  }
};
