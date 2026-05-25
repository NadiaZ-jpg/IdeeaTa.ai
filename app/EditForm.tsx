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
      className={`${className} focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all`}
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
        
        {/* Left Column (Now Full Width) */}
        <div className="flex flex-col gap-6 w-full">
          <div className="flex flex-col gap-2">
            <label className="text-base text-zinc-400 font-bold uppercase tracking-wider">Nume Afacere</label>
            <input type="text" value={result.nume || ''} onChange={(e) => updateField(['nume'], e.target.value)} className="bg-zinc-900 border border-zinc-700 p-4 rounded-xl text-3xl font-black w-full focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-base text-zinc-400 font-bold uppercase tracking-wider">Slogan</label>
            <input type="text" value={result.slogan || ''} onChange={(e) => updateField(['slogan'], e.target.value)} className="bg-zinc-900 border border-zinc-700 p-4 rounded-xl text-2xl font-bold w-full text-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-base text-zinc-400 font-bold uppercase tracking-wider">Descriere</label>
            <AutoExpandingTextarea rows={6} value={result.descriere || ''} onChange={(e) => updateField(['descriere'], e.target.value)} className="bg-zinc-900 border border-zinc-700 p-4 rounded-xl text-xl w-full leading-relaxed" />
          </div>

          <h3 className="text-2xl font-black mt-6 mb-2">Analiza SWOT</h3>
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

        {/* Right Column (Now Full Width) */}
        <div className="flex flex-col gap-6 w-full">
          <h3 className="text-2xl font-black mb-2">Buget Detaliat</h3>
          {result.buget_detaliat?.map((b: any, idx: number) => (
            <div key={idx} className="flex flex-col gap-2 bg-zinc-800/60 p-4 rounded-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),_0_6px_12px_-4px_rgba(0,0,0,0.6)] border-t border-zinc-700 border-x border-zinc-800 border-b border-black relative group mb-2">
              {removeField && (
                <button title="Șterge acest element" onClick={() => removeField(['buget_detaliat', idx])} className="absolute top-2 right-2 text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 p-1.5 rounded-lg text-xs z-10">
                  🗑️
                </button>
              )}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex flex-col gap-1 flex-1">
                   <label className="text-sm text-zinc-500 uppercase font-bold">Element Buget</label>
                   <input type="text" value={b.item || ''} onChange={(e) => updateField(['buget_detaliat', idx, 'item'], e.target.value)} className="bg-black/80 border border-zinc-700 p-3 rounded-lg text-lg font-bold w-full focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-inner" placeholder="Nume element..." />
                </div>
                <div className="flex flex-col gap-1 w-full md:w-32">
                   <label className="text-sm text-zinc-500 uppercase font-bold">Cost</label>
                   <input type="text" value={b.cost !== undefined ? b.cost : ''} onChange={(e) => updateField(['buget_detaliat', idx, 'cost'], e.target.value)} className="bg-black/80 border border-zinc-700 p-3 rounded-lg text-lg font-bold w-full focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-inner" placeholder="Ex: 500 LEI" />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                   <label className="text-sm text-zinc-500 uppercase font-bold">Explicație</label>
                   <AutoExpandingTextarea rows={2} value={b.explicatie || ''} onChange={(e) => updateField(['buget_detaliat', idx, 'explicatie'], e.target.value)} className="bg-black/80 border border-zinc-700 p-3 rounded-lg text-base w-full shadow-inner" placeholder="Detalii cost..." />
              </div>
            </div>
          ))}

          <h3 className="text-2xl font-black mt-6 mb-2 flex items-center gap-2"><span>⭐</span> Funcționalități Cheie</h3>
          {result.functionalitati_cheie?.map((keyFeature: any, idx: number) => (
            <div key={idx} className="flex flex-col gap-2 bg-emerald-900/30 p-4 rounded-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),_0_6px_12px_-4px_rgba(0,0,0,0.6)] border-t border-emerald-800/80 border-x border-emerald-900/50 border-b border-black relative group mb-2">
              {removeField && (
                <button title="Șterge acest element" onClick={() => removeField(['functionalitati_cheie', idx])} className="absolute top-2 right-2 text-emerald-500/50 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 p-1.5 rounded-lg text-xs z-10">
                  🗑️
                </button>
              )}
              <label className="text-sm text-emerald-500 uppercase font-bold">Titlu</label>
              <input type="text" value={keyFeature.titlu || ''} onChange={(e) => updateField(['functionalitati_cheie', idx, 'titlu'], e.target.value)} className="bg-black/80 border border-emerald-900/50 p-3 rounded-lg text-xl font-bold text-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-inner" placeholder="Titlu funcționalitate..." />
              
              <label className="text-sm text-emerald-500 uppercase font-bold mt-2">Descriere</label>
              <AutoExpandingTextarea rows={2} value={keyFeature.descriere || ''} onChange={(e) => updateField(['functionalitati_cheie', idx, 'descriere'], e.target.value)} className="bg-black/80 border border-emerald-900/50 p-3 rounded-lg text-lg text-zinc-300 w-full shadow-inner" placeholder="Descrierea funcționalității..." />
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
