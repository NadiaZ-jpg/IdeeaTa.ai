"use client";

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface StudioDataLoaderProps {
  user: any;
  onPlanLoaded: (plan: any, isPaid: boolean) => void;
}

export default function StudioDataLoader({ user, onPlanLoaded }: StudioDataLoaderProps) {
  const searchParams = useSearchParams();
  const planIdParam = searchParams.get('planId') || searchParams.get('id');
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (user && planIdParam && !hasLoaded) {
      const loadPlan = async () => {
        try {
          const docRef = doc(db, 'users', user.uid, 'plans', planIdParam);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            onPlanLoaded(data, data.isPaid === true);
            setHasLoaded(true);
          } else {
            console.warn("Planul nu a fost găsit în baza de date.");
          }
        } catch (error) {
          console.error("Eroare la încărcarea planului:", error);
        }
      };

      loadPlan();
    }
  }, [user, planIdParam, hasLoaded, onPlanLoaded]);

  return null;
}
