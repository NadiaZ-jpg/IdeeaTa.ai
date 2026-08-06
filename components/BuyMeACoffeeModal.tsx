"use client";
import React from 'react';

interface BuyMeACoffeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  locale: "ro" | "en" | "es";
}

export default function BuyMeACoffeeModal({ isOpen, onClose, locale }: BuyMeACoffeeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[210] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-[#09090b] border border-zinc-800 rounded-3xl w-full max-w-sm shadow-2xl p-6 relative overflow-hidden flex flex-col gap-5 text-center animate-in zoom-in-95 duration-300">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors text-lg p-1 cursor-pointer"
        >
          ✕
        </button>
        
        <div className="absolute top-0 left-0 w-full h-1 bg-amber-500"></div>

        <div className="mt-2">
          <h2 className="text-xl font-black text-white mb-1">
            {locale === "en" ? "Buy us a coffee" : locale === "es" ? "Invítanos a un café" : "Cumpără-ne o cafea"}
          </h2>
          <p className="text-zinc-400 text-xs px-2">
            {locale === "en" 
              ? "Scan the QR with your phone, then open the link in the browser (do not Install as an app). Or use the button below."
              : locale === "es"
              ? "Escanea el QR con el móvil y abre el enlace en el navegador (no Instales como app). O usa el botón de abajo."
              : "Scanează QR-ul cu telefonul, apoi deschide linkul în browser (nu apăsa Instalează ca aplicație). Sau folosește butonul de mai jos."}
          </p>
        </div>

        <div className="bg-white p-3 rounded-2xl w-48 h-48 mx-auto flex items-center justify-center shadow-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src="/bmc-qr.png" 
            alt="Buy Me A Coffee QR Code" 
            className="w-full h-full object-contain"
          />
        </div>

        <div className="flex flex-col gap-2 mt-2">
          <a 
            href="https://buymeacoffee.com/ideeata" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full bg-[#FFDD00] hover:bg-[#FFEA4D] text-black font-black py-3 rounded-xl transition-all flex items-center justify-center gap-1.5 text-xs shadow-md shadow-amber-950/20"
          >
            <span>☕</span>
            {locale === "en" ? "Go to donation page ➔" : locale === "es" ? "Ir a la página de donación ➔" : "Mergi la pagina de donație ➔"}
          </a>
        </div>
      </div>
    </div>
  );
}
