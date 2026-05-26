import { useState } from "react";

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userEmail: string | null;
  currency: string; // "LEI" or "EUR"
}

export function PricingModal({ isOpen, onClose, userId, userEmail, currency }: PricingModalProps) {
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCheckout = async (tier: string) => {
    setLoadingTier(tier);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier,
          currency,
          userId,
          email: userEmail,
        }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Eroare necunoscută la generarea plății.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "A apărut o eroare. Te rugăm să încerci din nou.");
      setLoadingTier(null);
    }
  };

  const getPriceDisplay = (tier: string) => {
    if (currency === "EUR") {
      if (tier === "standard") return "10 EUR";
      if (tier === "eu-funds") return "30 EUR";
      if (tier === "pro") return "20 EUR";
    } else {
      if (tier === "standard") return "49 RON";
      if (tier === "eu-funds") return "149 RON";
      if (tier === "pro") return "99 RON";
    }
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
        <div className="text-center flex flex-col items-center gap-2">
          <div className="w-16 h-16 bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 rounded-2xl flex items-center justify-center text-3xl mb-2 shadow-[0_0_20px_rgba(52,211,153,0.1)]">
            💰
          </div>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-tight bg-gradient-to-r from-white via-emerald-400 to-white bg-clip-text text-transparent">
            Alege Planul Potrivit Afacerii Tale
          </h2>
          <p className="text-zinc-400 text-sm mt-2 max-w-xl">
            Deblochează instrumentele noastre de top și obține acces complet la planurile de afaceri generate de AI.
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
            <p className="text-red-400 text-xs font-semibold">{error}</p>
          </div>
        )}

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          
          {/* Tier 1: Standard (3 Documents) */}
          <div className="bg-zinc-950/50 border border-zinc-800 rounded-3xl p-6 flex flex-col justify-between hover:border-zinc-700 transition-all group relative">
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className="text-sm font-bold text-zinc-400">Pachet Standard</span>
                <span className="text-xs bg-zinc-800 text-zinc-400 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">Unic</span>
              </div>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl font-black text-white">{getPriceDisplay("standard")}</span>
              </div>
              
              <ul className="space-y-3 mb-8 text-sm text-zinc-400">
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>Descărcare completă <strong>3 planuri</strong></span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>Formate PDF, PowerPoint, Word</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>Editare de bază în Studio</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>Fără watermark sau reclame</span>
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
                "Alege Standard"
              )}
            </button>
          </div>

          {/* Tier 2: EU Funds (Popular One-time) */}
          <div className="bg-zinc-950/70 border border-amber-500/30 rounded-3xl p-6 flex flex-col justify-between hover:border-amber-500/50 transition-all group relative shadow-[0_0_30px_rgba(245,158,11,0.05)]">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-500 text-black px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
              Optimizat Fonduri
            </div>
            
            <div>
              <div className="flex justify-between items-start mb-4 mt-2">
                <span className="text-sm font-bold text-amber-300">Pachet Fonduri Europene</span>
                <span className="text-xs bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">Unic</span>
              </div>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl font-black text-white">{getPriceDisplay("eu-funds")}</span>
              </div>
              
              <ul className="space-y-3 mb-8 text-sm text-zinc-400">
                <li className="flex items-start gap-2.5">
                  <span className="text-amber-500 font-bold">✓</span>
                  <span className="text-zinc-200 font-medium">Deblochează <strong>Modul Fonduri Europene</strong></span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-amber-500 font-bold">✓</span>
                  <span>Optimizare automată pentru granturi</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-amber-500 font-bold">✓</span>
                  <span>Calcule și termeni tehnici EU standard</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-amber-500 font-bold">✓</span>
                  <span>Include descărcare plan optimizat</span>
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
                "Alege Fonduri"
              )}
            </button>
          </div>

          {/* Tier 3: Pro Subscription (Best Value) */}
          <div className="bg-zinc-950/50 border border-emerald-500/30 rounded-3xl p-6 flex flex-col justify-between hover:border-emerald-500/50 transition-all group relative shadow-[0_0_30px_rgba(16,185,129,0.05)]">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
              Cel Mai Bun Raport
            </div>

            <div>
              <div className="flex justify-between items-start mb-4 mt-2">
                <span className="text-sm font-bold text-emerald-400">Abonament Pro</span>
                <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">Lunar</span>
              </div>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl font-black text-white">{getPriceDisplay("pro")}</span>
                <span className="text-zinc-500 text-xs font-semibold">/ lună</span>
              </div>
              
              <ul className="space-y-3 mb-8 text-sm text-zinc-400">
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span className="text-zinc-200 font-medium">Generări și descărcări <strong>nelimitate</strong></span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>Acces inclus la <strong>Modul Fonduri EU</strong></span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>Editări avansate și optimizare buget (-20%)</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>Suport tehnic prioritar</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleCheckout("pro")}
              disabled={loadingTier !== null}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loadingTier === "pro" ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Abonare Pro"
              )}
            </button>
          </div>

        </div>

        {/* Security Badges */}
        <div className="flex justify-center items-center gap-6 mt-2 opacity-50 text-[10px] text-zinc-500 border-t border-zinc-900 pt-6">
          <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider">🔒 Conexiune Securizată SSL</span>
          <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider">🛡 PCI-DSS Securitate Card</span>
          <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider">💳 Procesat Securizat prin Stripe</span>
        </div>

      </div>
    </div>
  );
}
