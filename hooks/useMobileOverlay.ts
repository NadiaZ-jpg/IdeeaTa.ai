/**
 * useMobileOverlay.ts
 * Comportament comun pentru bottom-sheet-uri și meniuri pe Mobile:
 * - blochează scroll-ul paginii din spate cât timp overlay-ul e deschis
 * - închide la Escape (tastaturi Bluetooth / tabletă)
 *
 * Contor global ca să nu deblocăm scroll-ul când mai e un overlay deschis.
 */
"use client";
import { useEffect, useRef } from "react";

let openOverlays = 0;
let previousOverflow = "";

export function useMobileOverlay(isOpen: boolean, onClose?: () => void) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen || typeof document === "undefined") return;

    if (openOverlays === 0) {
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }
    openOverlays += 1;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current?.();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      openOverlays = Math.max(0, openOverlays - 1);
      if (openOverlays === 0) {
        document.body.style.overflow = previousOverflow;
      }
    };
  }, [isOpen]);
}
