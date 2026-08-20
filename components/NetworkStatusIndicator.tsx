"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export function NetworkStatusIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [showReconnected, setShowReconnected] = useState(false);
  const pathname = usePathname();
  const isEn = pathname?.startsWith("/en");
  const isEs = pathname?.startsWith("/es");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
      }, 3500);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnected(false);
    };

    setIsOnline(navigator.onLine);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline && !showReconnected) return null;

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[100] max-w-[90vw] animate-in slide-in-from-top-4 duration-300 pointer-events-none">
      {!isOnline ? (
        <div className="bg-red-600/90 text-white backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-red-400/40 text-xs font-bold flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-white animate-ping shrink-0" />
          <span>
            {isEn
              ? "⚡ You are offline. Check internet."
              : isEs
              ? "⚡ Estás desconectado. Verifica conexión."
              : "⚡ Ești offline. Verifică conexiunea la internet."}
          </span>
        </div>
      ) : (
        <div className="bg-emerald-600/90 text-white backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-emerald-400/40 text-xs font-bold flex items-center gap-2">
          <span>✓</span>
          <span>
            {isEn
              ? "Connection restored"
              : isEs
              ? "Conexión restablecida"
              : "Conexiune restabilită"}
          </span>
        </div>
      )}
    </div>
  );
}
