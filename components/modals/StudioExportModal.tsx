import React from 'react';

type Locale = "ro" | "en" | "es";

interface StudioExportModalProps {
  locale: Locale;
  onClose: () => void;
}

export const StudioExportModal: React.FC<StudioExportModalProps> = ({ locale, onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-950 border border-emerald-500/30 w-full max-w-md rounded-2xl p-8 shadow-[0_0_40px_rgba(16,185,129,0.15)] flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6 border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
          <span className="text-3xl">✨</span>
        </div>
        <h2 className="text-2xl font-black text-white mb-4">
          {locale === "en" ? "Your plan looks great!" : locale === "es" ? "¡Tu plan está quedando increíble!" : "Planul tău arată grozav!"}
        </h2>
        <p className="text-zinc-400 mb-8 leading-relaxed">
          {locale === "en" 
            ? "Create a free account to download it completely in PDF, DOCX, or PPTX format and to save all your changes!"
            : locale === "es"
            ? "¡Crea una cuenta gratuita para descargarlo completamente en formato PDF, DOCX o PPTX y guardar todos tus cambios!"
            : "Creează-ți un cont gratuit pentru a-l descărca complet în format PDF, DOCX sau PPTX și pentru a-ți salva toate modificările!"}
        </p>
        <div className="flex flex-col gap-3 w-full">
          <button 
            onClick={() => {
              onClose();
              window.location.href = locale === "en" ? '/en/login' : locale === "es" ? '/es/login' : '/login';
            }}
            className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]"
          >
            {locale === "en" ? "Create free account" : locale === "es" ? "Crear cuenta gratuita" : "Creează cont gratuit"}
          </button>
          <button 
            onClick={onClose}
            className="w-full py-3.5 bg-transparent hover:bg-zinc-900 text-zinc-400 rounded-xl font-bold transition-all"
          >
            {locale === "en" ? "Back to editing" : locale === "es" ? "Volver a editar" : "Înapoi la editare"}
          </button>
        </div>
      </div>
    </div>
  );
};
