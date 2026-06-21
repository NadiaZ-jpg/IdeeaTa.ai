import re
import sys

def modify():
    with open('app/demo/page.tsx', 'r', encoding='utf-8') as f:
        code = f.read()

    # 1. Update generate logic (add demo limit, remove credits)
    # Target:
    # if (retryCount === 0) {
    #   setLoading(true);
    #   setMessageIndex(0);
    #   setResult(null);
    #   setIsPaid(false);
    # }
    
    generate_target = r"if \(retryCount === 0\) \{\s*setLoading\(true\);\s*setMessageIndex\(0\);\s*setResult\(null\);\s*setIsPaid\(false\);\s*\}"
    generate_repl = """if (retryCount === 0) {
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
    }"""
    code = re.sub(generate_target, generate_repl, code)

    # 2. Golden Rule useEffect (remove redirect and localStorage reset)
    # Target:
    # } else {
    #   setResult(null);
    #   if (typeof window !== "undefined") {
    #     localStorage.removeItem("current_generated_plan");
    #   }
    # }
    
    useeffect_target = r"\} else \{\s*setResult\(null\);\s*if \(typeof window !== \"undefined\"\) \{\s*localStorage\.removeItem\(\"current_generated_plan\"\);\s*\}\s*\}"
    useeffect_repl = """} else {
        // Regula de Aur: Nu ștergem planul pentru utilizatorii de pe demo
      }"""
    code = re.sub(useeffect_target, useeffect_repl, code)
    
    # 3. Action Bar Download Buttons (Condition on isEditing)
    # Target is the div wrapping the 3 buttons
    action_bar_target = r"""<button \s*onClick=\{\(\) => downloadAction\('pdf'\)\} .*?\{isDownloading === 'word' \? "⏳\.\.\." : "⬇ Document"\}\s*</button>"""
    
    action_bar_repl = """{!isEditing ? (
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
                )}"""
    
    code = re.sub(action_bar_target, action_bar_repl, code, flags=re.DOTALL)
    
    # 4. Action Bar Lock icon right next to download buttons
    # Target:
    # {!isPlanPaid && (
    #   <>
    #     <div className="w-px h-4 bg-zinc-800 flex-none" />
    #     <button 
    #       type="button"
    #       onClick={() => setShowPricingModal(true)}
    
    # We want to change the lock icon button to point to auth modal on Demo if they are not logged in
    lock_target = r"onClick=\{\(\) => setShowPricingModal\(true\)\}"
    lock_repl = r"onClick={() => { if (!user) { setShowAuthModal(true); } else { setShowPricingModal(true); } }}"
    code = re.sub(lock_target, lock_repl, code)

    # 5. Modify sidebar buttons to be "Amber/Pro"
    code = code.replace('<span className="text-emerald-500 group-hover:scale-110 transition-transform">🪄</span>', '<span className="text-amber-500 group-hover:scale-110 transition-transform">🪄</span>')
    code = code.replace('<span className="text-emerald-500 group-hover:scale-110 transition-transform">📉</span>', '<span className="text-amber-500 group-hover:scale-110 transition-transform">📉</span>')
    
    # Update Fonduri Europene
    fonduri_target = r"""<button \s*type="button" \s*onClick=\{\(\) => \{\s*if \(!isStudioPaid\) \{\s*setShowPricingModal\(true\);\s*\} else \{\s*setActiveAiPrompt\(activeAiPrompt\?\.action === "eu_funds_optimization".*?</button>"""
    match_fonduri = re.search(fonduri_target, code, re.DOTALL)
    if match_fonduri:
        fonduri_btn = match_fonduri.group(0)
        # remove it
        code = code.replace(fonduri_btn, '')
        
        # fix colors
        fonduri_btn = fonduri_btn.replace('bg-zinc-900/60 hover:bg-zinc-800/80 border border-amber-500/30 text-amber-300', 'bg-emerald-900/10 hover:bg-emerald-800/20 border border-emerald-500/30 text-emerald-300')
        fonduri_btn = fonduri_btn.replace('text-amber-500 group-hover:scale-110 transition-transform">🇪🇺</span>', 'text-emerald-500 group-hover:scale-110 transition-transform">🇪🇺</span>')
        fonduri_btn = fonduri_btn.replace('text-[10px] bg-amber-500/20 border border-amber-500/40 text-amber-300', 'text-[10px] bg-emerald-500/20 border border-emerald-500/40 text-emerald-300')
        
        # Insert below Plan Profesionist
        profesionist_target = r"""<button type="button" onClick=\{\(\) => \{\s*const isAlreadyAdded = result\?\.sectiuni_aditionale.*?Plan Profesionist \(Investitori/Bănci\).*?</button>"""
        match_prof = re.search(profesionist_target, code, re.DOTALL)
        if match_prof:
            prof_btn = match_prof.group(0)
            code = code.replace(prof_btn, prof_btn + '\n\n' + fonduri_btn)
            
    # 6. Make text non-selectable in the container if !user
    # Look for the container that renders the plan:
    # <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 relative print:max-w-none print:w-full print:block print:gap-0 mt-8 mb-32 pb-32">
    plan_container_target = r'<div className="max-w-\[1200px\] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 relative print:max-w-none print:w-full print:block print:gap-0 mt-8 mb-32 pb-32">'
    plan_container_repl = '<div className={`max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 relative print:max-w-none print:w-full print:block print:gap-0 mt-8 mb-32 pb-32 ${!user ? "select-none" : ""}`}>'
    code = re.sub(plan_container_target, plan_container_repl, code)

    # 7. Update AuthModal text for Studio Editare
    auth_modal_target = r'<p className="text-zinc-400 text-sm mb-6 leading-relaxed">Creează un cont gratuit sau autentifică-te pentru a avea acces la funcțiile avansate și pentru a descărca documentele\.</p>'
    auth_modal_repl = '<p className="text-zinc-400 text-sm mb-6 leading-relaxed">{isEditing ? "Planul tău a prins contur și arată senzațional! 🚀 Pentru a putea descărca documentele complete și pentru a nu-ți pierde progresul, creează un cont gratuit chiar acum." : "Creează un cont gratuit sau autentifică-te pentru a avea acces la funcțiile avansate și pentru a descărca documentele."}</p>'
    code = re.sub(auth_modal_target, auth_modal_repl, code)

    # 8. Force limit modal to exist properly
    # In case there's any issue with limit modal, the generic generate limits are already set above.

    with open('app/demo/page.tsx', 'w', encoding='utf-8') as f:
        f.write(code)

if __name__ == '__main__':
    modify()
