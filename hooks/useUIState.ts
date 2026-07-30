/**
 * useUIState.ts
 * Hook custom pentru starea pură de UI: modale, dropdown-uri și tab-uri de navigare.
 * Comun pentru StudioDesktop și DemoDesktop.
 * Sesiunea 2 din planul de refactorizare arhitecturală (30 Iulie 2026).
 *
 * NU conține logica de business (plan, versiuni, credite, user) — aceea rămâne în componentă.
 */
"use client";
import { useState } from "react";

export function useUIState() {
  // --- Modale principale ---
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showBmcModal, setShowBmcModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showExpertDrawer, setShowExpertDrawer] = useState(false);

  // --- Modale specifice Studio ---
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  // --- Modale specifice Demo ---
  const [showStudioExportModal, setShowStudioExportModal] = useState(false);

  // --- Dropdown-uri și panouri inline ---
  const [showVersionDropdown, setShowVersionDropdown] = useState(false);
  const [showToneOptions, setShowToneOptions] = useState(false);
  const [showExamples, setShowExamples] = useState(false);

  // --- Tab-uri de navigare (preview plan) ---
  const [mockupTab, setMockupTab] = useState(0);
  const [innerMockupTab, setInnerMockupTab] = useState("SWOT");

  return {
    // Modale principale
    showPricingModal, setShowPricingModal,
    showQrModal, setShowQrModal,
    showBmcModal, setShowBmcModal,
    showAuthModal, setShowAuthModal,
    showPaywall, setShowPaywall,
    showExpertDrawer, setShowExpertDrawer,
    // Modale Studio
    showVerificationModal, setShowVerificationModal,
    verificationSent, setVerificationSent,
    // Modale Demo
    showStudioExportModal, setShowStudioExportModal,
    // Dropdown-uri
    showVersionDropdown, setShowVersionDropdown,
    showToneOptions, setShowToneOptions,
    showExamples, setShowExamples,
    // Tab-uri
    mockupTab, setMockupTab,
    innerMockupTab, setInnerMockupTab,
  };
}
