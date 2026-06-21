const fs = require('fs');

let code = fs.readFileSync('app/demo/page.tsx', 'utf8');

// 1. generate logic
const generate_target = /if \(retryCount === 0\) \{\s*setLoading\(true\);\s*setMessageIndex\(0\);\s*setResult\(null\);\s*setIsPaid\(false\);\s*\}/;
const generate_repl = `if (retryCount === 0) {
      if (typeof window !== "undefined") {
        const count = parseInt(localStorage.getItem("demoGenerateCount") || "0", 10);
        if (count >= 3) {
          setShowLimitModal({show: true, message: "Ai atins limita de 3 generări gratuite. Pentru a continua, te rugăm să creezi un cont gratuit."});
          return;
        }
        localStorage.setItem("demoGenerateCount", (count + 1).toString());
      }
      setLoading(true);
      setMessageIndex(0);
      setResult(null);
      setIsPaid(false);
    }`;
code = code.replace(generate_target, generate_repl);

// 2. Golden Rule useEffect
const useeffect_target = /\} else \{\s*setResult\(null\);\s*if \(typeof window !== "undefined"\) \{\s*localStorage\.removeItem\("current_generated_plan"\);\s*\}\s*\}/;
const useeffect_repl = `} else {
        // Regula de Aur: Nu ștergem planul pentru utilizatorii de pe demo
      }`;
code = code.replace(useeffect_target, useeffect_repl);

// 3. Action Bar Download Buttons
const action_bar_target = /<button \s*onClick=\{\(\) => downloadAction\('pdf'\)\}[\s\S]*?\{isDownloading === 'word' \? "⏳\.\.\." : "⬇ Document"\}\s*<\/button>/;
const action_bar_repl = `{!isEditing ? (
                  <button 
                    onClick={() => downloadAction('pdf-summary')} 
                    disabled={isDownloading !== null}
                    className="flex-none bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] sm:text-[12px] h-full px-5 py-2.5 rounded-lg font-black uppercase tracking-wider transition-all flex items-center justify-center whitespace-nowrap gap-2 cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                  >
                    {isDownloading === 'pdf-summary' ? "Se descarcă..." : "🎁 DESCARCĂ SUMAR GRATUIT"}
                  </button>
                ) : (
                  <>
                    <button 
                      onClick={() => setShowAuthModal(true)} 
                      disabled={isDownloading !== null}
                      className="flex-none hover:bg-zinc-800 text-[10px] sm:text-[11px] h-full px-3 py-2.5 rounded-lg font-black uppercase tracking-wider transition-all flex items-center justify-center whitespace-nowrap gap-1 cursor-pointer text-zinc-300 hover:text-white"
                    >
                      {isDownloading === 'pdf' ? "⏳..." : "⬇ Prezentare"}
                    </button>
                    <div className="w-px h-4 bg-zinc-800 flex-none" />
                    <button 
                      onClick={() => setShowAuthModal(true)} 
                      disabled={isDownloading !== null}
                      className="flex-none hover:bg-zinc-800 text-[10px] sm:text-[11px] h-full px-3 py-2.5 rounded-lg font-black uppercase tracking-wider transition-all flex items-center justify-center whitespace-nowrap gap-1 cursor-pointer text-zinc-300 hover:text-white"
                    >
                      {isDownloading === 'pptx' ? "⏳..." : "⬇ Broșură"}
                    </button>
                    <div className="w-px h-4 bg-zinc-800 flex-none" />
                    <button 
                      onClick={() => setShowAuthModal(true)} 
                      disabled={isDownloading !== null}
                      className="flex-none hover:bg-zinc-800 text-[10px] sm:text-[11px] h-full px-3 py-2.5 rounded-lg font-black uppercase tracking-wider transition-all flex items-center justify-center whitespace-nowrap gap-1 cursor-pointer text-zinc-300 hover:text-white"
                    >
                      {isDownloading === 'word' ? "⏳..." : "⬇ Document"}
                    </button>
                  </>
                )}`;
