import React from "react";
import dynamic from "next/dynamic";
import { getSwotItemExplanation } from "@/lib/normalizePlanResult";

const BudgetPieChart = dynamic(() => import("@/components/BudgetChart").then((mod) => mod.BudgetPieChart), { ssr: false });

export function DemoPdfSlides({ result, ui, locale, currency, formatPrice, truncateText, splitTextIntoSlides, formatNumberedText }: any) {
  return (
    <>
      {/* Slide 1: Titlu */}
      <div className="pdf-presentation-slide w-[1280px] h-[720px] bg-emerald-950 text-white flex flex-col justify-center items-center p-20 relative border-[12px] border-emerald-900 box-border">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_white_0%,_transparent_100%)]"></div>
        <h1 className="text-8xl font-black text-center mb-10 text-emerald-100 z-10 font-sans tracking-tight leading-tight">{result.nume}</h1>
        <h2 className="text-lg text-center italic text-emerald-300 z-10 w-3/4 leading-relaxed font-serif">„{result.slogan}”</h2>
        <div className="absolute bottom-8 right-8 text-emerald-700/50 font-bold uppercase tracking-widest text-sm">IdeeaTa.ai</div>
      </div>

      {/* Slide 2a: Obiective */}
      <div className="pdf-presentation-slide w-[1280px] h-[720px] bg-white text-emerald-950 flex flex-col justify-start pt-20 px-24 pb-16 border-[12px] border-emerald-900 box-border relative">
        <div className="flex items-center gap-6 mb-12">
          <div className="w-16 h-2 bg-emerald-600"></div>
          <h2 className="text-lg font-black font-sans uppercase tracking-widest text-emerald-800">{ui.strategicObjectives}</h2>
        </div>
        <div className="flex flex-col gap-8 font-serif leading-normal text-gray-800 text-left">
          <div className="overflow-hidden">
            <h3 className="text-lg font-bold text-emerald-700 mb-3">{ui.slideObjShort}</h3>
            <p className="text-lg text-gray-700 leading-relaxed">{truncateText(result.viziune_strategie?.obiective_scurt, 800)}</p>
          </div>
          <div className="overflow-hidden">
            <h3 className="text-lg font-bold text-emerald-700 mb-3">{ui.slideObjMedium}</h3>
            <p className="text-lg text-gray-700 leading-relaxed">{truncateText(result.viziune_strategie?.obiective_mediu, 800)}</p>
          </div>
        </div>
      </div>

      {/* Slide 2b: Misiune si Valori */}
      <div className="pdf-presentation-slide w-[1280px] h-[720px] bg-white text-emerald-950 flex flex-col justify-start pt-20 px-24 pb-16 border-[12px] border-emerald-900 box-border relative">
        <div className="flex items-center gap-6 mb-12">
          <div className="w-16 h-2 bg-emerald-600"></div>
          <h2 className="text-lg font-black font-sans uppercase tracking-widest text-emerald-800">{ui.slideMissionValues}</h2>
        </div>
        <div className="flex flex-col font-serif leading-normal text-gray-800 text-left">
          <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-line">{truncateText(formatNumberedText(result.viziune_strategie?.misiune_valori || result.descriere), 1500)}</p>
        </div>
      </div>

      {/* Slide 2c: Analiza Pietei (Clienti si Concurenta) */}
      <div className="pdf-presentation-slide w-[1280px] h-[720px] bg-white text-emerald-950 flex flex-col justify-start pt-20 px-24 pb-16 border-[12px] border-emerald-900 box-border relative">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-16 h-2 bg-emerald-600"></div>
          <h2 className="text-lg font-black font-sans uppercase tracking-widest text-emerald-800">{ui.marketCompetition}</h2>
        </div>
        <div className="flex flex-col gap-10 font-serif leading-normal text-gray-800 text-left">
            <div className="overflow-hidden">
              <h3 className="text-lg font-bold text-emerald-700 mb-3">{ui.slideTargetCustomers}</h3>
              <p className="text-lg text-gray-700 leading-relaxed">{truncateText(result.analiza_pietei?.clienti_tinta, 700)}</p>
            </div>
            <div className="overflow-hidden">
              <h3 className="text-lg font-bold text-emerald-700 mb-3">{ui.slideCompetition}</h3>
              <p className="text-lg text-gray-700 leading-relaxed">{truncateText(result.analiza_pietei?.concurenta, 700)}</p>
            </div>
        </div>
      </div>

      {/* Slide 2d: Strategia de Marketing */}
      <div className="pdf-presentation-slide w-[1280px] h-[720px] bg-white text-emerald-950 flex flex-col justify-start pt-20 px-24 pb-16 border-[12px] border-emerald-900 box-border relative">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-16 h-2 bg-emerald-600"></div>
          <h2 className="text-lg font-black font-sans uppercase tracking-widest text-emerald-800">{ui.promotion}</h2>
        </div>
        <div className="flex flex-col gap-10 font-serif leading-normal text-gray-800 text-left">
            <div className="overflow-hidden">
              <h3 className="text-lg font-bold text-emerald-700 mb-3">{ui.slideMarketingStrategy}</h3>
              <p className="text-lg text-gray-700 leading-relaxed">{truncateText(result.analiza_pietei?.strategie_marketing, 1200)}</p>
            </div>
        </div>
      </div>

      {/* Slide 3: SWOT - Tari */}
      <div className="pdf-presentation-slide w-[1280px] h-[720px] bg-white flex flex-col px-24 py-16 border-[12px] border-emerald-900 box-border relative">
        <div className="flex items-center gap-6 mb-8 shrink-0">
          <div className="w-16 h-2 bg-emerald-500"></div>
          <h2 className="text-lg font-black font-sans uppercase tracking-widest text-emerald-900">{ui.slideSwot}</h2>
        </div>
        <div className="bg-emerald-50/50 p-8 border-l-8 border-emerald-500 flex flex-col gap-6 flex-1 rounded-2xl overflow-hidden">
          <h3 className="text-lg font-black text-emerald-800 uppercase tracking-widest pb-4 border-b-2 border-emerald-200 shrink-0">{ui.slideStrengths}</h3>
          <div className="grid grid-cols-2 gap-x-12 gap-y-6 overflow-hidden content-start flex-1">
            {result.analiza_swot?.puncte_tari?.slice(0, 8).map((item: any, idx: number) => (
              <div key={idx} className="flex flex-col gap-2">
                <h4 className="text-lg font-bold text-emerald-700 leading-snug">✦ {item.titlu || (typeof item === 'string' ? item : Object.values(item)[0])}</h4>
                <p className="text-lg text-gray-600 leading-relaxed max-w-lg text-left">{getSwotItemExplanation(item)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Slide 4: SWOT - Slabe */}
      <div className="pdf-presentation-slide w-[1280px] h-[720px] bg-white flex flex-col px-24 py-16 border-[12px] border-emerald-900 box-border relative">
        <div className="flex items-center gap-6 mb-8 shrink-0">
          <div className="w-16 h-2 bg-[#ff4d6d]"></div>
          <h2 className="text-lg font-black font-sans uppercase tracking-widest text-[#ff4d6d]">{ui.slideSwot}</h2>
        </div>
        <div className="bg-rose-50/50 p-8 border-l-8 border-[#ff4d6d] flex flex-col gap-6 flex-1 rounded-2xl overflow-hidden">
          <h3 className="text-lg font-black text-rose-900 uppercase tracking-widest pb-4 border-b-2 border-rose-200 shrink-0">{ui.slideWeaknesses}</h3>
          <div className="grid grid-cols-2 gap-x-12 gap-y-6 overflow-hidden content-start flex-1">
            {result.analiza_swot?.puncte_slabe?.slice(0, 8).map((item: any, idx: number) => (
              <div key={idx} className="flex flex-col gap-2">
                <h4 className="text-lg font-bold text-[#ff4d6d] leading-snug">✦ {item.titlu || (typeof item === 'string' ? item : Object.values(item)[0])}</h4>
                <p className="text-lg text-gray-600 leading-relaxed max-w-lg text-left">{getSwotItemExplanation(item)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Slide 5: SWOT - Oportunitati */}
      <div className="pdf-presentation-slide w-[1280px] h-[720px] bg-white flex flex-col px-24 py-16 border-[12px] border-emerald-900 box-border relative">
        <div className="flex items-center gap-6 mb-8 shrink-0">
          <div className="w-16 h-2 bg-blue-500"></div>
          <h2 className="text-lg font-black font-sans uppercase tracking-widest text-blue-600">{ui.slideSwot}</h2>
        </div>
        <div className="bg-blue-50/50 p-8 border-l-8 border-blue-500 flex flex-col gap-6 flex-1 rounded-2xl overflow-hidden">
          <h3 className="text-lg font-black text-blue-900 uppercase tracking-widest pb-4 border-b-2 border-blue-200 shrink-0">{ui.slideOpportunities}</h3>
          <div className="grid grid-cols-2 gap-x-12 gap-y-6 overflow-hidden content-start flex-1">
            {result.analiza_swot?.oportunitati?.slice(0, 8).map((item: any, idx: number) => (
              <div key={idx} className="flex flex-col gap-2">
                <h4 className="text-lg font-bold text-blue-600 leading-snug">✦ {item.titlu || (typeof item === 'string' ? item : Object.values(item)[0])}</h4>
                <p className="text-lg text-gray-600 leading-relaxed max-w-lg text-left">{getSwotItemExplanation(item)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Slide 6: SWOT - Amenintari */}
      <div className="pdf-presentation-slide w-[1280px] h-[720px] bg-white flex flex-col px-24 py-16 border-[12px] border-emerald-900 box-border relative">
        <div className="flex items-center gap-6 mb-8 shrink-0">
          <div className="w-16 h-2 bg-orange-500"></div>
          <h2 className="text-lg font-black font-sans uppercase tracking-widest text-orange-600">{ui.slideSwot}</h2>
        </div>
        <div className="bg-orange-50/50 p-8 border-l-8 border-orange-500 flex flex-col gap-6 flex-1 rounded-2xl overflow-hidden">
          <h3 className="text-lg font-black text-orange-900 uppercase tracking-widest pb-4 border-b-2 border-orange-200 shrink-0">{ui.slideThreats}</h3>
          <div className="grid grid-cols-2 gap-x-12 gap-y-6 overflow-hidden content-start flex-1">
            {result.analiza_swot?.amenintari?.slice(0, 8).map((item: any, idx: number) => (
              <div key={idx} className="flex flex-col gap-2">
                <h4 className="text-lg font-bold text-orange-600 leading-snug">✦ {item.titlu || (typeof item === 'string' ? item : Object.values(item)[0])}</h4>
                <p className="text-lg text-gray-600 leading-relaxed max-w-lg text-left">{getSwotItemExplanation(item)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Slide Key Features PDF - Descriere Flux */}
      <div className="pdf-presentation-slide w-[1280px] h-[720px] bg-white flex flex-col px-24 py-16 border-[12px] border-emerald-900 box-border relative">
        <div className="flex items-center gap-6 mb-8 shrink-0">
          <div className="w-16 h-2 bg-emerald-600"></div>
          <h2 className="text-lg font-black font-sans uppercase tracking-widest text-emerald-800">{ui.slideOperationalPlan}</h2>
        </div>
        <div className="bg-emerald-50/50 p-8 border-l-8 border-emerald-500 flex flex-col gap-6 flex-1 rounded-2xl overflow-hidden">
          <div className="flex flex-col gap-6 overflow-hidden content-start flex-1 pl-4 text-left">
              <div className="flex flex-col gap-4">
                 <h4 className="text-lg font-bold text-emerald-700 leading-snug">{"1. " + ui.slideTechFlow}</h4>
                 <p className="text-lg text-gray-700 leading-relaxed">{truncateText(result.plan_operational?.descriere_flux, 1200)}</p>
              </div>
          </div>
        </div>
      </div>

      {/* Slide Key Features PDF - Resurse Umane */}
      <div className="pdf-presentation-slide w-[1280px] h-[720px] bg-white flex flex-col px-24 py-16 border-[12px] border-emerald-900 box-border relative">
        <div className="flex items-center gap-6 mb-8 shrink-0">
          <div className="w-16 h-2 bg-emerald-600"></div>
          <h2 className="text-lg font-black font-sans uppercase tracking-widest text-emerald-800">{ui.slideOperationalPlan}</h2>
        </div>
        <div className="bg-emerald-50/50 p-8 border-l-8 border-emerald-500 flex flex-col gap-6 flex-1 rounded-2xl overflow-hidden">
          <div className="flex flex-col gap-6 overflow-hidden content-start flex-1 pl-4 text-left">
              <div className="flex flex-col gap-4">
                 <h4 className="text-lg font-bold text-emerald-700 leading-snug">{"2. " + ui.slideHumanResources}</h4>
                 <p className="text-lg text-gray-700 leading-relaxed">{truncateText(result.plan_operational?.resurse_umane, 1200)}</p>
              </div>
          </div>
        </div>
      </div>

      {/* Slide Key Features PDF - Locatie */}
      <div className="pdf-presentation-slide w-[1280px] h-[720px] bg-white flex flex-col px-24 py-16 border-[12px] border-emerald-900 box-border relative">
        <div className="flex items-center gap-6 mb-8 shrink-0">
          <div className="w-16 h-2 bg-emerald-600"></div>
          <h2 className="text-lg font-black font-sans uppercase tracking-widest text-emerald-800">{ui.slideOperationalPlan}</h2>
        </div>
        <div className="bg-emerald-50/50 p-8 border-l-8 border-emerald-500 flex flex-col gap-6 flex-1 rounded-2xl overflow-hidden">
          <div className="flex flex-col gap-6 overflow-hidden content-start flex-1 pl-4 text-left">
              <div className="flex flex-col gap-4">
                 <h4 className="text-lg font-bold text-emerald-700 leading-snug">{"3. " + ui.slideLocationEquipment}</h4>
                 <p className="text-lg text-gray-700 leading-relaxed">{truncateText(result.plan_operational?.locatie_dotari, 1200)}</p>
              </div>
          </div>
        </div>
      </div>

      {/* Slide 7: Buget - Chunking */}
      {Array.from({ length: Math.ceil((result.plan_financiar?.buget_investitii?.length || 1) / 4) }).map((_, slideIdx) => (
        <div key={`pdf-budget-${slideIdx}`} className="pdf-presentation-slide w-[1280px] h-[720px] bg-white flex flex-col p-24 border-[12px] border-emerald-900 box-border relative">
          <div className="flex items-center gap-6 mb-12">
            <div className="w-16 h-2 bg-emerald-600"></div>
            <h2 className="text-lg font-black font-sans uppercase tracking-widest text-emerald-800">{ui.investmentBudget} {slideIdx > 0 ? `(${ui.part} ${slideIdx + 1})` : ''}</h2>
          </div>
          <div className="grid grid-cols-2 gap-x-12 gap-y-8 font-sans items-start content-start overflow-hidden">
            {result.plan_financiar?.buget_investitii?.slice(slideIdx * 4, slideIdx * 4 + 4).map((b: any, i: number) => {
              const itemTitle = b.item || b.categorie || b.nume || "Investiție";
              const itemCost = b.cost !== undefined ? b.cost : b.suma_lei;
              const itemExplicatie = b.explicatie || b.detalii || "";
              return (
                <div key={i} className="flex flex-col gap-3 bg-emerald-50/50 p-6 border-l-4 border-emerald-500 rounded-xl min-h-[120px]">
                  <div className="flex justify-between items-start gap-4">
                    <h4 className="text-lg font-bold text-emerald-900 flex-1 leading-tight uppercase tracking-wide line-clamp-1">{itemTitle}</h4>
                    <span className="text-lg font-black text-emerald-700 whitespace-nowrap bg-emerald-100 px-4 py-1.5 rounded-lg border border-emerald-200">{formatPrice(itemCost)}</span>
                  </div>
                  <p className="text-lg text-gray-600 leading-snug italic line-clamp-2">{itemExplicatie}</p>
                </div>
              );
            })}
          </div>
          
          {slideIdx === Math.ceil((result.plan_financiar?.buget_investitii?.length || 1) / 4) - 1 && (
            <div className="absolute bottom-12 right-24">
               <div className="bg-emerald-900 text-white px-12 py-6 flex items-center rounded-2xl shadow-xl">
                 <span className="text-lg font-bold uppercase tracking-wider mr-6 text-emerald-200">{ui.estimatedTotal}</span>
                 <span className="text-lg font-black">{formatPrice(`${result.plan_financiar?.buget_investitii?.reduce((sum: number, b: any) => sum + parseInt((b.cost !== undefined ? b.cost : b.suma_lei)?.toString().replace(/[^0-9]/g, '') || '0'), 0)} ${currency || (locale === "en" || locale === "es" ? "EUR" : "LEI")}`)}</span>
               </div>
            </div>
          )}
        </div>
      ))}

      {/* Slide 8: Buget Chart */}
      <div className="pdf-presentation-slide w-[1280px] h-[720px] bg-white flex flex-col px-24 py-16 border-[12px] border-emerald-900 box-border relative">
        <div className="flex items-center gap-6 mb-8 shrink-0">
          <div className="w-16 h-2 bg-emerald-600"></div>
          <h2 className="text-lg font-black font-sans uppercase tracking-widest text-emerald-800">{ui.fieldCostDistribution}</h2>
        </div>
        <div className="flex-1 w-full bg-emerald-50/50 p-8 rounded-2xl border border-emerald-100">
            <BudgetPieChart budget={result.plan_financiar?.buget_investitii} currency={currency} isPdf={true} locale={locale} />
        </div>
      </div>

      {/* Custom Sections Slides (White Mode) */}
      {result.sectiuni_aditionale?.flatMap((sec: any, secIdx: number) => {
        if (!sec || !sec.continut) return [];
        const slides = splitTextIntoSlides(sec.continut, 1800);
        return slides.map((slideContent: string, slideIdx: number) => (
          <div key={`pdf-custom-white-${secIdx}-${slideIdx}`} className="pdf-presentation-slide w-[1280px] h-[720px] bg-white flex flex-col px-24 py-16 border-[12px] border-emerald-900 box-border relative overflow-hidden">
            <div className="flex items-center gap-6 mb-8 shrink-0">
              <div className="w-16 h-2 bg-emerald-600"></div>
              <h2 className="text-lg font-black font-sans uppercase tracking-widest text-emerald-800 line-clamp-1">
                {sec.titlu || 'Secțiune Adițională'} {slides.length > 1 ? `(Partea ${slideIdx + 1})` : ''}
              </h2>
            </div>
            <div className="flex-1 w-full bg-emerald-50/50 p-8 rounded-2xl border border-emerald-100 overflow-hidden">
              <p className="text-zinc-700 text-base italic leading-relaxed whitespace-pre-line">
                {formatNumberedText(slideContent)}
              </p>
            </div>
          </div>
        ));
      })}

      {/* CTA Slide (For PDF Summary) */}
      <div className="pdf-cta-slide w-[1280px] h-[720px] bg-emerald-950 flex flex-col justify-center items-center p-24 border-[12px] border-emerald-900 box-border relative text-center">
        <h2 className="text-6xl font-black text-white mb-8">{ui.paywallTitle}</h2>
        <p 
          className="text-lg text-emerald-200 mb-12 max-w-4xl leading-relaxed"
          dangerouslySetInnerHTML={{ __html: ui.paywallDesc }}
        />
        <div className="bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-600 border border-emerald-300/30 text-white px-14 py-6 rounded-2xl text-xl font-black uppercase tracking-wider shadow-[0_15px_35px_-5px_rgba(16,185,129,0.4)]">
          {ui.paywallBtn}
        </div>
      </div>

    </>
  );
}
