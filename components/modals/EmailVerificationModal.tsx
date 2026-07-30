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
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[210] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-[#09090b] border border-zinc-800 rounded-3xl w-full max-w-md shadow-2xl p-8 relative overflow-hidden flex flex-col gap-6 text-center animate-in zoom-in-95 duration-300">
        <div className="absolute top-0 left-0 w-full h-1 bg-amber-500"></div>
        
        <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto mt-2">
          <Mail className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-2xl font-black text-white mb-2">
            {locale === "en" ? "Confirm your email address" 
             : locale === "es" ? "Confirma tu dirección de email" 
             : "Confirmă adresa de email"}
          </h2>
          <p className="text-zinc-400">
            {locale === "en" 
              ? "To generate a free plan and receive the 3 Premium Edits, please confirm your email address by clicking the link sent to your Inbox."
              : locale === "es"
              ? "Para generar un plan gratuito y recibir las 3 Ediciones Premium, confirme su dirección de correo electrónico haciendo clic en el enlace enviado a su bandeja de entrada."
              : "Pentru a genera un plan gratuit și a primi cele 3 Editări Premium, te rugăm să îți confirmi adresa de email dând click pe link-ul primit în Inbox."}
          </p>
        </div>

        <div className="flex flex-col gap-3 mt-4">
          <button 
            type="button"
            onClick={() => {
              window.location.reload(); // Reincarca pentru a verifica starea noua
            }}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl transition-all"
          >
            {locale === "en" ? "I confirmed, continue" 
             : locale === "es" ? "Lo he confirmado, continuar" 
             : "Am confirmat, continuă"}
          </button>
          
          <button 
            type="button"
            onClick={onResendVerification}
            disabled={verificationSent}
            className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {verificationSent 
              ? (locale === "en" ? "Email sent!" : locale === "es" ? "¡Correo enviado!" : "Email trimis!") 
              : (locale === "en" ? "Resend verification email" : locale === "es" ? "Reenviar correo de verificación" : "Trimite emailul din nou")}
          </button>
          
          <button 
            type="button"
            onClick={onClose}
            className="w-full text-zinc-500 hover:text-white font-medium py-2 transition-all mt-2"
          >
            {locale === "en" ? "Close" : locale === "es" ? "Cerrar" : "Închide"}
          </button>
        </div>
      </div>
    </div>
  );
};