code = code.replace(action_bar_target, action_bar_repl);

// 4. Action Bar Lock icon
const lock_target = /onClick=\{\(\) => setShowPricingModal\(true\)\}/;
const lock_repl = `onClick={() => { if (!user) { setShowAuthModal(true); } else { setShowPricingModal(true); } }}`;
code = code.replace(lock_target, lock_repl);

// 5. Sidebar tools -> Amber
code = code.replace('<span className="text-emerald-500 group-hover:scale-110 transition-transform">🪄</span>', '<span className="text-amber-500 group-hover:scale-110 transition-transform">🪄</span>');
code = code.replace('<span className="text-emerald-500 group-hover:scale-110 transition-transform">📉</span>', '<span className="text-amber-500 group-hover:scale-110 transition-transform">📉</span>');

// Fonduri
const fonduri_target = /<button \s*type="button" \s*onClick=\{\(\) => \{\s*if \(!isStudioPaid\) \{\s*setShowPricingModal\(true\);\s*\} else \{\s*setActiveAiPrompt\(activeAiPrompt\?\.action === "eu_funds_optimization"[\s\S]*?<\/button>/;
const match_fonduri = code.match(fonduri_target);
if (match_fonduri) {
    let fonduri_btn = match_fonduri[0];
    code = code.replace(fonduri_btn, '');
    
    fonduri_btn = fonduri_btn.replace('bg-zinc-900/60 hover:bg-zinc-800/80 border border-amber-500/30 text-amber-300', 'bg-emerald-900/10 hover:bg-emerald-800/20 border border-emerald-500/30 text-emerald-300');
    fonduri_btn = fonduri_btn.replace('text-amber-500 group-hover:scale-110 transition-transform">🇪🇺</span>', 'text-emerald-500 group-hover:scale-110 transition-transform">🇪🇺</span>');
    fonduri_btn = fonduri_btn.replace('text-[10px] bg-amber-500/20 border border-amber-500/40 text-amber-300', 'text-[10px] bg-emerald-500/20 border border-emerald-500/40 text-emerald-300');
    
    const profesionist_target = /<button type="button" onClick=\{\(\) => \{\s*const isAlreadyAdded = result\?\.sectiuni_aditionale[\s\S]*?Plan Profesionist \(Investitori\/Bănci\)[\s\S]*?<\/button>/;
    const match_prof = code.match(profesionist_target);
    if (match_prof) {
        code = code.replace(match_prof[0], match_prof[0] + '\\n\\n' + fonduri_btn);
    }
}

// 6. Non-selectable
const plan_container_target = /<div className="max-w-\[1200px\] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 relative print:max-w-none print:w-full print:block print:gap-0 mt-8 mb-32 pb-32">/;
const plan_container_repl = '<div className={`max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 relative print:max-w-none print:w-full print:block print:gap-0 mt-8 mb-32 pb-32 ${!user ? "select-none" : ""}`}>';
code = code.replace(plan_container_target, plan_container_repl);

// 7. Auth Modal
const auth_modal_target = /<p className="text-zinc-400 text-sm mb-6 leading-relaxed">Creează un cont gratuit sau autentifică-te pentru a avea acces la funcțiile avansate și pentru a descărca documentele\.<\/p>/;
const auth_modal_repl = '<p className="text-zinc-400 text-sm mb-6 leading-relaxed">{isEditing ? "Planul tău a prins contur și arată senzațional! 🚀 Pentru a putea descărca documentele complete și pentru a nu-ți pierde progresul, creează un cont gratuit chiar acum." : "Creează un cont gratuit sau autentifică-te pentru a avea acces la funcțiile avansate și pentru a descărca documentele."}</p>';
code = code.replace(auth_modal_target, auth_modal_repl);

// Fix production URL for PDF
code = code.replace(/https:\/\/ideeata\.vercel\.app\//g, 'https://ideeata.ai/');

fs.writeFileSync('app/demo/page.tsx', code);
