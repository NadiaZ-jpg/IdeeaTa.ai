import { useState } from "react";
import { auth } from "@/lib/firebase";
import { UI_STRINGS } from "@/lib/uiStrings";

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (tier?: string) => void;
  onRequireLogin?: () => void;
  userId: string;
  userEmail: string | null;
  currency: string; // "RON" or "EUR" (legacy LEI normalized)
  planName?: string;
  planId?: string;
  locale?: "ro" | "en" | "es";
  /** Show 5 € credits top-up — only when user already has Pro Tools pack */
  showProTopup?: boolean;
}

export function PricingModal({
  isOpen,
  onClose,
  onSuccess,
  onRequireLogin,
  userId,
  userEmail,
  currency,
  planName,
  planId,
  locale = "ro",
  showProTopup = false,
}: PricingModalProps) {
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [promoInput, setPromoInput] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const ui = UI_STRINGS[locale] || UI_STRINGS.ro;

  if (!isOpen) return null;

  const handleCheckout = async (tier: string) => {
    if (!userId) {
      if (onRequireLogin) onRequireLogin();
      else setError(ui.checkoutNeedAccount);
      return;
    }

    setLoadingTier(tier);
    setError(null);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        if (onRequireLogin) onRequireLogin();
        else setError(ui.checkoutNeedAccount);
        return;
      }
      const token = await currentUser.getIdToken();
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tier,
          email: userEmail || currentUser.email,
          planName,
          planId,
          locale,
          returnPath:
            typeof window !== "undefined" && window.location.pathname.includes("/studio")
              ? "/studio"
              : typeof window !== "undefined" && window.location.pathname.includes("/demo")
                ? "/demo"
                : "/dashboard",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.url) {
        throw new Error(data?.error || ui.checkoutInvalidPackage);
      }
      window.location.href = data.url;
    } catch (err: any) {
      console.error(err);
      setError(err.message || ui.checkoutError);
      setLoadingTier(null);
    }
  };
 
  const getPriceDisplay = (tier: string) => {
    if (tier === "standard") return locale === "es" || locale === "en" ? "8 EUR" : "39 RON";
    if (tier === "eu-funds") return locale === "es" || locale === "en" ? "20 EUR" : "99 RON";
    return "";
  };

  const handleValidatePromo = async () => {
    const val = promoInput.trim();
    if (!val) return;

    setError(null);
    setPromoLoading(true);
    try {
      if (!userId) {
        if (onRequireLogin) onRequireLogin();
        else setError(ui.promoNeedLogin);
        return;
      }

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      const currentUser = auth.currentUser;
      if (currentUser) {
        const token = await currentUser.getIdToken();
        headers.Authorization = `Bearer ${token}`;
      }

      const res = await fetch("/api/validate-promo", {
        method: "POST",
        headers,
        body: JSON.stringify({ code: val, locale }),
      });

      const data = await res.json();
      if (data.success) {
        if (onSuccess) onSuccess(data.tier);
        onClose();
      } else {
        setError(data.error || ui.promoInvalid);
      }
    } catch (err) {
      console.error("Eroare validare:", err);
      setError(ui.promoServerError);
    } finally {
      setPromoLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[110] flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-300">
      <div className="bg-[#09090b] border border-zinc-800 rounded-[2.5rem] w-full max-w-5xl shadow-2xl p-6 md:p-10 relative overflow-hidden flex flex-col gap-8 animate-in slide-in-from-bottom-12 duration-300 text-left">
        
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors text-xl p-2 cursor-pointer"
          disabled={loadingTier !== null}
        >
          ✕
        </button>

        <div className="text-center flex flex-col items-center gap-2 relative">
          <div className="absolute top-0 left-0 flex items-center gap-1.5 z-20">
            <input 
              type="text" 
              value={promoInput}
              onChange={(e) => setPromoInput(e.target.value)}
              placeholder={ui.promoPlaceholder} 
              className="bg-zinc-900 border border-zinc-800 text-white text-base md:text-xs px-3 py-1.5 rounded-lg w-28 md:w-32 focus:outline-none focus:border-emerald-500 transition-colors"
              onKeyDown={async (e) => {
                if (e.key === 'Enter') {
                  handleValidatePromo();
                }
              }}
            />
            <button
              onClick={handleValidatePromo}
              disabled={promoLoading}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-[10px] md:text-xs font-bold px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              {promoLoading ? "..." : ui.apply}
            </button>
          </div>
          <div className="w-16 h-16 bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 rounded-2xl flex items-center justify-center text-3xl mb-2 shadow-[0_0_20px_rgba(52,211,153,0.1)]">
            💰
          </div>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-tight bg-gradient-to-r from-white via-emerald-400 to-white bg-clip-text text-transparent">
            {ui.pricingModalTitle}
          </h2>
          <p className="text-zinc-400 text-sm mt-2 max-w-xl">
            {ui.pricingModalSubtitle}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
            <p className="text-red-400 text-xs font-semibold">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 max-w-4xl mx-auto relative z-10 w-full">
          
          <div className="bg-zinc-950/50 border border-zinc-800 rounded-3xl p-6 flex flex-col justify-between hover:border-zinc-700 transition-all group relative">
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className="text-sm font-bold text-zinc-400">{ui.pricingStandardName}</span>
                <span className="text-xs bg-zinc-800 text-zinc-400 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">{ui.pricingOneTime}</span>
              </div>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl font-black text-white">{getPriceDisplay("standard")}</span>
              </div>
              
              <ul className="space-y-3 mb-8 text-sm text-zinc-400">
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>{ui.pricingStandardFeat1}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>{ui.pricingStandardFeat2}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>{ui.pricingStandardFeat3}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span className="text-zinc-200 font-medium">{ui.pricingStandardFeat4}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>{ui.pricingStandardFeat5}</span>
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
                ui.pricingChooseStandard
              )}
            </button>
          </div>

          <div className="bg-zinc-950/70 border border-amber-500/30 rounded-3xl p-6 flex flex-col justify-between hover:border-amber-500/50 transition-all group relative shadow-[0_0_30px_rgba(245,158,11,0.05)]">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-500 text-black px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
              {ui.pricingProBadge}
            </div>
            
            <div>
              <div className="flex justify-between items-start mb-4 mt-2">
                <span className="text-sm font-bold text-amber-300">{ui.pricingProName}</span>
                <span className="text-xs bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">{ui.pricingOneTime}</span>
              </div>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl font-black text-white">{getPriceDisplay("eu-funds")}</span>
              </div>
              
              <ul className="space-y-3 mb-8 text-sm text-zinc-400">
                <li className="flex items-start gap-2.5">
                  <span className="text-amber-500 font-bold">✓</span>
                  <span>{ui.pricingProFeat1}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-amber-500 font-bold">✓</span>
                  <span className="text-zinc-200 font-medium">{ui.pricingProFeat2}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-amber-500 font-bold">✓</span>
                  <span className="text-zinc-200 font-medium">{ui.pricingProFeat3}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-amber-500 font-bold">✓</span>
                  <span className="text-zinc-200 font-medium">{ui.pricingProFeat4}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-amber-500 font-bold">✓</span>
                  <span className="text-zinc-200 font-medium">{ui.pricingProFeat5}</span>
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
                ui.pricingChoosePro
              )}
            </button>
          </div>

        </div>

        <div className="flex justify-center items-center gap-6 mt-2 opacity-50 text-[10px] text-zinc-500 border-t border-zinc-900 pt-6">
          <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider">{ui.pricingSsl}</span>
          <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider">{ui.pricingPci}</span>
          <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider">{ui.pricingLemon}</span>
        </div>

      </div>
    </div>
  );
}
