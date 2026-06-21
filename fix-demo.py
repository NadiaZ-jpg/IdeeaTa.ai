import re
import sys

def modify():
    with open('app/demo/page.tsx', 'r', encoding='utf-8') as f:
        code = f.read()

    # 1. Action Bar replace
    pattern_action = re.compile(r'<button \s*onClick=\{\(\) => downloadAction\(\'pdf\'\)\}.*?\{\s*isDownloading === \'word\'.*?<\/button>', re.DOTALL)
    
    new_btn = """<button 
                    onClick={() => downloadAction('pdf-summary')} 
                    disabled={isDownloading !== null}
                    className="flex-none bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] sm:text-xs h-full px-5 rounded-lg font-black uppercase tracking-wider transition-all flex items-center justify-center whitespace-nowrap gap-2 cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                  >
                    {isDownloading === 'pdf-summary' ? "Se descarcă..." : "🎁 DESCARCĂ SUMAR GRATUIT"}
                  </button>"""
    code = pattern_action.sub(new_btn, code)

    # 2. Extract "Optimizat pentru Fonduri Europene"
    pattern_fonduri = re.compile(r'<button \s*type="button"\s*onClick=\{\(\) => \{\s*(?://.*?\n\s*)*if \(\!isStudioPaid\).*?Optimizat pentru Fonduri Europene.*?</button>', re.DOTALL)
    
    match_fonduri = pattern_fonduri.search(code)
    if match_fonduri:
        fonduri_btn = match_fonduri.group(0)
        code = code.replace(fonduri_btn, '') # remove it from current place
        
        # Modify colors
        fonduri_btn = fonduri_btn.replace('text-amber-500', 'text-emerald-500')
        fonduri_btn = fonduri_btn.replace('bg-amber-500', 'bg-emerald-500')
        fonduri_btn = fonduri_btn.replace('border-amber-500', 'border-emerald-500')
        fonduri_btn = fonduri_btn.replace('text-amber-300', 'text-emerald-300')
        fonduri_btn = fonduri_btn.replace('text-amber-400', 'text-emerald-400')
        
        # Insert after Plan Profesionist
        pattern_plan_prof = re.compile(r'<button type="button" onClick=\{\(\) => \{\s*//.*?\s*const isAlreadyAdded.*?Plan Profesionist \(Investitori/Bănci\).*?</button>', re.DOTALL)
        
        match_plan_prof = pattern_plan_prof.search(code)
        if match_plan_prof:
            plan_prof_btn = match_plan_prof.group(0)
            code = code.replace(plan_prof_btn, plan_prof_btn + '\n\n                      ' + fonduri_btn)

    with open('app/demo/page.tsx', 'w', encoding='utf-8') as f:
        f.write(code)

if __name__ == '__main__':
    modify()
