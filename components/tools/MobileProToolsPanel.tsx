"use client";

import React from "react";
import { ToolActionButton } from "@/components/tools/ToolActionButton";
import { expertModulesBadgeLabel } from "@/lib/templatesData";

type Locale = "ro" | "en" | "es";

export type MobileAiPrompt = {
  action: string;
  title: string;
  placeholder?: string;
  desc?: string;
  isConfirm?: boolean;
};

type Props = {
  ui: any;
  locale: Locale;
  t: (key: string, locale: Locale) => string;
  user: any;
  result: any;
  hasProAccess: boolean;
  isEditingAi: boolean;
  activeAiPrompt: MobileAiPrompt | null;
  setActiveAiPrompt: (v: MobileAiPrompt | null) => void;
  aiPromptInput: string;
  setAiPromptInput: (v: string) => void;
  handleAiEdit: (action: string, customInput?: string) => void;
  onRequireAuth: () => void;
  onRequirePro: () => void;
  showExpert?: boolean;
  onOpenExpert?: () => void;
};

const EU_DESC: Record<Locale, string> = {
  en: "The plan will be adapted for EU grants:\n1. Key concepts: digitization, sustainability.\n2. Renaming purchases to be eligible.\n\nAre you ready?",
  es: "El plan se adaptará para subvenciones de la UE:\n1. Conceptos clave: digitalización, sostenibilidad.\n2. Renombramiento de compras para que sean elegibles.\n\n¿Estás listo?",
  ro: "Se va adapta planul pentru fonduri europene:\n1. Concepte cheie: digitalizare, sustenabilitate.\n2. Redenumirea achizițiilor pentru a fi eligibile.\n\nEști gata?",
};

const INVESTOR_DESC: Record<Locale, string> = {
  en: "The following will be generated:\n1. Executive Summary\n2. Differentiation Matrix\n3. 'Go-To-Market' Strategy\n4. Risk Analysis\n5. Financial Scenarios",
  es: "Se generará lo siguiente:\n1. Resumen Ejecutivo\n2. Matriz de Diferenciación\n3. Estrategia 'Go-To-Market'\n4. Análisis de Riesgos\n5. Escenarios Financieros",
  ro: "Se va genera:\n1. Rezumat Executiv\n2. Matrice Diferențiere\n3. Strategie 'Go-To-Market'\n4. Analiză Risc\n5. Scenarii Financiare",
};

const BUDGET_DESC: Record<Locale, string> = {
  en: "By what percentage do you want to reduce the budgeted costs?",
  es: "¿Qué porcentaje deseas reducir de los costos presupuestados?",
  ro: "Cu ce procent dorești să reduci costurile bugetate?",
};

function isInvestorSectionAlreadyAdded(result: any): number {
  const idx = result?.sectiuni_aditionale?.findIndex(
    (sec: any) =>
      sec.titlu?.includes("Plan Profesionist") ||
      sec.titlu?.includes("Investitori") ||
      sec.titlu?.includes("Professional") ||
      sec.titlu?.includes("Investor") ||
      sec.titlu?.includes("Profesional") ||
      sec.titlu?.includes("Inversor")
  );
  return typeof idx === "number" ? idx : -1;
}

