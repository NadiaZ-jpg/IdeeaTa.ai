import React from 'react';
import { Mail } from 'lucide-react';
import { UI_STRINGS } from '@/lib/uiStrings';

type Locale = "ro" | "en" | "es";

interface EmailVerificationModalProps {
  locale: Locale;
  verificationSent: boolean;
  onResendVerification: () => void;
  onClose: () => void;
}

export const EmailVerificationModal: React.FC<EmailVerificationModalProps> = ({ locale, verificationSent, onResendVerification, onClose }) => {
  const ui = UI_STRINGS[locale] || UI_STRINGS.ro;
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[210] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-[#09090b] border border-zinc-800 rounded-3xl w-full max-w-md shadow-2xl p-8 relative overflow-hidden flex flex-col gap-6 text-center animate-in zoom-in-95 duration-300">
        <div className="absolute top-0 left-0 w-full h-1 bg-amber-500"></div>
        
        <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto mt-2">
          <Mail className="w-8 h-8" />
        </div>

        <div>
          <h2 key={`h2-${locale}`} className="text-2xl font-black text-white mb-2">
            {ui.emailVerifyTitle}
          </h2>
          <p key={`p-${locale}`} className="text-zinc-400">
            {ui.emailVerifyDesc}
          </p>
        </div>

        <div className="flex flex-col gap-3 mt-4">
          <button 
            key={`btn1-${locale}`}
            type="button"
            onClick={() => {
              window.location.reload();
            }}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl transition-all"
          >
            {ui.emailVerifyContinue}
          </button>
          
          <button 
            key={`btn2-${locale}-${verificationSent}`}
            type="button"
            onClick={onResendVerification}
            disabled={verificationSent}
            className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {verificationSent ? ui.emailVerifySent : ui.emailVerifyResend}
          </button>
          
          <button 
            key={`btn3-${locale}`}
            type="button"
            onClick={onClose}
            className="w-full text-zinc-500 hover:text-white font-medium py-2 transition-all mt-2"
          >
            {ui.closeBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
