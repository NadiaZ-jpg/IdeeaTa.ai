const fs = require('fs');
let code = fs.readFileSync('app/demo/page.tsx', 'utf8');

const oldPdf = `<button 
                  onClick={() => downloadAction('pdf')} 
                  disabled={isDownloading !== null}
                  className="flex-none hover:bg-zinc-800 text-[10px] sm:text-[11px] h-full px-3 rounded-lg font-black uppercase tracking-wider transition-all flex items-center justify-center whitespace-nowrap gap-1 cursor-pointer text-zinc-300 hover:text-white"
                >
                  {isDownloading === 'pdf' ? "..." : "⬇ PREZENTARE"}
                </button>
                <div className="w-px h-4 bg-zinc-800 flex-none" />`;
                
const oldPptx = `<button 
                  onClick={() => downloadAction('pptx')} 
                  disabled={isDownloading !== null}
                  className="flex-none hover:bg-zinc-800 text-[10px] sm:text-[11px] h-full px-3 rounded-lg font-black uppercase tracking-wider transition-all flex items-center justify-center whitespace-nowrap gap-1 cursor-pointer text-zinc-300 hover:text-white"
                >
                  {isDownloading === 'pptx' ? "..." : "⬇ BROȘURĂ"}
                </button>
                <div className="w-px h-4 bg-zinc-800 flex-none" />`;
                
const oldWord = `<button 
                  onClick={() => downloadAction('word')} 
                  disabled={isDownloading !== null}
                  className="flex-none hover:bg-zinc-800 text-[10px] sm:text-[11px] h-full px-3 rounded-lg font-black uppercase tracking-wider transition-all flex items-center justify-center whitespace-nowrap gap-1 cursor-pointer text-zinc-300 hover:text-white"
                >
                  {isDownloading === 'word' ? "..." : "⬇ DOCUMENT"}
                </button>`;

const newDownloadBtn = `<button 
                  onClick={() => downloadAction('pdf-summary')} 
                  disabled={isDownloading !== null}
                  className="flex-none bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] sm:text-[11px] h-full px-4 rounded-lg font-black uppercase tracking-wider transition-all flex items-center justify-center whitespace-nowrap gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                >
                  {isDownloading === 'pdf-summary' ? "Se descarcă..." : "🎁 DESCARCĂ SUMAR GRATUIT"}
                </button>`;

code = code.replace(oldPdf, '');
code = code.replace(oldPptx, '');
code = code.replace(oldWord, newDownloadBtn);

code = code.replace(
  /if \(retryCount === 0\) \{\n\s+setLoading\(true\);\n\s+setMessageIndex\(0\);/,
  `if (retryCount === 0) {
      if (typeof window !== "undefined") {
        const count = parseInt(localStorage.getItem("demoGenerateCount") || "0", 10);
        if (count >= 3) {
          setShowLimitModal({show: true, message: "Ai atins limita de 3 generări gratuite. Pentru a continua, te rugăm să creezi un cont gratuit."});
          return;
        }
        localStorage.setItem("demoGenerateCount", (count + 1).toString());
      }
    }

    if (retryCount === 0) {
      setLoading(true);
      setMessageIndex(0);`
);

code = code.replace(
  /} else \{\n\s+setResult\(null\);\n\s+if \(typeof window !== "undefined"\) \{\n\s+localStorage\.removeItem\("current_generated_plan"\);\n\s+\}\n\s+\}/,
  `} else {
          // No reset on refresh for demo
        }`
);

// Sidebar items styling and ordering
const fonduriBtn = `<button 
                        type="button" 
                        onClick={() => {
                          
                          setShowToneOptions(!showToneOptions);
                        }} 
                        disabled={isEditingAi} 
                        className="w-full bg-black hover:bg-zinc-800 border border-zinc-800 rounded-xl px-5 py-4 font-bold text-sm text-zinc-300 transition-all text-left flex items-center justify-between group disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="flex items-center gap-3">
                          <span className="text-emerald-500 group-hover:scale-110 transition-transform">✍️</span>
                          <span>Rescrie tonul</span>
                        </span>`;

// Replace emerald icons with amber icons for the 3 bottom tools
code = code.replace(`<span className="text-emerald-500 group-hover:scale-110 transition-transform">💰</span>`, `<span className="text-amber-500 group-hover:scale-110 transition-transform">💰</span>`);
code = code.replace(`<span className="text-emerald-500 group-hover:scale-110 transition-transform">💡</span>`, `<span className="text-amber-500 group-hover:scale-110 transition-transform">💡</span>`);
code = code.replace(`<span className="text-emerald-500 group-hover:scale-110 transition-transform">✍️</span>`, `<span className="text-amber-500 group-hover:scale-110 transition-transform">✍️</span>`);

// Modify "Optimizat pentru Fonduri"
code = code.replace(
  `                          <span className="text-amber-500 group-hover:scale-110 transition-transform">🇪🇺</span>
                          <span>
                            {isEditingAi ? "Se procesează..." : "Optimizat pentru Fonduri Europene"}
                          </span>
                        </span>
                        {!isStudioPaid && (
                          <span className="text-[10px] bg-amber-500/20 border border-amber-500/40 text-amber-300 px-2 py-0.5 rounded-full font-black uppercase tracking-wider whitespace-nowrap flex items-center gap-1">`,
  `                          <span className="text-emerald-500 group-hover:scale-110 transition-transform">🇪🇺</span>
                          <span>
                            {isEditingAi ? "Se procesează..." : "Optimizat pentru Fonduri Europene"}
                          </span>
                        </span>
                        {!isStudioPaid && (
                          <span className="text-[10px] bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-2 py-0.5 rounded-full font-black uppercase tracking-wider whitespace-nowrap flex items-center gap-1">`
);

// Ensure the PDF generator uses the production domain
code = code.replace(/https:\/\/ideeata\.vercel\.app\//g, 'https://ideeata.ai/');

fs.writeFileSync('app/demo/page.tsx', code);
