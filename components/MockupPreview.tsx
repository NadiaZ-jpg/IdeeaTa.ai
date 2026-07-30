"use client";
/**
 * MockupPreview.tsx
 * Exemplul static animat "Urban Beans" afișat înainte ca utilizatorul să genereze primul plan.
 * Conține 4 tab-uri: Rezumat, SWOT, Buget, Strategie + Grafice animate + Typing live + Înainte & După.
 * Comună pentru StudioDesktop și DemoDesktop.
 * Sesiunea 5 din planul de refactorizare arhitecturală (30 Iulie 2026).
 */

import React from "react";

interface MockupPreviewProps {
  mockupTab: number;
  setMockupTab: (tab: number) => void;
  innerMockupTab: string;
  setInnerMockupTab: (tab: string) => void;
  ui: any;
}

export function MockupPreview({
  mockupTab,
  setMockupTab,
  innerMockupTab,
  setInnerMockupTab,
  ui,
}: MockupPreviewProps) {
  return (
    <>
      {/* Tab 0: Preview cu tabs */}
      {mockupTab === 0 && (
        <div className="relative border border-zinc-800/60 rounded-[2.5rem] bg-[#09090b] overflow-hidden shadow-2xl ring-1 ring-white/5 min-h-[500px]">
          {/* Tab bar */}
          <div className="flex gap-1 border-b border-zinc-800/80 px-6 pt-5 pb-0 bg-zinc-900/40">
            <div className="flex gap-2 mr-4 items-center pb-4">
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-700"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-700"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-700"></div>
            </div>
            {[ui.mockupSummary, ui.mockupSwot, ui.mockupBudget, ui.mockupStrategy].map((t) => (
              <div
                key={t}
                onClick={() => setInnerMockupTab(t)}
                className={`cursor-pointer transition-all px-4 py-3 text-sm font-semibold rounded-t-xl border-t border-l border-r -mb-px ${
                  innerMockupTab === t
                    ? 'bg-[#09090b] border-zinc-700/60 text-emerald-400'
                    : 'bg-transparent border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30'
                }`}
              >
                {t}
              </div>
            ))}
          </div>

          {/* Content */}
          <div className="p-8 md:p-12 animate-in fade-in duration-300">
            <div className="mb-8">
              <div className="text-emerald-500 font-bold text-sm tracking-wider uppercase mb-2">{ui.generatedExample}</div>
              <h4 className="text-2xl font-black text-white">{ui.coffeeShopName}</h4>
            </div>

            {innerMockupTab === ui.mockupSummary && (
              <div className="text-zinc-400 leading-relaxed text-lg animate-in slide-in-from-bottom-2">
                <p className="mb-4">
                  <strong>Urban Beans</strong> {ui.mockupSummaryP1}</p>
                <p>
                  {ui.mockupSummaryP2}
                </p>
              </div>
            )}

            {innerMockupTab === ui.mockupSwot && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-bottom-2">
                <div className="cursor-pointer hover:scale-[1.02] transition-transform p-6 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 hover:border-emerald-400/60">
                  <h5 className="font-bold text-emerald-400 mb-3 text-lg">{ui.mockupSwotS_Title}</h5>
                  <ul className="text-zinc-300 space-y-2 text-sm">
                    <li>• {ui.mockupSwotS_1}</li>
                    <li>• {ui.mockupSwotS_2}</li>
                    <li>• {ui.mockupSwotS_3}</li>
                  </ul>
                </div>
                <div className="cursor-pointer hover:scale-[1.02] transition-transform p-6 rounded-2xl border border-red-500/30 bg-red-500/10 hover:border-red-400/60">
                  <h5 className="font-bold text-red-400 mb-3 text-lg">{ui.mockupSwotW_Title}</h5>
                  <ul className="text-zinc-300 space-y-2 text-sm">
                    <li>• {ui.mockupSwotW_1}</li>
                    <li>• {ui.mockupSwotW_2}</li>
                    <li>• {ui.mockupSwotW_3}</li>
                  </ul>
                </div>
                <div className="cursor-pointer hover:scale-[1.02] transition-transform p-6 rounded-2xl border border-blue-500/30 bg-blue-500/10 hover:border-blue-400/60">
                  <h5 className="font-bold text-blue-400 mb-3 text-lg">{ui.mockupSwotO_Title}</h5>
                  <ul className="text-zinc-300 space-y-2 text-sm">
                    <li>• {ui.mockupSwotO_1}</li>
                    <li>• {ui.mockupSwotO_2}</li>
                    <li>• {ui.mockupSwotO_3}</li>
                  </ul>
                </div>
                <div className="cursor-pointer hover:scale-[1.02] transition-transform p-6 rounded-2xl border border-orange-500/30 bg-orange-500/10 hover:border-orange-400/60">
                  <h5 className="font-bold text-orange-400 mb-3 text-lg">{ui.mockupSwotT_Title}</h5>
                  <ul className="text-zinc-300 space-y-2 text-sm">
                    <li>• {ui.mockupSwotT_1}</li>
                    <li>• {ui.mockupSwotT_2}</li>
                    <li>• {ui.mockupSwotT_3}</li>
                  </ul>
                </div>
              </div>
            )}

            {innerMockupTab === ui.mockupBudget && (
              <div className="animate-in slide-in-from-bottom-2 bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800">
                <h5 className="font-bold text-emerald-400 mb-6 text-lg">Buget de Investiții Inițiale</h5>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-zinc-800">
                    <span className="text-zinc-400">Echipamente (Espressor, Râșnițe)</span>
                    <span className="font-mono text-zinc-200">62.000 lei</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-zinc-800">
                    <span className="text-zinc-400">Amenajare locație &amp; Design</span>
                    <span className="font-mono text-zinc-850">85.000 lei</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-zinc-800">
                    <span className="text-zinc-400">Stoc inițial marfă &amp; Consumabile</span>
                    <span className="font-mono text-zinc-200">17.000 lei</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-zinc-300 font-bold">Total Investiție Estimată</span>
                    <span className="font-mono text-emerald-400 font-bold text-xl">164.000 lei</span>
                  </div>
                </div>
              </div>
            )}

            {innerMockupTab === ui.mockupStrategy && (
              <div className="animate-in slide-in-from-bottom-2 text-zinc-400 space-y-6">
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0">1</div>
                  <div>
                    <h6 className="text-white font-bold mb-1">{ui.mockupStrategy1_Title}</h6>
                    <p className="text-sm">Campanie Social Media axată pe procesul de amenajare, prezentarea echipei de baristi și dezvăluirea prăjitorului partener.</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0">2</div>
                  <div>
                    <h6 className="text-white font-bold mb-1">{ui.mockupStrategy2_Title}</h6>
                    <p className="text-sm">O săptămână dedicată exclusiv comunității locale și influencerilor din nișa culinară, cu un meniu limitat la 50% reducere.</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0">3</div>
                  <div>
                    <h6 className="text-white font-bold mb-1">Fidelizare B2B</h6>
                    <p className="text-sm">Pachete speciale pentru angajații birourilor din proximitate: badge-uri de companie care oferă 15% discount permanent.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 1: Grafice animate */}
      {mockupTab === 1 && (
        <div className="relative border border-zinc-800/60 rounded-[2.5rem] bg-[#09090b] overflow-hidden shadow-2xl ring-1 ring-white/5 p-8 md:p-12 min-h-[420px] animate-in fade-in duration-300">
          <div>
            <h4 className="text-xl font-bold text-white mb-2">Proiecții Financiare: Anul 1</h4>
            <p className="text-zinc-400 mb-8 text-sm">Estimare a veniturilor și a distribuției costurilor operaționale (în RON).</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Bar Chart */}
              <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800 p-6 flex flex-col justify-between">
                <h5 className="text-emerald-400 font-bold mb-6 text-sm uppercase tracking-wider">Evoluție Venituri</h5>
                <div className="grid grid-cols-4 gap-4 h-48 items-end">
                  {[
                    { val: 30, label: 'T1' },
                    { val: 55, label: 'T2' },
                    { val: 80, label: 'T3' },
                    { val: 95, label: 'T4' }
                  ].map((bar, i) => (
                    <div key={i} className="flex flex-col items-center gap-3 h-full justify-end group">
                      <span className="text-xs text-zinc-500 group-hover:text-white transition-colors opacity-0 group-hover:opacity-100 absolute -translate-y-8 animate-float-number" style={{ animationDelay: `${i * 150 + 500}ms` }}>{bar.val * 5}k lei</span>
                      <div className="w-full bg-zinc-800 rounded-t-xl overflow-hidden flex items-end shadow-inner relative group-hover:bg-zinc-700 transition-colors" style={{ height: '80%' }}>
                        <div
                          className={`w-full rounded-t-xl animate-scale-y ${i === 3 ? 'bg-emerald-400' : i === 2 ? 'bg-emerald-500' : 'bg-emerald-600/80'}`}
                          style={{ height: `${bar.val}%`, animationDelay: `${i * 150}ms` }}
                        ></div>
                      </div>
                      <div className="text-sm font-bold text-zinc-400">{bar.label}</div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Horizontal Bars & Donut */}
              <div className="flex flex-col gap-6">
                <div className="flex-1 bg-zinc-900/50 rounded-2xl border border-zinc-800 p-6">
                  <h5 className="text-orange-400 font-bold mb-4 text-sm uppercase tracking-wider">Distribuție Costuri</h5>
                  {[
                    { label: ui.mockupChartSalaries, w: 85, color: 'bg-orange-500' },
                    { label: 'Chirie & Utilități', w: 60, color: 'bg-orange-400/80' },
                    { label: 'Stoc Marfă', w: 45, color: 'bg-orange-300/60' },
                    { label: ui.mockupChartMarketing, w: 25, color: 'bg-orange-200/40' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 mb-3 last:mb-0 group cursor-pointer">
                      <div className="w-28 text-xs font-semibold text-zinc-400 group-hover:text-zinc-200 transition-colors truncate">{item.label}</div>
                      <div className="flex-1 bg-zinc-800 rounded-full h-3 overflow-hidden shadow-inner">
                        <div className={`${item.color} h-full rounded-full animate-scale-x group-hover:brightness-125`} style={{ width: `${item.w}%`, animationDelay: `${i * 150 + 400}ms` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800 p-6 flex items-center justify-between">
                  <div>
                    <h5 className="text-blue-400 font-bold mb-1 text-sm uppercase tracking-wider">Marjă Profit</h5>
                    <p className="text-3xl font-black text-white">24<span className="text-lg text-zinc-500">%</span></p>
                  </div>
                  <div className="w-24 h-24 rounded-full border-[8px] border-zinc-800 relative flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
                    <div className="absolute inset-0 rounded-full animate-spin-slow" style={{ background: 'conic-gradient(#3b82f6 0% 24%, transparent 24% 100%)' }}></div>
                    <div className="w-16 h-16 bg-[#09090b] rounded-full z-10 flex items-center justify-center">
                      <span className="text-blue-400 text-sm font-bold">T4</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Typing live */}
      {mockupTab === 2 && (
        <div className="relative border border-zinc-800/60 rounded-[2.5rem] bg-[#09090b] overflow-hidden shadow-2xl ring-1 ring-white/5 p-8 md:p-12 min-h-[420px] font-mono animate-in fade-in duration-300">
          <div className="text-sm leading-loose">
            <div className="text-emerald-400 mb-2">{ui.mockupLiveTitle}</div>
            <div className="text-zinc-400">{ui.mockupLiveGen}</div>
            <div className="text-zinc-300 mt-4 pl-4 border-l-2 border-emerald-500/50 animate-in slide-in-from-left-2 duration-500">
              <div className="text-emerald-400 mb-1">{ui.mockupLiveRev}</div>
              <div className="text-zinc-400">{ui.mockupLiveRev1}</div>
              <div className="text-zinc-400">{ui.mockupLiveRev2}</div>
              <div className="text-zinc-400">{ui.mockupLiveRev3}<span className="animate-pulse">_</span></div>
            </div>
            <div className="mt-4 pl-4 border-l-2 border-red-500/40 animate-in slide-in-from-left-2 duration-700 delay-150">
              <div className="text-red-400 mb-1">{ui.mockupLiveCosts}</div>
              <div className="text-zinc-500">{ui.mockupLiveCosts1}</div>
              <div className="text-zinc-500">{ui.mockupLiveCosts2}</div>
            </div>
            <div className="mt-4 pl-4 border-l-2 border-blue-500/40 animate-in slide-in-from-left-2 duration-1000 delay-300">
              <div className="text-blue-400 mb-1">{ui.mockupLiveStatus}</div>
              <div className="flex flex-col gap-3 mt-4">
                {[
                  { label: ui.mockupLiveStat1, w: 100, color: 'bg-emerald-500', text: ui.mockupLiveComplete, textColor: 'text-emerald-400' },
                  { label: ui.mockupLiveStat2, w: 70, color: 'bg-yellow-500', text: '70%', textColor: 'text-yellow-400' },
                  { label: ui.mockupLiveStat3, w: 40, color: 'bg-blue-500', text: '40%', textColor: 'text-blue-400', pulse: true },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 text-xs font-mono">
                    <div className="w-36 text-zinc-400">{item.label}</div>
                    <div className="flex-1 bg-zinc-800/50 h-1.5 rounded-full overflow-hidden">
                      <div className={`${item.color} w-[${item.w}%] h-full`}></div>
                    </div>
                    <div className={`w-16 text-right ${item.textColor} flex items-center justify-end gap-1`}>
                      {item.text} {item.pulse && <span className="animate-pulse">█</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Înainte & După */}
      {mockupTab === 4 && (
        <div className="relative border border-zinc-800/60 rounded-[2.5rem] bg-[#09090b] overflow-hidden shadow-2xl ring-1 ring-white/5 min-h-[420px]">
          <div className="grid grid-cols-2 h-full min-h-[360px]">
            <div className="p-8 border-r border-zinc-800/60 opacity-60">
              <div className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-4">Înainte</div>
              <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 text-zinc-400 text-sm leading-relaxed font-mono">
                &quot;Vreau să deschid o cafenea. Am experiență de 5 ani în domeniu. Nu știu de unde să încep cu planul de afaceri.&quot;
              </div>
            </div>
            <div className="p-8 opacity-50">
              <div className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4">{ui.afterSparkles}</div>
              <div className="flex flex-col gap-2">
                {[
                  ui.swotFull,
                  ui.budget12m,
                  ui.marketStrategy,
                  ui.euFundsEligibility,
                  ui.exportPdfPptx
                ].map((item: string) => (
                  <div key={item} className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2 text-xs text-emerald-300 font-medium">{item}</div>
                ))}
              </div>
            </div>
          </div>
          <div className="absolute top-0 bottom-0 left-1/2 w-px bg-gradient-to-b from-transparent via-emerald-500/50 to-transparent z-10"></div>
        </div>
      )}
    </>
  );
}
