import React from 'react';
import { UI_STRINGS } from '@/lib/uiStrings';

type Locale = "ro" | "en" | "es";

interface AuthWallModalProps {
  locale: Locale;
  onClose: () => void;
  onLoginClick: () => void;
}

export const AuthWallModal: React.FC<AuthWallModalProps> = ({ locale, onClose, onLoginClick }) => {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 max-w-md w-full flex flex-col shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="absolute -top-12 -left-12 w-40 h-40 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-12 -right-12 w-40 h-40 rounded-full bg-amber-500/10 blur-3xl pointer-events-none"></div>
        
        <div className="flex justify-between items-start mb-6 relative z-10">
          <span className="text-4xl">✨</span>
          <button 
            type="button" 
            onClick={onClose} 
            className="text-zinc-500 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
        
        <h3 className="text-2xl font-black text-white mb-3 relative z-10">
          {locale === "en" ? "Create a free account" : locale === "es" ? "Crea una cuenta gratis" : "Creează-ți un cont gratuit"}
        </h3>
        <p className="text-zinc-400 mb-6 text-sm leading-relaxed relative z-10 font-sans">
          {locale === "en" 
            ? "Create a free account to use our advanced tools and customize your business plan."
            : locale === "es"
            ? "Crea tu cuenta gratuita para usar nuestras herramientas avanzadas y personalizar tu plan de negocios."
            : "Creează-ți un cont gratuit pentru a folosi instrumentele noastre avansate și a personaliza planul tău de afaceri."}
        </p>
        
        <button 
          type="button"
          onClick={onLoginClick}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2"
        >
          <span>{locale === "en" ? "Login / Register" : locale === "es" ? "Iniciar sesión / Registrarse" : "Conectare / Înregistrare"}</span>
          <span>➔</span>
        </button>
        
        <button
          type="button"
          onClick={onClose}
          className="mt-3 w-full bg-zinc-800/80 hover:bg-zinc-800 text-zinc-400 hover:text-white font-bold py-3 px-4 rounded-xl transition-all text-sm"
        >
          {locale === "en" ? "Maybe later" : locale === "es" ? "Quizás más tarde" : "Mai târziu"}
        </button>
      </div>
    </div>
  );
};
