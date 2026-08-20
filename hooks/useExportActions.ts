import { useRef } from "react";
import { jsPDF } from "jspdf";
import { toPng } from "html-to-image";
import { generatePptx } from "@/lib/generatePptx";
import { generateDocxBlob } from "@/lib/generateDocx";
import { createSharedPlan, buildSharedPlanUrl } from "@/lib/sharePlan";
import {
  attachPdfCtaLinks,
  buildPdfCtaFallbackUrl,
  normalizeAppLocale,
} from "@/lib/pdfCtaBehavior";
import { UI_STRINGS } from "@/lib/uiStrings";
import { buildExportVersionFileSuffix, resolveExportPlanBody } from "@/lib/studioActiveVersion";
import { planUnlockPayload } from "@/lib/planUnlock";
import { auth } from "@/lib/firebase";
import { BusinessPlan } from "@/lib/normalizePlanResult";

interface UseExportActionsProps {
  result: BusinessPlan | null;
  locale: "ro" | "en" | "es";
  currency: string;
  /** Live FX (RON→EUR). Defaults to 0.201 when omitted. */
  fxRate?: number;
  user: any;
  isAdmin: boolean;
  isPlanPaid: boolean;
  subscriptionActive: boolean;
  euFundsUnlocked: boolean;
  credits: number;
  setIsDownloading: (mode: any) => void;
  setPendingDownloadMode: (mode: any) => void;
  setShowPricingModal: (show: boolean) => void;
  setIsSharedView: (shared: boolean) => void;
  /** Active history tab — filename suffix (Desktop/Mobile Studio + Demo). */
  activeVersionId?: string;
  /** Version map — B2: export body must match active tab. */
  versions?: Record<string, any> | null;
  /** Optimistic unlock after credit spend (parent can fold into isPlanPaid). */
  onPlanUnlockedByCredit?: (planName: string, planId?: string) => void;
}

