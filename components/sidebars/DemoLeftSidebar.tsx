import React from "react";
import { ToolActionButton } from "@/components/tools/ToolActionButton";
import { freeToneRemainingLabel } from "@/lib/toneQuota";
import { expertModulesBadgeLabel } from "@/lib/templatesData";

export function DemoLeftSidebar({ 
  user, 
  result, 
  ui, 
  locale, 
  t, 
  hasProAccess, 
  hasStandardAccess, 
  isAdmin, 
  activeAiPrompt, 
  setActiveAiPrompt, 
  isEditingAi, 
  showToneOptions, 
  setShowToneOptions, 
  setShowAuthModal, 
  setShowPricingModal, 
  setShowExpertDrawer, 
  handleAiEdit, 
  aiPromptInput, 
  setAiPromptInput,
  showProPackQuotaTip = false,
}: any) {
  return (
      <div className="w-full lg:w-2/5 xl:w-1/3 flex flex-col gap-6 sticky top-8 print:hidden">
      
                  <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-8 shadow-xl sticky top-8">
                   <h3 className="text-2xl font-black text-white mb-4 flex items-center gap-3"><span className="text-emerald-500">✨</span> {ui.toolsTitle}</h3>
                   <p className="text-zinc-400 text-sm mb-6 leading-relaxed">{ui.toolsDesc}</p>
                   
                      <div className="flex flex-col gap-2">
                      <ToolActionButton
                        icon="🏦"
                        accent={!hasProAccess ? "amber" : "emerald"}
                        label={isEditingAi ? ui.processing : ui.investorPlanBtn}
                        disabled={isEditingAi}
                        locale={locale}
                        badge={!hasProAccess ? "pro" : "none"}
                        onClick={() => {
                        if (!user) {
                          setShowAuthModal(true);
                          return;
                        }
                        const isAlreadyAdded = result?.sectiuni_aditionale?.findIndex((sec: any) => 
                          sec.titlu.includes("Plan Profesionist") || 
                          sec.titlu.includes("Investitori") || 
                          sec.titlu.includes("Professional") || 
                          sec.titlu.includes("Investor") || 
                          sec.titlu.includes("Profesional") || 
                          sec.titlu.includes("Inversor")
                        );
                        if (isAlreadyAdded !== undefined && isAlreadyAdded >= 0) {
                          alert(t("chapterAlreadyAdded", locale));
                          document.getElementById(`custom-section-${isAlreadyAdded}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
                          return;
                        }
                        if (!hasProAccess) {
                          setShowPricingModal(true);
                          return;
                        }
                        setActiveAiPrompt(activeAiPrompt?.action === "investor_ready" ? null : {
                          action: "investor_ready", 
                          title: ui.investorPlanBtn, 
                          isConfirm: true, 
                          desc: locale === "en"
                            ? "The following will be generated:\n1. Executive Summary\n2. Differentiation Matrix\n3. 'Go-To-Market' Strategy\n4. Risk Analysis\n5. Financial Scenarios"
                            : locale === "es"
                            ? "Se generará lo siguiente:\n1. Resumen Ejecutivo\n2. Matriz de Diferenciación\n3. Estrategia 'Go-To-Market'\n4. Análisis de Riesgos\n5. Escenarios Financieros"
                            : "Se va genera:\n1. Rezumat Executiv\n2. Matrice Diferențiere\n3. Strategie 'Go-To-Market'\n4. Analiză Risc\n5. Scenarii Financiare"
                        });
                      }}
                      />

                      <ToolActionButton
                        icon="🇪🇺"
                        accent={!hasProAccess ? "amber" : "emerald"}
                        label={isEditingAi ? ui.processing : ui.optimizedForEUGrants}
                        disabled={isEditingAi}
                        locale={locale}
                        badge={!hasProAccess ? "pro" : "none"}
                        onClick={() => {
                          if (!user) {
                            setShowAuthModal(true);
                            return;
                          }
                          const isAlreadyAdded = result?.sectiuni_aditionale?.findIndex((sec: any) => 
                            sec.titlu.includes("Fonduri") || 
                            sec.titlu.includes("Europene") || 
                            sec.titlu.includes("European") || 
                            sec.titlu.includes("Funds") || 
                            sec.titlu.includes("Fondos") || 
                            sec.titlu.includes("Europeos")
                          );
                          if (isAlreadyAdded !== undefined && isAlreadyAdded >= 0) {
                            alert(t("chapterAlreadyAdded", locale));
                            document.getElementById(`custom-section-${isAlreadyAdded}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
                            return;
                          }
                          if (!hasProAccess) {
                            setShowPricingModal(true);
                            return;
                          }
                          if (activeAiPrompt?.action === "eu_funds_optimization") {
                            setActiveAiPrompt(null);
                          } else {
                            setActiveAiPrompt({
                              action: "eu_funds_optimization", 
                              title: ui.euGrantsOpt, 
                              isConfirm: true, 
                              desc: locale === "en" 
                                ? "The plan will be adapted for EU grants:\n1. Key concepts: digitization, sustainability.\n2. Renaming purchases to be eligible.\n\nAre you ready?" 
                                : locale === "es"
                                ? "El plan se adaptará para subvenciones de la UE:\n1. Conceptos clave: digitalización, sostenibilidad.\n2. Renombramiento de compras para que sean elegibles.\n\n¿Estás listo?"
                                : "Se va adapta planul pentru fonduri europene:\n1. Concepte cheie: digitalizare, sustenabilitate.\n2. Redenumirea achizițiilor pentru a fi eligibile.\n\nEști gata?"
                            });
                          }
                        }}
                      />

                        <div className="h-px w-full bg-zinc-800/80 my-1" />

                      {/* Cont gratuit: doar Rescrie tonul — cu cont, primele 2 tonuri; 3–4 = Pro */}
                      <ToolActionButton
                        icon="🪄"
                        accent="emerald"
                        label={ui.rewriteTone}
                        disabled={isEditingAi}
                        locale={locale}
                        badge={!user ? "locked" : "none"}
                        trailing={user ? <span className="text-zinc-500 text-xs">{showToneOptions ? "▲" : "▼"}</span> : undefined}
                        onClick={() => {
                          if (!user) { setShowAuthModal(true); return; }
                          setShowToneOptions(!showToneOptions);
                        }}
                      />
                      
                      {showToneOptions && user && (
                          <div className="flex flex-col gap-1 p-2 bg-zinc-950/50 rounded-xl border border-zinc-800/50 animate-in slide-in-from-top-2">
                          {!hasStandardAccess && !isAdmin && (
                            <p className="text-[10px] text-zinc-500 px-2 pb-1">
                              {freeToneRemainingLabel(locale === "en" || locale === "es" ? locale : "ro")}
                            </p>
                          )}
                          <button 
                            type="button"
                            onClick={() => handleAiEdit("professional_tone", "formal")} 
                            disabled={isEditingAi}
                            className="w-full text-xs text-left px-4 py-2.5 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-white transition-all font-semibold"
                          >
                            {ui.toneProfessional}
                          </button>
                          <button 
                            type="button"
                            onClick={() => handleAiEdit("professional_tone", "creative")} 
                            disabled={isEditingAi}
                            className="w-full text-xs text-left px-4 py-2.5 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-white transition-all font-semibold"
                          >
                            {ui.toneCreative}
                          </button>
                          <button 
                            type="button"
                            onClick={() => {
                              if (!hasProAccess && !isAdmin) {
                                setShowPricingModal(true);
                                return;
                              }
                              handleAiEdit("professional_tone", "persuasive");
                            }} 
                            disabled={isEditingAi}
                            className="w-full text-xs text-left px-4 py-2.5 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-white transition-all font-semibold flex items-center justify-between gap-2"
                          >
                            <span className="min-w-0">{ui.tonePersuasive}</span>
                            {(!hasProAccess && !isAdmin) && (
                              <span className="shrink-0 min-w-[3.25rem] text-center text-[9px] font-bold uppercase tracking-wide text-amber-400/90 border border-amber-500/30 bg-amber-500/5 px-2 py-1 rounded-md">Pro</span>
                            )}
                          </button>
                          <button 
                            type="button"
                            onClick={() => {
                              if (!hasProAccess && !isAdmin) {
                                setShowPricingModal(true);
                                  return;
                                }
                                handleAiEdit("professional_tone", "friendly");
                              }} 
                              disabled={isEditingAi}
                              className="w-full text-xs text-left px-4 py-2.5 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-white transition-all font-semibold flex items-center justify-between gap-2"
                            >
                              <span className="min-w-0">{ui.toneFriendly}</span>
                              {(!hasProAccess && !isAdmin) && (
                                <span className="shrink-0 min-w-[3.25rem] text-center text-[9px] font-bold uppercase tracking-wide text-amber-400/90 border border-amber-500/30 bg-amber-500/5 px-2 py-1 rounded-md">Pro</span>
                              )}
                            </button>
                          </div>
                        )}

                      <ToolActionButton
                        icon="📉"
                        accent="amber"
                        label={isEditingAi ? ui.processing : ui.optimizeBudget}
                        disabled={isEditingAi}
                        locale={locale}
                        badge="pro"
                        onClick={() => {
                          if (!user) { setShowAuthModal(true); return; }
                          if (!hasProAccess && !isAdmin) {
                            setShowPricingModal(true);
                            return;
                          }
                          setActiveAiPrompt(activeAiPrompt?.action === "optimize_budget" ? null : {
                            action: "optimize_budget", 
                            title: ui.optimizeBudget, 
                            placeholder: ui.optimizeBudgetPlaceholder, 
                            desc: locale === "en" 
                              ? "By what percentage do you want to reduce the budgeted costs?" 
                              : locale === "es" 
                              ? "¿Qué porcentaje deseas reducir de los costos presupuestados?" 
                              : "Cu ce procent dorești să reduci costurile bugetate?"
                          });
                        }}
                      />

                      <ToolActionButton
                        icon="🏛️"
                        accent="emerald"
                        label={ui.expertSectionLibrary}
                        disabled={isEditingAi}
                        locale={locale}
                        badge="modules"
                        badgeLabel={expertModulesBadgeLabel(locale)}
                        onClick={() => {
                          if (!user) { setShowAuthModal(true); return; }
                          setShowExpertDrawer(true);
                        }}
                      />
                    </div>


                    {activeAiPrompt && (
                      <div id="ai-prompt-box" className="mt-4 p-4 bg-zinc-950 border border-zinc-800 rounded-xl animate-in fade-in slide-in-from-top-2 duration-200">
                        <h4 className="text-sm font-bold text-zinc-200 mb-2">{activeAiPrompt.title}</h4>
                        <p className="text-xs text-zinc-400 mb-3 whitespace-pre-line">{activeAiPrompt.desc}</p>
                        
                        {!activeAiPrompt.isConfirm && (
                          <input 
                            type="text" 
                            value={aiPromptInput}
                            onChange={(e) => setAiPromptInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                if (aiPromptInput.trim() || activeAiPrompt.isConfirm) {
                                  handleAiEdit(
                                    activeAiPrompt.action,
                                    undefined,
                                    aiPromptInput,
                                    false,
                                    activeAiPrompt.combineOptions
                                  );
                                }
                              }
                            }}
                            placeholder={activeAiPrompt.placeholder}
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white mb-3 focus:outline-none focus:border-emerald-500 transition-colors"
                            autoFocus
                          />
                        )}
                        
                          <div className="flex gap-2">
                          <button 
                            type="button"
                            onClick={() =>
                              handleAiEdit(
                                activeAiPrompt.action,
                                undefined,
                                aiPromptInput,
                                false,
                                activeAiPrompt.combineOptions
                              )
                            }
                            disabled={!activeAiPrompt.isConfirm && !aiPromptInput.trim()}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-bold text-xs py-2 rounded-lg transition-colors"
                          >
                            {activeAiPrompt.isConfirm ? ui.confirm : ui.apply}
                          </button>
                          <button 
                            type="button"
                            onClick={() => { setActiveAiPrompt(null); setAiPromptInput(""); }}
                            className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs py-2 rounded-lg transition-colors"
                          >
                            {ui.cancel}
                          </button>
                        </div>
                      </div>
                    )}
                </div>
            
            {/* User Tip */}
              <div className="mt-6 flex flex-col gap-3 w-full">
              <div className="flex items-start gap-2 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl w-full">
              <span className="text-emerald-400 mt-0.5 text-lg">💡</span>
              <p className="text-[13px] text-emerald-100/70 leading-relaxed">
                <span dangerouslySetInnerHTML={{ __html: ui.editorTip }}></span>
              </p>
            </div>
              <div className="flex items-start gap-2 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl w-full">
                <span className="text-emerald-400 mt-0.5 text-lg shrink-0">🪄</span>
                <p className="text-[13px] text-emerald-100/70 leading-relaxed">
                  <span dangerouslySetInnerHTML={{ __html: ui.versionToolsTip }} />
                </p>
              </div>
              {showProPackQuotaTip && (
                <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/25 p-4 rounded-2xl w-full">
                  <span className="text-amber-400 mt-0.5 text-lg shrink-0">⏱️</span>
                  <p className="text-[13px] text-amber-100/80 leading-relaxed">
                    <span dangerouslySetInnerHTML={{ __html: ui.proPackQuotaTip }} />
                  </p>
                </div>
              )}
              </div>
    </div>
  );
}
