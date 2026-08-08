import React, { useState } from 'react';
import { EXPERT_TEMPLATES, ExpertTemplate, expertModulesAllFilterLabel } from '@/lib/templatesData';

type Locale = "ro" | "en" | "es";

interface ExpertSectionsDrawerProps {
  locale: Locale;
  user: any;
  hasProAccess: boolean;
  isAdmin: boolean;
  businessName: string;
  onRequireAuth: () => void;
  onRequirePro: () => void;
  onAddSection: (newSection: { titlu: string; continut: string }) => void;
  onClose: () => void;
}

export const ExpertSectionsDrawer: React.FC<ExpertSectionsDrawerProps> = ({
  locale,
  user,
  hasProAccess,
  isAdmin,
  businessName,
  onRequireAuth,
  onRequirePro,
  onAddSection,
  onClose
}) => {
  const [selectedExpertCategory, setSelectedExpertCategory] = useState("all");

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[110] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-[#121214] border border-zinc-800 rounded-3xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-[0_0_50px_rgba(16,185,129,0.15)] overflow-hidden">
        {/* Header Drawer */}
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-950/60">
          <div>
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              <span className="text-emerald-400 text-2xl">🏛️</span>
              {locale === "en" ? "Expert Section Library" : locale === "es" ? "Biblioteca de Secciones Expertas" : "Librăria de Secțiuni Experte"}
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              {locale === "en" ? "Select a pre-completed professional module to expand your plan instantly (0 API costs & zero lag)." : locale === "es" ? "Selecciona un módulo profesional precompletado para ampliar tu plan al instante." : "Alege un modul profesional pre-completat pentru extinderea instantanee a planului."}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-9 h-9 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-full font-bold flex items-center justify-center transition-all cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Categories filter */}
        <div className="px-6 py-3 border-b border-zinc-800/80 bg-black/30 flex gap-2 overflow-x-auto no-scrollbar md:flex-wrap md:overflow-visible">
          <button
            onClick={() => setSelectedExpertCategory("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${selectedExpertCategory === "all" ? "bg-emerald-600 text-white" : "bg-zinc-800/60 text-zinc-400 hover:text-white"}`}
          >
            {expertModulesAllFilterLabel(locale)}
          </button>
          {Array.from(new Set(EXPERT_TEMPLATES.map(t => t.category[locale] || t.category.ro))).map((cat, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedExpertCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${selectedExpertCategory === cat ? "bg-emerald-600 text-white" : "bg-zinc-800/60 text-zinc-400 hover:text-white"}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Modules Grid */}
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
          {EXPERT_TEMPLATES.filter(tpl => selectedExpertCategory === "all" || (tpl.category[locale] || tpl.category.ro) === selectedExpertCategory).map((tpl) => (
            <div 
              key={tpl.id}
              className="bg-zinc-900/60 border border-zinc-800 hover:border-emerald-500/50 rounded-2xl p-5 flex flex-col justify-between transition-all group hover:-translate-y-1 hover:shadow-lg"
            >
              <div>
                <span className="text-[10px] uppercase font-black tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md inline-block mb-3 border border-emerald-500/20">
                  {tpl.category[locale] || tpl.category.ro}
                </span>
                <h4 className="text-base font-bold text-white mb-2 leading-snug">
                  {tpl.title[locale] || tpl.title.ro}
                </h4>
                <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                  {tpl.desc[locale] || tpl.desc.ro}
                </p>
              </div>
              <button
                onClick={() => {
                  if (!user) {
                    onRequireAuth();
                    return;
                  }
                  if (!hasProAccess && !isAdmin) {
                    onRequirePro();
                    return;
                  }
                  
                  const rawContent = tpl.content[locale] || tpl.content.ro;
                  const formattedContent = rawContent.replace(/{NUME_AFACERE}/g, businessName);

                  const newSection = {
                    titlu: tpl.title[locale] || tpl.title.ro,
                    continut: formattedContent
                  };

                  onAddSection(newSection);
                  onClose();
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.2)]"
              >
                <span>➕ {locale === "en" ? "Add to Plan" : locale === "es" ? "Añadir al Plan" : "Adaugă în Plan"}</span>
                {(!hasProAccess && !isAdmin) && (
                  <span className="text-[10px] bg-amber-500/30 text-amber-300 px-1.5 py-0.5 rounded font-black">🔒 PRO</span>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