export function useExportActions({
  result,
  locale,
  currency,
  fxRate = 0.201,
  user,
  isAdmin,
  isPlanPaid,
  subscriptionActive,
  euFundsUnlocked,
  credits,
  setIsDownloading,
  setPendingDownloadMode,
  setShowPricingModal,
  setIsSharedView,
  activeVersionId,
  versions,
  onPlanUnlockedByCredit,
}: UseExportActionsProps) {
  /** Session unlocks — prevents double credit spend before Firestore snapshot. */
  const sessionUnlockedRef = useRef<Set<string>>(new Set());

  const handleDownloadAction = async (mode: 'pdf' | 'pptx' | 'word' | 'pdf-summary', bypassPaymentCheck = false) => {
    const exportResult = resolveExportPlanBody(versions, activeVersionId, result) as BusinessPlan | null;
    if (!exportResult) return;

    const { planName, planId } = planUnlockPayload(exportResult || {});
    const unlockKey = planId || planName;
    const versionSuffix = buildExportVersionFileSuffix(activeVersionId, exportResult, locale);
    const sessionUnlocked = sessionUnlockedRef.current.has(unlockKey);
    const effectivelyPaid =
      bypassPaymentCheck ||
      isAdmin ||
      isPlanPaid ||
      subscriptionActive ||
      euFundsUnlocked ||
      sessionUnlocked;

    if (mode !== 'pdf-summary' && !effectivelyPaid) {
      if (!user) {
        window.history.pushState({ login: true }, '', window.location.pathname + '?login=true');
        setIsSharedView(false);
        return;
      }
      if (credits > 0) {
        const confirmUnlock = window.confirm(
          locale === "en"
            ? `Downloading this document will consume 1 credit of the ${credits} available. Do you wish to continue?`
            : locale === "es"
            ? `Descargar este documento consumirá 1 crédito de los ${credits} disponibles. ¿Desea continuar?`
            : `Descărcarea acestui document va consuma 1 credit din cele ${credits} disponibile. Dorești să continui?`
        );
        if (!confirmUnlock) return;

        try {
          const token = await user.getIdToken();
          const res = await fetch("/api/spend-export-credit", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ planName, planId }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok || !data?.success) {
            if (data?.code === "NO_CREDITS") {
              setPendingDownloadMode(mode as any);
              setShowPricingModal(true);
              return;
            }
            throw new Error(data?.error || "Spend failed");
          }
          sessionUnlockedRef.current.add(unlockKey);
          onPlanUnlockedByCredit?.(planName, planId);
        } catch (e) {
          console.error("Eroare la scaderea creditului:", e);
          alert(UI_STRINGS[locale].errorProcessingCredit);
          return;
        }
      } else {
        setPendingDownloadMode(mode as any);
        setShowPricingModal(true);
        return;
      }
    }
    setIsDownloading(mode as any);
    await new Promise(resolve => setTimeout(resolve, 500));
    try {
      let generatedShareId: string | null = null;
      if (mode === 'pdf-summary' || mode === 'pdf') {
        let token: string | null = null;
        try {
          token = auth.currentUser ? await auth.currentUser.getIdToken() : null;
        } catch {
          /* guest share */
        }
        generatedShareId = await createSharedPlan(exportResult, locale, token);
      }

      if (mode === 'pptx' || mode === 'pdf' || mode === 'pdf-summary') {
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      const safeName = exportResult?.nume?.replace(/[^a-zA-Z0-9]/g, '_') || 'Business';
      const fileUi = UI_STRINGS[locale] || UI_STRINGS.ro;
      const presentationLabel = fileUi.filePresentation;
      const summaryFreeLabel = fileUi.fileSummaryFree;
      const documentLabel = fileUi.fileDocument;
      const brochureLabel = fileUi.fileBrochure;

      // Prefer UI display currency (Desktop toggle), then plan field, then locale default.
      const exportCurrency =
        currency ||
        exportResult?.selectedCurrency ||
        (locale === "es" || locale === "en" ? "EUR" : "LEI");
      const exportFx = typeof fxRate === "number" && fxRate > 0 ? fxRate : 0.201;

      if (mode === 'pptx') {
        await generatePptx(exportResult, `${safeName}${versionSuffix}`, exportCurrency, exportFx, locale, brochureLabel);
      } else if (mode === 'pdf' || mode === 'pdf-summary') {
        let slidesArray = Array.from(document.querySelectorAll('.pdf-presentation-slide'));
        if (slidesArray.length === 0) {
           setIsDownloading(null);
           return;
        }
        
        if (mode === 'pdf-summary') {
          slidesArray = slidesArray.slice(0, 4);
          const ctaSlide = document.querySelector('.pdf-cta-slide');
          if (ctaSlide) {
            slidesArray.push(ctaSlide as Element);
          }
        }

        const pdf = new jsPDF({
          orientation: "landscape",
          unit: "pt",
          format: [1280, 720]
        });

        const exportLocale = normalizeAppLocale(locale);
        // Do NOT fall back to result.id — that is not a shared_plans doc id.
        const pdfUrl = generatedShareId
          ? buildSharedPlanUrl(generatedShareId, exportLocale)
          : buildPdfCtaFallbackUrl(exportLocale);
        if (!generatedShareId) {
          console.warn(
            "[PDF] Share create failed — CTA uses Demo start (no fake sharedId)"
          );
        }

        const pdfFooters: Record<string, string> = {
          ro: "Plan generat inteligent de IdeeaTa.ai",
          en: "Business plan smartly generated by IdeeaTa.ai",
          es: "Plan de negocios generado inteligentemente por IdeeaTa.ai"
        };

        const isMobileScreen = typeof window !== "undefined" && (window.innerWidth < 1024 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
        const effectivePixelRatio = isMobileScreen ? 1.2 : 2;

        for (let i = 0; i < slidesArray.length; i++) {
          const slideElement = slidesArray[i] as HTMLElement;
          const dataUrl = await toPng(slideElement, { quality: 1.0, pixelRatio: effectivePixelRatio });
          if (i > 0) pdf.addPage([1280, 720], "landscape");
          pdf.addImage(dataUrl, 'PNG', 0, 0, 1280, 720);

          pdf.setTextColor(150, 150, 150);
          pdf.setFontSize(14);
          pdf.text(pdfFooters[exportLocale] || pdfFooters.ro, 640, 700, { align: 'center' });

          attachPdfCtaLinks(pdf, {
            pageIndex: i,
            totalPages: slidesArray.length,
            isSummaryExport: mode === 'pdf-summary',
            ctaUrl: pdfUrl,
          });
        }
        
        const suffix = mode === 'pdf-summary' ? `_${summaryFreeLabel}` : '';
        pdf.save(`IdeeaTa_${presentationLabel}_${safeName}${versionSuffix}${suffix}.pdf`);
      } else if (mode === 'word') {
          const chartElement = document.getElementById("docx-export-chart-hidden");
          let chartDataUrl = null;
          if (chartElement) {
             try {
                chartDataUrl = await toPng(chartElement, { backgroundColor: '#ffffff' });
             } catch(e) { console.error(e); }
          }
          const blob = await generateDocxBlob(exportResult, chartDataUrl, locale, exportCurrency, exportFx);
          const link = document.createElement('a');
          const objectUrl = URL.createObjectURL(blob);
          link.href = objectUrl;
          const safeName2 = exportResult?.nume?.replace(/[^a-zA-Z0-9]/g, '_') || 'Business';
          link.download = `IdeeaTa_${documentLabel}_${safeName2}${versionSuffix}.docx`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(objectUrl);
      }

      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (e) {
      console.error("Eroare la generarea documentului", e);
      alert(UI_STRINGS[locale].errorSavingDocument);
    } finally {
      setIsDownloading(null);
    }
  };

  return { downloadAction: handleDownloadAction };
}
