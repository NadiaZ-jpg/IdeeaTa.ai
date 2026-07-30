import React from "react";

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
  setAiPromptInput 
}: any) {
  return (
      <div className="w-full lg:w-2/5 xl:w-1/3 flex flex-col gap-6 sticky top-8 print:hidden">
      
                  <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-8 shadow-xl sticky top-8">
                   <h3 className="text-2xl font-black text-white mb-4 flex items-center gap-3"><span className="text-emerald-500">✨</span> Instrumente</h3>
                   <p className="text-zinc-400 text-sm mb-6 leading-relaxed">Aici poți folosi asistentul inteligent pentru a adăuga mai multe informații și detalii planului tău.</p>
                   
                      <div className="flex flex-col gap-3">
                      {/* BLOC PREMIUM (VERDE) */}
                      <button type="button" onClick={() => {
                        if (!user) {
                          setShowAuthModal(true);
                          return;
                        }
                        const isAlreadyAdded = result?.sectiuni_aditionale?.findIndex((sec: any) => sec.titlu.includes("Plan Profesionist") || sec.titlu.includes("Investitori"));
                        if (isAlreadyAdded !== undefined && isAlreadyAdded >= 0) {
                          alert(t("chapterAlreadyAdded", locale));
                          document.getElementById(`custom-section-${isAlreadyAdded}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
                          return;
                        }
                        if (!hasProAccess) {
                          setShowPricingModal(true);
                          return;
                        }
                        setActiveAiPrompt(activeAiPrompt?.action === "investor_ready" ? null : {action: "investor_ready", title: "Plan Profesionist", isConfirm: true, desc: "Se va genera:\n1. Rezumat Executiv\n2. Matrice Diferențiere\n3. Strategie 'Go-To-Market'\n4. Analiză Risc\n5. Scenarii Financiare"});
                      }} disabled={isEditingAi} className={`w-full rounded-xl px-5 py-4 font-bold text-sm transition-all text-left flex items-center justify-between group disabled:opacity-50 disabled:cursor-not-allowed ${!hasProAccess ? 'bg-zinc-900/60 hover:bg-zinc-800/80 border border-amber-500/30 text-amber-300' : 'bg-zinc-900/80 hover:bg-zinc-800 border border-emerald-500/30 text-emerald-100 shadow-[0_0_15px_rgba(16,185,129,0.1)]'}`}>
                        <span className="flex items-center gap-3">
                          <span className={`${!hasProAccess ? 'text-amber-500' : 'text-emerald-400'} group-hover:scale-110 transition-transform text-lg`}>🏦</span> 
                          <span>{isEditingAi ? "Se procesează..." : "Plan Profesionist (Investitori/Bănci)"}</span>
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
                          const isAlreadyAdded = result?.sectiuni_aditionale?.findIndex((sec: any) => sec.titlu.includes("Fonduri") || sec.titlu.includes("Europene"));
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
                            setActiveAiPrompt({action: "eu_funds_optimization", title: "Optimizare Fonduri Europene", isConfirm: true, desc: "Se va adapta planul pentru fonduri europene:\n1. Concepte cheie: digitalizare, sustenabilitate.\n2. Redenumirea achizițiilor pentru a fi eligibile.\n\nEști gata?"});
                          }
                        }} 
                        disabled={isEditingAi} 
                        className={`w-full rounded-xl px-5 py-4 font-bold text-sm transition-all text-left flex items-center justify-between group disabled:opacity-50 disabled:cursor-not-allowed ${!hasProAccess ? 'bg-zinc-900/60 hover:bg-zinc-800/80 border border-amber-500/30 text-amber-300' : 'bg-zinc-900/80 hover:bg-zinc-800 border border-emerald-500/30 text-emerald-100 shadow-[0_0_15px_rgba(16,185,129,0.1)]'}`}
                      >
                        <span className="flex items-center gap-3">
                          <span className={`${!hasProAccess ? 'text-amber-500' : 'text-emerald-400'} group-hover:scale-110 transition-transform text-lg`}>🇪🇺</span>
                          <span>
                            {isEditingAi ? "Se procesează..." : "Optimizat pentru Fonduri Europene"}
                          </span>
                        </span>
                        {!hasProAccess && (
                          <span className="text-[10px] bg-amber-500/20 border border-amber-500/40 text-amber-300 px-2 py-0.5 rounded-full font-black uppercase tracking-wider whitespace-nowrap flex items-center gap-1">
                            🔒 PRO
                          </span>
                        )}
                      </button>

                        <div className="h-px w-full bg-zinc-800 my-2"></div>

                      {/* BLOC SECUNDAR (AURIU - LIBER PE DEMO) */}
                      <button 
                        type="button"
                        onClick={() => {
                          if (!user) { setShowAuthModal(true); return; }
                          setShowToneOptions(!showToneOptions);
                        }} 
                        disabled={isEditingAi} 
                        className="w-full bg-black hover:bg-zinc-800 border border-zinc-800 rounded-xl px-5 py-4 font-bold text-sm text-zinc-300 transition-all text-left flex items-center justify-between group disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="flex items-center gap-3">
                          <span className="text-emerald-500 group-hover:scale-110 transition-transform">🪄</span>
                          <span>Rescrie tonul</span>
                        </span>
                        <span className="flex items-center gap-2">
                          <span className="text-zinc-500 text-xs">{showToneOptions ? "▲" : "▼"}</span>
                        </span>
                      </button>
                      
                      {showToneOptions && (
                          <div className="flex flex-col gap-1 p-2 bg-zinc-950/50 rounded-xl border border-zinc-800/50 mt-1 animate-in slide-in-from-top-2">
                          <button 
                            type="button"
                            onClick={() => handleAiEdit("professional_tone", "foarte formal, academic și riguros")} 
                            disabled={isEditingAi}
                            className="w-full text-xs text-left px-4 py-2.5 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-white transition-all font-semibold"
                          >
                            Formal & Academic
                          </button>
                          <button 
                            type="button"
                            onClick={() => handleAiEdit("professional_tone", "entuziast, creativ și plin de energie")} 
                            disabled={isEditingAi}
                            className="w-full text-xs text-left px-4 py-2.5 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-white transition-all font-semibold"
                          >
                            Creativ & Entuziast
                          </button>
                          <button 
                            type="button"
                            onClick={() => {
                              if (!hasStandardAccess && !isAdmin) {
                                setShowPricingModal(true);
                                return;
                              }
                              handleAiEdit("professional_tone", "persuasiv, orientat spre vânzări și convingător");
                            }} 
                            disabled={isEditingAi}
                            className="w-full text-xs text-left px-4 py-2.5 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-white transition-all font-semibold flex items-center justify-between group"
                          >
                            <span>Comercial & Persuasiv</span>
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
                                handleAiEdit("professional_tone", "prietenos, simplu și ușor de înțeles");
                              }} 
                              disabled={isEditingAi}
                              className="w-full text-xs text-left px-4 py-2.5 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-white transition-all font-semibold flex items-center justify-between group"
                            >
                              <span>Simplu & Prietenos</span>
                              {(!hasStandardAccess && !isAdmin) && (
                                <span className="text-[9px] bg-amber-500/20 border border-amber-500/40 text-amber-300 px-1.5 py-0.5 rounded font-black uppercase">🔒 PRO</span>
                              )}
                            </button>
                          </div>
                        )}

                      <button 
                        type="button" 
                        onClick={() => {
                          if (!user) { setShowAuthModal(true); return; }
                          setActiveAiPrompt(activeAiPrompt?.action === "optimize_budget" ? null : {action: "optimize_budget", title: "Optimizează Bugetul", placeholder: "ex: 10, 20, 30", desc: "Cu ce procent dorești să reduci costurile bugetate?"});
                        }} 
                        disabled={isEditingAi} 
                        className="w-full bg-black hover:bg-zinc-800 border border-amber-500/20 rounded-xl px-5 py-4 font-bold text-sm text-amber-100 transition-all text-left flex items-center justify-between group disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="flex items-center gap-3">
                          <span className="text-amber-500 group-hover:scale-110 transition-transform">📉</span>
                          <span>
                            {isEditingAi ? "Se procesează..." : (
                              <>
                                Optimizează Bugetul <span className="whitespace-nowrap">(Personalizat)</span>
                              </>
                            )}
                          </span>
                        </span>
                        <span className="text-[10px] bg-amber-500/20 border border-amber-500/40 text-amber-300 px-2 py-0.5 rounded-full font-black uppercase tracking-wider whitespace-nowrap">
                          🔒 PRO
                        </span>
                      </button>

                      <button 
                        type="button" 
                        onClick={() => {
                          if (!user) { setShowAuthModal(true); return; }
                          setShowExpertDrawer(true);
                        }} 
                        disabled={isEditingAi} 
                        className="w-full text-left flex items-center justify-between rounded-xl px-5 py-4 font-bold text-sm transition-all group disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-black hover:from-emerald-900/40 border border-emerald-500/40 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.1)] cursor-pointer"
                      >
                        <span className="flex items-center gap-3">
                          <span className="text-emerald-400 group-hover:scale-110 transition-transform text-lg">🏛️</span> 
                          <span>Librăria de Secțiuni Experte</span>
                        </span>
                        <span className="text-[10px] bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-2 py-0.5 rounded-full font-black uppercase tracking-wider whitespace-nowrap">
                          30+ MODULE
                        </span>
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
                            {activeAiPrompt.isConfirm ? "Confirmă" : "Aplică"}
                          </button>
                          <button 
                            type="button"
                            onClick={() => { setActiveAiPrompt(null); setAiPromptInput(""); }}
                            className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs py-2 rounded-lg transition-colors"
                          >
                            Anulează
                          </button>
                        </div>
                      </div>
                    )}
                </div>
            
            {/* User Tip */}
              <div className="mt-6 flex items-start gap-2 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl w-full">
              <span className="text-emerald-400 mt-0.5 text-lg">💡</span>
              <p className="text-[13px] text-emerald-100/70 leading-relaxed">
                <strong>Sfat:</strong> Aici editezi textul documentului. Pentru a adăuga <strong className="text-white">imagini</strong>, logo sau a schimba aranjarea în pagină, apasă <em>Confirmă și Salvează</em>, apoi descarcă documentele.
              </p>
            </div>
    </div>
  );
}
