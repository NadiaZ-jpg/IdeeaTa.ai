"use client";
import { useState, useRef, useEffect } from "react";
import { jsPDF } from "jspdf";
import { toPng } from "html-to-image";
import pptxgen from "pptxgenjs";
import { EditForm } from "./EditForm";
import { BudgetBarChart } from "./BudgetChart";
import { auth, db } from '@/lib/firebase';
import { signInWithRedirect, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User, getRedirectResult, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, onSnapshot, setDoc, getDoc, increment, arrayUnion } from 'firebase/firestore';
import { PricingModal } from '@/components/PricingModal';

const formatNumberedText = (text: string | undefined) => {
  if (typeof text !== 'string') return text;
  // This regex matches a space followed by digits and a dot and a space, e.g., " 1. ", " 2. "
  // It replaces it with "\n1. ", "\n2. " to render them on new lines.
  let formatted = text.replace(/\s(\d+\.)\s/g, '\n$1 ');
  // Also add a newline before bolded subheadings like **Etapa 1:** or **Pilonul Verde:**
  formatted = formatted.replace(/\s(\*\*[^*]+\*\*)/g, '\n\n$1');
  return formatted.trim();
};

const formatObjectNumbers = (obj: any): any => {
  if (typeof obj === 'string') {
    return formatNumberedText(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map(formatObjectNumbers);
  }
  if (obj !== null && typeof obj === 'object') {
    const newObj: any = {};
    for (const key in obj) {
      newObj[key] = formatObjectNumbers(obj[key]);
    }
    return newObj;
  }
  return obj;
};

export default function Home() {
  const [skill, setSkill] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [fxRate, setFxRate] = useState(0.201);
  const [currency, setCurrency] = useState("LEI");
  const [isDownloading, setIsDownloading] = useState<'pdf' | 'pptx' | 'word' | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [backupResult, setBackupResult] = useState<any>(null);
  const [isEditingAi, setIsEditingAi] = useState(false);
  const [showToneOptions, setShowToneOptions] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [pendingDownloadMode, setPendingDownloadMode] = useState<'pdf' | 'pptx' | 'word' | null>(null);
  const [credits, setCredits] = useState(0);
  const [euFundsUnlocked, setEuFundsUnlocked] = useState(false);
  const [subscriptionActive, setSubscriptionActive] = useState(false);
  const [unlockedPlans, setUnlockedPlans] = useState<string[]>([]);
  const [showPricingModal, setShowPricingModal] = useState(false);

  const devBypass = process.env.NEXT_PUBLIC_DEV_BYPASS === 'true';
  const [animatedPlaceholder, setAnimatedPlaceholder] = useState("");

  useEffect(() => {
    const placeholders = [
      "Consultanță Securitate Cibernetică...",
      "Studio de Design Interior...",
      "Fermă Urbană de Microplante...",
      "Dezvoltare Soluții AI...",
      "Cafenea de Specialitate...",
      "Platformă de Cursuri Online...",
      "Spălătorie Auto Ecologică..."
    ];
    let currentIdx = 0;
    let currentCharIdx = 0;
    let isDeleting = false;
    let timeout: NodeJS.Timeout;

    const tick = () => {
      const fullText = placeholders[currentIdx];
      
      if (!isDeleting) {
        setAnimatedPlaceholder(fullText.substring(0, currentCharIdx + 1));
        currentCharIdx++;

        if (currentCharIdx === fullText.length) {
          isDeleting = true;
          timeout = setTimeout(tick, 2000); 
        } else {
          timeout = setTimeout(tick, 100); 
        }
      } else {
        setAnimatedPlaceholder(fullText.substring(0, currentCharIdx - 1));
        currentCharIdx--;

        if (currentCharIdx === 0) {
          isDeleting = false;
          currentIdx = (currentIdx + 1) % placeholders.length;
          timeout = setTimeout(tick, 500); 
        } else {
          timeout = setTimeout(tick, 50); 
        }
      }
    };

    timeout = setTimeout(tick, 500);
    return () => clearTimeout(timeout);
  }, []);

  const startEditing = () => {
    if (!isStudioPaid) {
      setShowPricingModal(true);
      return;
    }
    setBackupResult(JSON.parse(JSON.stringify(result)));
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setResult(backupResult);
    setIsEditing(false);
  };

  const saveEditing = () => {
    setIsEditing(false);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    if (isContentCopyProtected) {
      e.preventDefault();
      alert("Copierea și click-dreapta sunt dezactivate în previzualizarea protejată. Deblochează planul pentru acces complet.");
    }
  };

  const handleAiEdit = async (action: string, customStyle?: string) => {
    if (isEditingAi) return;

    let targetSection = "";
    if (action === "add_sections") {
      const userInput = window.prompt("În ce secțiune dorești să adaugi informații suplimentare?\n(ex: Plan Financiar, Analiza Pieței, SWOT, Plan Operațional)");
      if (!userInput) return; // Anulat de utilizator
      targetSection = userInput;
    } else if (action === "optimize_budget") {
      let percentStr = window.prompt("Cu ce procent dorești să reduci costurile bugetate? (ex: 10, 20, 30)");
      if (!percentStr) return; // Anulat
      let percent = parseInt(percentStr.replace(/%/g, ''));
      if (isNaN(percent) || percent <= 0) {
        alert("Te rog introdu un procent valid (ex: 20).");
        return;
      }
      if (percent > 40) {
        if (!window.confirm(`⚠️ Atenție! O reducere de ${percent}% a bugetului ar putea afecta sever fezabilitatea și calitatea echipamentelor/serviciilor achiziționate. Continuăm cu această optimizare drastică?`)) {
          return;
        }
      }
      targetSection = percent.toString(); // Refolosim variabila pentru a trimite procentul
    } else if (action === "eu_funds_optimization") {
      const confirmEu = window.confirm("🇪🇺 Optimizare pentru Fonduri Europene\n\nAcest instrument va:\n1. Adapta vocabularul din Planul Operațional și SWOT pentru a include concepte cheie (digitalizare, sustenabilitate, economie circulară).\n2. Redenumi automat achizițiile din buget pentru a fi mai ușor încadrabile în categoriile de cheltuieli eligibile.\n\nDorești să aplici aceste modificări documentului tău?");
      if (!confirmEu) return; // Anulat
    } else if (action === "investor_ready") {
      const confirmInv = window.confirm("🏦 Transformare în Plan Profesionist\n\nAceastă funcție va dezvolta planul tău la un nivel avansat, așteptat de bănci și investitori privați, adăugând:\n1. Un Rezumat Executiv (Executive Summary)\n2. O Matrice de Diferențiere față de concurență\n3. Strategia 'Go-To-Market' (inclusiv CAC și LTV)\n4. Analiză detaliată de Risc și Plan de Contingență\n5. Scenarii Financiare Multiple (Pesimist/Realist/Optimist)\n\nAcțiunea va dura mai mult. Ești sigur că vrei să continui?");
      if (!confirmInv) return;
    }

    setIsEditingAi(true);
    setShowToneOptions(false);
    try {
      const res = await fetch("/api/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ result, action, customStyle, targetSection })
      });
      let data;
      try {
        data = await res.json();
      } catch (e) {
        alert("Eroare de rețea. Te rugăm să mai încerci o dată.");
        return;
      }

      if (data.updatedResult) {
        try {
          const parsed = JSON.parse(data.updatedResult);
          setResult(formatObjectNumbers(parsed));
        } catch (err) {
          console.error("Failed to parse JSON:", err);
          alert("AI-ul a returnat un format invalid. Mai încearcă o dată.");
        }
      } else if (data.error) {
        alert(data.error);
      }
    } catch (e) {
      console.error(e);
      alert("A apărut o eroare neașteptată la editarea cu AI.");
    } finally {
      setIsEditingAi(false);
    }
  };

  const updateField = (path: (string|number)[], value: string) => {
    setResult((prev: any) => {
      const next = JSON.parse(JSON.stringify(prev));
      let curr = next;
      for (let i = 0; i < path.length - 1; i++) {
        curr = curr[path[i]];
      }
      curr[path[path.length - 1]] = value;
      return next;
    });
  };

  const removeField = (path: (string|number)[]) => {
    setResult((prev: any) => {
      const next = JSON.parse(JSON.stringify(prev));
      let curr = next;
      for (let i = 0; i < path.length - 1; i++) {
        curr = curr[path[i]];
      }
      const lastKey = path[path.length - 1];
      if (Array.isArray(curr)) {
         curr.splice(lastKey as number, 1);
      } else {
         delete curr[lastKey];
      }
      return next;
    });
  };

  const [showExamples, setShowExamples] = useState(false); 
  const [mockupTab, setMockupTab] = useState(0);
  const [innerMockupTab, setInnerMockupTab] = useState('SWOT');
  
  const [user, setUser] = useState<User | null>(null);
  const ADMIN_EMAILS = ['contact@ideeata.ai', 'nadiaramonaz@gmail.com'];
  const isAdmin = user ? ADMIN_EMAILS.includes(user.email || '') : false;
  const isPlanPaid = isAdmin || devBypass || subscriptionActive || (result && unlockedPlans.includes(result.nume)) || isPaid;
  const isStudioPaid = isAdmin || devBypass || subscriptionActive || euFundsUnlocked || isPaid;
  const isContentCopyProtected = !isPlanPaid && !isStudioPaid;
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isEmailLoading, setIsEmailLoading] = useState(false);

  useEffect(() => {
    const checkRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result && result.user) {
          setUser(result.user);
        }
      } catch (error: any) {
        console.error("Eroare la redirect:", error);
        setAuthError(error.message || "A apărut o eroare necunoscută.");
      }
    };
    checkRedirect();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthLoading(false);
      if (currentUser) {
        window.scrollTo({ top: 0 });
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setCredits(0);
      setEuFundsUnlocked(false);
      setSubscriptionActive(false);
      setUnlockedPlans([]);
      return;
    }

    const userRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setCredits(data.credits || 0);
        setEuFundsUnlocked(data.euFundsUnlocked || false);
        setSubscriptionActive(data.subscriptionActive || false);
        setUnlockedPlans(data.unlockedPlans || []);
      } else {
        setDoc(userRef, {
          email: user.email,
          credits: 0,
          euFundsUnlocked: false,
          subscriptionActive: false,
          unlockedPlans: [],
          createdAt: new Date().toISOString(),
        }, { merge: true });
      }
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentSuccess = urlParams.get("payment_success") === "true";
    const sessionId = urlParams.get("session_id");
    const tier = urlParams.get("tier");

    if (paymentSuccess && sessionId && user) {
      const verifyPayment = async () => {
        try {
          const res = await fetch(`/api/verify-checkout?session_id=${sessionId}`);
          const data = await res.json();
          if (data.success && data.userId === user.uid) {
            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);
            const processedSessions = userSnap.data()?.processedSessions || [];

            if (!processedSessions.includes(sessionId)) {
              if (tier === "standard") {
                const planToUnlock = data.planName || result?.nume || "Plan de Afaceri";
                await setDoc(userRef, {
                  unlockedPlans: arrayUnion(planToUnlock),
                  processedSessions: arrayUnion(sessionId)
                }, { merge: true });
                alert(`Plată confirmată! Planul "${planToUnlock}" a fost deblocat pentru descărcare.`);
              } else if (tier === "eu-funds") {
                await setDoc(userRef, {
                  euFundsUnlocked: true,
                  processedSessions: arrayUnion(sessionId)
                }, { merge: true });
                alert("Plată confirmată! Modulul de Fonduri Europene a fost deblocat.");
              } else if (tier === "pro") {
                await setDoc(userRef, {
                  subscriptionActive: true,
                  processedSessions: arrayUnion(sessionId)
                }, { merge: true });
                alert("Plată confirmată! Abonamentul tău Pro Nelimitat a fost activat.");
              }
            }
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        } catch (error) {
          console.error("Eroare la verificarea plății:", error);
        }
      };
      verifyPayment();
    }
  }, [user]);

  // Incarca planul salvat din localStorage la pornire si verifica daca s-a anulat plata
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("current_generated_plan");
        if (saved && saved !== "null" && saved !== "undefined") {
          try {
            setResult(formatObjectNumbers(JSON.parse(saved)));
          } catch (e) {
            console.error("Eroare la incarcarea planului salvat local:", e);
          }
        }
      
      const urlParams = new URLSearchParams(window.location.search);
      const paymentCancelled = urlParams.get("payment_cancelled") === "true";
      if (paymentCancelled) {
        setShowPricingModal(true);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  // Salveaza planul in localStorage cand se schimba rezultatul
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (result) {
        localStorage.setItem("current_generated_plan", JSON.stringify(result));
      } else {
        localStorage.removeItem("current_generated_plan");
      }
    }
  }, [result]);

  // Prevenire copiere conținut dacă este protejat
  useEffect(() => {
    const handleCopyCut = (e: ClipboardEvent) => {
      if (isContentCopyProtected) {
        e.preventDefault();
        alert("Previzualizare protejată. Achiziționează Pachetul Standard (39 lei) pentru a descărca documentele sau Pachetul Studio (99 lei) pentru a le edita și copia.");
      }
    };

    document.addEventListener("copy", handleCopyCut);
    document.addEventListener("cut", handleCopyCut);
    return () => {
      document.removeEventListener("copy", handleCopyCut);
      document.removeEventListener("cut", handleCopyCut);
    };
  }, [isContentCopyProtected]);

  const handleGoogleLogin = async () => {
    setAuthError(null);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Eroare la autentificare cu popup, se incearca redirect:", error);
      try {
        await signInWithRedirect(auth, provider);
      } catch (redirectError: any) {
        console.error("Eroare la autentificare cu redirect:", redirectError);
        setAuthError(redirectError.message || "A apărut o eroare la conectare. Te rugăm să folosești formularul de email.");
      }
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsEmailLoading(true);

    try {
      if (isLoginMode) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      // If successful, onAuthStateChanged will handle the redirect/state update
    } catch (error: any) {
      console.error("Eroare email auth:", error);
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setAuthError("Email sau parolă incorectă.");
      } else if (error.code === 'auth/email-already-in-use') {
        setAuthError("Există deja un cont cu acest email. Te rugăm să te loghezi.");
      } else if (error.code === 'auth/weak-password') {
        setAuthError("Parola trebuie să aibă cel puțin 6 caractere.");
      } else {
        setAuthError(error.message || "A apărut o eroare necunoscută la autentificare.");
      }
    } finally {
      setIsEmailLoading(false);
    }
  };
  
  const inputRef = useRef<any>(null);
  const brochureRef = useRef<any>(null);
  const presentationRef = useRef<any>(null);
  const pdfPrintRef = useRef<any>(null);

  const examplesList = [
    "Consultanță Securitate Cibernetică",
    "Analiză de Risc Instituțional",
    "Dezvoltare Soluții AI pentru Companii",
    "Fermă Urbană de Microplante",
    "Consultanță Accesare Fonduri Europene",
    "Spălătorie Auto Ecologică",
    "Agenție de Marketing Digital",
    "Platformă de Cursuri Online",
    "Studio de Design Interior",
    "Magazin Online de Produse Bio",
    "Aplicație de Fitness",
    "Consultanță Nutriție",
    "Servicii de Contabilitate",
    "Clinică Stomatologică",
    "Cafenea de Specialitate",
    "Service Auto Hibrid",
    "Organizare Evenimente",
    "Agenție de Recrutare IT"
  ];

  const randomIdeas = [
    "Producție de ambalaje biodegradabile din miceliu",
    "Aplicație de realitate augmentată pentru design interior",
    "Serviciu de abonament pentru cafea de specialitate prăjită local",
    "Reciclare și recondiționare baterii pentru mașini electrice",
    "Turism apicol și experiențe de degustare la stupină",
    "Platformă de telemedicină veterinară",
    "Atelier de conversie a mașinilor clasice în mașini electrice",
    "Sistem de irigații intelligente bazate pe senzori IoT",
    "Catering cu meniu complet personalizat pe baza ADN-ului",
    "Agenție de turism pentru experiențe de „digital detox”"
  ];

  const loadingMessages = [
    "Se inițiază analiza de piață...",
    "Se calculează necesarul financiar...",
    "Se preia cursul valutar actualizat...",
    "Se definitivează strategia S.W.O.T...",
    "Aproape gata..."
  ];
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (loading) {
      interval = setInterval(() => {
        setMessageIndex((prev) => (prev < loadingMessages.length - 1 ? prev + 1 : prev));
      }, 2500); 
    }
    return () => clearInterval(interval);
  }, [loading, loadingMessages.length]);

  const generate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault(); 
    if (!skill.trim() || loading) return;

    setLoading(true);
    setMessageIndex(0);
    setResult(null);
    setIsPaid(false);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skill }),
      });

      let data;
      try {
        const resText = await res.text();
        try {
          data = JSON.parse(resText);
        } catch (e) {
          throw new Error(res.ok ? "Răspuns neașteptat de la server. Vă rugăm să reîncercați." : "Eroare la comunicarea cu serverul.");
        }

        if (!res.ok) {
          throw new Error(data.error || `Eroare server: ${res.status}`);
        }
      } catch (err: any) {
        throw new Error(err.message || "Eroare de conexiune la server.");
      }
      if (data.fx_rate) setFxRate(data.fx_rate);

      if (data && data.ideas && data.ideas.length > 0) {
        const content = data.ideas[0];
        let cleanJson = content.replace(/```json/g, '').replace(/```/g, '').trim();
        cleanJson = cleanJson.replace(/[„“”]/g, '"');
        const startIndex = cleanJson.indexOf('{');
        const endIndex = cleanJson.lastIndexOf('}');
        if (startIndex !== -1 && endIndex !== -1) cleanJson = cleanJson.substring(startIndex, endIndex + 1);

        try {
          const finalResult = JSON.parse(cleanJson);
          setResult(formatObjectNumbers(finalResult));
          setSkill(""); 
          
          // Scroll dynamically to the top of the page to show the top of the new plan
          setTimeout(() => {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }, 100);
          
          if (user) {
            try {
              const planId = finalResult.nume.replace(/[^a-zA-Z0-9]/g, '_') + "_" + Date.now();
              const planRef = doc(db, "users", user.uid, "plans", planId);
              await setDoc(planRef, {
                ...finalResult,
                createdAt: new Date().toISOString(),
              });
              console.log("Plan salvat cu succes în Firestore:", planId);
            } catch (fsError) {
              console.error("Eroare la salvarea planului în Firestore:", fsError);
            }
          }
        } catch (parseError) {
          console.error("TEXTUL GENERAT DE AI A FOST:", cleanJson);
          alert("AI-ul a uitat niște ghilimele în structura de date! Apasă din nou pe „Generează” pentru a-i cere o variantă corectă.");
        }
      }
    } catch (error: any) {
      console.error("Eroare:", error);
      alert(error.message || "A apărut o eroare la generarea planului. Te rugăm să încerci din nou mai târziu.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault(); 
      generate();
    }
  };

  const formatPrice = (priceText: any) => {
    if (!priceText) return "";
    const numericValue = parseInt(priceText.toString().replace(/[^0-9]/g, ""));
    if (isNaN(numericValue)) return priceText;

    if (currency === "EUR") {
      const eurValue = Math.round(numericValue * fxRate);
      return `${eurValue} EUR`;
    }
    return `${numericValue.toLocaleString('ro-RO')} LEI`;
  };

  const resetApp = () => {
    setResult(null);
    setCurrency("LEI");
    setIsPaid(false);
    if (typeof window !== "undefined") {
      localStorage.removeItem("current_generated_plan");
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const downloadAction = async (mode: 'pdf' | 'pptx' | 'word', bypassPaymentCheck = false) => {
    const planName = result?.nume || "Plan de Afaceri";

    if (!isPlanPaid && !bypassPaymentCheck) {
      if (credits > 0) {
        const confirmUnlock = window.confirm(
          `Descărcarea acestui document va consuma 1 credit din cele ${credits} disponibile. Dorești să continui?`
        );
        if (!confirmUnlock) return;

        try {
          const userRef = doc(db, "users", user!.uid);
          await setDoc(userRef, {
            credits: increment(-1),
            unlockedPlans: arrayUnion(planName)
          }, { merge: true });
        } catch (e) {
          console.error("Eroare la scaderea creditului:", e);
          alert("A apărut o eroare la procesarea creditului. Vă rugăm reîncercați.");
          return;
        }
      } else {
        setPendingDownloadMode(mode);
        setShowPricingModal(true);
        return;
      }
    }
    setIsDownloading(mode);
    try {
      if (mode === 'pptx' || mode === 'pdf') {
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      if (mode === 'pptx') {
        const slides = document.querySelectorAll('.presentation-slide');
        if (slides.length === 0) {
           setIsDownloading(null);
           return;
        }

        const pres = new pptxgen();
        pres.layout = 'LAYOUT_16x9';

        for (let i = 0; i < slides.length; i++) {
          const slideElement = slides[i] as HTMLElement;
          const dataUrl = await toPng(slideElement, { quality: 1.0, pixelRatio: 2 });
          
          const pptSlide = pres.addSlide();
          pptSlide.addImage({ data: dataUrl, x: 0, y: 0, w: '100%', h: '100%' });
        }

        const safeName = result?.nume?.replace(/[^a-zA-Z0-9]/g, '_') || 'Business';
        await pres.writeFile({ fileName: `IdeeaTa_Brosura_${safeName}.pptx` });
      } else if (mode === 'pdf') {
        const slides = document.querySelectorAll('.pdf-presentation-slide');
        if (slides.length === 0) {
           setIsDownloading(null);
           return;
        }
        
        const pdf = new jsPDF({
          orientation: "landscape",
          unit: "pt",
          format: [1280, 720]
        });

        for (let i = 0; i < slides.length; i++) {
          const slideElement = slides[i] as HTMLElement;
          const dataUrl = await toPng(slideElement, { quality: 1.0, pixelRatio: 2 });
          if (i > 0) pdf.addPage([1280, 720], "landscape");
          pdf.addImage(dataUrl, 'PNG', 0, 0, 1280, 720);
        }
        
        const safeName = result?.nume?.replace(/[^a-zA-Z0-9]/g, '_') || 'Business';
        pdf.save(`IdeeaTa_Prezentare_${safeName}.pdf`);
      } else if (mode === 'word') {
          const preHtml = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Plan de Afaceri</title></head><body>";
          const postHtml = "</body></html>";
          
          let html = `
              <h1 style="text-align:center; font-family: Arial, sans-serif;">${result.nume || ''}</h1>
              <h3 style="text-align:center; color: #555; font-style: italic; font-family: Arial, sans-serif;">„${result.slogan || ''}”</h3>
              <hr />
              
              <h2 style="font-family: Arial, sans-serif; color: #065f46;">I & II. Date Generale și Viziune</h2>
              <table width="100%" cellpadding="5" cellspacing="0" style="font-family: Arial, sans-serif; font-size: 14px; margin-bottom: 20px;">
                <tr><td width="30%"><strong>Forma Juridică:</strong></td><td>${result.date_generale?.forma_juridica}</td></tr>
                <tr><td><strong>Cod CAEN:</strong></td><td>${result.date_generale?.cod_caen}</td></tr>
                <tr><td><strong>Date Contact:</strong></td><td>${result.date_generale?.date_contact}</td></tr>
              </table>
              <h3 style="font-family: Arial, sans-serif; font-size: 16px;">Viziune și Strategie</h3>
              <ul style="font-family: Arial, sans-serif; font-size: 14px;">
                <li style="margin-bottom: 10px;"><strong>Obiective pe Termen Scurt:</strong><br/>${result.viziune_strategie?.obiective_scurt}</li>
                <li style="margin-bottom: 10px;"><strong>Obiective pe Termen Mediu:</strong><br/>${result.viziune_strategie?.obiective_mediu}</li>
                <li style="margin-bottom: 10px;"><strong>Misiune și Valori:</strong><br/>${result.viziune_strategie?.misiune_valori}</li>
              </ul>

              <h2 style="font-family: Arial, sans-serif; color: #065f46;">III. Analiza Pieței și Promovarea</h2>
              <ul style="font-family: Arial, sans-serif; font-size: 14px;">
                <li style="margin-bottom: 10px;"><strong>Clienții Țintă:</strong><br/>${result.analiza_pietei?.clienti_tinta}</li>
                <li style="margin-bottom: 10px;"><strong>Concurența:</strong><br/>${result.analiza_pietei?.concurenta}</li>
                <li style="margin-bottom: 10px;"><strong>Strategia de Marketing:</strong><br/>${result.analiza_pietei?.strategie_marketing}</li>
              </ul>

              <h2 style="font-family: Arial, sans-serif; color: #065f46;">IV. Analiza SWOT</h2>
              <table width="100%" border="1" cellpadding="10" cellspacing="0" style="border-collapse: collapse; font-family: Arial, sans-serif; width: 100%;">
                  <tr>
                      <td width="50%" valign="top">
                          <h3 style="color: #065f46;">Puncte Tari (S)</h3>
                          <ul>
                              ${result.analiza_swot?.puncte_tari?.map((item: any) => `<li><strong style="color:#065f46;">${item.titlu || item}</strong><br/>${item.explicatie_tehnica}</li>`).join('') || ''}
                          </ul>
                      </td>
                      <td width="50%" valign="top">
                          <h3 style="color: #9a3412;">Slăbiciuni (W)</h3>
                          <ul>
                              ${result.analiza_swot?.puncte_slabe?.map((item: any) => `<li><strong style="color:#9a3412;">${item.titlu || item}</strong><br/>${item.explicatie_tehnica}</li>`).join('') || ''}
                          </ul>
                      </td>
                  </tr>
                  <tr>
                      <td width="50%" valign="top">
                          <h3 style="color: #1e40af;">Oportunități (O)</h3>
                          <ul>
                              ${result.analiza_swot?.oportunitati?.map((item: any) => `<li><strong style="color:#1e40af;">${item.titlu || item}</strong><br/>${item.explicatie_tehnica}</li>`).join('') || ''}
                          </ul>
                      </td>
                      <td width="50%" valign="top">
                          <h3 style="color: #991b1b;">Amenințări (T)</h3>
                          <ul>
                              ${result.analiza_swot?.amenintari?.map((item: any) => `<li><strong style="color:#991b1b;">${item.titlu || item}</strong><br/>${item.explicatie_tehnica}</li>`).join('') || ''}
                          </ul>
                      </td>
                  </tr>
              </table>
              
              <h2 style="font-family: Arial, sans-serif; color: #065f46; margin-top: 24px;">V. Planul Operațional și de Management</h2>
              <ol style="font-family: Arial, sans-serif; line-height: 1.6; font-size: 14px; padding-left: 20px;">
                  <li style="margin-bottom: 10px;"><strong>Descriere Flux Tehnologic:</strong><br/>${result.plan_operational?.descriere_flux}</li>
                  <li style="margin-bottom: 10px;"><strong>Resurse Umane (Organigramă):</strong><br/>${result.plan_operational?.resurse_umane}</li>
                  <li style="margin-bottom: 10px;"><strong>Locație și Dotări Necesare:</strong><br/>${result.plan_operational?.locatie_dotari}</li>
              </ol>

              <h2 style="font-family: Arial, sans-serif; color: #065f46;">VI. Planul Financiar</h2>
              <p style="font-family: Arial, sans-serif; line-height: 1.6; font-size: 14px; font-style: italic;">
                  ${result.plan_financiar?.strategie_financiara}
              </p>
              <h3 style="font-family: Arial, sans-serif; font-size: 16px;">Buget Investiții</h3>
              <ul style="font-family: Arial, sans-serif; line-height: 1.6; font-size: 14px;">
                  ${result.plan_financiar?.buget_investitii?.map((b: any) => `<li><strong>${b.item}</strong> - <span style="color:#065f46;">${formatPrice(b.cost)}</span><br/><span style="color:#555; font-style:italic;">${b.explicatie}</span></li>`).join('') || ''}
              </ul>
              <h3 style="text-align:right; font-family: Arial, sans-serif; color: #065f46;">
                  Total Estimat: ${formatPrice(result.plan_financiar?.buget_investitii?.reduce((sum: number, b: any) => sum + parseInt(b.cost?.toString().replace(/[^0-9]/g, '') || '0'), 0).toString())}
              </h3>
          `;
          
          const blob = new Blob(['\ufeff', preHtml + html + postHtml], {
              type: 'application/msword'
          });
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          
          const safeName = result?.nume?.replace(/[^a-zA-Z0-9]/g, '_') || 'Business';
          link.download = `IdeeaTa_Document_${safeName}.doc`;
          
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
      }
    } catch (e) {
      console.error("Eroare la generarea documentului", e);
      alert("A apărut o eroare la salvarea documentului.");
    } finally {
      setIsDownloading(null);
    }
  };

  const renderSidebar = () => (
    <div className="w-full lg:w-2/5 xl:w-1/3 flex flex-col gap-6 sticky top-8 print:hidden">
      
                <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-8 shadow-xl sticky top-8">
                   <h3 className="text-2xl font-black text-white mb-4 flex items-center gap-3"><span className="text-emerald-500">✨</span> Instrumente</h3>
                   <p className="text-zinc-400 text-sm mb-6 leading-relaxed">Aici poți folosi asistentul inteligent pentru a adăuga mai multe informații și detalii planului tău.</p>
                   
                   <div className="flex flex-col gap-3">
                      <div className="flex flex-col gap-2">
                        <button 
                          type="button"
                          onClick={() => setShowToneOptions(!showToneOptions)} 
                          disabled={isEditingAi} 
                          className="w-full bg-black hover:bg-zinc-800 border border-zinc-800 rounded-xl px-5 py-4 font-bold text-sm text-zinc-300 transition-all text-left flex items-center justify-between group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="flex items-center gap-3">
                            <span className="text-emerald-500 group-hover:scale-110 transition-transform">🪄</span>
                            <span>Rescrie tonul</span>
                          </span>
                          <span className="text-xs text-zinc-500">{showToneOptions ? "▲" : "▼"}</span>
                        </button>
                        
                        {showToneOptions && (
                          <div className="bg-black/40 border border-zinc-800 rounded-xl p-2 flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                            <button 
                              type="button"
                              onClick={() => handleAiEdit("professional_tone", "formal, corporativ și profesionist")} 
                              disabled={isEditingAi}
                              className="w-full text-xs text-left px-4 py-2.5 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-white transition-all font-semibold"
                            >
                              💼 Profesional & Corporativ
                            </button>
                            <button 
                              type="button"
                              onClick={() => handleAiEdit("professional_tone", "entuziast, creativ și plin de energie")} 
                              disabled={isEditingAi}
                              className="w-full text-xs text-left px-4 py-2.5 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-white transition-all font-semibold"
                            >
                              🎨 Entuziast & Creativ
                            </button>
                            <button 
                              type="button"
                              onClick={() => handleAiEdit("professional_tone", "persuasiv, orientat spre vânzări și convingător")} 
                              disabled={isEditingAi}
                              className="w-full text-xs text-left px-4 py-2.5 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-white transition-all font-semibold"
                            >
                              📈 Persuasiv & Vânzări
                            </button>
                            <button 
                              type="button"
                              onClick={() => handleAiEdit("professional_tone", "prietenos, simplu și ușor de înțeles")} 
                              disabled={isEditingAi}
                              className="w-full text-xs text-left px-4 py-2.5 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-white transition-all font-semibold"
                            >
                              🤝 Prietenos & Casual
                            </button>
                          </div>
                        )}
                      </div>

                      <button 
                        type="button" 
                        onClick={() => {
                          if (!isStudioPaid) {
                            setShowPricingModal(true);
                          } else {
                            handleAiEdit("eu_funds_optimization");
                          }
                        }} 
                        disabled={isEditingAi} 
                        className={`w-full text-left flex items-center justify-between rounded-xl px-5 py-4 font-bold text-sm transition-all group disabled:opacity-50 disabled:cursor-not-allowed ${
                          !isStudioPaid 
                            ? "bg-zinc-900/60 hover:bg-zinc-800/80 border border-amber-500/30 text-amber-300" 
                            : "bg-black hover:bg-zinc-800 border border-zinc-800 text-zinc-300"
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <span className="text-amber-500 group-hover:scale-110 transition-transform">🇪🇺</span>
                          <span>
                            {isEditingAi ? "Se procesează..." : "Optimizat pentru Fonduri Europene"}
                          </span>
                        </span>
                        {!isStudioPaid && (
                          <span className="text-[10px] bg-amber-500/20 border border-amber-500/40 text-amber-300 px-2 py-0.5 rounded-full font-black uppercase tracking-wider whitespace-nowrap flex items-center gap-1">
                            🔒 PRO
                          </span>
                        )}
                      </button>

                      <button type="button" onClick={() => handleAiEdit("optimize_budget")} disabled={isEditingAi} className="w-full bg-black hover:bg-zinc-800 border border-zinc-800 rounded-xl px-5 py-4 font-bold text-sm text-zinc-300 transition-all text-left flex items-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed">
                        <span className="text-emerald-500 group-hover:scale-110 transition-transform">📉</span>
                        <span>
                          {isEditingAi ? "Se procesează..." : (
                            <>
                              Optimizează Bugetul <span className="whitespace-nowrap">(Personalizat)</span>
                            </>
                          )}
                        </span>
                      </button>

                      <button type="button" onClick={() => handleAiEdit("add_sections")} disabled={isEditingAi} className="w-full bg-black hover:bg-zinc-800 border border-zinc-800 rounded-xl px-5 py-4 font-bold text-sm text-zinc-300 transition-all text-left flex items-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed">
                        <span className="text-emerald-500 group-hover:scale-110 transition-transform">💡</span> 
                        <span>{isEditingAi ? "Se procesează..." : "Adaugă secțiuni noi"}</span>
                      </button>

                      <button type="button" onClick={() => handleAiEdit("investor_ready")} disabled={isEditingAi} className="w-full bg-zinc-900/80 hover:bg-zinc-800 border border-emerald-500/30 rounded-xl px-5 py-4 font-bold text-sm text-emerald-100 transition-all text-left flex items-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                        <span className="text-emerald-400 group-hover:scale-110 transition-transform text-lg">🏦</span> 
                        <span>{isEditingAi ? "Se procesează..." : "Plan Profesionist (Investitori/Bănci)"}</span>
                      </button>
                    </div>
                </div>
            
            {/* User Tip */}
            <div className="mt-6 flex items-start gap-2 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl w-full">
              <span className="text-emerald-400 mt-0.5 text-lg">💡</span>
              <p className="text-[13px] text-emerald-100/70 leading-relaxed">
                <strong>Sfat:</strong> Aici editezi textul documentului. Pentru a adăuga <strong className="text-white">imagini</strong>, logo sau a schimba aranjarea în pagină, apasă <em>Confirmă și Salvează</em>, apoi <strong>Descarcă Word</strong> și deschide fișierul cu Microsoft Word sau Google Docs.
              </p>
            </div>
    </div>
  );

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
        {/* Background glow orbs */}
        <div className="absolute top-[10%] left-[-15%] w-[600px] h-[600px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none animate-pulse duration-[8000ms] z-0"></div>
        <div className="absolute top-[35%] right-[-15%] w-[650px] h-[650px] rounded-full bg-amber-500/5 blur-[150px] pointer-events-none animate-pulse duration-[12000ms] z-0"></div>
        
        <div className="w-full max-w-md p-8 md:p-12 bg-zinc-900/80 backdrop-blur-md rounded-3xl border border-zinc-800 shadow-2xl relative z-10 flex flex-col items-center">
          <h1 className="text-4xl font-black text-transparent bg-gradient-to-r from-zinc-400 via-emerald-400 to-zinc-400 bg-clip-text text-center mb-4 tracking-tighter">IdeeaTa.ai</h1>
          <p className="text-zinc-400 text-center mb-10 font-medium">Platforma necesită autentificare pentru a continua.</p>
          
          <form onSubmit={handleEmailAuth} className="w-full mb-6 space-y-4">
            <div>
              <input 
                type="email" 
                placeholder="Adresa de email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="off"
                data-bwignore="true"
                data-1p-ignore="true"
                className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
              />
            </div>
            <div>
              <input 
                type="password" 
                placeholder="Parola"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                data-bwignore="true"
                data-1p-ignore="true"
                className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
              />
            </div>
            <button 
              type="submit" 
              disabled={isEmailLoading}
              className="w-full py-4 px-6 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all shadow-lg disabled:opacity-50"
            >
              {isEmailLoading ? "Se procesează..." : (isLoginMode ? "Intră în cont" : "Creează cont nou")}
            </button>
            <div className="text-center mt-4">
              <button 
                type="button" 
                onClick={() => setIsLoginMode(!isLoginMode)}
                className="text-emerald-400 text-sm font-medium hover:text-emerald-300 transition-colors"
              >
                {isLoginMode ? "Nu ai cont? Creează unul nou" : "Ai deja cont? Intră aici"}
              </button>
            </div>
          </form>

          <div className="w-full flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-zinc-800"></div>
            <span className="text-zinc-500 text-sm font-medium">sau</span>
            <div className="flex-1 h-px bg-zinc-800"></div>
          </div>

          <button 
            onClick={handleGoogleLogin} 
            className="w-full py-4 px-6 flex items-center justify-center gap-4 bg-white hover:bg-zinc-100 text-zinc-900 font-bold rounded-xl transition-all shadow-lg"
          >
            <svg viewBox="0 0 24 24" className="w-6 h-6" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continuă cu Google
          </button>
          
          {authError && (
            <div className="mt-6 w-full p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-red-400 text-sm font-medium text-center break-words">{authError}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#09090b] text-white p-8 flex flex-col items-center font-sans print:bg-white print:text-black print:p-0 relative overflow-x-hidden">
      {/* Background glow orbs */}
      <div className="absolute top-[10%] left-[-15%] w-[600px] h-[600px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none animate-pulse duration-[8000ms] z-0"></div>
      <div className="absolute top-[35%] right-[-15%] w-[650px] h-[650px] rounded-full bg-amber-500/5 blur-[150px] pointer-events-none animate-pulse duration-[12000ms] z-0"></div>

      {isDownloading && (
        <div className="fixed inset-0 bg-[#09090b]/90 backdrop-blur-sm z-[100] flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-6"></div>
          <p className="text-2xl font-bold text-white tracking-widest uppercase text-center">
            {isDownloading === 'pptx' ? 'Se generează broșură de prezentare...' : isDownloading === 'pdf' ? 'Se generează prezentarea...' : 'Se generează document...'}
          </p>
          <p className="text-emerald-400 font-medium mt-3 text-center">
            Acest proces durează câteva momente pentru a asigura calitatea maximă.
          </p>
        </div>
      )}

      <div className={`${isDownloading === 'pptx' ? 'hidden' : 'flex'} flex-col items-center w-full max-w-[1600px] px-4 md:px-12 relative z-10`}>
        {user && (
          <div className="w-full flex justify-between items-center py-4 border-b border-zinc-800/80 mb-6 print:hidden">
            <span className="text-zinc-500 text-xs font-semibold">Proiectul tău de afaceri inteligent</span>
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="text-zinc-400">{user.email}</span>
              {subscriptionActive ? (
                <span className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                  PRO
                </span>
              ) : euFundsUnlocked ? (
                <span className="bg-amber-500/20 border border-amber-500/40 text-amber-300 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                  STUDIO &amp; FONDURI
                </span>
              ) : isPlanPaid ? (
                <span className="bg-blue-500/20 border border-blue-500/40 text-blue-400 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                  STANDARD DEBLOCAT
                </span>
              ) : (
                <span className="bg-zinc-800 border border-zinc-700 text-zinc-300 px-2 py-0.5 rounded-full font-bold">
                  PREVIZUALIZARE
                </span>
              )}
              {!subscriptionActive && (
                <button 
                  onClick={() => setShowPricingModal(true)}
                  className="text-emerald-400 hover:text-emerald-300 transition-colors font-bold underline cursor-pointer"
                >
                  Vezi Planuri
                </button>
              )}
              <button 
                onClick={() => signOut(auth)}
                className="text-zinc-500 hover:text-white transition-colors cursor-pointer"
              >
                Ieși din cont
              </button>
            </div>
          </div>
        )}

        <h1 className="text-4xl md:text-6xl lg:text-[5rem] font-black mt-4 lg:mt-12 mb-6 lg:mb-8 not-italic tracking-tighter cursor-pointer bg-gradient-to-r from-zinc-400 via-emerald-400 to-zinc-400 bg-clip-text text-transparent animate-shimmer print:hidden self-start lg:self-center" onClick={resetApp}>
          IdeeaTa.ai
        </h1>
        
        {!result && (
          <>
          <div className="w-full flex flex-col items-center justify-center mb-12 lg:mb-16 relative">
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-zinc-900/90 border border-emerald-500/30 text-emerald-400 text-sm font-black uppercase tracking-wider shadow-[0_0_30px_rgba(16,185,129,0.1)] hover:border-emerald-400/50 transition-all duration-300 animate-pulse relative z-10">
              <span className="text-base">✨</span> Nu începe o afacere înainte să verifici IdeeaTa.ai
            </div>
            {/* Elegant curved line bridging the gap below the pill */}
            <div className="w-full max-w-2xl mt-4 opacity-50 relative -top-6 -z-10 hidden md:block">
              <svg viewBox="0 0 600 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
                <path d="M 0 10 C 150 10, 200 70, 300 70 C 400 70, 450 10, 600 10" stroke="url(#paint0_linear)" strokeWidth="1" strokeDasharray="4 4" />
                <defs>
                  <linearGradient id="paint0_linear" x1="0" y1="0" x2="600" y2="0" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#10b981" stopOpacity="0" />
                    <stop offset="0.5" stopColor="#10b981" />
                    <stop offset="1" stopColor="#10b981" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
            <div className="w-full grid grid-cols-1 xl:grid-cols-2 gap-12 xl:gap-20 items-stretch animate-in fade-in zoom-in duration-500 mb-32 mt-4 lg:mt-8">
          {/* Left Column */}
          <div className="flex flex-col justify-between text-left min-h-full">
            
            <div>
              <h2 className="text-3xl md:text-4xl lg:text-[3.5rem] font-black mb-8 leading-[1.1] not-italic text-white tracking-tighter text-left max-w-[90%]">
                Transformă-ți <span className="text-emerald-400">experiența</span> într-un business validat.
              </h2>
              
              <p className="text-zinc-400 text-xl lg:text-2xl leading-relaxed not-italic font-medium text-left">
                Descrie la ce ești bun, iar noi îți vom genera un plan de afaceri complet.
              </p>
              <p className="text-zinc-400 text-xl lg:text-2xl mt-4 leading-relaxed not-italic font-medium text-left">
                Analiză SWOT, proiecții financiare și strategie de piață.
              </p>
            </div>

            {/* Animated wave lines - decorative */}
            <div className="relative w-full overflow-hidden my-8 opacity-70">
              <svg viewBox="0 0 500 260" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
                <defs>
                  <style>{`
                    @keyframes waveShift {
                      0% { transform: translateX(0px); }
                      100% { transform: translateX(-60px); }
                    }
                    @keyframes waveShift2 {
                      0% { transform: translateX(0px); }
                      100% { transform: translateX(60px); }
                    }
                    .wv1 { animation: waveShift 7s ease-in-out infinite alternate; }
                    .wv2 { animation: waveShift2 9s ease-in-out infinite alternate; }
                    .wv3 { animation: waveShift 11s ease-in-out infinite alternate-reverse; }
                    .wv4 { animation: waveShift2 13s ease-in-out infinite alternate; }
                    .wv5 { animation: waveShift 15s ease-in-out infinite alternate-reverse; }
                  `}</style>
                </defs>
                {/* Group 1 - bright green, top waves */}
                <g className="wv1" stroke="#10b981" strokeWidth="1" fill="none" opacity="0.8">
                  <path d="M-60,18 C-10,-10 60,55 130,15 C200,-25 270,60 340,10 C400,-20 460,45 560,12" />
                  <path d="M-60,36 C-5,5 65,70 135,30 C205,-10 275,75 345,25 C405,-5 462,62 560,28" />
                  <path d="M-60,54 C0,22 70,85 140,45 C210,5 280,90 350,40 C410,10 465,78 560,44" />
                </g>
                {/* Group 2 - mid green, middle waves */}
                <g className="wv2" stroke="#10b981" strokeWidth="0.8" fill="none" opacity="0.5">
                  <path d="M-60,72 C5,40 75,100 145,60 C215,20 285,105 355,55 C415,25 468,92 560,60" />
                  <path d="M-60,90 C10,58 80,115 150,75 C220,35 290,118 360,70 C418,40 470,108 560,76" />
                  <path d="M-60,108 C15,76 85,130 155,90 C225,50 295,132 365,85 C422,55 472,124 560,92" />
                </g>
                {/* Group 3 - light green, bottom waves */}
                <g className="wv3" stroke="#6ee7b7" strokeWidth="0.6" fill="none" opacity="0.28">
                  <path d="M-60,124 C20,92 90,145 160,105 C230,65 300,148 370,100 C426,70 474,138 560,108" />
                  <path d="M-60,140 C25,108 95,160 165,120 C235,80 305,162 375,115 C430,85 476,152 560,124" />
                  <path d="M-60,156 C30,124 100,175 170,135 C240,95 310,175 380,130 C434,100 478,165 560,140" />
                </g>
                {/* Group 4 - extra waves */}
                <g className="wv4" stroke="#6ee7b7" strokeWidth="0.4" fill="none" opacity="0.15">
                  <path d="M-60,172 C35,140 105,190 175,150 C245,110 315,190 385,145 C440,115 480,180 560,156" />
                  <path d="M-60,188 C40,156 110,205 180,165 C250,125 320,205 390,160 C445,130 484,195 560,172" />
                  <path d="M-60,204 C45,172 115,220 185,180 C255,140 325,220 395,175 C450,145 488,210 560,188" />
                </g>
                {/* Group 5 - extra waves, very faded */}
                <g className="wv5" stroke="#34d399" strokeWidth="0.3" fill="none" opacity="0.08">
                  <path d="M-60,220 C50,188 120,235 190,195 C260,155 330,235 400,190 C455,160 492,225 560,204" />
                  <path d="M-60,236 C55,204 125,250 195,210 C265,170 335,250 405,205 C460,175 496,240 560,220" />
                  <path d="M-60,252 C60,220 130,265 200,225 C270,185 340,265 410,220 C465,190 500,255 560,236" />
                </g>
              </svg>
            </div>

            <div className="flex flex-col gap-6 mt-2">

              <div className="flex flex-col gap-2">
                <div className="w-full h-px bg-gradient-to-r from-emerald-500/40 via-zinc-700/40 to-transparent"></div>
                <div className="flex items-center justify-between">
                  <p className="text-zinc-400 text-sm font-semibold uppercase tracking-widest">Timp de generare</p>
                  <p className="text-emerald-400 text-sm font-black">Sub 60 sec</p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="w-full h-px bg-gradient-to-r from-emerald-500/30 via-zinc-700/40 to-transparent"></div>
                <div className="flex items-center justify-between">
                  <p className="text-zinc-400 text-sm font-semibold uppercase tracking-widest">Format export</p>
                  <p className="text-emerald-400 text-sm font-black">PDF · PPTX · DOCX</p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="w-full h-px bg-gradient-to-r from-emerald-500/20 via-zinc-700/40 to-transparent"></div>
                <div className="flex items-center justify-between">
                  <p className="text-zinc-400 text-sm font-semibold uppercase tracking-widest">Structură Document</p>
                  <p className="text-emerald-400 text-sm font-black">6 Capitole Standard</p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="w-full h-px bg-gradient-to-r from-emerald-500/10 via-zinc-700/30 to-transparent"></div>
                <div className="flex items-center justify-between">
                  <p className="text-zinc-400 text-sm font-semibold uppercase tracking-widest">Fonduri / Investitori</p>
                  <p className="text-emerald-400 text-sm font-black">Plan Profesional</p>
                </div>
              </div>

            </div>

          </div>

          {/* Right Column (Floating Studio UI) */}
          <div className="relative w-full">
            {/* Glow behind the box */}
            <div className="absolute inset-0 bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none"></div>
            
            {/* Glassmorphism Container */}
            <div className="bg-[#09090b]/60 backdrop-blur-3xl border border-zinc-800/80 rounded-[2rem] p-6 sm:p-10 shadow-[0_0_60px_rgba(16,185,129,0.1)] relative z-10 flex flex-col gap-6 ring-1 ring-white/5">
              
              {/* Fake window controls & Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-zinc-700"></div>
                  <div className="w-3 h-3 rounded-full bg-zinc-700"></div>
                  <div className="w-3 h-3 rounded-full bg-zinc-700"></div>
                </div>
                <h2 className="text-2xl md:text-3xl font-black tracking-tighter bg-gradient-to-r from-zinc-400 via-emerald-400 to-zinc-400 bg-clip-text text-transparent animate-shimmer">IdeeaTa Studio</h2>
                <div className="w-8"></div>
              </div>
              
              <p className="text-zinc-400 font-medium text-lg text-center sm:text-left">
                Construiește planul tău de afaceri inteligent
              </p>
              
              <form onSubmit={generate} className="flex flex-col gap-4 w-full relative group z-10">
                {skill.length > 35 && (
                  <div className="absolute bottom-full mb-3 left-0 right-0 bg-zinc-800 text-zinc-100 p-4 rounded-xl text-base shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 z-50 text-center whitespace-normal break-words border border-zinc-600 pointer-events-none font-medium leading-relaxed">
                    {skill}
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-zinc-800 transform rotate-45 border-b border-r border-zinc-600"></div>
                  </div>
                )}
                
                <div className="relative group/input">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-2xl blur opacity-20 group-focus-within/input:opacity-50 transition duration-500"></div>
                  <textarea
                    ref={inputRef as any}
                    value={skill}
                    title={skill}
                    onChange={(e) => setSkill(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={loading}
                    placeholder={animatedPlaceholder || "Crează un plan pentru... (ex: Consultanță securitate)"}
                    className="relative w-full h-32 p-6 rounded-2xl bg-[#09090b] border border-zinc-700 outline-none focus:border-emerald-500 transition-all text-xl shadow-inner resize-none placeholder:text-zinc-600 font-medium text-white"
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      const randomIndex = Math.floor(Math.random() * randomIdeas.length);
                      setSkill(randomIdeas[randomIndex]);
                      setShowExamples(false);
                      setTimeout(() => inputRef.current?.focus(), 50);
                    }}
                    className="text-zinc-400 font-bold text-lg px-4 py-3 rounded-xl transition-all duration-300 hover:bg-zinc-800/50 hover:text-emerald-400 flex items-center gap-2 w-full sm:w-auto justify-center border border-transparent hover:border-zinc-700/50"
                  >
                    ✨ Inspiră-mă
                  </button>

                  <button type="submit" disabled={loading} className="w-full sm:w-auto bg-white text-black px-8 py-4 rounded-xl font-black text-lg hover:bg-zinc-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center justify-center gap-2">
                    {loading ? loadingMessages[messageIndex] : "Generează Planul"}
                    {!loading && <span>&rarr;</span>}
                  </button>
                </div>
              </form>
            </div>
          <div className="mt-8 relative w-full">
            <div className="absolute inset-0 bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none"></div>
            
            <div className="bg-[#09090b]/60 backdrop-blur-3xl border border-zinc-800/80 rounded-[2rem] p-6 sm:p-8 shadow-[0_0_60px_rgba(16,185,129,0.05)] relative z-10 flex flex-col gap-4 ring-1 ring-white/5">
              
              <div className="flex items-center justify-between mb-2">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-zinc-700"></div>
                  <div className="w-3 h-3 rounded-full bg-zinc-700"></div>
                  <div className="w-3 h-3 rounded-full bg-zinc-700"></div>
                </div>
                <h3 className="text-xl font-bold tracking-tight text-white">💡 Exemple de Afaceri</h3>
                <div className="w-8"></div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {examplesList.map((ex, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSkill(ex);
                      setTimeout(() => inputRef.current?.focus(), 50);
                    }}
                    className="bg-zinc-900/80 border border-zinc-700/80 text-zinc-300 font-medium text-xs sm:text-sm px-2 py-3 rounded-xl transition-all duration-300 hover:bg-emerald-900/60 hover:text-emerald-400 hover:border-emerald-500 hover:scale-[1.02] text-center w-full shadow-sm leading-snug"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          </div>

          </div>
        </div>

        {/* Grid de Beneficii / Ce conține planul */}
        <div className="mt-10 w-full max-w-5xl relative z-10">
          <h3 className="text-2xl md:text-3xl font-black mb-10 tracking-tighter bg-gradient-to-r from-zinc-400 via-emerald-400 to-zinc-400 bg-clip-text text-transparent animate-shimmer text-center">
            Ce conține planul tău de afaceri?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 text-left">
            <div className="relative w-full h-full group">
              <div className="absolute inset-0 bg-emerald-500/10 blur-[60px] rounded-full pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-500"></div>
              
              <div className="bg-[#09090b]/60 backdrop-blur-3xl border border-zinc-800/80 rounded-[2rem] p-6 sm:p-8 shadow-[0_0_60px_rgba(16,185,129,0.05)] relative z-10 flex flex-col justify-between h-full ring-1 ring-white/5 hover:border-emerald-500/50 hover:shadow-[0_0_80px_rgba(16,185,129,0.15)] transition-all duration-300">
                <div>
                  
                  <div className="flex gap-1.5 mb-6">
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-700"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-700"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-700"></div>
                  </div>
                  
                  <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 text-emerald-400 flex items-center justify-center text-2xl mb-4 group-hover:scale-125 group-hover:rotate-12 group-hover:-translate-y-1 transition-all duration-300 shadow-inner">
                    🧠
                  </div>
                  <h4 className="text-2xl font-bold text-white mb-3">Analiză SWOT Completă</h4>
                  <p className="text-zinc-400 text-base md:text-lg leading-relaxed">
                    Puncte tari, slăbiciuni, oportunități și amenințări detaliate cu explicații tehnice adaptate domeniului ales.
                  </p>
                </div>
              </div>
            </div>
            <div className="relative w-full h-full group">
              <div className="absolute inset-0 bg-emerald-500/10 blur-[60px] rounded-full pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-500"></div>
              
              <div className="bg-[#09090b]/60 backdrop-blur-3xl border border-zinc-800/80 rounded-[2rem] p-6 sm:p-8 shadow-[0_0_60px_rgba(16,185,129,0.05)] relative z-10 flex flex-col justify-between h-full ring-1 ring-white/5 hover:border-emerald-500/50 hover:shadow-[0_0_80px_rgba(16,185,129,0.15)] transition-all duration-300">
                <div>
                  
                  <div className="flex gap-1.5 mb-6">
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-700"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-700"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-700"></div>
                  </div>
                  
                  <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 text-emerald-400 flex items-center justify-center text-2xl mb-4 group-hover:scale-125 group-hover:rotate-12 group-hover:-translate-y-1 transition-all duration-300 shadow-inner">
                    💸
                  </div>
                  <h4 className="text-2xl font-bold text-white mb-3">Bugetare Detaliată</h4>
                  <p className="text-zinc-400 text-base md:text-lg leading-relaxed">
                    Distribuția automată a costurilor de pornire și justificare clară pentru fiecare cheltuială estimată.
                  </p>
                </div>
              </div>
            </div>
            <div className="relative w-full h-full group">
              <div className="absolute inset-0 bg-emerald-500/10 blur-[60px] rounded-full pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-500"></div>
              
              <div className="bg-[#09090b]/60 backdrop-blur-3xl border border-zinc-800/80 rounded-[2rem] p-6 sm:p-8 shadow-[0_0_60px_rgba(16,185,129,0.05)] relative z-10 flex flex-col justify-between h-full ring-1 ring-white/5 hover:border-emerald-500/50 hover:shadow-[0_0_80px_rgba(16,185,129,0.15)] transition-all duration-300">
                <div>
                  
                  <div className="flex gap-1.5 mb-6">
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-700"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-700"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-700"></div>
                  </div>
                  
                  <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 text-emerald-400 flex items-center justify-center text-2xl mb-4 group-hover:scale-125 group-hover:rotate-12 group-hover:-translate-y-1 transition-all duration-300 shadow-inner">
                    🌟
                  </div>
                  <h4 className="text-2xl font-bold text-white mb-3">Optimizat Fonduri Europene</h4>
                  <p className="text-zinc-400 text-base md:text-lg leading-relaxed">
                    Structură și jargon specifice ghidurilor de finanțare pentru a-ți crește șansele de a obține granturi nerambursabile.
                  </p>
                </div>
              </div>
            </div>
            <div className="relative w-full h-full group">
              <div className="absolute inset-0 bg-emerald-500/10 blur-[60px] rounded-full pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-500"></div>
              
              <div className="bg-[#09090b]/60 backdrop-blur-3xl border border-zinc-800/80 rounded-[2rem] p-6 sm:p-8 shadow-[0_0_60px_rgba(16,185,129,0.05)] relative z-10 flex flex-col justify-between h-full ring-1 ring-white/5 hover:border-emerald-500/50 hover:shadow-[0_0_80px_rgba(16,185,129,0.15)] transition-all duration-300">
                <div>
                  
                  <div className="flex gap-1.5 mb-6">
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-700"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-700"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-700"></div>
                  </div>
                  
                  <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 text-emerald-400 flex items-center justify-center text-2xl mb-4 group-hover:scale-125 group-hover:rotate-12 group-hover:-translate-y-1 transition-all duration-300 shadow-inner">
                    🚀
                  </div>
                  <h4 className="text-2xl font-bold text-white mb-3">Export Corporate</h4>
                  <p className="text-zinc-400 text-base md:text-lg leading-relaxed">
                    Descarcă broșura de prezentare PowerPoint (.pptx), raportul PDF sau documentul editabil Word (.doc).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Previzualizare Plan / Mockup - 5 Taburi */}
        <div className="mt-24 w-full max-w-5xl relative z-10">
          <h3 className="text-2xl md:text-3xl font-black mb-4 tracking-tighter bg-gradient-to-r from-zinc-400 via-emerald-400 to-zinc-400 bg-clip-text text-transparent animate-shimmer text-center">
            Cum arată un plan generat?
          </h3>
          <p className="text-xl lg:text-2xl font-medium text-zinc-400 text-center mb-10">Perspectivă</p>

          {/* Tab buttons */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {[
              { id: 0, label: '🎬 Preview cu tabs' },
              { id: 1, label: '📊 Grafice animate' },
              { id: 2, label: '🖥️ Typing live' },
              { id: 4, label: '✨ Înainte & După' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setMockupTab(tab.id)}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 border ${
                  mockupTab === tab.id
                    ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                    : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab 0: Preview cu tabs */}
          {mockupTab === 0 && (
            <div className="relative border border-zinc-800/60 rounded-[2.5rem] bg-[#09090b] overflow-hidden shadow-2xl ring-1 ring-white/5 min-h-[500px]">
              {/* Tab bar */}
              <div className="flex gap-1 border-b border-zinc-800/80 px-6 pt-5 pb-0 bg-zinc-900/40">
                <div className="flex gap-2 mr-4 items-center pb-4">
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-700"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-700"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-700"></div>
                </div>
                {['Rezumat', 'SWOT', 'Buget', 'Strategie'].map((t) => (
                  <div 
                    key={t} 
                    onClick={() => setInnerMockupTab(t)}
                    className={`cursor-pointer transition-all px-4 py-3 text-sm font-semibold rounded-t-xl border-t border-l border-r -mb-px ${
                      innerMockupTab === t 
                        ? 'bg-[#09090b] border-zinc-700/60 text-emerald-400' 
                        : 'bg-transparent border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30'
                    }`}
                  >
                    {t}
                  </div>
                ))}
              </div>
              
              {/* Content */}
              <div className="p-8 md:p-12 animate-in fade-in duration-300">
                <div className="mb-8">
                  <div className="text-emerald-500 font-bold text-sm tracking-wider uppercase mb-2">Exemplu generat</div>
                  <h4 className="text-2xl font-black text-white">Cafenea de Specialitate "Urban Beans"</h4>
                </div>
                
                {innerMockupTab === 'Rezumat' && (
                  <div className="text-zinc-400 leading-relaxed text-lg animate-in slide-in-from-bottom-2">
                    <p className="mb-4">
                      <strong>Urban Beans</strong> este o cafenea de specialitate modernă, situată în inima centrului istoric. 
                      Ne propunem să oferim nu doar cafea de origine prăjită local, ci și o experiență senzorială completă, 
                      într-un mediu cu un design industrial minimalist.
                    </p>
                    <p>
                      Misiunea noastră este să educăm consumatorii despre procesul de la bob la ceașcă, 
                      sprijinind fermierii independenți prin comerț echitabil (Fairtrade).
                    </p>
                  </div>
                )}

                {innerMockupTab === 'SWOT' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-bottom-2">
                    {/* Puncte Tari */}
                    <div className="cursor-pointer hover:scale-[1.02] transition-transform p-6 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 hover:border-emerald-400/60">
                      <h5 className="font-bold text-emerald-400 mb-3 text-lg">Puncte Tari</h5>
                      <ul className="text-zinc-300 space-y-2 text-sm">
                        <li>• Locație premium cu trafic pietonal intens</li>
                        <li>• Baristi certificați SCA (Specialty Coffee Association)</li>
                        <li>• Exclusivitate pentru un prăjitor local renumit</li>
                      </ul>
                    </div>
                    {/* Puncte Slabe */}
                    <div className="cursor-pointer hover:scale-[1.02] transition-transform p-6 rounded-2xl border border-red-500/30 bg-red-500/10 hover:border-red-400/60">
                      <h5 className="font-bold text-red-400 mb-3 text-lg">Puncte Slabe</h5>
                      <ul className="text-zinc-300 space-y-2 text-sm">
                        <li>• Costuri mari de chirie în zona centrală</li>
                        <li>• Lipsa unei istorii/notorietăți pe piață (brand nou)</li>
                        <li>• Prețuri mai mari față de lanțurile comerciale</li>
                      </ul>
                    </div>
                    {/* Oportunitati */}
                    <div className="cursor-pointer hover:scale-[1.02] transition-transform p-6 rounded-2xl border border-blue-500/30 bg-blue-500/10 hover:border-blue-400/60">
                      <h5 className="font-bold text-blue-400 mb-3 text-lg">Oportunități</h5>
                      <ul className="text-zinc-300 space-y-2 text-sm">
                        <li>• Creșterea cererii pentru cafea de specialitate</li>
                        <li>• Parteneriate B2B cu birourile din zonă</li>
                        <li>• Lansarea unui abonament lunar pentru boabe de cafea</li>
                      </ul>
                    </div>
                    {/* Amenintari */}
                    <div className="cursor-pointer hover:scale-[1.02] transition-transform p-6 rounded-2xl border border-orange-500/30 bg-orange-500/10 hover:border-orange-400/60">
                      <h5 className="font-bold text-orange-400 mb-3 text-lg">Amenințări</h5>
                      <ul className="text-zinc-300 space-y-2 text-sm">
                        <li>• Fluctuația prețului cafelei verzi pe bursa globală</li>
                        <li>• Deschiderea unei noi francize majore în apropiere</li>
                        <li>• Reticența clienților tradiționaliști la cafeaua acidă/fructată</li>
                      </ul>
                    </div>
                  </div>
                )}

                {innerMockupTab === 'Buget' && (
                  <div className="animate-in slide-in-from-bottom-2 bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800">
                    <h5 className="font-bold text-emerald-400 mb-6 text-lg">Buget de Investiții Inițiale</h5>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center pb-3 border-b border-zinc-800">
                        <span className="text-zinc-400">Echipamente (Espressor, Râșnițe)</span>
                        <span className="font-mono text-zinc-200">62.000 lei</span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b border-zinc-800">
                        <span className="text-zinc-400">Amenajare locație & Design</span>
                        <span className="font-mono text-zinc-200">85.000 lei</span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b border-zinc-800">
                        <span className="text-zinc-400">Stoc inițial marfă & Consumabile</span>
                        <span className="font-mono text-zinc-200">17.000 lei</span>
                      </div>
                      <div className="flex justify-between items-center pt-2">
                        <span className="text-zinc-300 font-bold">Total Investiție Estimată</span>
                        <span className="font-mono text-emerald-400 font-bold text-xl">164.000 lei</span>
                      </div>
                    </div>
                  </div>
                )}

                {innerMockupTab === 'Strategie' && (
                  <div className="animate-in slide-in-from-bottom-2 text-zinc-400 space-y-6">
                    <div className="flex gap-4 items-start">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0">1</div>
                      <div>
                        <h6 className="text-white font-bold mb-1">Pre-lansare & Teasing</h6>
                        <p className="text-sm">Campanie Social Media axată pe procesul de amenajare, prezentarea echipei de baristi și dezvăluirea prăjitorului partener.</p>
                      </div>
                    </div>
                    <div className="flex gap-4 items-start">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0">2</div>
                      <div>
                        <h6 className="text-white font-bold mb-1">Soft Opening</h6>
                        <p className="text-sm">O săptămână dedicată exclusiv comunității locale și influencerilor din nișa culinară, cu un meniu limitat la 50% reducere.</p>
                      </div>
                    </div>
                    <div className="flex gap-4 items-start">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0">3</div>
                      <div>
                        <h6 className="text-white font-bold mb-1">Fidelizare B2B</h6>
                        <p className="text-sm">Pachete speciale pentru angajații birourilor din proximitate: badge-uri de companie care oferă 15% discount permanent.</p>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* Tab 1: Grafice animate */}
          {mockupTab === 1 && (
            <div className="relative border border-zinc-800/60 rounded-[2.5rem] bg-[#09090b] overflow-hidden shadow-2xl ring-1 ring-white/5 p-8 md:p-12 min-h-[420px] animate-in fade-in duration-300">
              <div>
                <h4 className="text-xl font-bold text-white mb-2">Proiecții Financiare: Anul 1</h4>
                <p className="text-zinc-400 mb-8 text-sm">Estimare a veniturilor și a distribuției costurilor operaționale (în RON).</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  {/* Bar Chart Section */}
                  <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800 p-6 flex flex-col justify-between">
                    <h5 className="text-emerald-400 font-bold mb-6 text-sm uppercase tracking-wider">Evoluție Venituri</h5>
                    <div className="grid grid-cols-4 gap-4 h-48 items-end">
                      {[
                        { val: 30, label: 'T1' },
                        { val: 55, label: 'T2' },
                        { val: 80, label: 'T3' },
                        { val: 95, label: 'T4' }
                      ].map((bar, i) => (
                        <div key={i} className="flex flex-col items-center gap-3 h-full justify-end group">
                          <span className="text-xs text-zinc-500 group-hover:text-white transition-colors opacity-0 group-hover:opacity-100 absolute -translate-y-8 animate-float-number" style={{animationDelay: `${i * 150 + 500}ms`}}>{bar.val * 5}k lei</span>
                          <div className="w-full bg-zinc-800 rounded-t-xl overflow-hidden flex items-end shadow-inner relative group-hover:bg-zinc-700 transition-colors" style={{ height: '80%' }}>
                            <div 
                              className={`w-full rounded-t-xl animate-scale-y ${i===3?'bg-emerald-400':i===2?'bg-emerald-500':'bg-emerald-600/80'}`} 
                              style={{ height: `${bar.val}%`, animationDelay: `${i * 150}ms` }}
                            ></div>
                          </div>
                          <div className="text-sm font-bold text-zinc-400">{bar.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Horizontal Bars & Donut */}
                  <div className="flex flex-col gap-6">
                    <div className="flex-1 bg-zinc-900/50 rounded-2xl border border-zinc-800 p-6">
                      <h5 className="text-orange-400 font-bold mb-4 text-sm uppercase tracking-wider">Distribuție Costuri</h5>
                      {[
                        { label: 'Salarii', w: 85, color: 'bg-orange-500' },
                        { label: 'Chirie & Utilități', w: 60, color: 'bg-orange-400/80' },
                        { label: 'Stoc Marfă', w: 45, color: 'bg-orange-300/60' },
                        { label: 'Marketing', w: 25, color: 'bg-orange-200/40' },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-4 mb-3 last:mb-0 group cursor-pointer">
                          <div className="w-28 text-xs font-semibold text-zinc-400 group-hover:text-zinc-200 transition-colors truncate">{item.label}</div>
                          <div className="flex-1 bg-zinc-800 rounded-full h-3 overflow-hidden shadow-inner">
                            <div className={`${item.color} h-full rounded-full animate-scale-x group-hover:brightness-125`} style={{ width: `${item.w}%`, animationDelay: `${i * 150 + 400}ms` }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800 p-6 flex items-center justify-between">
                      <div>
                        <h5 className="text-blue-400 font-bold mb-1 text-sm uppercase tracking-wider">Marjă Profit</h5>
                        <p className="text-3xl font-black text-white">24<span className="text-lg text-zinc-500">%</span></p>
                      </div>
                      <div className="w-24 h-24 rounded-full border-[8px] border-zinc-800 relative flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
                        <div className="absolute inset-0 rounded-full animate-spin-slow" style={{ background: 'conic-gradient(#3b82f6 0% 24%, transparent 24% 100%)' }}></div>
                        <div className="w-16 h-16 bg-[#09090b] rounded-full z-10 flex items-center justify-center">
                          <span className="text-blue-400 text-sm font-bold">T4</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Typing live */}
          {mockupTab === 2 && (
            <div className="relative border border-zinc-800/60 rounded-[2.5rem] bg-[#09090b] overflow-hidden shadow-2xl ring-1 ring-white/5 p-8 md:p-12 min-h-[420px] font-mono animate-in fade-in duration-300">
              <div className="text-sm leading-loose">
                <div className="text-emerald-400 mb-2"># Plan de Afaceri — Cafenea de Specialitate "Urban Beans"</div>
                <div className="text-zinc-400">{'>'} Generând proiecții financiare (în LEI)...</div>
                <div className="text-zinc-300 mt-4 pl-4 border-l-2 border-emerald-500/50 animate-in slide-in-from-left-2 duration-500">
                  <div className="text-emerald-400 mb-1">## Venituri Estimate</div>
                  <div className="text-zinc-400">— Trimestrul 1: 150.000 lei (creștere organică)</div>
                  <div className="text-zinc-400">— Trimestrul 2: 275.000 lei (sezon cald)</div>
                  <div className="text-zinc-400">— Trimestrul 3: 400.000 lei (B2B stabilizat)<span className="animate-pulse">█</span></div>
                </div>
                <div className="mt-4 pl-4 border-l-2 border-red-500/40 animate-in slide-in-from-left-2 duration-700 delay-150">
                  <div className="text-red-400 mb-1">## Costuri Operaționale</div>
                  <div className="text-zinc-500">— Salarii: 35.000 lei / lună</div>
                  <div className="text-zinc-500">— Chirie: 15.000 lei / lună</div>
                </div>
                <div className="mt-4 pl-4 border-l-2 border-blue-500/40 animate-in slide-in-from-left-2 duration-1000 delay-300">
                  <div className="text-blue-400 mb-1">## Stadiu Generare</div>
                  <div className="flex flex-col gap-3 mt-4">
                    <div className="flex items-center gap-4 text-xs font-mono">
                      <div className="w-36 text-zinc-400">Analiză Competiție</div>
                      <div className="flex-1 bg-zinc-800/50 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 w-full h-full"></div>
                      </div>
                      <div className="w-16 text-right text-emerald-400">Complet</div>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-mono">
                      <div className="w-36 text-zinc-400">Strategie Prețuri</div>
                      <div className="flex-1 bg-zinc-800/50 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-yellow-500 w-[70%] h-full"></div>
                      </div>
                      <div className="w-16 text-right text-yellow-400">70%</div>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-mono">
                      <div className="w-36 text-zinc-400">Calcul ROI</div>
                      <div className="flex-1 bg-zinc-800/50 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-blue-500 w-[40%] h-full"></div>
                      </div>
                      <div className="w-16 text-right text-blue-400 flex items-center justify-end gap-1">40% <span className="animate-pulse">█</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Înainte & După */}
          {mockupTab === 4 && (
            <div className="relative border border-zinc-800/60 rounded-[2.5rem] bg-[#09090b] overflow-hidden shadow-2xl ring-1 ring-white/5 min-h-[420px]">
              <div className="grid grid-cols-2 h-full min-h-[360px]">
                {/* Înainte */}
                <div className="p-8 border-r border-zinc-800/60 opacity-60">
                  <div className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-4">Înainte</div>
                  <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 text-zinc-400 text-sm leading-relaxed font-mono">
                    "Vreau să deschid o cafenea. Am experiență de 5 ani în domeniu. Nu știu de unde să încep cu planul de afaceri."
                  </div>
                </div>
                {/* După */}
                <div className="p-8 opacity-50">
                  <div className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4">După ✨</div>
                  <div className="flex flex-col gap-2">
                    {['📊 Analiză SWOT completă', '💰 Buget detaliat pe 12 luni', '🎯 Strategie de piață', '🇪🇺 Eligibilitate fonduri UE', '📄 Export PDF + PPTX'].map((item) => (
                      <div key={item} className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2 text-xs text-emerald-300 font-medium">{item}</div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Divider line */}
              <div className="absolute top-0 bottom-0 left-1/2 w-px bg-gradient-to-b from-transparent via-emerald-500/50 to-transparent z-10"></div>
            </div>
          )}

        </div>
            </>
    )}

      {isEditing && result ? (
        <div className="w-full max-w-[98%] xl:max-w-[120rem] animate-in fade-in slide-in-from-bottom-10 print:hidden px-4 2xl:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 w-full mb-8 pb-8 border-b border-zinc-800">
            <div className="flex flex-col gap-3">
              <h1 className="text-3xl font-black text-emerald-400 flex items-center gap-3">
                <span>✏️</span> Studio Editare
              </h1>
            </div>
            <div className="flex gap-4 shrink-0">
              <button onClick={cancelEditing} className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold transition-all shadow-xl">
                 ❌ Anulează
              </button>
              <button onClick={saveEditing} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all shadow-xl border border-emerald-500">
                 ✅ Confirmă și Salvează
              </button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 items-start w-full">
            <div className="w-full lg:w-3/5 xl:w-2/3">
              <EditForm result={result} updateField={updateField} removeField={removeField} />
            </div>
            {renderSidebar()}
          </div>
        </div>
      ) : result && (
        <div className="w-full max-w-6xl flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 w-full">
            <button onClick={resetApp} className="w-full md:flex-1 h-10 bg-zinc-800 hover:bg-zinc-700 text-white px-4 rounded-xl font-bold transition-all shadow-xl border border-zinc-700 flex items-center justify-center gap-2 text-xs whitespace-nowrap">
               🔄 Altă idee
            </button>
            <div className="relative group w-full md:flex-1">
              <button 
                onClick={startEditing} 
                className="w-full h-10 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white px-4 rounded-xl font-bold transition-all shadow-xl border border-zinc-700/60 flex items-center justify-center gap-2 text-xs whitespace-nowrap cursor-pointer"
              >
                 ✏️ Studio Editare {!isStudioPaid && <span className="text-amber-500">🔒</span>}
              </button>
              {/* Tooltip Studio Editare */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-60 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-250 scale-95 group-hover:scale-100 z-50">
                <div className="relative rounded-xl p-px" style={{background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #065f46 100%)'}}>
                  <div className="rounded-xl bg-zinc-950 px-4 py-3" style={{boxShadow: '0 0 24px 2px rgba(16,185,129,0.13)'}}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-emerald-400 text-sm">✏️</span>
                      <span className="text-emerald-300 text-[11px] font-black uppercase tracking-widest">Studio Editare</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-zinc-400 text-[10px]"><span className="text-emerald-500">▸</span> Editare directă în browser</div>
                      <div className="flex items-center gap-1.5 text-zinc-400 text-[10px]"><span className="text-emerald-500">▸</span> Toate instrumentele incluse</div>
                      <div className="flex items-center gap-1.5 text-zinc-400 text-[10px]"><span className="text-emerald-500">▸</span> Optimizare fonduri europene 🇪🇺</div>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-zinc-950" style={{background: 'linear-gradient(135deg, transparent 50%, #059669 50%)', clipPath: 'polygon(0 0, 100% 100%, 0 100%)', transform: 'translateX(-50%) rotate(45deg)'}} />
              </div>
            </div>

            <div className="w-full md:w-auto flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex gap-2 p-1 bg-black rounded-xl border border-zinc-700 h-10 w-full md:w-32 flex-none">
                <button onClick={() => setCurrency("LEI")} className={`w-1/2 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${currency === "LEI" ? "bg-emerald-600 text-white" : "text-zinc-500 hover:text-white"}`}>LEI</button>
                <button onClick={() => setCurrency("EUR")} className={`w-1/2 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${currency === "EUR" ? "bg-blue-600 text-white" : "text-zinc-500 hover:text-white"}`}>EUR</button>
              </div>
              
              {/* Download Buttons Container (Pachet Standard) */}
              <div className="relative group w-full md:w-auto flex-none">
              <div 
                className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-700/60 p-1 rounded-xl h-10 w-full md:w-auto overflow-x-auto md:overflow-visible"
              >
                <button 
                  onClick={() => downloadAction('pdf')} 
                  disabled={isDownloading !== null}
                  className="flex-none hover:bg-zinc-800 text-[10px] sm:text-[11px] h-full px-3 rounded-lg font-black uppercase tracking-wider transition-all flex items-center justify-center whitespace-nowrap gap-1 cursor-pointer text-zinc-300 hover:text-white"
                >
                  {isDownloading === 'pdf' ? "⏳..." : "⬇ Prezentare"}
                </button>
                <div className="w-px h-4 bg-zinc-800 flex-none" />
                <button 
                  onClick={() => downloadAction('pptx')} 
                  disabled={isDownloading !== null}
                  className="flex-none hover:bg-zinc-800 text-[10px] sm:text-[11px] h-full px-3 rounded-lg font-black uppercase tracking-wider transition-all flex items-center justify-center whitespace-nowrap gap-1 cursor-pointer text-zinc-300 hover:text-white"
                >
                  {isDownloading === 'pptx' ? "⏳..." : "⬇ Broșură"}
                </button>
                <div className="w-px h-4 bg-zinc-800 flex-none" />
                <button 
                  onClick={() => downloadAction('word')} 
                  disabled={isDownloading !== null}
                  className="flex-none hover:bg-zinc-800 text-[10px] sm:text-[11px] h-full px-3 rounded-lg font-black uppercase tracking-wider transition-all flex items-center justify-center whitespace-nowrap gap-1 cursor-pointer text-zinc-300 hover:text-white"
                >
                  {isDownloading === 'word' ? "⏳..." : "⬇ Document"}
                </button>

                {!isPlanPaid && (
                  <>
                    <div className="w-px h-4 bg-zinc-800 flex-none" />
                    <button 
                      type="button"
                      onClick={() => setShowPricingModal(true)}
                      className="flex-none text-xs text-amber-500 hover:text-amber-400 cursor-pointer px-3 h-full rounded-lg flex items-center justify-center hover:bg-zinc-800/50 hover:scale-110 transition-all"
                      title="Pachet Standard"
                    >
                      🔒
                    </button>
                  </>
                )}
              </div>
              {/* Tooltip Pachet Standard */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-60 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-250 scale-95 group-hover:scale-100 z-50">
                <div className="relative rounded-xl p-px" style={{background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #065f46 100%)'}}>
                  <div className="rounded-xl bg-zinc-950 px-4 py-3" style={{boxShadow: '0 0 24px 2px rgba(16,185,129,0.13)'}}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-emerald-400 text-sm">⬇</span>
                      <span className="text-emerald-300 text-[11px] font-black uppercase tracking-widest">Pachet Standard</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-zinc-400 text-[10px]"><span className="text-emerald-500">▸</span> Prezentare PDF</div>
                      <div className="flex items-center gap-1.5 text-zinc-400 text-[10px]"><span className="text-emerald-500">▸</span> Broșură PPTX</div>
                      <div className="flex items-center gap-1.5 text-zinc-400 text-[10px]"><span className="text-emerald-500">▸</span> Document Word</div>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3" style={{background: 'linear-gradient(135deg, transparent 50%, #059669 50%)', clipPath: 'polygon(0 0, 100% 100%, 0 100%)', transform: 'translateX(-50%) rotate(45deg)'}} />
              </div>
            </div>
            </div>
          </div>

          <div 
            ref={brochureRef} 
            className={`${isEditing ? 'hidden' : 'block'} bg-[#09090b] border border-zinc-800 p-8 md:p-12 rounded-[2.5rem] shadow-2xl transition-all duration-500 relative ${isContentCopyProtected ? 'select-none' : ''}`}
            onContextMenu={handleContextMenu}
          >

            <div className="pdf-section mt-12 mb-10 border-b border-zinc-800 pb-10">
              <h2 className="text-6xl font-black mb-4 tracking-tight not-italic text-white">
                {result.nume}
              </h2>
              <p className="text-emerald-400 uppercase text-lg font-black tracking-[0.4em] not-italic mt-4">
                {result.slogan}
              </p>
            </div>

            {/* Date Generale & Viziune */}
            <div className="pdf-section mb-10 bg-zinc-900/50 p-10 rounded-3xl border-l-4 border-emerald-500 shadow-inner print:shadow-none print:bg-transparent print:border-l-4 print:border-emerald-700 print:text-black">
              <h3 className="text-emerald-400 text-sm font-black uppercase mb-6 tracking-[0.2em]">I & II. Date Generale și Viziune</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-zinc-300 print:text-gray-800">
                <div>
                  <p><strong className="text-white print:text-black">Forma Juridică:</strong> {result.date_generale?.forma_juridica}</p>
                  <p className="mt-2"><strong className="text-white print:text-black">Cod CAEN:</strong> {result.date_generale?.cod_caen}</p>
                  <p className="mt-2"><strong className="text-white print:text-black">Contact:</strong> {result.date_generale?.date_contact}</p>
                </div>
                <div>
                  <p className="whitespace-pre-line"><strong className="text-white print:text-black">Obiective (1 an):</strong> {formatNumberedText(result.viziune_strategie?.obiective_scurt)}</p>
                  <p className="mt-2 whitespace-pre-line"><strong className="text-white print:text-black">Obiective (3-5 ani):</strong> {formatNumberedText(result.viziune_strategie?.obiective_mediu)}</p>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-zinc-800/50 text-zinc-300 print:border-gray-200 print:text-gray-800 text-justify leading-relaxed">
                  <p className="whitespace-pre-line"><strong className="text-white print:text-black">Misiune și Valori:</strong> {formatNumberedText(result.viziune_strategie?.misiune_valori)}</p>
              </div>
            </div>

            {/* Analiza Pietei */}
            <div className="pdf-section mb-10 bg-zinc-900/50 p-10 rounded-3xl border-l-4 border-emerald-500 shadow-inner print:shadow-none print:bg-transparent print:border-l-4 print:border-emerald-700 print:text-black">
              <h3 className="text-emerald-400 text-sm font-black uppercase mb-6 tracking-[0.2em]">III. Analiza Pieței și Promovarea</h3>
              <div className="space-y-6 text-zinc-300 print:text-gray-800 text-justify leading-relaxed">
                <div><strong className="text-white print:text-black block mb-1">Clienții Țintă:</strong> <span className="italic whitespace-pre-line">{formatNumberedText(result.analiza_pietei?.clienti_tinta)}</span></div>
                <div><strong className="text-white print:text-black block mb-1">Concurența:</strong> <span className="italic whitespace-pre-line">{formatNumberedText(result.analiza_pietei?.concurenta)}</span></div>
                <div><strong className="text-white print:text-black block mb-1">Strategia de Marketing:</strong> <span className="italic whitespace-pre-line">{formatNumberedText(result.analiza_pietei?.strategie_marketing)}</span></div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-6 mb-14 print:gap-4">
              {Object.entries({
                puncte_tari: {t: 'Puncte Tari', l: 'S'},
                puncte_slabe: {t: 'Slăbiciuni', l: 'W'},
                oportunitati: {t: 'Oportunități', l: 'O'},
                amenintari: {t: 'Amenințări', l: 'T'}
              }).map(([key, info]) => (
                <div key={key} className="pdf-section p-8 rounded-3xl border border-zinc-800/50 bg-black/20 shadow-inner print:break-inside-avoid print:p-0 print:border-none print:shadow-none print:bg-transparent">
                  <div className="flex items-center gap-4 mb-6 print:mb-4">
                    <span className="text-[#960018] bg-black border border-zinc-800 font-black w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-[0_0_10px_rgba(150,0,24,0.15)] print:border-none print:bg-transparent print:shadow-none print:w-auto print:h-auto print:text-emerald-800">{info.l}</span>
                    <h4 className="text-emerald-400 font-black text-sm uppercase tracking-[0.2em] drop-shadow-md print:text-emerald-800 print:drop-shadow-none">{info.t}</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {result.analiza_swot?.[key]?.map((item: any, idx: number) => (
                      <div 
                        key={idx} 
                        className="bg-emerald-950/10 p-5 rounded-2xl border border-emerald-900/30 border-l-4 border-l-emerald-500 shadow-[inset_0_0_20px_rgba(52,211,153,0.05)] transition-all duration-300 hover:bg-[#960018] hover:border-[#ff4d6d] hover:border-l-[#ff4d6d] hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(255,77,109,0.4)] group cursor-default print:border-gray-200 print:border-l-4 print:border-l-emerald-700 print:bg-transparent print:text-black print:break-inside-avoid print:p-3 print:shadow-none"
                      >
                        <span className="text-zinc-100 font-black text-xl block mb-2 group-hover:text-white transition-colors print:text-black uppercase tracking-wider print:text-lg">✦ {item.titlu || item}</span>
                        <p className="text-zinc-400 text-lg italic leading-relaxed text-justify group-hover:text-white/90 transition-colors print:text-gray-700 print:text-base whitespace-pre-line">{formatNumberedText(item.explicatie_tehnica)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Operational */}
            <div className="pdf-section mb-10 bg-zinc-900/50 p-10 rounded-3xl border-l-4 border-emerald-500 shadow-inner print:shadow-none print:bg-transparent print:border-l-4 print:border-emerald-700 print:text-black">
              <h3 className="text-emerald-400 text-sm font-black uppercase mb-6 tracking-[0.2em]">V. Planul Operațional și de Management</h3>
              <ol className="space-y-6 text-zinc-300 print:text-gray-800 list-decimal pl-6 text-justify leading-relaxed">
                <li className="pl-2"><strong className="text-white print:text-black block mb-1">Descriere Flux Tehnologic:</strong> <span className="italic whitespace-pre-line">{formatNumberedText(result.plan_operational?.descriere_flux)}</span></li>
                <li className="pl-2"><strong className="text-white print:text-black block mb-1">Resurse Umane:</strong> <span className="italic whitespace-pre-line">{formatNumberedText(result.plan_operational?.resurse_umane)}</span></li>
                <li className="pl-2"><strong className="text-white print:text-black block mb-1">Locație și Dotări:</strong> <span className="italic whitespace-pre-line">{formatNumberedText(result.plan_operational?.locatie_dotari)}</span></li>
              </ol>
            </div>

            <div className="pt-10 border-t border-zinc-800 print:border-none print:pt-4">
               <h3 className="pdf-section text-emerald-400 text-sm font-black uppercase mb-6 tracking-[0.2em] text-center drop-shadow-md print:text-emerald-800 print:drop-shadow-none">
                 VI. Planul Financiar
               </h3>
               
               <div className="pdf-section text-zinc-300 italic text-justify leading-relaxed max-w-4xl mx-auto mb-10 print:text-gray-700 whitespace-pre-line">
                 {formatNumberedText(result.plan_financiar?.strategie_financiara)}
               </div>

               <div className="mb-16">
                 <h4 className="text-zinc-500 font-bold uppercase tracking-wider mb-6 text-sm">Distribuția costurilor</h4>
                 <BudgetBarChart budget={result.plan_financiar?.buget_investitii} />
               </div>

               <div className="grid grid-cols-1 gap-6 print:gap-3">
                  {result.plan_financiar?.buget_investitii?.map((b: any, i: number) => (
                    <div 
                      key={i} 
                      className="pdf-section bg-emerald-950/10 p-8 rounded-3xl border border-emerald-900/30 border-l-4 border-l-emerald-500 shadow-[inset_0_0_20px_rgba(52,211,153,0.05)] flex flex-col md:flex-row justify-between items-center gap-8 transition-all duration-300 hover:bg-[#960018] hover:border-[#ff4d6d] hover:border-l-[#ff4d6d] hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(255,77,109,0.4)] group cursor-default print:border-gray-200 print:border-l-4 print:border-l-emerald-700 print:bg-transparent print:text-black print:break-inside-avoid print:p-4 print:shadow-none"
                    >
                      <div className="flex-1">
                        <span className="text-zinc-100 font-black text-xl block mb-3 uppercase tracking-wider group-hover:text-white transition-colors print:text-black print:mb-1 print:text-lg">{b.item}</span>
                        <p className="text-zinc-400 text-lg italic leading-relaxed group-hover:text-white/90 transition-colors print:text-gray-700 print:text-base">{b.explicatie}</p>
                      </div>
                      <div className="bg-zinc-900/80 px-8 py-5 rounded-2xl border border-zinc-800 min-w-[200px] text-center group-hover:bg-black/20 group-hover:border-white/20 transition-colors print:bg-transparent print:border-none print:px-2 print:py-0 print:min-w-0 print:text-right">
                        <span className="text-emerald-400 font-black text-2xl group-hover:text-white transition-colors print:text-emerald-800 print:text-xl">{formatPrice(b.cost)}</span>
                      </div>
                    </div>
                  ))}
                </div>
            </div>
            
              </div>
            </div>
      )}
      </div>

      {/* DOCUMENT PREZENTARE - Afișat doar la nevoie pentru a fi capturat impecabil */}
      {result && (
        <div className="fixed top-[-9999px] left-[-9999px] w-[1280px] opacity-0 pointer-events-none z-[-50]">
          <div ref={presentationRef} className="flex flex-col gap-10 bg-[#09090b] p-10">
            {/* Slide 1: Title */}
            <div className="presentation-slide w-[1280px] h-[720px] bg-[#09090b] text-white flex flex-col justify-center items-center p-20 relative border-[12px] border-zinc-900 box-border">
              <h1 className="text-8xl font-black text-center mb-10 text-white z-10 font-sans tracking-tight leading-tight">{result.nume}</h1>
              <h2 className="text-4xl text-center italic text-emerald-400 z-10 w-3/4 leading-relaxed tracking-widest font-sans uppercase">„{result.slogan}”</h2>
              <div className="absolute bottom-8 right-8 text-zinc-600 font-bold uppercase tracking-widest text-sm">IdeeaTa.ai</div>
            </div>

            {/* Slide 2: Viziune */}
            <div className="presentation-slide w-[1280px] h-[720px] bg-[#09090b] text-white flex flex-col justify-center p-24 border-[12px] border-zinc-900 box-border relative">
              <div className="flex items-center gap-6 mb-12">
                <div className="w-16 h-2 bg-emerald-500"></div>
                <h2 className="text-5xl font-black font-sans uppercase tracking-widest text-emerald-400">Viziune și Strategie</h2>
              </div>
              <div className="grid grid-cols-2 gap-12 font-sans leading-normal text-zinc-200">
                <div>
                  <h3 className="text-3xl font-bold text-emerald-500 mb-4">Obiective (1 an)</h3>
                  <p className="text-2xl line-clamp-4">{result.viziune_strategie?.obiective_scurt}</p>
                  <h3 className="text-3xl font-bold text-emerald-500 mb-4 mt-8">Obiective (3-5 ani)</h3>
                  <p className="text-2xl line-clamp-4">{result.viziune_strategie?.obiective_mediu}</p>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-emerald-500 mb-4">Misiune și Valori</h3>
                  <p className="text-2xl line-clamp-8 text-justify">{result.viziune_strategie?.misiune_valori}</p>
                </div>
              </div>
            </div>

            {/* Slide 2b: Analiza Pietei */}
            <div className="presentation-slide w-[1280px] h-[720px] bg-[#09090b] text-white flex flex-col justify-center p-24 border-[12px] border-zinc-900 box-border relative">
              <div className="flex items-center gap-6 mb-8">
                <div className="w-16 h-2 bg-emerald-500"></div>
                <h2 className="text-5xl font-black font-sans uppercase tracking-widest text-emerald-400">Analiza Pieței</h2>
              </div>
              <div className="flex flex-col gap-6 font-sans leading-normal text-zinc-200 text-justify">
                  <div><h3 className="text-3xl font-bold text-emerald-500 mb-2">Clienții Țintă</h3>
                  <p className="text-2xl line-clamp-3">{result.analiza_pietei?.clienti_tinta}</p></div>
                  <div><h3 className="text-3xl font-bold text-emerald-500 mb-2">Concurența</h3>
                  <p className="text-2xl line-clamp-3">{result.analiza_pietei?.concurenta}</p></div>
                  <div><h3 className="text-3xl font-bold text-emerald-500 mb-2">Strategia de Marketing</h3>
                  <p className="text-2xl line-clamp-3">{result.analiza_pietei?.strategie_marketing}</p></div>
              </div>
            </div>

            {/* Slide 3: SWOT - Puncte Tari */}
            <div className="presentation-slide w-[1280px] h-[720px] bg-[#09090b] flex flex-col px-24 py-16 border-[12px] border-zinc-900 box-border relative">
              <div className="flex items-center gap-6 mb-8 shrink-0">
                <div className="w-16 h-2 bg-emerald-500"></div>
                <h2 className="text-5xl font-black font-sans uppercase tracking-widest text-emerald-400">Analiză Strategica SWOT</h2>
              </div>
              <div className="bg-zinc-900/50 p-8 border-l-8 border-emerald-500 flex flex-col gap-6 rounded-3xl flex-1 overflow-hidden">
                <h3 className="text-4xl font-black text-white uppercase tracking-widest pb-4 border-b-2 border-zinc-800 shrink-0">Puncte Tari (Strengths)</h3>
                <div className="grid grid-cols-2 gap-x-12 gap-y-6 overflow-hidden content-start flex-1">
                  {result.analiza_swot?.puncte_tari?.slice(0, 8).map((item: any, idx: number) => (
                    <div key={idx} className="flex flex-col gap-2">
                      <h4 className="text-2xl font-bold text-emerald-400 leading-snug">✦ {item.titlu || item}</h4>
                      <p className="text-lg text-zinc-300 leading-relaxed max-w-lg text-justify">{item.explicatie_tehnica}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Slide 4: SWOT - Slabiciuni */}
            <div className="presentation-slide w-[1280px] h-[720px] bg-[#09090b] flex flex-col px-24 py-16 border-[12px] border-zinc-900 box-border relative">
              <div className="flex items-center gap-6 mb-8 shrink-0">
                <div className="w-16 h-2 bg-[#ff4d6d]"></div>
                <h2 className="text-5xl font-black font-sans uppercase tracking-widest text-[#ff4d6d]">Analiză Strategica SWOT</h2>
              </div>
              <div className="bg-zinc-900/50 p-8 border-l-8 border-[#ff4d6d] flex flex-col gap-6 rounded-3xl flex-1 overflow-hidden">
                <h3 className="text-4xl font-black text-white uppercase tracking-widest pb-4 border-b-2 border-zinc-800 shrink-0">Slăbiciuni (Weaknesses)</h3>
                <div className="grid grid-cols-2 gap-x-12 gap-y-6 overflow-hidden content-start flex-1">
                  {result.analiza_swot?.puncte_slabe?.slice(0, 8).map((item: any, idx: number) => (
                    <div key={idx} className="flex flex-col gap-2">
                      <h4 className="text-2xl font-bold text-[#ff4d6d] leading-snug">✦ {item.titlu || item}</h4>
                      <p className="text-lg text-zinc-300 leading-relaxed max-w-lg">{item.explicatie_tehnica}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Slide 5: SWOT - Oportunitati */}
            <div className="presentation-slide w-[1280px] h-[720px] bg-[#09090b] flex flex-col px-24 py-16 border-[12px] border-zinc-900 box-border relative">
              <div className="flex items-center gap-6 mb-8 shrink-0">
                <div className="w-16 h-2 bg-blue-500"></div>
                <h2 className="text-5xl font-black font-sans uppercase tracking-widest text-blue-400">Analiză Strategica SWOT</h2>
              </div>
              <div className="bg-zinc-900/50 p-8 border-l-8 border-blue-500 flex flex-col gap-6 rounded-3xl flex-1 overflow-hidden">
                <h3 className="text-4xl font-black text-white uppercase tracking-widest pb-4 border-b-2 border-zinc-800 shrink-0">Oportunități (Opportunities)</h3>
                <div className="grid grid-cols-2 gap-x-12 gap-y-6 overflow-hidden content-start flex-1">
                  {result.analiza_swot?.oportunitati?.slice(0, 8).map((item: any, idx: number) => (
                    <div key={idx} className="flex flex-col gap-2">
                      <h4 className="text-2xl font-bold text-blue-400 leading-snug">✦ {item.titlu || item}</h4>
                      <p className="text-lg text-zinc-300 leading-relaxed max-w-lg">{item.explicatie_tehnica}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Slide 6: SWOT - Amenintari */}
            <div className="presentation-slide w-[1280px] h-[720px] bg-[#09090b] flex flex-col px-24 py-16 border-[12px] border-zinc-900 box-border relative">
              <div className="flex items-center gap-6 mb-8 shrink-0">
                <div className="w-16 h-2 bg-orange-500"></div>
                <h2 className="text-5xl font-black font-sans uppercase tracking-widest text-orange-400">Analiză Strategica SWOT</h2>
              </div>
              <div className="bg-zinc-900/50 p-8 border-l-8 border-orange-500 flex flex-col gap-6 rounded-3xl flex-1 overflow-hidden">
                <h3 className="text-4xl font-black text-white uppercase tracking-widest pb-4 border-b-2 border-zinc-800 shrink-0">Amenințări (Threats)</h3>
                <div className="grid grid-cols-2 gap-x-12 gap-y-6 overflow-hidden content-start flex-1">
                  {result.analiza_swot?.amenintari?.slice(0, 8).map((item: any, idx: number) => (
                    <div key={idx} className="flex flex-col gap-2">
                      <h4 className="text-2xl font-bold text-orange-400 leading-snug">✦ {item.titlu || item}</h4>
                      <p className="text-lg text-zinc-300 leading-relaxed max-w-lg">{item.explicatie_tehnica}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Slide Key Features */}
            <div className="presentation-slide w-[1280px] h-[720px] bg-[#09090b] flex flex-col px-24 py-16 border-[12px] border-zinc-900 box-border relative">
              <div className="flex items-center gap-6 mb-8 shrink-0">
                <div className="w-16 h-2 bg-emerald-500"></div>
                <h2 className="text-5xl font-black font-sans uppercase tracking-widest text-emerald-400">Planul Operațional</h2>
              </div>
              <div className="bg-zinc-900/50 p-8 border-l-8 border-emerald-500 flex flex-col gap-6 rounded-3xl flex-1 overflow-hidden">
                <div className="flex flex-col gap-6 overflow-hidden content-start flex-1 pl-4 text-justify">
                    <div className="flex flex-col gap-2">
                      <h4 className="text-2xl font-bold text-emerald-400 leading-snug">1. Descriere Flux (Sustenabilitate / Verde)</h4>
                      <p className="text-lg text-zinc-300 leading-relaxed line-clamp-3">{result.plan_operational?.descriere_flux}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <h4 className="text-2xl font-bold text-emerald-400 leading-snug">2. Resurse Umane</h4>
                      <p className="text-lg text-zinc-300 leading-relaxed line-clamp-3">{result.plan_operational?.resurse_umane}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <h4 className="text-2xl font-bold text-emerald-400 leading-snug">3. Locație și Dotări</h4>
                      <p className="text-lg text-zinc-300 leading-relaxed line-clamp-3">{result.plan_operational?.locatie_dotari}</p>
                    </div>
                </div>
              </div>
            </div>

            {/* Slide 7: Buget */}
            <div className="presentation-slide w-[1280px] h-[720px] bg-[#09090b] flex flex-col p-24 border-[12px] border-zinc-900 box-border relative">
              <div className="flex items-center gap-6 mb-12 shrink-0">
                <div className="w-16 h-2 bg-emerald-500"></div>
                <h2 className="text-5xl font-black font-sans uppercase tracking-widest text-emerald-400">Buget Investiții</h2>
              </div>
              <div className="grid grid-cols-2 gap-x-12 gap-y-8 font-sans items-start content-start overflow-hidden">
                {result.plan_financiar?.buget_investitii?.slice(0, 8).map((b: any, i: number) => (
                  <div key={i} className="flex flex-col gap-3 bg-zinc-900/50 p-6 border-l-4 border-emerald-500 rounded-2xl h-[140px]">
                    <div className="flex justify-between items-start gap-4">
                      <h4 className="text-2xl font-bold text-zinc-100 flex-1 leading-tight uppercase font-sans tracking-wide line-clamp-1">{b.item}</h4>
                      <span className="text-2xl font-black text-emerald-400 whitespace-nowrap bg-black px-4 py-1.5 rounded-xl border border-zinc-800">{formatPrice(b.cost)}</span>
                    </div>
                    <p className="text-xl text-zinc-400 leading-snug italic line-clamp-2">{b.explicatie}</p>
                  </div>
                ))}
              </div>
              
              <div className="absolute bottom-12 right-24">
                 <div className="bg-emerald-600 text-white px-12 py-6 flex items-center rounded-3xl shadow-2xl">
                   <span className="text-3xl font-bold uppercase tracking-wider mr-6">Total Estimat:</span>
                   <span className="text-5xl font-black text-zinc-900">{formatPrice(result.plan_financiar?.buget_investitii?.reduce((sum: number, b: any) => sum + parseInt(b.cost?.toString().replace(/[^0-9]/g, '') || '0'), 0).toString())}</span>
                 </div>
              </div>
            </div>

            {/* Slide 8: Buget Chart */}
            <div className="presentation-slide w-[1280px] h-[720px] bg-[#09090b] flex flex-col p-24 border-[12px] border-zinc-900 box-border relative">
              <div className="flex items-center gap-6 mb-12 shrink-0">
                <div className="w-16 h-2 bg-emerald-500"></div>
                <h2 className="text-5xl font-black font-sans uppercase tracking-widest text-emerald-400">Distribuția Costurilor</h2>
              </div>
              <div className="flex-1 w-full bg-zinc-900/50 p-8 rounded-3xl border border-zinc-800">
                  <BudgetBarChart budget={result.plan_financiar?.buget_investitii} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PREZENTARE PDF - ALB CU VERDE, MULTIPLE SLIDES */}
      {result && (
        <div className="fixed top-[-9999px] left-[-9999px] w-[1280px] opacity-0 pointer-events-none z-[-50]">
          <div ref={pdfPrintRef}>
            {/* Slide 1: Titlu */}
            <div className="pdf-presentation-slide w-[1280px] h-[720px] bg-emerald-950 text-white flex flex-col justify-center items-center p-20 relative border-[12px] border-emerald-900 box-border">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_white_0%,_transparent_100%)]"></div>
              <h1 className="text-8xl font-black text-center mb-10 text-emerald-100 z-10 font-sans tracking-tight leading-tight">{result.nume}</h1>
              <h2 className="text-4xl text-center italic text-emerald-300 z-10 w-3/4 leading-relaxed font-serif">„{result.slogan}”</h2>
              <div className="absolute bottom-8 right-8 text-emerald-700/50 font-bold uppercase tracking-widest text-sm">IdeeaTa.ai</div>
            </div>

            {/* Slide 2: Viziune */}
            <div className="pdf-presentation-slide w-[1280px] h-[720px] bg-white text-emerald-950 flex flex-col justify-center p-24 border-[12px] border-emerald-900 box-border relative">
              <div className="flex items-center gap-6 mb-12">
                <div className="w-16 h-2 bg-emerald-600"></div>
                <h2 className="text-5xl font-black font-sans uppercase tracking-widest text-emerald-800">Viziune și Strategie</h2>
              </div>
              <div className="grid grid-cols-2 gap-12 font-serif leading-normal text-gray-800">
                <div>
                  <h3 className="text-3xl font-bold text-emerald-700 mb-4">Obiective (1 an)</h3>
                  <p className="text-2xl line-clamp-4">{result.viziune_strategie?.obiective_scurt}</p>
                  <h3 className="text-3xl font-bold text-emerald-700 mb-4 mt-8">Obiective (3-5 ani)</h3>
                  <p className="text-2xl line-clamp-4">{result.viziune_strategie?.obiective_mediu}</p>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-emerald-700 mb-4">Misiune și Valori</h3>
                  <p className="text-2xl line-clamp-8 text-justify">{result.viziune_strategie?.misiune_valori}</p>
                </div>
              </div>
            </div>

            {/* Slide 2b: Analiza Pietei */}
            <div className="pdf-presentation-slide w-[1280px] h-[720px] bg-white text-emerald-950 flex flex-col justify-center p-24 border-[12px] border-emerald-900 box-border relative">
              <div className="flex items-center gap-6 mb-8">
                <div className="w-16 h-2 bg-emerald-600"></div>
                <h2 className="text-5xl font-black font-sans uppercase tracking-widest text-emerald-800">Analiza Pieței</h2>
              </div>
              <div className="flex flex-col gap-6 font-serif leading-normal text-gray-800 text-justify">
                  <div><h3 className="text-3xl font-bold text-emerald-700 mb-2">Clienții Țintă</h3>
                  <p className="text-2xl line-clamp-3">{result.analiza_pietei?.clienti_tinta}</p></div>
                  <div><h3 className="text-3xl font-bold text-emerald-700 mb-2">Concurența</h3>
                  <p className="text-2xl line-clamp-3">{result.analiza_pietei?.concurenta}</p></div>
                  <div><h3 className="text-3xl font-bold text-emerald-700 mb-2">Strategia de Marketing</h3>
                  <p className="text-2xl line-clamp-3">{result.analiza_pietei?.strategie_marketing}</p></div>
              </div>
            </div>

            {/* Slide 3: SWOT - Tari */}
            <div className="pdf-presentation-slide w-[1280px] h-[720px] bg-white flex flex-col px-24 py-16 border-[12px] border-emerald-900 box-border relative">
              <div className="flex items-center gap-6 mb-8 shrink-0">
                <div className="w-16 h-2 bg-emerald-500"></div>
                <h2 className="text-5xl font-black font-sans uppercase tracking-widest text-emerald-900">Analiză Strategica SWOT</h2>
              </div>
              <div className="bg-emerald-50/50 p-8 border-l-8 border-emerald-500 flex flex-col gap-6 flex-1 rounded-2xl overflow-hidden">
                <h3 className="text-4xl font-black text-emerald-800 uppercase tracking-widest pb-4 border-b-2 border-emerald-200 shrink-0">Puncte Tari</h3>
                <div className="grid grid-cols-2 gap-x-12 gap-y-6 overflow-hidden content-start flex-1">
                  {result.analiza_swot?.puncte_tari?.slice(0, 8).map((item: any, idx: number) => (
                    <div key={idx} className="flex flex-col gap-2">
                      <h4 className="text-2xl font-bold text-emerald-700 leading-snug">✦ {item.titlu || item}</h4>
                      <p className="text-lg text-gray-600 leading-relaxed max-w-lg text-justify">{item.explicatie_tehnica}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Slide 4: SWOT - Slabe */}
            <div className="pdf-presentation-slide w-[1280px] h-[720px] bg-white flex flex-col px-24 py-16 border-[12px] border-emerald-900 box-border relative">
              <div className="flex items-center gap-6 mb-8 shrink-0">
                <div className="w-16 h-2 bg-[#ff4d6d]"></div>
                <h2 className="text-5xl font-black font-sans uppercase tracking-widest text-[#ff4d6d]">Analiză Strategica SWOT</h2>
              </div>
              <div className="bg-rose-50/50 p-8 border-l-8 border-[#ff4d6d] flex flex-col gap-6 flex-1 rounded-2xl overflow-hidden">
                <h3 className="text-4xl font-black text-rose-900 uppercase tracking-widest pb-4 border-b-2 border-rose-200 shrink-0">Slăbiciuni</h3>
                <div className="grid grid-cols-2 gap-x-12 gap-y-6 overflow-hidden content-start flex-1">
                  {result.analiza_swot?.puncte_slabe?.slice(0, 8).map((item: any, idx: number) => (
                    <div key={idx} className="flex flex-col gap-2">
                      <h4 className="text-2xl font-bold text-[#ff4d6d] leading-snug">✦ {item.titlu || item}</h4>
                      <p className="text-lg text-gray-600 leading-relaxed max-w-lg text-justify">{item.explicatie_tehnica}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Slide 5: SWOT - Oportunitati */}
            <div className="pdf-presentation-slide w-[1280px] h-[720px] bg-white flex flex-col px-24 py-16 border-[12px] border-emerald-900 box-border relative">
              <div className="flex items-center gap-6 mb-8 shrink-0">
                <div className="w-16 h-2 bg-blue-500"></div>
                <h2 className="text-5xl font-black font-sans uppercase tracking-widest text-blue-600">Analiză Strategica SWOT</h2>
              </div>
              <div className="bg-blue-50/50 p-8 border-l-8 border-blue-500 flex flex-col gap-6 flex-1 rounded-2xl overflow-hidden">
                <h3 className="text-4xl font-black text-blue-900 uppercase tracking-widest pb-4 border-b-2 border-blue-200 shrink-0">Oportunități</h3>
                <div className="grid grid-cols-2 gap-x-12 gap-y-6 overflow-hidden content-start flex-1">
                  {result.analiza_swot?.oportunitati?.slice(0, 8).map((item: any, idx: number) => (
                    <div key={idx} className="flex flex-col gap-2">
                      <h4 className="text-2xl font-bold text-blue-600 leading-snug">✦ {item.titlu || item}</h4>
                      <p className="text-lg text-gray-600 leading-relaxed max-w-lg text-justify">{item.explicatie_tehnica}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Slide 6: SWOT - Amenintari */}
            <div className="pdf-presentation-slide w-[1280px] h-[720px] bg-white flex flex-col px-24 py-16 border-[12px] border-emerald-900 box-border relative">
              <div className="flex items-center gap-6 mb-8 shrink-0">
                <div className="w-16 h-2 bg-orange-500"></div>
                <h2 className="text-5xl font-black font-sans uppercase tracking-widest text-orange-600">Analiză Strategica SWOT</h2>
              </div>
              <div className="bg-orange-50/50 p-8 border-l-8 border-orange-500 flex flex-col gap-6 flex-1 rounded-2xl overflow-hidden">
                <h3 className="text-4xl font-black text-orange-900 uppercase tracking-widest pb-4 border-b-2 border-orange-200 shrink-0">Amenințări</h3>
                <div className="grid grid-cols-2 gap-x-12 gap-y-6 overflow-hidden content-start flex-1">
                  {result.analiza_swot?.amenintari?.slice(0, 8).map((item: any, idx: number) => (
                    <div key={idx} className="flex flex-col gap-2">
                      <h4 className="text-2xl font-bold text-orange-600 leading-snug">✦ {item.titlu || item}</h4>
                      <p className="text-lg text-gray-600 leading-relaxed max-w-lg text-justify">{item.explicatie_tehnica}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Slide Key Features PDF */}
            <div className="pdf-presentation-slide w-[1280px] h-[720px] bg-white flex flex-col px-24 py-16 border-[12px] border-emerald-900 box-border relative">
              <div className="flex items-center gap-6 mb-8 shrink-0">
                <div className="w-16 h-2 bg-emerald-600"></div>
                <h2 className="text-5xl font-black font-sans uppercase tracking-widest text-emerald-800">Planul Operațional</h2>
              </div>
              <div className="bg-emerald-50/50 p-8 border-l-8 border-emerald-500 flex flex-col gap-6 flex-1 rounded-2xl overflow-hidden">
                <div className="flex flex-col gap-6 overflow-hidden content-start flex-1 pl-4 text-justify">
                    <div className="flex flex-col gap-2">
                       <h4 className="text-2xl font-bold text-emerald-700 leading-snug">1. Descriere Flux (Sustenabilitate / Verde)</h4>
                       <p className="text-lg text-gray-600 leading-relaxed line-clamp-3">{result.plan_operational?.descriere_flux}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                       <h4 className="text-2xl font-bold text-emerald-700 leading-snug">2. Resurse Umane</h4>
                       <p className="text-lg text-gray-600 leading-relaxed line-clamp-3">{result.plan_operational?.resurse_umane}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                       <h4 className="text-2xl font-bold text-emerald-700 leading-snug">3. Locație și Dotări</h4>
                       <p className="text-lg text-gray-600 leading-relaxed line-clamp-3">{result.plan_operational?.locatie_dotari}</p>
                    </div>
                </div>
              </div>
            </div>

            {/* Slide 7: Buget */}
            <div className="pdf-presentation-slide w-[1280px] h-[720px] bg-white flex flex-col p-24 border-[12px] border-emerald-900 box-border relative">
              <div className="flex items-center gap-6 mb-12">
                <div className="w-16 h-2 bg-emerald-600"></div>
                <h2 className="text-5xl font-black font-sans uppercase tracking-widest text-emerald-800">Buget Investiții</h2>
              </div>
              <div className="grid grid-cols-2 gap-x-12 gap-y-8 font-sans items-start content-start overflow-hidden">
                {result.plan_financiar?.buget_investitii?.slice(0, 8).map((b: any, i: number) => (
                  <div key={i} className="flex flex-col gap-3 bg-emerald-50/50 p-6 border-l-4 border-emerald-500 rounded-xl h-[140px]">
                    <div className="flex justify-between items-start gap-4">
                      <h4 className="text-2xl font-bold text-emerald-900 flex-1 leading-tight uppercase tracking-wide line-clamp-1">{b.item}</h4>
                      <span className="text-2xl font-black text-emerald-700 whitespace-nowrap bg-emerald-100 px-4 py-1.5 rounded-lg border border-emerald-200">{formatPrice(b.cost)}</span>
                    </div>
                    <p className="text-xl text-gray-600 leading-snug italic line-clamp-2">{b.explicatie}</p>
                  </div>
                ))}
              </div>
              
              <div className="absolute bottom-12 right-24">
                 <div className="bg-emerald-900 text-white px-12 py-6 flex items-center rounded-2xl shadow-xl">
                   <span className="text-3xl font-bold uppercase tracking-wider mr-6 text-emerald-200">Total Estimat:</span>
                   <span className="text-5xl font-black">{formatPrice(result.plan_financiar?.buget_investitii?.reduce((sum: number, b: any) => sum + parseInt(b.cost?.toString().replace(/[^0-9]/g, '') || '0'), 0).toString())}</span>
                 </div>
              </div>
            </div>

            {/* Slide 8: Buget Chart */}
            <div className="pdf-presentation-slide w-[1280px] h-[720px] bg-white flex flex-col px-24 py-16 border-[12px] border-emerald-900 box-border relative">
              <div className="flex items-center gap-6 mb-8 shrink-0">
                <div className="w-16 h-2 bg-emerald-600"></div>
                <h2 className="text-5xl font-black font-sans uppercase tracking-widest text-emerald-800">Distribuția Costurilor</h2>
              </div>
              <div className="flex-1 w-full bg-emerald-50/50 p-8 rounded-2xl border border-emerald-100">
                  <BudgetBarChart budget={result.plan_financiar?.buget_investitii} />
              </div>
            </div>

          </div>
        </div>
      )}
      <PricingModal
        isOpen={showPricingModal}
        onClose={() => {
          setShowPricingModal(false);
          setPendingDownloadMode(null);
        }}
        userId={user?.uid || ""}
        userEmail={user?.email || ""}
        currency={currency}
        planName={result?.nume || "Plan de Afaceri"}
      />
    </main>
  );
}