/** Studio/Demo Mobile — same Pro tools as Desktop left sidebar (EU / Investor / Budget / Expert). */
export function MobileProToolsPanel({
  ui,
  locale,
  t,
  user,
  result,
  hasProAccess,
  isEditingAi,
  activeAiPrompt,
  setActiveAiPrompt,
  aiPromptInput,
  setAiPromptInput,
  handleAiEdit,
  onRequireAuth,
  onRequirePro,
  showExpert = false,
  onOpenExpert,
}: Props) {
  const togglePrompt = (next: MobileAiPrompt) => {
    setActiveAiPrompt(activeAiPrompt?.action === next.action ? null : next);
    setAiPromptInput("");
  };

  const runPrompt = () => {
    if (!activeAiPrompt) return;
    if (!activeAiPrompt.isConfirm && !aiPromptInput.trim()) return;
    handleAiEdit(activeAiPrompt.action, activeAiPrompt.isConfirm ? undefined : aiPromptInput);
    setActiveAiPrompt(null);
    setAiPromptInput("");
  };

  return (
    <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-4 space-y-3 w-full">
      <div className="space-y-1">
        <h3 className="text-sm font-black text-white flex items-center gap-2">
          <span className="text-emerald-500">✨</span> {ui.toolsTitle}
        </h3>
        <p className="text-[11px] text-zinc-400 leading-relaxed">{ui.toolsDesc}</p>
      </div>

      <div className="flex flex-col gap-2">
        <ToolActionButton
          icon="🇪🇺"
          accent={!hasProAccess ? "amber" : "neutral"}
          label={isEditingAi ? ui.processing : ui.optimizedForEUGrants}
          disabled={isEditingAi}
          locale={locale}
          badge={!hasProAccess ? "pro" : "none"}
          onClick={() => {
            if (!user) {
              onRequireAuth();
              return;
            }
            if (!hasProAccess) {
              onRequirePro();
              return;
            }
            togglePrompt({
              action: "eu_funds_optimization",
              title: ui.euGrantsOpt,
              isConfirm: true,
              desc: EU_DESC[locale],
            });
          }}
        />

        <ToolActionButton
          icon="🏦"
          accent={!hasProAccess ? "amber" : "emerald"}
          label={isEditingAi ? ui.processing : ui.investorPlanBtn}
          disabled={isEditingAi}
          locale={locale}
          badge={!hasProAccess ? "pro" : "none"}
          onClick={() => {
            if (!user) {
              onRequireAuth();
              return;
            }
            const already = isInvestorSectionAlreadyAdded(result);
            if (already >= 0) {
              alert(t("chapterAlreadyAdded", locale));
              document
                .getElementById(`custom-section-${already}`)
                ?.scrollIntoView({ behavior: "smooth", block: "center" });
              return;
            }
            if (!hasProAccess) {
              onRequirePro();
              return;
            }
            togglePrompt({
              action: "investor_ready",
              title: ui.investorPlanBtn,
              isConfirm: true,
              desc: INVESTOR_DESC[locale],
            });
          }}
        />

        <ToolActionButton
          icon="📉"
          accent={!hasProAccess ? "amber" : "emerald"}
          label={isEditingAi ? ui.processing : ui.optimizeBudget}
          disabled={isEditingAi}
          locale={locale}
          badge={!hasProAccess ? "pro" : "none"}
          onClick={() => {
            if (!user) {
              onRequireAuth();
              return;
            }
            if (!hasProAccess) {
              onRequirePro();
              return;
            }
            togglePrompt({
              action: "optimize_budget",
              title: ui.optimizeBudget,
              placeholder: ui.optimizeBudgetPlaceholder,
              desc: BUDGET_DESC[locale],
            });
          }}
        />

        {showExpert && onOpenExpert && (
          <ToolActionButton
            icon="🏛️"
            accent="emerald"
            label={ui.expertSectionLibrary}
            disabled={isEditingAi}
            locale={locale}
            badge="modules"
            badgeLabel={expertModulesBadgeLabel(locale)}
            onClick={() => {
              if (!user) {
                onRequireAuth();
                return;
              }
              onOpenExpert();
            }}
          />
        )}
      </div>

      {activeAiPrompt && (
        <div className="mt-1 p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl animate-in fade-in slide-in-from-top-2 duration-200">
          <h4 className="text-xs font-bold text-zinc-200 mb-1.5">{activeAiPrompt.title}</h4>
          {activeAiPrompt.desc && (
            <p className="text-[11px] text-zinc-400 mb-3 whitespace-pre-line">{activeAiPrompt.desc}</p>
          )}

          {!activeAiPrompt.isConfirm && (
            <input
              type="text"
              value={aiPromptInput}
              onChange={(e) => setAiPromptInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  runPrompt();
                }
              }}
              placeholder={activeAiPrompt.placeholder}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white mb-3 focus:outline-none focus:border-emerald-500 transition-colors min-h-[44px]"
              autoFocus
            />
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={runPrompt}
              disabled={!activeAiPrompt.isConfirm && !aiPromptInput.trim()}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-bold text-xs py-2.5 rounded-lg transition-colors min-h-[44px]"
            >
              {activeAiPrompt.isConfirm ? ui.confirm : ui.apply}
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveAiPrompt(null);
                setAiPromptInput("");
              }}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs py-2.5 rounded-lg transition-colors min-h-[44px]"
            >
              {ui.cancel}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
