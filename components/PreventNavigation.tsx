"use client";

import { useEffect } from "react";

interface PreventNavigationProps {
  isGenerating: boolean;
}

export default function PreventNavigation({ isGenerating }: PreventNavigationProps) {
  useEffect(() => {
    if (!isGenerating) return;

    // Previne Refresh / Închidere tab / Închidere browser
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      // Pentru browserele moderne, acest string nu mai este mereu afișat (browserul arată un mesaj generic),
      // dar setarea returnValue este obligatorie pentru a declanșa popup-ul de avertizare.
      e.returnValue = "Procesul este în desfășurare. Dacă părăsești pagina, vei pierde progresul. Ești sigur?";
      return e.returnValue;
    };

    // Previne Navigarea înapoi (Back button) prin interceptarea history API
    const handlePopState = (e: PopStateEvent) => {
      // Re-adăugăm starea în istoric pentru a "anula" efectul de Back
      window.history.pushState(null, "", window.location.href);
      alert("Te rugăm să aștepți finalizarea procesului înainte de a naviga înapoi!");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    
    // Adăugăm o stare falsă în istoric doar o dată, la montare (când isGenerating devine true)
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isGenerating]);

  return null; // Nu randează nimic vizual în DOM
}
