import Link from 'next/link';

export default function DespreNoiPage() {
  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-300 py-24 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto prose prose-invert prose-emerald">
        <h1 className="text-center text-4xl font-black mb-8">Despre IdeeaTa.ai</h1>
        
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 mb-12">
          <p className="text-xl text-zinc-300 leading-relaxed m-0 text-center italic">
            "Misiunea noastră este să democratizăm accesul la planificare de business profesionistă. Transformăm sclipirea de geniu din mintea ta într-un plan de afaceri concret, în doar 2 secunde."
          </p>
        </div>

        <h2>Cum a Început Totul</h2>
        <p>Am observat că mii de antreprenori la început de drum au idei fantastice, dar se blochează în birocrație, în calcule financiare complicate și în redactarea formală a planurilor de afaceri cerute de investitori sau de bănci. Consultanța clasică durează săptămâni și costă mii de euro.</p>
        <p>Așa s-a născut <strong>IdeeaTa.ai</strong>. Am combinat expertiza de business cu cele mai noi tehnologii de Inteligență Artificială (Google Gemini) pentru a crea un asistent capabil să structureze, să dimensioneze financiar și să redacteze un plan de afaceri premium instantaneu.</p>

        <h2>Ce Oferim</h2>
        <ul>
          <li><strong>Viteză:</strong> Timpul de la idee la document final este redus la minim absolut.</li>
          <li><strong>Precizie AI:</strong> Generăm automat analize SWOT, strategii de marketing și bugete de investiții.</li>
          <li><strong>Instrumente Interactive:</strong> Funcția noastră vedetă, <em>Studio AI Interactiv</em>, îți permite să ajustezi tonul documentului, să tai din costuri sau să optimizezi planul pentru atragerea de Fonduri Europene.</li>
          <li><strong>Documente Gata de Pitch:</strong> Exportăm direct în PDF spectaculos, DOCX (Word) editabil sau PPTX (PowerPoint) cu grafice interactive, exact așa cum se așteaptă să le primească un Business Angel.</li>
        </ul>

        <h2>Viziunea Noastră</h2>
        <p>Vrem să devenim partenerul digital nr. 1 pentru start-up-urile din România și, curând, din Europa. Credem că nicio idee bună nu ar trebui să se piardă doar pentru că fondatorul nu știe să scrie un plan de afaceri.</p>
        
        <div className="flex justify-center mt-12">
          <Link href="/demo" className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-emerald-900/30 no-underline">
            Validează-ți ideea chiar acum
          </Link>
        </div>
      </div>
    </div>
  );
}
