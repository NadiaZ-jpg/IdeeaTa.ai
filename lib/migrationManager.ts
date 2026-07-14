import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User } from 'firebase/auth';

/**
 * Migrates locally saved plans (from Demo) to the user's Firebase account upon login.
 */
export const migrateLocalPlansToFirebase = async (user: User) => {
  if (!user) return;
  
  try {
    const savedPlansStr = localStorage.getItem('current_versions');
    let localPlans: any[] = [];
    
    // Check 'current_versions' which is an array of plans
    if (savedPlansStr) {
      const parsed = JSON.parse(savedPlansStr);
      if (Array.isArray(parsed)) {
        localPlans = [...parsed];
      }
    }
    
    // Check 'current_generated_plan' which is a single plan, just in case
    const singlePlanStr = localStorage.getItem('current_generated_plan');
    if (singlePlanStr) {
      const singlePlan = JSON.parse(singlePlanStr);
      // Check if it's already in the array
      if (singlePlan && singlePlan.id && !localPlans.some(p => p.id === singlePlan.id)) {
        localPlans.push(singlePlan);
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
          migratedAt: new Date().toISOString()
        });
        console.log(`Plan ${plan.id} migrated to Firebase successfully.`);
      }
    }
    
    // We don't delete from localStorage, we let them be there as backup.
  } catch (error) {
    console.error("Eroare la migrarea planurilor din localStorage:", error);
  }
};
