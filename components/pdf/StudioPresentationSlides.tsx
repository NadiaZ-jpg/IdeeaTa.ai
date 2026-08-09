import dynamic from "next/dynamic";
const BudgetPieChart = dynamic(() => import('@/components/BudgetChart').then(mod => mod.BudgetPieChart), { ssr: false });

export function StudioPresentationSlides({ 
  result, 
  ui, 
  locale, 
  currency,
  formatPrice, 
  truncateText, 
  splitTextIntoSlides, 
  formatNumberedText, 
  presentationRef 
}: any) {
  return (
    <>
            {/* DOCUMENT PREZENTARE - Afișat doar la nevoie pentru a fi capturat impecabil */}
            {result && (
              <div className="fixed top-[-9999px] left-[-9999px] w-[1280px] opacity-0 pointer-events-none z-[-50]">
                <div ref={presentationRef} className="flex flex-col gap-10 bg-[#09090b] p-10">
                  {/* Slide 1: Title */}
                  <div className="presentation-slide w-[1280px] h-[720px] bg-[#09090b] text-white flex flex-col justify-center items-center p-20 relative border-[12px] border-zinc-900 box-border">
                    <h1 className="text-8xl font-black text-center mb-10 text-white z-10 font-sans tracking-tight leading-tight">{result.nume}</h1>
                    <h2 className="text-4xl text-center italic text-emerald-400 z-10 w-3/4 leading-relaxed tracking-widest font-sans uppercase">„{result.slogan}”</h2>
                    <div className="absolute bottom-8 right-8 text-zinc-600 font-bold uppercase tracking-widest text-sm">IdeeaTa.ai</div>
                  </div>
      
                  {/* Slide 2: Viziune */}
                  <div className="presentation-slide w-[1280px] h-[720px] bg-[#09090b] text-white flex flex-col justify-center p-24 border-[12px] border-zinc-900 box-border relative">
                    <div className="flex items-center gap-6 mb-12">
                      <div className="w-16 h-2 bg-emerald-500"></div>
                      <h2 className="text-5xl font-black font-sans uppercase tracking-widest text-emerald-400">Viziune și Strategie</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-12 font-sans leading-normal text-zinc-200">
                      <div className="flex flex-col gap-4">
                        <div className="overflow-hidden">
                          <h3 className="text-xl font-bold text-emerald-700 mb-2">Obiective (1 an)</h3>
                          <p className="text-base leading-relaxed text-left">{truncateText(result.viziune_strategie?.obiective_scurt, 280)}</p>
                        </div>
                        <div className="overflow-hidden">
                          <h3 className="text-xl font-bold text-emerald-700 mb-2">Obiective (3-5 ani)</h3>
                          <p className="text-base leading-relaxed text-left">{truncateText(result.viziune_strategie?.obiective_mediu, 280)}</p>
                        </div>
                      </div>
                      <div className="overflow-hidden">
                        <h3 className="text-xl font-bold text-emerald-700 mb-2">Misiune și Valori</h3>
                        <p className="text-base leading-relaxed text-left whitespace-pre-line">{truncateText(formatNumberedText(result.viziune_strategie?.misiune_valori || result.descriere), 500)}</p>
                      </div>
                    </div>
                  </div>
      
                  {/* Slide 2b: Analiza Pietei */}
                  <div className="presentation-slide w-[1280px] h-[720px] bg-[#09090b] text-white flex flex-col justify-center p-24 border-[12px] border-zinc-900 box-border relative">
                    <div className="flex items-center gap-6 mb-8">
                      <div className="w-16 h-2 bg-emerald-500"></div>
                      <h2 className="text-5xl font-black font-sans uppercase tracking-widest text-emerald-400">Analiza Pieței</h2>
                    </div>
                    <div className="flex flex-col gap-6 font-serif leading-normal text-zinc-300 text-left flex-1 overflow-hidden justify-start">
                        <div className="overflow-hidden"><h3 className="text-3xl font-bold text-emerald-500 mb-2">Clienții Țintă</h3>
                        <p className="text-2xl">{truncateText(result.analiza_pietei?.clienti_tinta, 250)}</p></div>
                        <div className="overflow-hidden"><h3 className="text-3xl font-bold text-emerald-500 mb-2">Concurența</h3>
                        <p className="text-2xl">{truncateText(result.analiza_pietei?.concurenta, 250)}</p></div>
                        <div className="overflow-hidden"><h3 className="text-3xl font-bold text-emerald-500 mb-2">Strategia de Marketing</h3>
                        <p className="text-2xl">{truncateText(result.analiza_pietei?.strategie_marketing, 250)}</p></div>
                    </div>
                  </div>
      
                  {/* Slide 3: SWOT - Puncte Tari */}
                  <div className="presentation-slide w-[1280px] h-[720px] bg-[#09090b] flex flex-col px-24 py-16 border-[12px] border-zinc-900 box-border relative">
                    <div className="flex items-center gap-6 mb-8 shrink-0">
                      <div className="w-16 h-2 bg-emerald-500"></div>
                      <h2 className="text-5xl font-black font-sans uppercase tracking-widest text-emerald-400">Analiză Strategica SWOT</h2>
                    </div>
                    <div className="bg-zinc-900/50 p-8 border-l-8 border-emerald-500 flex flex-col gap-6 rounded-3xl flex-1">
                      <h3 className="text-4xl font-black text-white uppercase tracking-widest pb-4 border-b-2 border-zinc-800 shrink-0">Puncte Tari (Strengths)</h3>
                      <div className="grid grid-cols-2 gap-x-12 gap-y-6 flex-1">
                        {result.analiza_swot?.puncte_tari?.slice(0, 8).map((item: any, idx: number) => (
                          <div key={idx} className="flex flex-col gap-2">
                            <h4 className="text-2xl font-bold text-emerald-400 leading-snug">✦ {item.titlu || (typeof item === 'string' ? item : Object.values(item)[0])}</h4>
                            <p className="text-lg text-zinc-300 leading-relaxed max-w-lg text-left">{item.explicatie_tehnica}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
      
                  {/* Slide 4: SWOT - Slabiciuni */}
                  <div className="presentation-slide w-[1280px] h-[720px] bg-[#09090b] flex flex-col px-24 py-16 border-[12px] border-zinc-900 box-border relative">
                    <div className="flex items-center gap-6 mb-8 shrink-0">
                      <div className="w-16 h-2 bg-[#ff4d6d]"></div>
                      <h2 className="text-5xl font-black font-sans uppercase tracking-widest text-[#ff4d6d]">Analiză Strategica SWOT</h2>
                    </div>
                    <div className="bg-zinc-900/50 p-8 border-l-8 border-[#ff4d6d] flex flex-col gap-6 rounded-3xl flex-1">
                      <h3 className="text-4xl font-black text-white uppercase tracking-widest pb-4 border-b-2 border-zinc-800 shrink-0">Slăbiciuni (Weaknesses)</h3>
                      <div className="grid grid-cols-2 gap-x-12 gap-y-6 flex-1">
                        {result.analiza_swot?.puncte_slabe?.slice(0, 8).map((item: any, idx: number) => (
                          <div key={idx} className="flex flex-col gap-2">
                            <h4 className="text-2xl font-bold text-[#ff4d6d] leading-snug">✦ {item.titlu || (typeof item === 'string' ? item : Object.values(item)[0])}</h4>
                            <p className="text-lg text-zinc-300 leading-relaxed max-w-lg">{item.explicatie_tehnica}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
      
                  {/* Slide 5: SWOT - Oportunitati */}
                  <div className="presentation-slide w-[1280px] h-[720px] bg-[#09090b] flex flex-col px-24 py-16 border-[12px] border-zinc-900 box-border relative">
                    <div className="flex items-center gap-6 mb-8 shrink-0">
                      <div className="w-16 h-2 bg-blue-500"></div>
                      <h2 className="text-5xl font-black font-sans uppercase tracking-widest text-blue-400">Analiză Strategica SWOT</h2>
                    </div>
                    <div className="bg-zinc-900/50 p-8 border-l-8 border-blue-500 flex flex-col gap-6 rounded-3xl flex-1">
                      <h3 className="text-4xl font-black text-white uppercase tracking-widest pb-4 border-b-2 border-zinc-800 shrink-0">Oportunități (Opportunities)</h3>
                      <div className="grid grid-cols-2 gap-x-12 gap-y-6 flex-1">
                        {result.analiza_swot?.oportunitati?.slice(0, 8).map((item: any, idx: number) => (
                          <div key={idx} className="flex flex-col gap-2">
                            <h4 className="text-2xl font-bold text-blue-400 leading-snug">✦ {item.titlu || (typeof item === 'string' ? item : Object.values(item)[0])}</h4>
                            <p className="text-lg text-zinc-300 leading-relaxed max-w-lg text-left">{item.explicatie_tehnica}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
      
                  {/* Slide 6: SWOT - Amenintari */}
                  <div className="presentation-slide w-[1280px] h-[720px] bg-[#09090b] flex flex-col px-24 py-16 border-[12px] border-zinc-900 box-border relative">
                    <div className="flex items-center gap-6 mb-8 shrink-0">
                      <div className="w-16 h-2 bg-orange-500"></div>
                      <h2 className="text-5xl font-black font-sans uppercase tracking-widest text-orange-400">Analiză Strategica SWOT</h2>
                    </div>
                    <div className="bg-zinc-900/50 p-8 border-l-8 border-orange-500 flex flex-col gap-6 rounded-3xl flex-1">
                      <h3 className="text-4xl font-black text-white uppercase tracking-widest pb-4 border-b-2 border-zinc-800 shrink-0">Amenințări (Threats)</h3>
                      <div className="grid grid-cols-2 gap-x-12 gap-y-6 flex-1">
                        {result.analiza_swot?.amenintari?.slice(0, 8).map((item: any, idx: number) => (
                          <div key={idx} className="flex flex-col gap-2">
                            <h4 className="text-2xl font-bold text-orange-400 leading-snug">✦ {item.titlu || (typeof item === 'string' ? item : Object.values(item)[0])}</h4>
                            <p className="text-lg text-zinc-300 leading-relaxed max-w-lg text-left">{item.explicatie_tehnica}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
      
                  {/* Slide Key Features */}
                  <div className="presentation-slide w-[1280px] h-[720px] bg-[#09090b] flex flex-col px-24 py-16 border-[12px] border-zinc-900 box-border relative">
                    <div className="flex items-center gap-6 mb-8 shrink-0">
                      <div className="w-16 h-2 bg-emerald-500"></div>
                      <h2 className="text-5xl font-black font-sans uppercase tracking-widest text-emerald-400">Planul Operațional</h2>
                    </div>
                    <div className="bg-zinc-900/50 p-8 border-l-8 border-emerald-500 flex flex-col gap-6 rounded-3xl flex-1">
                      <div className="flex flex-col gap-6 flex-1 pl-4 text-left">
                          <div className="flex flex-col gap-2">
                            <h4 className="text-2xl font-bold text-emerald-400 leading-snug">1. Descriere Flux (Sustenabilitate / Verde)</h4>
                            <p className="text-lg text-zinc-300 leading-relaxed">{result.plan_operational?.descriere_flux}</p>
                          </div>
                          <div className="flex flex-col gap-2">
                            <h4 className="text-2xl font-bold text-emerald-400 leading-snug">2. Resurse Umane</h4>
                            <p className="text-lg text-zinc-300 leading-relaxed">{result.plan_operational?.resurse_umane}</p>
                          </div>
                          <div className="flex flex-col gap-2">
                            <h4 className="text-2xl font-bold text-emerald-400 leading-snug">3. Locație și Dotări</h4>
                            <p className="text-lg text-zinc-300 leading-relaxed">{result.plan_operational?.locatie_dotari}</p>
                          </div>
                      </div>
                    </div>
                  </div>
      
                  {/* Slide 7: Buget */}
                  <div className="presentation-slide w-[1280px] h-[720px] bg-[#09090b] flex flex-col p-24 border-[12px] border-zinc-900 box-border relative">
                    <div className="flex items-center gap-6 mb-12 shrink-0">
                      <div className="w-16 h-2 bg-emerald-500"></div>
                      <h2 className="text-5xl font-black font-sans uppercase tracking-widest text-emerald-400">Buget Investiții</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-x-12 gap-y-8 font-sans items-start content-start">
                      {[...(result.plan_financiar?.buget_investitii || [])].sort((a: any, b: any) =>
                        parseInt((b.cost !== undefined ? b.cost : b.suma_lei)?.toString().replace(/[^0-9]/g, '') || '0') -
                        parseInt((a.cost !== undefined ? a.cost : a.suma_lei)?.toString().replace(/[^0-9]/g, '') || '0')
                      ).slice(0, 8).map((b: any, i: number) => {
                        const itemTitle = b.item || b.categorie || b.nume || "Investiție";
                        const itemCost = b.cost !== undefined ? b.cost : b.suma_lei;
                        const itemExplicatie = b.explicatie || b.detalii || "";
                        return (
                          <div key={i} className="flex flex-col gap-3 bg-zinc-900/50 p-6 border-l-4 border-emerald-500 rounded-2xl">
                            <div className="flex justify-between items-start gap-4">
                              <h4 className="text-2xl font-bold text-zinc-100 flex-1 leading-tight uppercase font-sans tracking-wide">{itemTitle}</h4>
                              <span className="text-2xl font-black text-emerald-400 whitespace-nowrap bg-black px-4 py-1.5 rounded-xl border border-zinc-800">{formatPrice(itemCost)}</span>
                            </div>
                            <p className="text-xl text-zinc-400 leading-snug italic">{itemExplicatie}</p>
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="absolute bottom-12 right-24">
                       <div className="bg-emerald-600 text-white px-12 py-6 flex items-center rounded-3xl shadow-2xl">
                         <span className="text-3xl font-bold uppercase tracking-wider mr-6">Total Estimat:</span>
                         <span className="text-5xl font-black text-zinc-900">
                           {formatPrice(`${result.plan_financiar?.buget_investitii?.reduce((sum: number, b: any) =>
                             sum + parseInt((b.cost !== undefined ? b.cost : b.suma_lei)?.toString().replace(/[^0-9]/g, '') || '0'), 0)} ${currency || (locale === "en" || locale === "es" ? "EUR" : "LEI")}`)}
                         </span>
                       </div>
                    </div>
                  </div>
      
                  {/* Slide 8: Buget Chart */}
                  <div className="presentation-slide w-[1280px] h-[720px] bg-[#09090b] flex flex-col p-24 border-[12px] border-zinc-900 box-border relative">
                    <div className="flex items-center gap-6 mb-12 shrink-0">
                      <div className="w-16 h-2 bg-emerald-500"></div>
                      <h2 className="text-5xl font-black font-sans uppercase tracking-widest text-emerald-400">{ui.costDistribution}</h2>
                    </div>
                    <div className="flex-1 w-full bg-zinc-900/50 p-8 rounded-3xl border border-zinc-800">
                        <BudgetPieChart budget={result.plan_financiar?.buget_investitii} currency={currency} locale={locale} />
                    </div>
                  </div>
      
                  {/* Custom Sections Slides (Dark Mode) */}
                  {result.sectiuni_aditionale?.flatMap((sec: any, secIdx: number) => {
                    if (!sec || !sec.continut) return [];
                    const slides = splitTextIntoSlides(sec.continut, 1800);
                    return slides.map((slideContent: any, slideIdx: number) => (
                      <div key={`pdf-custom-dark-${secIdx}-${slideIdx}`} className="presentation-slide w-[1280px] h-[720px] bg-[#09090b] flex flex-col p-24 border-[12px] border-zinc-900 box-border relative overflow-hidden">
                        <div className="flex items-center gap-6 mb-8 shrink-0">
                          <div className="w-16 h-2 bg-emerald-500"></div>
                          <h2 className="text-3xl font-black font-sans uppercase tracking-widest text-emerald-400 line-clamp-1">
                            {sec.titlu || 'Secțiune Adițională'} {slides.length > 1 ? `(Partea ${slideIdx + 1})` : ''}
                          </h2>
                        </div>
                        <div className="flex-1 w-full bg-zinc-900/50 p-8 rounded-3xl border border-zinc-800 overflow-hidden">
                          <p className="text-zinc-300 text-base italic leading-relaxed whitespace-pre-line">
                            {formatNumberedText(slideContent)}
                          </p>
                        </div>
                      </div>
                    ));
                  })}
                </div>
              </div>
            )}
    </>
  );
}
