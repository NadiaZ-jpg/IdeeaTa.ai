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
      className={className}
      rows={rows}
      placeholder={placeholder}
      style={{ resize: "none", overflow: "hidden" }}
    />
  );
}

export function EditForm({ result, updateField }: { result: any, updateField: (path: (string|number)[], value: string) => void }) {
  if (!result) return null;
  
  return (
    <div className="bg-[#09090b] border border-zinc-800 p-8 md:p-12 rounded-[2.5rem] shadow-2xl flex flex-col gap-6 w-full text-white animate-in zoom-in-95 duration-300">
      <h2 className="text-3xl font-black mb-4">✏️ Editează Planul de Afaceri</h2>
      
      <div className="flex flex-col gap-2">
        <label className="text-sm text-zinc-400 font-bold uppercase tracking-wider">Nume Afacere</label>
        <input type="text" value={result.nume || ''} onChange={(e) => updateField(['nume'], e.target.value)} className="bg-zinc-900 border border-zinc-700 p-4 rounded-xl text-xl w-full" />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm text-zinc-400 font-bold uppercase tracking-wider">Slogan</label>
        <input type="text" value={result.slogan || ''} onChange={(e) => updateField(['slogan'], e.target.value)} className="bg-zinc-900 border border-zinc-700 p-4 rounded-xl text-lg w-full text-emerald-400" />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm text-zinc-400 font-bold uppercase tracking-wider">Descriere</label>
        <AutoExpandingTextarea rows={6} value={result.descriere || ''} onChange={(e) => updateField(['descriere'], e.target.value)} className="bg-zinc-900 border border-zinc-700 p-4 rounded-xl text-base w-full leading-relaxed" />
      </div>

      <h3 className="text-2xl font-black mt-8 mb-2">Analiza SWOT</h3>
      
      {["puncte_tari", "puncte_slabe", "oportunitati", "amenintari"].map(cat => (
        <div key={cat} className="flex flex-col gap-4 mb-6">
          <h4 className="text-lg font-bold text-emerald-500 uppercase">{cat.replace('_', ' ')}</h4>
          {result.analiza_swot?.[cat]?.map((item: any, idx: number) => (
            <div key={idx} className="flex flex-col gap-2 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
              <input type="text" value={item.titlu !== undefined ? item.titlu : (typeof item === 'string' ? item : '')} onChange={(e) => updateField(['analiza_swot', cat, idx, typeof item === 'string' ? ' ' : 'titlu'], e.target.value)} className="bg-black border border-zinc-700 p-2 rounded-lg font-bold" />
              <AutoExpandingTextarea rows={2} value={item.explicatie_tehnica || ''} onChange={(e) => updateField(['analiza_swot', cat, idx, 'explicatie_tehnica'], e.target.value)} className="bg-black border border-zinc-700 p-2 rounded-lg text-sm w-full" />
            </div>
          ))}
        </div>
      ))}

      <h3 className="text-2xl font-black mt-8 mb-2">Buget Detaliat</h3>
      {result.buget_detaliat?.map((b: any, idx: number) => (
        <div key={idx} className="flex flex-col gap-2 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 mb-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex flex-col gap-1 flex-1">
               <label className="text-xs text-zinc-500 uppercase font-bold">Element Buget</label>
               <input type="text" value={b.item || ''} onChange={(e) => updateField(['buget_detaliat', idx, 'item'], e.target.value)} className="bg-black border border-zinc-700 p-2 rounded-lg font-bold w-full" />
            </div>
            <div className="flex flex-col gap-1 w-full md:w-32">
               <label className="text-xs text-zinc-500 uppercase font-bold">Cost</label>
               <input type="text" value={b.cost !== undefined ? b.cost : ''} onChange={(e) => updateField(['buget_detaliat', idx, 'cost'], e.target.value)} className="bg-black border border-zinc-700 p-2 rounded-lg font-bold w-full" />
            </div>
          </div>
          <div className="flex flex-col gap-1">
               <label className="text-xs text-zinc-500 uppercase font-bold">Explicație</label>
               <AutoExpandingTextarea rows={2} value={b.explicatie || ''} onChange={(e) => updateField(['buget_detaliat', idx, 'explicatie'], e.target.value)} className="bg-black border border-zinc-700 p-2 rounded-lg text-sm w-full" />
          </div>
        </div>
      ))}

      <h3 className="text-2xl font-black mt-8 mb-2 flex items-center gap-2"><span>⭐</span> Funcționalități Cheie</h3>
      {result.functionalitati_cheie?.map((keyFeature: any, idx: number) => (
        <div key={idx} className="flex flex-col gap-2 bg-emerald-950/20 p-4 rounded-xl border border-emerald-900/50 mb-4 shadow-[inset_0_0_10px_rgba(52,211,153,0.05)]">
          <label className="text-xs text-emerald-500 uppercase font-bold">Titlu</label>
          <input type="text" value={keyFeature.titlu || ''} onChange={(e) => updateField(['functionalitati_cheie', idx, 'titlu'], e.target.value)} className="bg-black border border-emerald-900 form-input p-2 rounded-lg font-bold text-emerald-400" />
          
          <label className="text-xs text-emerald-500 uppercase font-bold mt-2">Descriere</label>
          <AutoExpandingTextarea rows={2} value={keyFeature.descriere || ''} onChange={(e) => updateField(['functionalitati_cheie', idx, 'descriere'], e.target.value)} className="bg-black border border-emerald-900 form-input p-2 rounded-lg text-sm text-zinc-300 w-full" />
        </div>
      ))}
    </div>
  );
}
