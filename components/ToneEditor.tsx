"use client";

import { useState } from "react";
import { User } from "firebase/auth";

interface ToneEditorProps {
  user: User | null;
  isStudioPaid: boolean;
  isAdmin: boolean;
  isEditingAi: boolean;
  setShowAuthModal: (v: boolean) => void;
  setShowPricingModal: (v: boolean) => void;
  handleAiEdit: (field: string, instructions: string) => void;
}

export function ToneEditor({
  user,
  isStudioPaid,
  isAdmin,
  isEditingAi,
  setShowAuthModal,
  setShowPricingModal,
  handleAiEdit
}: ToneEditorProps) {
  const [showToneOptions, setShowToneOptions] = useState(false);

  const onToneSelect = (instructions: string) => {
    // Închidem meniul indiferent de situație
    setShowToneOptions(false);

    // Dacă utilizatorul are drepturi premium, dăm voie direct
    if (isStudioPaid || isAdmin) {
      handleAiEdit("professional_tone", instructions);
      return;
    }

    // Pentru conturi gratuite, verificăm limita de 3 utilizări
    if (typeof window !== "undefined") {
      const currentEdits = parseInt(localStorage.getItem("freeToneEdits") || "0", 10);
      
      if (currentEdits >= 3) {
        // Limita a fost atinsă, blocăm execuția și cerem bani
        setShowPricingModal(true);
        return;
      }
      
      // Dacă e sub limită, permitem editarea și creștem contorul
      localStorage.setItem("freeToneEdits", (currentEdits + 1).toString());
      handleAiEdit("professional_tone", instructions);
    }
  };

  return (
    <>
      <button 
        type="button"
        onClick={() => {
          if (!user) { setShowAuthModal(true); return; }
          setShowToneOptions(!showToneOptions);
        }} 
        disabled={isEditingAi} 
        className="w-full bg-black hover:bg-zinc-800 border border-amber-500/20 rounded-xl px-5 py-4 font-bold text-sm text-amber-100 transition-all text-left flex items-center justify-between group disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="flex items-center gap-3">
          <span className="text-amber-500 group-hover:scale-110 transition-transform">🪄</span>
          <span>Rescrie tonul</span>
        </span>
        <span className="flex items-center gap-2">
          <span className="text-[10px] bg-amber-500/20 border border-amber-500/40 text-amber-300 px-2 py-0.5 rounded-full font-black uppercase tracking-wider whitespace-nowrap">
            🔒 PRO
          </span>
          <span className="text-zinc-500 text-xs">▼</span>
        </span>
      </button>
      
      {showToneOptions && (
        <div className="flex flex-col gap-1 p-2 bg-zinc-950/50 rounded-xl border border-zinc-800/50 mt-1 animate-in slide-in-from-top-2">
          <button 
            type="button"
            onClick={() => onToneSelect("foarte formal, academic și riguros")} 
            disabled={isEditingAi}
            className="w-full text-xs text-left px-4 py-2.5 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-white transition-all font-semibold"
          >
            Formal & Academic
          </button>
          <button 
            type="button"
            onClick={() => onToneSelect("entuziast, creativ și plin de energie")} 
            disabled={isEditingAi}
            className="w-full text-xs text-left px-4 py-2.5 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-white transition-all font-semibold"
          >
            Creativ & Entuziast
          </button>
          <button 
            type="button"
            onClick={() => onToneSelect("persuasiv, orientat spre vânzări și convingător")} 
            disabled={isEditingAi}
            className="w-full text-xs text-left px-4 py-2.5 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-white transition-all font-semibold"
          >
            Comercial & Persuasiv
          </button>
          <button 
            type="button"
            onClick={() => onToneSelect("prietenos, simplu și ușor de înțeles")} 
            disabled={isEditingAi}
            className="w-full text-xs text-left px-4 py-2.5 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-white transition-all font-semibold"
          >
            Prietenos & Simplu
          </button>
        </div>
      )}
    </>
  );
}
