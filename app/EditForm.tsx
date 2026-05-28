import { useEffect, useRef } from "react";

function AutoExpandingTextarea({ value, onChange, className, rows = 2, placeholder }: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  className?: string;
  rows?: number;
  placeholder?: string;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={onChange}
      className={`${className} text-justify focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all`}
      rows={rows}
      placeholder={placeholder}
      style={{ resize: "none", overflow: "hidden" }}
    />
  );
}

export function EditForm({ result, updateField, removeField }: { result: any, updateField: (path: (string|number)[], value: string) => void, removeField?: (path: (string|number)[]) => void }) {
  if (!result) return null;
  
  return (
    <div className="bg-[#09090b] border border-zinc-800 p-8 md:p-12 rounded-[2.5rem] shadow-2xl flex flex-col gap-8 w-full text-white animate-in zoom-in-95 duration-300">
      <h2 className="text-3xl font-black">✏️ Editează Planul de Afaceri</h2>
      
      <div className="flex flex-col gap-8 items-stretch w-full">
        
        {/* Date Generale & Viziune */}
        <div className="flex flex-col gap-6 w-full">
          <h3 className="text-2xl font-black mb-2 text-emerald-400">I & II. Date Generale și Viziune</h3>
          <div className="flex flex-col gap-2">
            <label className="text-base text-zinc-400 font-bold uppercase tracking-wider">Nume Afacere</label>
            <input type="text" value={result.nume || ''} onChange={(e) => updateField(['nume'], e.target.value)} className="bg-zinc-900 border border-zinc-700 p-4 rounded-xl text-3xl font-black w-full focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-base text-zinc-400 font-bold uppercase tracking-wider">Slogan</label>
            <input type="text" value={result.slogan || ''} onChange={(e) => updateField(['slogan'], e.target.value)} className="bg-zinc-900 border border-zinc-700 p-4 rounded-xl text-2xl font-bold w-full text-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm text-zinc-400 font-bold uppercase tracking-wider">Forma Juridică</label>
              <input type="text" value={result.date_generale?.forma_juridica || ''} onChange={(e) => updateField(['date_generale', 'forma_juridica'], e.target.value)} className="bg-zinc-900 border border-zinc-700 p-3 rounded-lg text-lg w-full focus:outline-none focus:ring-1 focus:ring-emerald-500" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm text-zinc-400 font-bold uppercase tracking-wider">Cod CAEN</label>
              <input type="text" value={result.date_generale?.cod_caen || ''} onChange={(e) => updateField(['date_generale', 'cod_caen'], e.target.value)} className="bg-zinc-900 border border-zinc-700 p-3 rounded-lg text-lg w-full focus:outline-none focus:ring-1 focus:ring-emerald-500" />
            </div>
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-sm text-zinc-400 font-bold uppercase tracking-wider">Date Contact / Reprezentant</label>
              <input type="text" value={result.date_generale?.date_contact || ''} onChange={(e) => updateField(['date_generale', 'date_contact'], e.target.value)} className="bg-zinc-900 border border-zinc-700 p-3 rounded-lg text-lg w-full focus:outline-none focus:ring-1 focus:ring-emerald-500" />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-zinc-400 font-bold uppercase tracking-wider">Obiective pe Termen Scurt</label>
            <AutoExpandingTextarea rows={2} value={result.viziune_strategie?.obiective_scurt || ''} onChange={(e) => updateField(['viziune_strategie', 'obiective_scurt'], e.target.value)} className="bg-zinc-900 border border-zinc-700 p-4 rounded-xl text-lg w-full leading-relaxed" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-zinc-400 font-bold uppercase tracking-wider">Obiective pe Termen Mediu</label>
            <AutoExpandingTextarea rows={2} value={result.viziune_strategie?.obiective_mediu || ''} onChange={(e) => updateField(['viziune_strategie', 'obiective_mediu'], e.target.value)} className="bg-zinc-900 border border-zinc-700 p-4 rounded-xl text-lg w-full leading-relaxed" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-zinc-400 font-bold uppercase tracking-wider">Misiune și Valori</label>
            <AutoExpandingTextarea rows={3} value={result.viziune_strategie?.misiune_valori || ''} onChange={(e) => updateField(['viziune_strategie', 'misiune_valori'], e.target.value)} className="bg-zinc-900 border border-zinc-700 p-4 rounded-xl text-lg w-full leading-relaxed" />
          </div>
        </div>

        {/* Analiza Pietei */}
        <div className="flex flex-col gap-6 w-full pt-6 border-t border-zinc-800">
          <h3 className="text-2xl font-black mb-2 text-emerald-400">III. Analiza Pieței și Promovarea</h3>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-zinc-400 font-bold uppercase tracking-wider">Clienții Țintă</label>
            <AutoExpandingTextarea rows={3} value={result.analiza_pietei?.clienti_tinta || ''} onChange={(e) => updateField(['analiza_pietei', 'clienti_tinta'], e.target.value)} className="bg-zinc-900 border border-zinc-700 p-4 rounded-xl text-lg w-full leading-relaxed" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-zinc-400 font-bold uppercase tracking-wider">Concurența</label>
            <AutoExpandingTextarea rows={3} value={result.analiza_pietei?.concurenta || ''} onChange={(e) => updateField(['analiza_pietei', 'concurenta'], e.target.value)} className="bg-zinc-900 border border-zinc-700 p-4 rounded-xl text-lg w-full leading-relaxed" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-zinc-400 font-bold uppercase tracking-wider">Strategia de Marketing</label>
            <AutoExpandingTextarea rows={3} value={result.analiza_pietei?.strategie_marketing || ''} onChange={(e) => updateField(['analiza_pietei', 'strategie_marketing'], e.target.value)} className="bg-zinc-900 border border-zinc-700 p-4 rounded-xl text-lg w-full leading-relaxed" />
          </div>
        </div>

        {/* SWOT */}
        <div className="flex flex-col gap-6 w-full pt-6 border-t border-zinc-800">
          <h3 className="text-2xl font-black mb-2 text-emerald-400">IV. Analiza SWOT</h3>
          {["puncte_tari", "puncte_slabe", "oportunitati", "amenintari"].map(cat => (
            <div key={cat} className="flex flex-col gap-4 mb-2">
              <h4 className="text-lg font-bold text-emerald-500 uppercase">{cat.replace('_', ' ')}</h4>
              {result.analiza_swot?.[cat]?.map((item: any, idx: number) => (
                <div key={idx} className="flex flex-col gap-2 bg-zinc-800/60 p-4 rounded-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),_0_6px_12px_-4px_rgba(0,0,0,0.6)] border-t border-zinc-700 border-x border-zinc-800 border-b border-black relative group">
                  {removeField && (
                    <button title="Șterge acest element" onClick={() => removeField(['analiza_swot', cat, idx])} className="absolute top-2 right-2 text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 p-1.5 rounded-lg text-xs z-10">
                      🗑️
                    </button>
                  )}
                  <input type="text" value={item.titlu !== undefined ? item.titlu : (typeof item === 'string' ? item : '')} onChange={(e) => updateField(['analiza_swot', cat, idx, typeof item === 'string' ? ' ' : 'titlu'], e.target.value)} className="bg-black/80 border border-zinc-700 p-3 rounded-lg text-xl font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-inner" placeholder="Titlu element..." />
                  <AutoExpandingTextarea rows={2} value={item.explicatie_tehnica || ''} onChange={(e) => updateField(['analiza_swot', cat, idx, 'explicatie_tehnica'], e.target.value)} className="bg-black/80 border border-zinc-700 p-3 rounded-lg text-lg w-full shadow-inner" placeholder="Explicație..." />
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Operational */}
        <div className="flex flex-col gap-6 w-full pt-6 border-t border-zinc-800">
          <h3 className="text-2xl font-black mb-2 text-emerald-400">V. Planul Operațional și de Management</h3>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-zinc-400 font-bold uppercase tracking-wider">Descriere Flux (incl. Digitalizare & Sustenabilitate)</label>
            <AutoExpandingTextarea rows={4} value={result.plan_operational?.descriere_flux || ''} onChange={(e) => updateField(['plan_operational', 'descriere_flux'], e.target.value)} className="bg-zinc-900 border border-zinc-700 p-4 rounded-xl text-lg w-full leading-relaxed" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-zinc-400 font-bold uppercase tracking-wider">Resurse Umane (Organigramă)</label>
            <AutoExpandingTextarea rows={3} value={result.plan_operational?.resurse_umane || ''} onChange={(e) => updateField(['plan_operational', 'resurse_umane'], e.target.value)} className="bg-zinc-900 border border-zinc-700 p-4 rounded-xl text-lg w-full leading-relaxed" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-zinc-400 font-bold uppercase tracking-wider">Locație și Dotări Necesare</label>
            <AutoExpandingTextarea rows={3} value={result.plan_operational?.locatie_dotari || ''} onChange={(e) => updateField(['plan_operational', 'locatie_dotari'], e.target.value)} className="bg-zinc-900 border border-zinc-700 p-4 rounded-xl text-lg w-full leading-relaxed" />
          </div>
        </div>

        {/* Financiar */}
        <div className="flex flex-col gap-6 w-full pt-6 border-t border-zinc-800">
          <h3 className="text-2xl font-black mb-2 text-emerald-400">VI. Planul Financiar</h3>
          
          <div className="flex flex-col gap-2 mb-6">
            <label className="text-sm text-zinc-400 font-bold uppercase tracking-wider">Strategie Financiară (Cash-Flow / Rentabilitate)</label>
            <AutoExpandingTextarea rows={4} value={result.plan_financiar?.strategie_financiara || ''} onChange={(e) => updateField(['plan_financiar', 'strategie_financiara'], e.target.value)} className="bg-zinc-900 border border-zinc-700 p-4 rounded-xl text-lg w-full leading-relaxed" />
          </div>

          <h4 className="text-xl font-bold mb-2">Buget Investiții</h4>
          {result.plan_financiar?.buget_investitii?.map((b: any, idx: number) => (
            <div key={idx} className="flex flex-col gap-2 bg-zinc-800/60 p-4 rounded-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),_0_6px_12px_-4px_rgba(0,0,0,0.6)] border-t border-zinc-700 border-x border-zinc-800 border-b border-black relative group mb-2">
              {removeField && (
                <button title="Șterge acest element" onClick={() => removeField(['plan_financiar', 'buget_investitii', idx])} className="absolute top-2 right-2 text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 p-1.5 rounded-lg text-xs z-10">
                  🗑️
                </button>
              )}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex flex-col gap-1 flex-1">
                   <label className="text-sm text-zinc-500 uppercase font-bold">Element Buget</label>
                   <input type="text" value={b.item || ''} onChange={(e) => updateField(['plan_financiar', 'buget_investitii', idx, 'item'], e.target.value)} className="bg-black/80 border border-zinc-700 p-3 rounded-lg text-lg font-bold w-full focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-inner" placeholder="Nume element..." />
                </div>
                <div className="flex flex-col gap-1 w-full md:w-32">
                   <label className="text-sm text-zinc-500 uppercase font-bold">Cost estimat</label>
                   <input type="text" value={b.cost !== undefined ? b.cost : ''} onChange={(e) => updateField(['plan_financiar', 'buget_investitii', idx, 'cost'], e.target.value)} className="bg-black/80 border border-zinc-700 p-3 rounded-lg text-lg font-bold w-full focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-inner" placeholder="Ex: 15000 LEI" />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                   <label className="text-sm text-zinc-500 uppercase font-bold">Justificare necesitate</label>
                   <AutoExpandingTextarea rows={2} value={b.explicatie || ''} onChange={(e) => updateField(['plan_financiar', 'buget_investitii', idx, 'explicatie'], e.target.value)} className="bg-black/80 border border-zinc-700 p-3 rounded-lg text-base w-full shadow-inner" placeholder="De ce este necesar? Cum contribuie la afacere?" />
              </div>
            </div>
          ))}

        </div>

      </div>
    </div>
  );
}
