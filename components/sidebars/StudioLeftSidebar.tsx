import React from "react";

export function StudioLeftSidebar({ 
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
  setAiPromptInput 
}: any) {
  return (
      <div className="w-full lg:w-2/5 xl:w-1/3 flex flex-col gap-6 sticky top-8 print:hidden">
      
                  <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-8 shadow-xl sticky top-8">
                   <h3 className="text-2xl font-black text-white mb-4 flex items-center gap-3"><span className="text-emerald-500">✨</span> {ui.toolsTitle}</h3>
                   <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
                     {ui.toolsDesc}
                   </p>
                   
                     <div className="flex flex-col gap-3">
                        <div className="flex flex-col gap-2">
                        <button 
                          type="button"
                          onClick={() => {
                            if (!user) {
                              setShowAuthModal(true);
                              return;
                            }
                            setShowToneOptions(!showToneOptions);
                          }} 
                          disabled={isEditingAi} 
                          className="w-full bg-black hover:bg-zinc-800 border border-zinc-800 rounded-xl px-5 py-4 font-bold text-sm text-zinc-300 transition-all text-left flex items-center justify-between group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="flex items-center gap-3">
                            <span className="text-emerald-500 group-hover:scale-110 transition-transform">🪄</span>
                            <span>{ui.rewriteTone}</span>
                          </span>
                          <span className="flex items-center gap-2">
                            {user && <span className="text-xs text-zinc-500">{showToneOptions ? "▲" : "▼"}</span>}
                          </span>
                        </button>
                        
                        {showToneOptions && (
                            <div className="bg-black/40 border border-zinc-800 rounded-xl p-2 flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
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
                                if (!hasStandardAccess && !isAdmin) {
                                  setShowPricingModal(true);
                                  return;
                                }
                                handleAiEdit("professional_tone", "persuasive");
                              }} 
                              disabled={isEditingAi}
                              className="w-full text-xs text-left px-4 py-2.5 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-white transition-all font-semibold flex items-center justify-between group"
                            >
                              <span>{ui.tonePersuasive}</span>
                              {(!hasStandardAccess && !isAdmin) && (
                                <span className="text-[9px] bg-amber-500/20 border border-amber-500/40 text-amber-300 px-1.5 py-0.5 rounded font-black uppercase">🔒 PRO</span>
                              )}
                            </button>
                            <button 
                              type="button"
                              onClick={() => {
                                if (!hasStandardAccess && !isAdmin) {
                                  setShowPricingModal(true);
                                  return;
                                }
                                handleAiEdit("professional_tone", "friendly");
                              }} 
                              disabled={isEditingAi}
                              className="w-full text-xs text-left px-4 py-2.5 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-white transition-all font-semibold flex items-center justify-between group"
                            >
                              <span>{ui.toneFriendly}</span>
                              {(!hasStandardAccess && !isAdmin) && (
                                <span className="text-[9px] bg-amber-500/20 border border-amber-500/40 text-amber-300 px-1.5 py-0.5 rounded font-black uppercase">🔒 PRO</span>
                              )}
                            </button>
                          </div>
                        )}
                      </div>

                      <button 
                        type="button" 
                        onClick={() => {
                          if (!user) {
                            setShowAuthModal(true);
                            return;
                          }
                          if (!hasProAccess) {
                            setShowPricingModal(true);
                          } else {
                            setActiveAiPrompt(activeAiPrompt?.action === "eu_funds_optimization" ? null : {
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
                        disabled={isEditingAi} 
                        className={`w-full text-left flex items-center justify-between rounded-xl px-5 py-4 font-bold text-sm transition-all group disabled:opacity-50 disabled:cursor-not-allowed ${
                          !hasProAccess 
                            ? "bg-zinc-900/60 hover:bg-zinc-800/80 border border-amber-500/30 text-amber-300" 
                            : "bg-black hover:bg-zinc-800 border border-zinc-800 text-zinc-300"
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <span className="text-amber-500 group-hover:scale-110 transition-transform">🇪🇺</span>
                          <span>
                            {isEditingAi 
                              ? (ui.processing) : (ui.optimizedForEUGrants)}
                          </span>
                        </span>
                        {!hasProAccess && (
                          <span className="text-[10px] bg-amber-500/20 border border-amber-500/40 text-amber-300 px-2 py-0.5 rounded-full font-black uppercase tracking-wider whitespace-nowrap flex items-center gap-1">
                            🔒 PRO
                          </span>
                        )}
                      </button>

                      <button 
                        type="button" 
                        onClick={() => {
                          if (!user) {
                            setShowAuthModal(true);
                            return;
                          }
                          // BLOCARE STRICTĂ — gratuit logat nu poate folosi Optimizează Bugetul (override freeze studio - Master Plan)
                          if (!hasProAccess) {
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
                        disabled={isEditingAi} 
                        className={`w-full text-left flex items-center justify-between rounded-xl px-5 py-4 font-bold text-sm transition-all group disabled:opacity-50 disabled:cursor-not-allowed ${
                          !hasProAccess 
                            ? "bg-zinc-900/60 hover:bg-zinc-800/80 border border-amber-500/30 text-amber-300" 
                            : "bg-black hover:bg-zinc-800 border border-zinc-800 text-zinc-300"
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <span className="text-emerald-500 group-hover:scale-110 transition-transform">📉</span>
                          <span>
                            {isEditingAi ? ui.processing : (
                              <span dangerouslySetInnerHTML={{ __html: ui.optimizeBudgetCustom.replace('(Personalizado)', '<span class="whitespace-nowrap">(Personalizado)</span>').replace('(Custom)', '<span class="whitespace-nowrap">(Custom)</span>').replace('(Personalizat)', '<span class="whitespace-nowrap">(Personalizat)</span>') }}></span>
                            )}
                          </span>
                        </span>
                        {!hasProAccess && (
                          <span className="text-[10px] bg-amber-500/20 border border-amber-500/40 text-amber-300 px-2 py-0.5 rounded-full font-black uppercase tracking-wider whitespace-nowrap flex items-center gap-1">
                            🔒 PRO
                          </span>
                        )}
                      </button>

                      <button 
                        type="button" 
                        onClick={() => {
                          if (!user) {
                            setShowAuthModal(true);
                            return;
                          }
                          setShowExpertDrawer(true);
                        }} 
                        disabled={isEditingAi} 
                        className="w-full text-left flex items-center justify-between rounded-xl px-5 py-4 font-bold text-sm transition-all group disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-black hover:from-emerald-900/40 border border-emerald-500/40 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.1)] cursor-pointer"
                      >
                        <span className="flex items-center gap-3">
                          <span className="text-emerald-400 group-hover:scale-110 transition-transform text-lg">🏛️</span> 
                          <span>
                            {ui.expertSectionLibrary}
                          </span>
                        </span>
                        <span className="text-[10px] bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-2 py-0.5 rounded-full font-black uppercase tracking-wider whitespace-nowrap">
                          {ui.modules30}
                        </span>
                      </button>

                      <button type="button" onClick={() => {
                        if (!user) {
                          setShowAuthModal(true);
                          return;
                        }
                        const isAlreadyAdded = result?.sectiuni_aditionale?.findIndex((sec: any) => sec.titlu.includes("Plan Profesionist") || sec.titlu.includes("Investitori") || sec.titlu.includes("Professional") || sec.titlu.includes("Investor") || sec.titlu.includes("Profesional") || sec.titlu.includes("Inversor"));
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
                      }} disabled={isEditingAi} className={`w-full rounded-xl px-5 py-4 font-bold text-sm transition-all text-left flex items-center justify-between group disabled:opacity-50 disabled:cursor-not-allowed ${!hasProAccess ? 'bg-zinc-900/60 hover:bg-zinc-800/80 border border-amber-500/30 text-amber-300' : 'bg-zinc-900/80 hover:bg-zinc-800 border border-emerald-500/30 text-emerald-100 shadow-[0_0_15px_rgba(16,185,129,0.1)]'}`}>
                        <span className="flex items-center gap-3">
                          <span className={`${!hasProAccess ? 'text-amber-500' : 'text-emerald-400'} group-hover:scale-110 transition-transform text-lg`}>🏦</span> 
                          <span>{isEditingAi ? ui.processing : ui.investorPlanBtn}</span>
                        </span>
                        {!hasProAccess && (
                          <span className="text-xs font-black bg-amber-500/20 text-amber-400 px-2.5 py-1 rounded-md border border-amber-500/20 group-hover:bg-amber-500/30 transition-colors flex items-center gap-1.5 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                            🔒 PRO
                          </span>
                        )}
                      </button>
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
                                  handleAiEdit(activeAiPrompt.action, undefined, aiPromptInput);
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
                            onClick={() => handleAiEdit(activeAiPrompt.action, undefined, aiPromptInput)}
                            disabled={!activeAiPrompt.isConfirm && !aiPromptInput.trim()}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-bold text-xs py-2 rounded-lg transition-colors"
                          >
                            {activeAiPrompt.isConfirm 
                              ? (ui.confirm) : (ui.apply)}
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
              <div className="mt-6 flex items-start gap-2 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl w-full">
              <span className="text-emerald-400 mt-0.5 text-lg">💡</span>
              <p className="text-[13px] text-emerald-100/70 leading-relaxed">
                <span dangerouslySetInnerHTML={{ __html: ui.editorTip }}></span>
              </p>
            </div>
    </div>
  );
}
