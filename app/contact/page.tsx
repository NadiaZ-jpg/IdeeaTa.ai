export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-300 py-24 px-4 sm:px-8 flex items-center justify-center">
      <div className="max-w-2xl w-full mx-auto bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 md:p-12 text-center shadow-2xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-[-50px] left-1/2 -translate-x-1/2 w-[200px] h-[200px] bg-emerald-500/20 blur-[80px] rounded-full pointer-events-none" />

        <h1 className="text-4xl md:text-5xl font-black text-white mb-6 relative z-10">Contactează-ne</h1>
        
        <p className="text-zinc-400 text-lg mb-10 leading-relaxed max-w-lg mx-auto relative z-10">
          Ai o întrebare legată de platformă, întâmpini o problemă tehnică sau vrei să colaborăm? Scrie-ne și îți vom răspunde în cel mai scurt timp!
        </p>

        <div className="bg-[#09090b] border border-zinc-800 rounded-2xl p-6 mb-8 inline-block relative z-10">
          <p className="text-sm text-zinc-500 uppercase tracking-widest font-bold mb-2">E-mail Suport</p>
          <a href="mailto:contact@ideeata.ai" className="text-2xl font-bold text-emerald-400 hover:text-emerald-300 transition-colors">
            contact@ideeata.ai
          </a>
        </div>

        <div className="mt-8 pt-8 border-t border-zinc-800/50 text-zinc-500 text-sm relative z-10">
          <p>Timpul mediu de răspuns este de 24-48 de ore, de luni până vineri.</p>
        </div>
      </div>
    </div>
  );
}
