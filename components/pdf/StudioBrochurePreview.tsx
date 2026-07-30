import React from "react";
import dynamic from "next/dynamic";
const BudgetPieChart = dynamic(() => import('@/components/BudgetChart').then(mod => mod.BudgetPieChart), { ssr: false });

export function StudioBrochurePreview({ 
  result, 
  ui, 
  locale, 
  currency, 
  formatPrice, 
  formatNumberedText, 
  isContentCopyProtected, 
  handleContextMenu, 
  brochureRef 
}: any) {
  return (
    <>
                  <div 
                    ref={brochureRef} 
                    className={`bg-[#09090b] border border-zinc-800 p-8 md:p-12 rounded-[2.5rem] shadow-2xl transition-all duration-500 relative ${isContentCopyProtected ? 'select-none' : ''}`}
                    onContextMenu={handleContextMenu}
                  >
      
                  <div className="pdf-section mt-12 mb-10 border-b border-zinc-800 pb-10">
                    <h2 className="text-6xl font-black mb-4 tracking-tight not-italic text-white">
                      {result.nume}
                    </h2>
                    <p className="text-emerald-400 uppercase text-lg font-black tracking-[0.4em] not-italic mt-4">
                      {result.slogan}
                    </p>
                  </div>
      
                  {/* Date Generale & Viziune */}
                  <div id="section-general" className="pdf-section mb-10 bg-zinc-900/50 p-10 rounded-3xl border-l-4 border-emerald-500 shadow-inner print:shadow-none print:bg-transparent print:border-l-4 print:border-emerald-700 print:text-black">
                    <h3 className="text-emerald-400 text-sm font-black uppercase mb-6 tracking-[0.2em]">{ui.sectionGeneral}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-zinc-300 print:text-gray-800">
                      <div className="flex flex-col relative overflow-hidden">
                        <div className="leading-relaxed text-left z-10 relative">
                          <p className="whitespace-pre-line"><strong className="text-white print:text-black block mb-1">{ui.fieldLegalForm}</strong> {result.date_generale?.forma_juridica}</p>
                          <p className="mt-4 whitespace-pre-line"><strong className="text-white print:text-black block mb-1">{ui.fieldCaenCode}</strong> {result.date_generale?.cod_caen}</p>
                          <p className="mt-4 whitespace-pre-line"><strong className="text-white print:text-black block mb-1">{ui.fieldContact}</strong> {result.date_generale?.date_contact}</p>
                        </div>
                        
                        {/* Decorative curved lines to fill empty space */}
                        <div className="mt-auto pt-16 pb-4 w-full flex-grow flex items-end opacity-[0.25] select-none pointer-events-none hidden md:block print:hidden relative h-56 overflow-hidden">
                          <svg viewBox="0 0 500 260" xmlns="http://www.w3.org/2000/svg" className="w-full absolute bottom-[-40px] left-[-20px] transform scale-[1.15]">
                            <defs>
                              <style>{`
                                @keyframes waveShift {
                                  0% { transform: translateX(0px); }
                                  100% { transform: translateX(-60px); }
                                }
                                @keyframes waveShift2 {
                                  0% { transform: translateX(0px); }
                                  100% { transform: translateX(60px); }
                                }
                                .wv1 { animation: waveShift 7s ease-in-out infinite alternate; }
                                .wv2 { animation: waveShift2 9s ease-in-out infinite alternate; }
                                .wv3 { animation: waveShift 11s ease-in-out infinite alternate-reverse; }
                                .wv4 { animation: waveShift2 13s ease-in-out infinite alternate; }
                                .wv5 { animation: waveShift 15s ease-in-out infinite alternate-reverse; }
                              `}</style>
                            </defs>
                            <g className="wv1" stroke="#10b981" strokeWidth="1.2" fill="none" opacity="0.8">
                              <path d="M-60,18 C-10,-10 60,55 130,15 C200,-25 270,60 340,10 C400,-20 460,45 560,12" />
                              <path d="M-60,36 C-5,5 65,70 135,30 C205,-10 275,75 345,25 C405,-5 462,62 560,28" />
                              <path d="M-60,54 C0,22 70,85 140,45 C210,5 280,90 350,40 C410,10 465,78 560,44" />
                            </g>
                            <g className="wv2" stroke="#10b981" strokeWidth="1" fill="none" opacity="0.5">
                              <path d="M-60,72 C5,40 75,100 145,60 C215,20 285,105 355,55 C415,25 468,92 560,60" />
                              <path d="M-60,90 C10,58 80,115 150,75 C220,35 290,118 360,70 C418,40 470,108 560,76" />
                              <path d="M-60,108 C15,76 85,130 155,90 C225,50 295,132 365,85 C422,55 472,124 560,92" />
                            </g>
                            <g className="wv3" stroke="#6ee7b7" strokeWidth="0.8" fill="none" opacity="0.28">
                              <path d="M-60,124 C20,92 90,145 160,105 C230,65 300,148 370,100 C426,70 474,138 560,108" />
                              <path d="M-60,140 C25,108 95,160 165,120 C235,80 305,162 375,115 C430,85 476,152 560,124" />
                              <path d="M-60,156 C30,124 100,175 170,135 C240,95 310,175 380,130 C434,100 478,165 560,140" />
                            </g>
                            <g className="wv4" stroke="#6ee7b7" strokeWidth="0.6" fill="none" opacity="0.15">
                              <path d="M-60,172 C35,140 105,190 175,150 C245,110 315,190 385,145 C440,115 480,180 560,156" />
                              <path d="M-60,188 C40,156 110,205 180,165 C250,125 320,205 390,160 C445,130 484,195 560,172" />
                              <path d="M-60,204 C45,172 115,220 185,180 C255,140 325,220 395,175 C450,145 488,210 560,188" />
                            </g>
                            <g className="wv5" stroke="#34d399" strokeWidth="0.5" fill="none" opacity="0.08">
                              <path d="M-60,220 C50,188 120,235 190,195 C260,155 330,235 400,190 C455,160 492,225 560,204" />
                              <path d="M-60,236 C55,204 125,250 195,210 C265,170 335,250 405,205 C460,175 496,240 560,220" />
                              <path d="M-60,252 C60,220 130,265 200,225 C270,185 340,265 410,220 C465,190 500,255 560,236" />
                            </g>
                          </svg>
                        </div>
                      </div>
                      <div>
                        <p className="whitespace-pre-line"><strong className="text-white print:text-black block mb-1">{ui.fieldObjectives1y}</strong>{formatNumberedText(result.viziune_strategie?.obiective_scurt)}</p>
                        <p className="mt-4 whitespace-pre-line"><strong className="text-white print:text-black block mb-1">{ui.fieldObjectives35y}</strong>{formatNumberedText(result.viziune_strategie?.obiective_mediu)}</p>
                      </div>
                    </div>
                    <div className="mt-6 pt-6 border-t border-zinc-800/50 text-zinc-300 print:border-gray-200 print:text-gray-800 text-left leading-relaxed">
                        <p className="whitespace-pre-line"><strong className="text-white print:text-black">{ui.fieldMissionValues}</strong> {formatNumberedText(result.viziune_strategie?.misiune_valori)}</p>
                    </div>
                  </div>
      
                  {/* Analiza Pietei */}
                  <div id="section-market" className="pdf-section mb-10 bg-zinc-900/50 p-10 rounded-3xl border-l-4 border-emerald-500 shadow-inner print:shadow-none print:bg-transparent print:border-l-4 print:border-emerald-700 print:text-black">
                    <h3 className="text-emerald-400 text-sm font-black uppercase mb-6 tracking-[0.2em]">{ui.sectionMarket}</h3>
                    <div className="space-y-6 text-zinc-300 print:text-gray-800 text-left leading-relaxed">
                      <div><strong className="text-white print:text-black block mb-1">{ui.fieldTargetCustomers}</strong> <span className="italic whitespace-pre-line">{formatNumberedText(result.analiza_pietei?.clienti_tinta)}</span></div>
                      <div><strong className="text-white print:text-black block mb-1">{ui.fieldCompetition}</strong> <span className="italic whitespace-pre-line">{formatNumberedText(result.analiza_pietei?.concurenta)}</span></div>
                      <div><strong className="text-white print:text-black block mb-1">{ui.fieldMarketingStrategy}</strong> <span className="italic whitespace-pre-line">{formatNumberedText(result.analiza_pietei?.strategie_marketing)}</span></div>
                    </div>
                  </div>
                  
                  <div id="section-swot" className="grid grid-cols-1 gap-6 mb-14 print:gap-4">
                    {Object.entries({
                      puncte_tari: {t: ui.swotStrengths, l: ui.swotStrengthsLetter},
                      puncte_slabe: {t: ui.swotWeaknesses, l: ui.swotWeaknessesLetter},
                      oportunitati: {t: ui.swotOpportunities, l: 'O'},
                      amenintari: {t: ui.swotThreats, l: locale === "es" ? 'A' : 'T'}
                    }).map(([key, info]) => (
                      <div key={key} className="pdf-section p-8 rounded-3xl border border-zinc-800/50 bg-black/20 shadow-inner print:break-inside-avoid print:p-0 print:border-none print:shadow-none print:bg-transparent">
                        <div className="flex items-center gap-4 mb-6 print:mb-4">
                          <span className="text-[#960018] bg-black border border-zinc-800 font-black w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-[0_0_10px_rgba(150,0,24,0.15)] print:border-none print:bg-transparent print:shadow-none print:w-auto print:h-auto print:text-emerald-800">{info.l}</span>
                          <h4 className="text-emerald-400 font-black text-sm uppercase tracking-[0.2em] drop-shadow-md print:text-emerald-800 print:drop-shadow-none">{info.t}</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {result.analiza_swot?.[key]?.map((item: any, idx: number) => (
                            <div 
                              key={idx} 
                              className="bg-emerald-950/10 p-5 rounded-2xl border border-emerald-900/30 border-l-4 border-l-emerald-500 shadow-[inset_0_0_20px_rgba(52,211,153,0.05)] transition-all duration-300 hover:bg-[#960018] hover:border-[#ff4d6d] hover:border-l-[#ff4d6d] hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(255,77,109,0.4)] group cursor-default print:border-gray-200 print:border-l-4 print:border-l-emerald-700 print:bg-transparent print:text-black print:break-inside-avoid print:p-3 print:shadow-none"
                            >
                              <span className="text-zinc-100 font-black text-xl block mb-2 group-hover:text-white transition-colors print:text-black uppercase tracking-wider print:text-lg">✦ {item.titlu || item}</span>
                              <p className="text-zinc-400 text-lg italic leading-relaxed text-left group-hover:text-white/90 transition-colors print:text-gray-700 print:text-base whitespace-pre-line">{formatNumberedText(item.explicatie_tehnica)}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
      
                  {/* Operational */}
                  <div id="section-operational" className="pdf-section mb-10 bg-zinc-900/50 p-10 rounded-3xl border-l-4 border-emerald-500 shadow-inner print:shadow-none print:bg-transparent print:border-l-4 print:border-emerald-700 print:text-black">
                    <h3 className="text-emerald-400 text-sm font-black uppercase mb-6 tracking-[0.2em]">{ui.sectionOperational}</h3>
                    <ol className="space-y-6 text-zinc-300 print:text-gray-800 list-decimal pl-6 text-left leading-relaxed">
                      <li className="pl-2"><strong className="text-white print:text-black block mb-1">{ui.fieldTechFlow}</strong> <span className="italic whitespace-pre-line">{formatNumberedText(result.plan_operational?.descriere_flux)}</span></li>
                      <li className="pl-2"><strong className="text-white print:text-black block mb-1">{ui.fieldHumanResources}</strong> <span className="italic whitespace-pre-line">{formatNumberedText(result.plan_operational?.resurse_umane)}</span></li>
                      <li className="pl-2"><strong className="text-white print:text-black block mb-1">{ui.fieldLocationEquipment}</strong> <span className="italic whitespace-pre-line">{formatNumberedText(result.plan_operational?.locatie_dotari)}</span></li>
                    </ol>
                  </div>
      
                  {/* Additional AI Sections */}
                  <div id="section-custom">
                    {result.sectiuni_aditionale?.map((sec: any, idx: number) => (
                      <div id={`custom-section-${idx}`} key={`custom-${idx}`} className="pdf-section mb-10 bg-zinc-900/50 p-10 rounded-3xl border-l-4 border-emerald-500 shadow-inner print:shadow-none print:bg-transparent print:border-l-4 print:border-emerald-700 print:text-black">
                        <h3 className="text-emerald-400 text-sm font-black uppercase mb-6 tracking-[0.2em]">{sec.titlu}</h3>
                        <p className="text-zinc-300 italic text-left leading-relaxed print:text-gray-800 whitespace-pre-line">
                          {formatNumberedText(sec.continut)}
                        </p>
                      </div>
                    ))}
                  </div>
      
                  <div id="section-financial" className="pt-10 border-t border-zinc-800 print:border-none print:pt-4">
                     <h3 className="pdf-section text-emerald-400 text-sm font-black uppercase mb-6 tracking-[0.2em] text-center drop-shadow-md print:text-emerald-800 print:drop-shadow-none">
                       {ui.sectionFinancial}
                     </h3>
                     
                     <div className="pdf-section text-zinc-300 italic text-left leading-relaxed max-w-4xl mx-auto mb-10 print:text-gray-700 whitespace-pre-line">
                       {formatNumberedText(result.plan_financiar?.strategie_financiara)}
                     </div>
      
                     <div className="mb-16" id="docx-chart-container">
                       <h4 className="text-zinc-500 font-bold uppercase tracking-wider mb-6 text-sm">{ui.fieldCostDistribution}</h4>
                       <BudgetPieChart budget={result.plan_financiar?.buget_investitii} currency={currency} locale={locale} />
                     </div>
      
                     <div className="grid grid-cols-1 gap-6 print:gap-3">
                        {[...(result.plan_financiar?.buget_investitii || [])].sort((a: any, b: any) =>
                          parseInt((b.cost !== undefined ? b.cost : b.suma_lei)?.toString().replace(/[^0-9]/g, '') || '0') -
                          parseInt((a.cost !== undefined ? a.cost : a.suma_lei)?.toString().replace(/[^0-9]/g, '') || '0')
                        ).map((b: any, i: number) => {
                          const itemTitle = b.item || b.categorie || b.nume || "Investiție";
                          const itemCost = b.cost !== undefined ? b.cost : b.suma_lei;
                          const itemExplicatie = b.explicatie || b.detalii || "";
                          return (
                            <div 
                              key={i} 
                              className="pdf-section bg-emerald-950/10 p-8 rounded-3xl border border-emerald-900/30 border-l-4 border-l-emerald-500 shadow-[inset_0_0_20px_rgba(52,211,153,0.05)] flex flex-col md:flex-row justify-between items-center gap-8 transition-all duration-300 hover:bg-[#960018] hover:border-[#ff4d6d] hover:border-l-[#ff4d6d] hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(255,77,109,0.4)] group cursor-default print:border-gray-200 print:border-l-4 print:border-l-emerald-700 print:bg-transparent print:text-black print:break-inside-avoid print:p-4 print:shadow-none"
                            >
                              <div className="flex-1">
                                <span className="text-zinc-100 font-black text-xl block mb-3 uppercase tracking-wider group-hover:text-white transition-colors print:text-black print:mb-1 print:text-lg">{itemTitle}</span>
                                <p className="text-zinc-400 text-lg italic leading-relaxed group-hover:text-white/90 transition-colors print:text-gray-700 print:text-base">{itemExplicatie}</p>
                              </div>
                              <div className="bg-zinc-900/80 px-8 py-5 rounded-2xl border border-zinc-800 min-w-[200px] text-center group-hover:bg-black/20 group-hover:border-white/20 transition-colors print:bg-transparent print:border-none print:px-2 print:py-0 print:min-w-0 print:text-right">
                                <span className="text-emerald-400 font-black text-2xl group-hover:text-white transition-colors print:text-emerald-800 print:text-xl">{formatPrice(itemCost)}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                  </div>
                  </div>
    </>
  );
}
