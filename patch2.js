const fs = require('fs');
let code = fs.readFileSync('app/demo/page.tsx', 'utf8');

// Action Bar Lock icon right next to download buttons
// Target:
// <button 
//   type="button"
//   onClick={() => setShowPricingModal(true)}
//   className="flex-none text-xs text-amber-500 hover:text-amber-400 cursor-pointer px-3 h-full rounded-lg flex items-center justify-center hover:bg-zinc-800/50 hover:scale-110 transition-all"
//   title="Deblocheaza Descarcarile Complete (Pachet Standard)"
// >

const target = `onClick={() => setShowPricingModal(true)}
                      className="flex-none text-xs text-amber-500 hover:text-amber-400 cursor-pointer px-3 h-full rounded-lg flex items-center justify-center hover:bg-zinc-800/50 hover:scale-110 transition-all"
                      title="Deblocheaza Descarcarile Complete (Pachet Standard)"`;

const repl = `onClick={() => { if (!user) { setShowAuthModal(true); } else { setShowPricingModal(true); } }}
                      className="flex-none text-xs text-amber-500 hover:text-amber-400 cursor-pointer px-3 h-full rounded-lg flex items-center justify-center hover:bg-zinc-800/50 hover:scale-110 transition-all"
                      title="Deblochează Pachete Tarifare"`;

code = code.replace(target, repl);

fs.writeFileSync('app/demo/page.tsx', code);
