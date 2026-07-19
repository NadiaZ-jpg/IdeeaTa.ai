import { useState } from "react";
 
interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (tier?: string) => void;
  onRequireLogin?: () => void;
  userId: string;
  userEmail: string | null;
  currency: string; // "LEI" or "EUR"
  planName?: string;
  locale?: "ro" | "en" | "es";
}
 
export function PricingModal({ isOpen, onClose, onSuccess, onRequireLogin, userId, userEmail, currency, planName, locale = "ro" }: PricingModalProps) {
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
 
  if (!isOpen) return null;
 
  const handleCheckout = async (tier: string) => {
    if (!userId) {
      if (onRequireLogin) {
        onRequireLogin();
      } else {
        setError(locale === "en" ? "Please create a free account to continue." : locale === "es" ? "Por favor, crea una cuenta gratuita para continuar." : "Te rugăm să îți creezi un cont gratuit pentru a continua.");
      }
      return;
    }

    setLoadingTier(tier);
    setError(null);
    try {
      let checkoutUrl = "";
      
      // Lemon Squeezy Checkout URLs
      if (tier === "standard") {
        checkoutUrl = "https://ideeta.lemonsqueezy.com/checkout/buy/dbd62a14-ca39-47ea-8d4f-cd1ef1f3270e";
      } else if (tier === "eu-funds") {
        checkoutUrl = "https://ideeta.lemonsqueezy.com/checkout/buy/561d5420-b48c-446e-830e-c5a25ed30b13";
      }

      if (checkoutUrl) {
        const urlObj = new URL(checkoutUrl);
        if (userEmail) urlObj.searchParams.set("checkout[email]", userEmail);
        urlObj.searchParams.set("checkout[custom][userId]", userId);
        if (tier === "standard" && planName) {
           urlObj.searchParams.set("checkout[custom][planName]", planName);
        }
        window.location.href = urlObj.toString();
      } else {
        throw new Error(locale === "en" ? "Invalid package." : locale === "es" ? "Paquete inválido." : "Pachet invalid.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || (locale === "en" ? "An error occurred. Please try again." : locale === "es" ? "Ocurrió un error. Por favor, inténtalo de nuevo." : "A apărut o eroare. Te rugăm să încerci din nou."));
      setLoadingTier(null);
    }
  };
 
  const getPriceDisplay = (tier: string) => {
    if (tier === "standard") return locale === "es" ? "8 EUR" : "39 RON";
    if (tier === "eu-funds") return locale === "es" ? "20 EUR" : "99 RON";
    return "";
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[110] flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-300">
      <div className="bg-[#09090b] border border-zinc-800 rounded-[2.5rem] w-full max-w-5xl shadow-2xl p-6 md:p-10 relative overflow-hidden flex flex-col gap-8 animate-in slide-in-from-bottom-12 duration-300 text-left">
        
        {/* Ambient glows inside modal */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors text-xl p-2 cursor-pointer"
          disabled={loadingTier !== null}
        >
          ✕
        </button>

        {/* Header */}
        <div className="text-center flex flex-col items-center gap-2 relative">
          <div className="absolute top-0 right-0">
            <input 
              type="text" 
              placeholder={locale === "en" ? "Promo code" : locale === "es" ? "Código promocional" : "Cod promoțional"} 
              className="bg-zinc-900 border border-zinc-800 text-white text-xs px-3 py-1 rounded-lg w-32 focus:outline-none focus:border-emerald-500 transition-colors"
              onKeyDown={async (e) => {
                if (e.key === 'Enter') {
                  const val = e.currentTarget.value.trim();
                  if (!val) return;

                  setError(null);
                  try {
                    const res = await fetch("/api/validate-promo", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ code: val })
                    });

                    const data = await res.json();
                    if (data.success) {
                      if (onSuccess) onSuccess(data.tier);
                      onClose();
                    } else {
                      setError(data.error || (locale === "en" ? "Invalid promo code" : locale === "es" ? "Código promocional inválido" : "Cod promoțional invalid"));
                    }
                  } catch (err) {
                    console.error("Eroare validare:", err);
                    setError(locale === "en" ? "Error connecting to the server." : locale === "es" ? "Error al conectar con el servidor." : "Eroare la conectarea cu serverul.");
                  }
                }
              }}
            />
          </div>
          <div className="w-16 h-16 bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 rounded-2xl flex items-center justify-center text-3xl mb-2 shadow-[0_0_20px_rgba(52,211,153,0.1)]">
            💰
          </div>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-tight bg-gradient-to-r from-white via-emerald-400 to-white bg-clip-text text-transparent">
            {locale === "en" ? "Choose the Right Plan for Your Business" : locale === "es" ? "Elige el Plan Adecuado para tu Negocio" : "Alege Planul Potrivit Afacerii Tale"}
          </h2>
          <p className="text-zinc-400 text-sm mt-2 max-w-xl">
            {locale === "en" ? "Unlock our top tools and get full access to business plans." : locale === "es" ? "Desbloquea nuestras mejores herramientas y obtén acceso completo a los planes de negocio." : "Deblochează instrumentele noastre de top și obține acces complet la planurile de afaceri."}
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
            <p className="text-red-400 text-xs font-semibold">{error}</p>
          </div>
        )}

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 max-w-4xl mx-auto relative z-10 w-full">
          
          {/* Tier 1: Standard (3 Documents) */}
          <div className="bg-zinc-950/50 border border-zinc-800 rounded-3xl p-6 flex flex-col justify-between hover:border-zinc-700 transition-all group relative">
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className="text-sm font-bold text-zinc-400">{locale === "en" ? "Standard Package" : locale === "es" ? "Paquete Estándar" : "Pachet Standard"}</span>
                <span className="text-xs bg-zinc-800 text-zinc-400 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">{locale === "en" ? "One-time" : locale === "es" ? "Pago único" : "Unic"}</span>
              </div>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl font-black text-white">{getPriceDisplay("standard")}</span>
              </div>
              
              <ul className="space-y-3 mb-8 text-sm text-zinc-400">
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>{locale === "en" ? "Business plan download" : locale === "es" ? "Descarga de plan de negocios" : "Descărcare plan de afaceri"}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>{locale === "en" ? "All 3 formats: PDF, PPTX, Word" : locale === "es" ? "Los 3 formatos: PDF, PPTX, Word" : "Toate cele 3 formate: PDF, PPTX, Word"}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>{locale === "en" ? "No watermark or ads" : locale === "es" ? "Sin marca de agua ni anuncios" : "Fără watermark sau reclame"}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span className="text-zinc-200 font-medium">{locale === "en" ? "Free text editing in browser" : locale === "es" ? "Edición libre de texto en el navegador" : "Editare text liberă în browser"}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>{locale === "en" ? "Unlimited AI Tone (all variations)" : locale === "es" ? "Tono de IA ilimitado (todas las variantes)" : "Ton AI nelimitat (toate variantele)"}</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleCheckout("standard")}
              disabled={loadingTier !== null}
              className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 group-hover:border-zinc-700 disabled:opacity-50"
            >
              {loadingTier === "standard" ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                locale === "en" ? "Choose Standard" : locale === "es" ? "Elegir Estándar" : "Alege Standard"
              )}
            </button>
          </div>

          {/* Tier 2: Studio + EU Funds */}
          <div className="bg-zinc-950/70 border border-amber-500/30 rounded-3xl p-6 flex flex-col justify-between hover:border-amber-500/50 transition-all group relative shadow-[0_0_30px_rgba(245,158,11,0.05)]">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-500 text-black px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
              {locale === "en" ? "PRO Tools" : locale === "es" ? "Herramientas PRO" : "Instrumente PRO"}
            </div>
            
            <div>
              <div className="flex justify-between items-start mb-4 mt-2">
                <span className="text-sm font-bold text-amber-300">{locale === "en" ? "Editing + Professional Tools Package" : locale === "es" ? "Paquete de Edición + Herramientas Profesionales" : "Pachet Editare + Instrumente Profesionale"}</span>
                <span className="text-xs bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">{locale === "en" ? "One-time" : locale === "es" ? "Pago único" : "Unic"}</span>
              </div>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl font-black text-white">{getPriceDisplay("eu-funds")}</span>
              </div>
              
              <ul className="space-y-3 mb-8 text-sm text-zinc-400">
                <li className="flex items-start gap-2.5">
                  <span className="text-amber-500 font-bold">✓</span>
                  <span>{locale === "en" ? "Everything in the Standard Package" : locale === "es" ? "Todo lo incluido en el Paquete Estándar" : "Tot ce include Pachetul Standard"}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-amber-500 font-bold">✓</span>
                  <span className="text-zinc-200 font-medium">
                    {locale === "en" ? "All 4 AI Tone variations" : locale === "es" ? "Las 4 variaciones de Tono de IA" : <>Toate cele <strong>4 variante de Ton AI</strong></>}
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-amber-500 font-bold">✓</span>
                  <span className="text-zinc-200 font-medium">
                    {locale === "en" ? "Unlock Professional Plan (Investors/Banks)" : locale === "es" ? "Desbloquear Plan Profesional (Inversores/Bancos)" : <>Deblochează <strong>Plan Profesionist</strong> (Investitori/Bănci)</>}
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-amber-500 font-bold">✓</span>
                  <span className="text-zinc-200 font-medium">
                    {locale === "en" ? "Unlock EU Grants Optimization" : locale === "es" ? "Desbloquear Optimización de Fondos de la UE" : <>Deblochează <strong>Optimizare Fonduri Europene</strong></>}
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-amber-500 font-bold">✓</span>
                  <span>{locale === "en" ? "AI Budget Optimization (auto-recalculation)" : locale === "es" ? "Optimización de Presupuesto por IA (recalculo automático)" : "Optimizare Buget AI (recalculare automată)"}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-amber-500 font-bold">✓</span>
                  <span>{locale === "en" ? "Add New Sections (expand plan anytime)" : locale === "es" ? "Añadir nuevas secciones (ampliar plan en cualquier momento)" : "Adaugă Secțiuni Noi (extinde planul oricând)"}</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleCheckout("eu-funds")}
              disabled={loadingTier !== null}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loadingTier === "eu-funds" ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              ) : (
                locale === "en" ? "Choose Studio & Grants" : locale === "es" ? "Elegir Studio y Subvenciones" : "Alege Studio & Fonduri"
              )}
            </button>
          </div>

        </div>

        {/* Security Badges */}
        <div className="flex justify-center items-center gap-6 mt-2 opacity-50 text-[10px] text-zinc-500 border-t border-zinc-900 pt-6">
          <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
            {locale === "en" ? "🔒 Secure SSL Connection" : locale === "es" ? "🔒 Conexión SSL Segura" : "🔒 Conexiune Securizată SSL"}
          </span>
          <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
            {locale === "en" ? "🛡 PCI-DSS Card Security" : locale === "es" ? "🛡 Seguridad de Tarjeta PCI-DSS" : "🛡 PCI-DSS Securitate Card"}
          </span>
          <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
            {locale === "en" ? "💳 Securely Processed via Lemon Squeezy" : locale === "es" ? "💳 Procesado de Forma Segura a través de Lemon Squeezy" : "💳 Procesat Securizat prin Lemon Squeezy"}
          </span>
        </div>

      </div>
    </div>
  );
}
