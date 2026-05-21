"use client";
import { useState, useRef, useEffect } from "react";
import { jsPDF } from "jspdf";
import { toPng } from "html-to-image";
import pptxgen from "pptxgenjs";
import { EditForm } from "./EditForm";
import { BudgetBarChart } from "./BudgetChart";

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

  const startEditing = () => {
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

  const handleAiEdit = async (action: string, customStyle?: string) => {
    if (isEditingAi) return;
    setIsEditingAi(true);
    setShowToneOptions(false);
    try {
      const res = await fetch("/api/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ result, action, customStyle })
      });
      const data = await res.json();
      if (data.updatedResult) {
        setResult(JSON.parse(data.updatedResult));
      } else if (data.error) {
        alert(data.error);
      }
    } catch (e) {
      console.error(e);
      alert("A apărut o eroare la editarea cu AI.");
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
  const [showExamples, setShowExamples] = useState(false); 
  
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
    "Aplicație de Fitness Personalizat",
    "Consultanță Nutriție"
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
          setResult(finalResult);
          setSkill(""); 
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const downloadAction = async (mode: 'pdf' | 'pptx' | 'word', bypassPaymentCheck = false) => {
    if (!isPaid && !bypassPaymentCheck) {
      setPendingDownloadMode(mode);
      setShowPaywall(true);
      return;
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
              
              <h2 style="font-family: Arial, sans-serif; color: #065f46;">Oportunitatea și Descrierea Afacerii</h2>
              <p style="font-family: Arial, sans-serif; line-height: 1.6; font-size: 14px;">${result.descriere || ''}</p>
              
              <h2 style="font-family: Arial, sans-serif; color: #065f46;">Analiza SWOT</h2>
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
              
              ${result.functionalitati_cheie && result.functionalitati_cheie.length > 0 ? `
              <h2 style="font-family: Arial, sans-serif; color: #065f46; margin-top: 24px;">Funcționalități Cheie</h2>
              <ul style="font-family: Arial, sans-serif; line-height: 1.6; font-size: 14px;">
                  ${result.functionalitati_cheie.map((item: any) => `<li><strong>${item.titlu}</strong><br/><span style="color:#555;">${item.descriere}</span></li>`).join('')}
              </ul>
              ` : ''}

              <h2 style="font-family: Arial, sans-serif; color: #065f46;">Buget Necesar și Justificare</h2>
              <ul style="font-family: Arial, sans-serif; line-height: 1.6; font-size: 14px;">
                  ${result.buget_detaliat?.map((b: any) => `<li><strong>${b.item}</strong> - <span style="color:#065f46;">${formatPrice(b.cost)}</span><br/><span style="color:#555; font-style:italic;">${b.explicatie}</span></li>`).join('') || ''}
              </ul>
              <h3 style="text-align:right; font-family: Arial, sans-serif; color: #065f46;">
                  Total Estimat: ${formatPrice(result.buget_detaliat?.reduce((sum: number, b: any) => sum + parseInt(b.cost?.toString().replace(/[^0-9]/g, '') || '0'), 0).toString())}
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

  return (
    <main className="min-h-screen bg-[#09090b] text-white p-8 flex flex-col items-center font-sans print:bg-white print:text-black print:p-0">
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

      <div className={`${isDownloading === 'pptx' ? 'hidden' : 'flex'} flex-col items-center w-full max-w-6xl`}>
        <h1 className="text-5xl font-black mt-12 mb-20 not-italic tracking-tighter cursor-pointer bg-gradient-to-r from-zinc-400 via-emerald-400 to-zinc-400 bg-clip-text text-transparent animate-shimmer print:hidden" onClick={resetApp}>
          IdeeaTa.ai
        </h1>
        
        {!result && (
        <div className="w-full max-w-4xl flex flex-col items-center animate-in fade-in zoom-in duration-500 mb-16 text-center mt-6">
          
          <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-zinc-900/90 border border-amber-500/30 text-amber-400 text-sm font-black uppercase tracking-wider mb-8 shadow-[0_0_30px_rgba(245,158,11,0.1)] hover:border-amber-400/50 transition-all duration-300 animate-pulse">
            <span className="text-base">🛑</span> Nu începe o afacere înainte să verifici IdeeaTa.ai
          </div>

          <h2 className="text-4xl font-black mb-10 leading-tight max-w-3xl not-italic text-white">
            Transformă-ți <span className="text-emerald-400">experiența</span><br />într-un business validat.
          </h2>
          
          <p className="text-zinc-300 text-lg mb-16 leading-relaxed max-w-2xl not-italic font-medium text-center">
            Descrie la ce ești bun, iar noi îți vom genera un plan de afaceri complet.<br />Analiză SWOT, proiecții financiare și strategie de piață.
          </p>

          <form onSubmit={generate} className="flex gap-4 w-full max-w-2xl h-16 relative group z-10 w-full">
            {skill.length > 35 && (
              <div className="absolute bottom-full mb-3 left-0 right-0 bg-zinc-800 text-zinc-100 p-4 rounded-xl text-base shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 z-50 text-center whitespace-normal break-words border border-zinc-600 pointer-events-none font-medium leading-relaxed">
                {skill}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-zinc-800 transform rotate-45 border-b border-r border-zinc-600"></div>
              </div>
            )}
            <input
              type="text"
              ref={inputRef}
              value={skill}
              title={skill}
              onChange={(e) => setSkill(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              placeholder="Ex: Consultanță Securitate, Design Interior..."
              className="flex-1 h-full px-6 rounded-xl bg-zinc-900 border border-zinc-800 outline-none focus:border-emerald-500 transition-all text-xl shadow-inner"
            />
            <button type="submit" disabled={loading} className="h-full bg-emerald-600 px-8 rounded-xl font-black text-lg min-w-[240px] hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-900/20">
              {loading ? loadingMessages[messageIndex] : "Generează Planul"}
            </button>
          </form>

          <div className="mt-16 flex flex-col items-center w-full">
            <button 
              type="button"
              onClick={() => setShowExamples(!showExamples)}
              className="flex items-center gap-2 text-sm text-zinc-400 hover:text-emerald-400 transition-colors font-bold tracking-widest uppercase mb-8"
            >
              Exemple de afaceri
              <span className={`text-xs transform transition-transform duration-300 ${showExamples ? "rotate-180" : "rotate-0"}`}>
                ▼
              </span>
            </button>

            {showExamples && (
              <div className="flex flex-wrap justify-center gap-4 max-w-3xl animate-in fade-in slide-in-from-top-2">
                {examplesList.map((ex, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSkill(ex);
                      setShowExamples(false);
                      setTimeout(() => inputRef.current?.focus(), 50);
                    }}
                    className="bg-emerald-950/20 border border-emerald-800/40 text-emerald-400 font-bold text-sm px-6 py-4 rounded-full transition-all duration-300 hover:bg-[#960018] hover:text-white hover:border-[#ff4d6d] hover:scale-105 hover:shadow-[0_0_20px_rgba(255,77,109,0.4)]"
                  >
                    {ex}
                  </button>
                ))}
                
                {/* RESTAURAT: Bula aurie cu logica de randomizare și efectele originale */}
                <button
                  type="button"
                  onClick={() => {
                    const randomIndex = Math.floor(Math.random() * randomIdeas.length);
                    setSkill(randomIdeas[randomIndex]);
                    setShowExamples(false);
                    setTimeout(() => inputRef.current?.focus(), 50);
                  }}
                  className="bg-amber-950/30 border border-amber-500/60 text-amber-400 font-black text-sm px-6 py-4 rounded-full transition-all duration-300 hover:bg-amber-500 hover:text-black hover:border-amber-400 hover:scale-105 hover:shadow-[0_0_20px_rgba(245,158,11,0.5)] flex items-center gap-2"
                >
                  🎲 Surprinde-mă <span className="whitespace-nowrap">(Altă idee)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {isEditing && result ? (
        <div className="w-full max-w-6xl animate-in fade-in slide-in-from-bottom-10 print:hidden">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 w-full mb-8 pb-8 border-b border-zinc-800">
            <h1 className="text-3xl font-black text-emerald-400 flex items-center gap-3">
              <span>✏️</span> Studio Editare
            </h1>
            <div className="flex gap-4">
              <button onClick={cancelEditing} className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold transition-all shadow-xl">
                 ❌ Anulează
              </button>
              <button onClick={saveEditing} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all shadow-xl border border-emerald-500">
                 ✅ Confirmă și Salvează
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-[#09090b] border border-zinc-800 p-8 rounded-[2.5rem] shadow-2xl">
              <EditForm result={result} updateField={updateField} />
            </div>
            <div className="flex flex-col gap-6">
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
                          if (!isPaid) {
                            setShowPaywall(true);
                          } else {
                            handleAiEdit("eu_funds_optimization");
                          }
                        }} 
                        disabled={isEditingAi} 
                        className={`w-full text-left flex items-center justify-between rounded-xl px-5 py-4 font-bold text-sm transition-all group disabled:opacity-50 disabled:cursor-not-allowed ${
                          !isPaid 
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
                        {!isPaid && (
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
                              Optimizează Bugetul <span className="whitespace-nowrap">(-20% costuri)</span>
                            </>
                          )}
                        </span>
                      </button>
                      <button type="button" onClick={() => handleAiEdit("add_sections")} disabled={isEditingAi} className="w-full bg-black hover:bg-zinc-800 border border-zinc-800 rounded-xl px-5 py-4 font-bold text-sm text-zinc-300 transition-all text-left flex items-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed">
                        <span className="text-emerald-500 group-hover:scale-110 transition-transform">💡</span> 
                        <span>{isEditingAi ? "Se procesează..." : "Adaugă secțiuni noi"}</span>
                      </button>
                    </div>
                </div>
            </div>
          </div>
        </div>
      ) : result && (
        <div className="w-full max-w-6xl flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 w-full">
            <button onClick={resetApp} className="w-full md:flex-1 h-10 bg-zinc-800 hover:bg-zinc-700 text-white px-4 rounded-xl font-bold transition-all shadow-xl border border-zinc-700 flex items-center justify-center gap-2 text-xs whitespace-nowrap">
               🔄 Altă idee
            </button>
            <button onClick={startEditing} className="w-full md:flex-1 h-10 bg-emerald-700 hover:bg-emerald-600 text-white px-4 rounded-xl font-bold transition-all shadow-xl border border-emerald-600 flex items-center justify-center gap-2 text-xs whitespace-nowrap">
               ✏️ Studio Editare
            </button>

            <div className="w-full md:w-auto h-10 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex gap-2 p-1 bg-black rounded-xl border border-zinc-700 h-full w-full md:w-32 flex-none">
                <button onClick={() => setCurrency("LEI")} className={`w-1/2 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${currency === "LEI" ? "bg-emerald-600 text-white" : "text-zinc-500 hover:text-white"}`}>LEI</button>
                <button onClick={() => setCurrency("EUR")} className={`w-1/2 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${currency === "EUR" ? "bg-blue-600 text-white" : "text-zinc-500 hover:text-white"}`}>EUR</button>
              </div>
              <div className="flex gap-2 h-full w-full overflow-x-auto md:overflow-visible pb-2 md:pb-0 hide-scrollbar scroll-smooth">
                <button 
                  onClick={() => downloadAction('pdf')} 
                  disabled={isDownloading !== null}
                  className="flex-none bg-zinc-800 disabled:opacity-50 hover:bg-zinc-700 text-[10px] sm:text-[11px] h-full px-4 rounded-xl font-black uppercase tracking-widest border border-zinc-700 transition-all flex items-center justify-center whitespace-nowrap gap-1.5 cursor-pointer"
                >
                  {isDownloading === 'pdf' ? "⏳..." : `⬇ Prezentare ${!isPaid ? "🔒" : ""}`}
                </button>
                <button 
                  onClick={() => downloadAction('pptx')} 
                  disabled={isDownloading !== null}
                  className="flex-none bg-zinc-800 disabled:opacity-50 hover:bg-zinc-700 text-[10px] sm:text-[11px] h-full px-4 rounded-xl font-black uppercase tracking-widest border border-zinc-700 transition-all flex items-center justify-center whitespace-nowrap gap-1.5 cursor-pointer"
                >
                  {isDownloading === 'pptx' ? "⏳..." : `⬇ Broșură ${!isPaid ? "🔒" : ""}`}
                </button>
                <button 
                  onClick={() => downloadAction('word')} 
                  disabled={isDownloading !== null}
                  className="flex-none bg-zinc-800 disabled:opacity-50 hover:bg-zinc-700 text-[10px] sm:text-[11px] h-full px-4 rounded-xl font-black uppercase tracking-widest border border-zinc-700 transition-all flex items-center justify-center whitespace-nowrap gap-1.5 cursor-pointer"
                >
                  {isDownloading === 'word' ? "⏳..." : `⬇ Document ${!isPaid ? "🔒" : ""}`}
                </button>
              </div>
            </div>
          </div>

          <div ref={brochureRef} className={`${isEditing ? 'hidden' : 'block'} bg-[#09090b] border border-zinc-800 p-8 md:p-12 rounded-[2.5rem] shadow-2xl transition-all duration-500`}>
            <div className="pdf-section mt-12 mb-10 border-b border-zinc-800 pb-10">
              <h2 className="text-6xl font-black mb-4 tracking-tight not-italic text-white">
                {result.nume}
              </h2>
              <p className="text-emerald-400 uppercase text-lg font-black tracking-[0.4em] not-italic mt-4">
                {result.slogan}
              </p>
            </div>

            <div className="pdf-section mb-16 bg-zinc-900/50 p-10 rounded-3xl border-l-4 border-emerald-500 shadow-inner print:shadow-none print:bg-transparent print:border-l-4 print:border-emerald-700 print:text-black">
              <p className="text-zinc-200 text-2xl leading-relaxed font-medium text-justify not-italic print:text-black">
                {result.descriere}
              </p>
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
                        <p className="text-zinc-400 text-lg italic leading-relaxed group-hover:text-white/90 transition-colors print:text-gray-700 print:text-base">{item.explicatie_tehnica}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-10 border-t border-zinc-800 print:border-none print:pt-4">
               <h3 className="pdf-section text-emerald-400 text-sm font-black uppercase mb-10 tracking-[0.2em] text-center drop-shadow-md print:text-emerald-800 print:drop-shadow-none">
                 Buget și Justificare (Curs actualizat)
               </h3>
               
               <div className="mb-16">
                 <h4 className="text-zinc-500 font-bold uppercase tracking-wider mb-6 text-sm">Distribuția costurilor</h4>
                 <BudgetBarChart budget={result.buget_detaliat} />
               </div>

               <div className="grid grid-cols-1 gap-6 print:gap-3">
                  {result.buget_detaliat?.map((b: any, i: number) => (
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

            {/* KEY FEATURES BROCHURE SECTION */}
            {result.functionalitati_cheie && result.functionalitati_cheie.length > 0 && (
              <div className="pt-10 border-t border-zinc-800 print:border-none print:pt-4">
                 <h3 className="pdf-section text-emerald-400 text-sm font-black uppercase mb-10 tracking-[0.2em] text-center drop-shadow-md print:text-emerald-800 print:drop-shadow-none">
                   Funcționalități Cheie
                 </h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:gap-3">
                    {result.functionalitati_cheie.map((item: any, i: number) => (
                      <div key={i} className="pdf-section bg-[#09090b] p-8 rounded-3xl border border-zinc-800 border-l-4 border-l-emerald-500 shadow-xl flex flex-col gap-3 print:border-gray-200 print:bg-transparent print:shadow-none">
                          <h4 className="text-xl font-bold text-white print:text-black">{item.titlu}</h4>
                          <p className="text-zinc-400 text-md leading-relaxed print:text-gray-700">{item.descriere}</p>
                      </div>
                    ))}
                 </div>
              </div>
            )}
            
          </div>
        </div>
      )}
      </div>

      {/* DOCUMENT PREZENTARE - Afișat doar la nevoie pentru a fi capturat impecabil */}
      {result && (
        <div className={`${isDownloading === 'pptx' ? 'block relative' : 'hidden'} w-[1280px] mx-auto`}>
          <div ref={presentationRef} className="flex flex-col gap-10 bg-[#09090b] p-10">
            {/* Slide 1: Title */}
            <div className="presentation-slide w-[1280px] h-[720px] bg-[#09090b] text-white flex flex-col justify-center items-center p-20 relative border-[12px] border-zinc-900 box-border">
              <h1 className="text-8xl font-black text-center mb-10 text-white z-10 font-sans tracking-tight leading-tight">{result.nume}</h1>
              <h2 className="text-4xl text-center italic text-emerald-400 z-10 w-3/4 leading-relaxed tracking-widest font-sans uppercase">„{result.slogan}”</h2>
              <div className="absolute bottom-8 right-8 text-zinc-600 font-bold uppercase tracking-widest text-sm">IdeeaTa.ai</div>
            </div>

            {/* Slide 2: Descriere */}
            <div className="presentation-slide w-[1280px] h-[720px] bg-[#09090b] text-white flex flex-col justify-center p-24 border-[12px] border-zinc-900 box-border relative">
              <div className="flex items-center gap-6 mb-12">
                <div className="w-16 h-2 bg-emerald-500"></div>
                <h2 className="text-5xl font-black font-sans uppercase tracking-widest text-emerald-400">Conceptul Afacerii</h2>
              </div>
              <div className="text-4xl font-sans leading-normal text-zinc-200 text-justify">
                {result.descriere}
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
                  {result.analiza_swot?.puncte_tari?.slice(0, 4).map((item: any, idx: number) => (
                    <div key={idx} className="flex flex-col gap-2">
                      <h4 className="text-2xl font-bold text-emerald-400 leading-snug">✦ {item.titlu || item}</h4>
                      <p className="text-lg text-zinc-300 leading-relaxed max-w-lg">{item.explicatie_tehnica}</p>
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
                  {result.analiza_swot?.puncte_slabe?.slice(0, 4).map((item: any, idx: number) => (
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
                  {result.analiza_swot?.oportunitati?.slice(0, 4).map((item: any, idx: number) => (
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
                  {result.analiza_swot?.amenintari?.slice(0, 4).map((item: any, idx: number) => (
                    <div key={idx} className="flex flex-col gap-2">
                      <h4 className="text-2xl font-bold text-orange-400 leading-snug">✦ {item.titlu || item}</h4>
                      <p className="text-lg text-zinc-300 leading-relaxed max-w-lg">{item.explicatie_tehnica}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Slide Key Features */}
            {result.functionalitati_cheie && result.functionalitati_cheie.length > 0 && (
            <div className="presentation-slide w-[1280px] h-[720px] bg-[#09090b] flex flex-col px-24 py-16 border-[12px] border-zinc-900 box-border relative">
              <div className="flex items-center gap-6 mb-8 shrink-0">
                <div className="w-16 h-2 bg-emerald-500"></div>
                <h2 className="text-5xl font-black font-sans uppercase tracking-widest text-emerald-400">Funcționalități Cheie</h2>
              </div>
              <div className="bg-zinc-900/50 p-8 border-l-8 border-emerald-500 flex flex-col gap-6 rounded-3xl flex-1 overflow-hidden">
                <h3 className="text-4xl font-black text-white uppercase tracking-widest pb-4 border-b-2 border-zinc-800 shrink-0">Funcționalități Cheie</h3>
                <div className="grid grid-cols-2 gap-x-12 gap-y-6 overflow-hidden content-start flex-1">
                  {result.functionalitati_cheie.slice(0, 4).map((item: any, idx: number) => (
                    <div key={idx} className="flex flex-col gap-2">
                      <h4 className="text-2xl font-bold text-emerald-400 leading-snug">✦ {item.titlu}</h4>
                      <p className="text-lg text-zinc-300 leading-relaxed max-w-lg">{item.descriere}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            )}

            {/* Slide 7: Buget */}
            <div className="presentation-slide w-[1280px] h-[720px] bg-[#09090b] flex flex-col p-24 border-[12px] border-zinc-900 box-border relative">
              <div className="flex items-center gap-6 mb-12 shrink-0">
                <div className="w-16 h-2 bg-emerald-500"></div>
                <h2 className="text-5xl font-black font-sans uppercase tracking-widest text-emerald-400">Buget Necesar și Justificare</h2>
              </div>
              <div className="grid grid-cols-2 gap-x-12 gap-y-8 font-sans items-start content-start overflow-hidden">
                {result.buget_detaliat?.slice(0, 4).map((b: any, i: number) => (
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
                   <span className="text-5xl font-black text-zinc-900">{formatPrice(result.buget_detaliat?.reduce((sum: number, b: any) => sum + parseInt(b.cost?.toString().replace(/[^0-9]/g, '') || '0'), 0).toString())}</span>
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
                  <BudgetBarChart budget={result.buget_detaliat} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PREZENTARE PDF - ALB CU VERDE, MULTIPLE SLIDES */}
      {result && (
        <div className={`${isDownloading === 'pdf' ? 'block absolute top-0 left-0 opacity-0 pointer-events-none' : 'hidden'}`}>
          <div ref={pdfPrintRef}>
            {/* Slide 1: Titlu */}
            <div className="pdf-presentation-slide w-[1280px] h-[720px] bg-emerald-950 text-white flex flex-col justify-center items-center p-20 relative border-[12px] border-emerald-900 box-border">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_white_0%,_transparent_100%)]"></div>
              <h1 className="text-8xl font-black text-center mb-10 text-emerald-100 z-10 font-sans tracking-tight leading-tight">{result.nume}</h1>
              <h2 className="text-4xl text-center italic text-emerald-300 z-10 w-3/4 leading-relaxed font-serif">„{result.slogan}”</h2>
              <div className="absolute bottom-8 right-8 text-emerald-700/50 font-bold uppercase tracking-widest text-sm">IdeeaTa.ai</div>
            </div>

            {/* Slide 2: Descriere */}
            <div className="pdf-presentation-slide w-[1280px] h-[720px] bg-white text-emerald-950 flex flex-col justify-center p-24 border-[12px] border-emerald-900 box-border relative">
              <div className="flex items-center gap-6 mb-12">
                <div className="w-16 h-2 bg-emerald-600"></div>
                <h2 className="text-5xl font-black font-sans uppercase tracking-widest text-emerald-800">Conceptul Afacerii</h2>
              </div>
              <div className="text-4xl font-serif leading-normal text-gray-800 text-justify">
                <span className="float-left text-9xl text-emerald-700 pr-6 pt-4 font-black leading-none">{result.descriere.charAt(0)}</span>
                {result.descriere.substring(1)}
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
                  {result.analiza_swot?.puncte_tari?.slice(0, 4).map((item: any, idx: number) => (
                    <div key={idx} className="flex flex-col gap-2">
                      <h4 className="text-2xl font-bold text-emerald-700 leading-snug">✦ {item.titlu || item}</h4>
                      <p className="text-lg text-gray-600 leading-relaxed max-w-lg">{item.explicatie_tehnica}</p>
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
                  {result.analiza_swot?.puncte_slabe?.slice(0, 4).map((item: any, idx: number) => (
                    <div key={idx} className="flex flex-col gap-2">
                      <h4 className="text-2xl font-bold text-[#ff4d6d] leading-snug">✦ {item.titlu || item}</h4>
                      <p className="text-lg text-gray-600 leading-relaxed max-w-lg">{item.explicatie_tehnica}</p>
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
                  {result.analiza_swot?.oportunitati?.slice(0, 4).map((item: any, idx: number) => (
                    <div key={idx} className="flex flex-col gap-2">
                      <h4 className="text-2xl font-bold text-blue-600 leading-snug">✦ {item.titlu || item}</h4>
                      <p className="text-lg text-gray-600 leading-relaxed max-w-lg">{item.explicatie_tehnica}</p>
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
                  {result.analiza_swot?.amenintari?.slice(0, 4).map((item: any, idx: number) => (
                    <div key={idx} className="flex flex-col gap-2">
                      <h4 className="text-2xl font-bold text-orange-600 leading-snug">✦ {item.titlu || item}</h4>
                      <p className="text-lg text-gray-600 leading-relaxed max-w-lg">{item.explicatie_tehnica}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Slide Key Features PDF */}
            {result.functionalitati_cheie && result.functionalitati_cheie.length > 0 && (
            <div className="pdf-presentation-slide w-[1280px] h-[720px] bg-white flex flex-col px-24 py-16 border-[12px] border-emerald-900 box-border relative">
              <div className="flex items-center gap-6 mb-8 shrink-0">
                <div className="w-16 h-2 bg-emerald-600"></div>
                <h2 className="text-5xl font-black font-sans uppercase tracking-widest text-emerald-800">Funcționalități Cheie</h2>
              </div>
              <div className="bg-emerald-50/50 p-8 border-l-8 border-emerald-500 flex flex-col gap-6 flex-1 rounded-2xl overflow-hidden">
                <h3 className="text-4xl font-black text-emerald-900 uppercase tracking-widest pb-4 border-b-2 border-emerald-200 shrink-0">Funcționalități Cheie</h3>
                <div className="grid grid-cols-2 gap-x-12 gap-y-6 overflow-hidden content-start flex-1">
                  {result.functionalitati_cheie.slice(0, 4).map((item: any, idx: number) => (
                    <div key={idx} className="flex flex-col gap-2">
                       <h4 className="text-2xl font-bold text-emerald-700 leading-snug">✦ {item.titlu}</h4>
                       <p className="text-lg text-gray-600 leading-relaxed max-w-lg">{item.descriere}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            )}

            {/* Slide 7: Buget */}
            <div className="pdf-presentation-slide w-[1280px] h-[720px] bg-white flex flex-col p-24 border-[12px] border-emerald-900 box-border relative">
              <div className="flex items-center gap-6 mb-12">
                <div className="w-16 h-2 bg-emerald-600"></div>
                <h2 className="text-5xl font-black font-sans uppercase tracking-widest text-emerald-800">Buget Necesar</h2>
              </div>
              <div className="grid grid-cols-2 gap-x-12 gap-y-8 font-sans items-start content-start overflow-hidden">
                {result.buget_detaliat?.slice(0, 4).map((b: any, i: number) => (
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
                   <span className="text-5xl font-black">{formatPrice(result.buget_detaliat?.reduce((sum: number, b: any) => sum + parseInt(b.cost?.toString().replace(/[^0-9]/g, '') || '0'), 0).toString())}</span>
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
                  <BudgetBarChart budget={result.buget_detaliat} />
              </div>
            </div>

          </div>
        </div>
      )}
      {showPaywall && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[110] flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-300">
          <div className="bg-[#09090b] border border-zinc-800 rounded-[2.5rem] w-full max-w-lg shadow-2xl p-8 md:p-10 relative overflow-hidden flex flex-col gap-6 animate-in slide-in-from-bottom-12 duration-300 text-left">
            
            {/* Ambient glows inside modal */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none"></div>
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none"></div>

            {/* Header */}
            <div className="text-center flex flex-col items-center gap-2">
              <div className="w-16 h-16 bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 rounded-2xl flex items-center justify-center text-3xl mb-2 shadow-[0_0_20px_rgba(52,211,153,0.1)]">
                🚀
              </div>
              <h2 className="text-3xl font-black tracking-tight leading-tight bg-gradient-to-r from-white via-emerald-400 to-white bg-clip-text text-transparent">
                Deblochează Planul Complet
              </h2>
              <p className="text-zinc-400 text-sm mt-2 max-w-sm">
                Descarcă planul tău în toate formatele premium, editează-l nelimitat și elimină orice restricție.
              </p>
            </div>

            {/* Benefits list */}
            <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-5 flex flex-col gap-3 text-left">
              <div className="flex items-start gap-3">
                <span className="text-emerald-500 text-lg mt-0.5">✔</span>
                <div>
                  <h4 className="text-sm font-bold text-white">Toate cele 3 Formate incluse</h4>
                  <p className="text-xs text-zinc-500">PDF Prezentare, Broșură PowerPoint (.pptx) și Document Word (.doc)</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-emerald-500 text-lg mt-0.5">✔</span>
                <div>
                  <h4 className="text-sm font-bold text-white">Studio Editare Nelimitat</h4>
                  <p className="text-xs text-zinc-500">Modifică textul, bugetul și secțiunile oricând dorești, fără limite</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-emerald-500 text-lg mt-0.5">✔</span>
                <div>
                  <h4 className="text-sm font-bold text-white">Fără Watermark sau Reclame</h4>
                  <p className="text-xs text-zinc-500">Documente curate și profesioniste, gata de prezentat partenerilor</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-amber-500 text-lg mt-0.5">✔</span>
                <div>
                  <h4 className="text-sm font-bold text-amber-300 flex items-center gap-1.5">
                    Instrumente Premium (PRO)
                  </h4>
                  <p className="text-xs text-zinc-500">Accesează optimizarea automată pentru Fonduri Europene și granturi</p>
                </div>
              </div>
            </div>

            {/* Price section */}
            <div className="flex items-center justify-between bg-zinc-900/60 border border-zinc-800 p-5 rounded-2xl text-left">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Acces Unic Proiect</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-sm text-zinc-500 line-through">120 RON</span>
                  <span className="text-2xl font-black text-emerald-400">39 RON</span>
                </div>
              </div>
              <span className="text-[10px] text-zinc-400 bg-zinc-800/80 border border-zinc-700 px-3 py-1.5 rounded-full font-black uppercase tracking-wider">
                Fără Abonament
              </span>
            </div>

            {/* Mock Checkout Form */}
            <div className="flex flex-col gap-3 text-left">
              <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Informații Plată (Simulat)</label>
              
              <div className="border border-zinc-800 bg-black/40 rounded-xl p-4 flex flex-col gap-3">
                {/* Card Number */}
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] text-zinc-500 uppercase font-black">Număr Card</span>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="4242 4242 4242 4242" 
                      disabled={isPaying}
                      defaultValue="4242 4242 4242 4242"
                      className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-emerald-500/50 rounded-lg px-3 py-2 text-xs font-mono tracking-widest text-zinc-200 outline-none transition-all placeholder-zinc-700" 
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-lg">💳</span>
                  </div>
                </div>

                {/* Expiry & CVC */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] text-zinc-500 uppercase font-black">Expirare</span>
                    <input 
                      type="text" 
                      placeholder="12/28" 
                      disabled={isPaying}
                      defaultValue="12/28"
                      className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-emerald-500/50 rounded-lg px-3 py-2 text-xs font-mono text-zinc-200 outline-none transition-all placeholder-zinc-700 text-center" 
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] text-zinc-500 uppercase font-black">CVC / CVV</span>
                    <input 
                      type="password" 
                      placeholder="•••" 
                      disabled={isPaying}
                      defaultValue="123"
                      className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-emerald-500/50 rounded-lg px-3 py-2 text-xs font-mono text-zinc-200 outline-none transition-all placeholder-zinc-700 text-center" 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 mt-2">
              <button 
                type="button"
                onClick={async () => {
                  if (isPaying) return;
                  setIsPaying(true);
                  // Simulate Stripe checkout request
                  await new Promise(resolve => setTimeout(resolve, 1500));
                  setIsPaying(false);
                  setIsPaid(true);
                  setShowPaywall(false);
                  // If there was a pending download mode, run it
                  if (pendingDownloadMode) {
                    downloadAction(pendingDownloadMode, true);
                  }
                }}
                disabled={isPaying}
                className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/20 active:scale-95 cursor-pointer"
              >
                {isPaying ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Se procesează...
                  </>
                ) : (
                  <>🔒 Simulează Plată Securizată</>
                )}
              </button>
              
              <button 
                type="button"
                disabled={isPaying}
                onClick={() => {
                  setShowPaywall(false);
                  setPendingDownloadMode(null);
                }}
                className="w-full h-10 hover:bg-zinc-900/60 text-zinc-400 hover:text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center cursor-pointer"
              >
                Mai târziu
              </button>
            </div>

            {/* Security Badges */}
            <div className="flex justify-center items-center gap-6 mt-1 opacity-55 text-[10px] text-zinc-500 border-t border-zinc-900 pt-4">
              <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider">🔒 Conexiune SSL</span>
              <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider">🛡 PCI-DSS</span>
              <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider">💳 Partener Stripe</span>
            </div>

          </div>
        </div>
      )}
    </main>
  );
}
