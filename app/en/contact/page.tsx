import Link from 'next/link';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-300 py-24 px-4 sm:px-8 flex items-center justify-center">
      <div className="max-w-2xl w-full mx-auto bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 md:p-12 text-center shadow-2xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-[-50px] left-1/2 -translate-x-1/2 w-[200px] h-[200px] bg-emerald-500/20 blur-[80px] rounded-full pointer-events-none" />

        <h1 className="text-4xl md:text-5xl font-black text-white mb-6 relative z-10">Contact Us</h1>
        
        <p className="text-zinc-400 text-lg mb-10 leading-relaxed max-w-lg mx-auto relative z-10 text-justify">
          Do you have a question about the platform, encountered a technical issue, or want to collaborate? Write to us and we will get back to you as soon as possible!
        </p>

        <div className="bg-[#09090b] border border-zinc-800 rounded-2xl p-6 mb-8 inline-block relative z-10">
          <p className="text-sm text-zinc-500 uppercase tracking-widest font-bold mb-2">Support Email</p>
          <a href="mailto:contact@ideeata.ai" className="text-2xl font-bold text-emerald-400 hover:text-emerald-300 transition-colors">
            contact@ideeata.ai
          </a>
        </div>

        <div className="mt-8 pt-8 border-t border-zinc-800/50 text-zinc-500 text-sm relative z-10 mb-8">
          <p className="text-justify">The average response time is 24-48 hours, Monday to Friday.</p>
        </div>

        <div className="flex justify-center relative z-10">
          <Link href="/en/demo" className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-emerald-900/30 no-underline">
            Validate your idea right now
          </Link>
        </div>
      </div>
    </div>
  );
}
