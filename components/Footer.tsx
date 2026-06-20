import Link from 'next/link';

export function Footer() {
  return (
    <footer className="w-full border-t border-zinc-800 bg-[#09090b] py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col items-center md:items-start gap-2">
          <div className="text-xl font-black tracking-tight text-white flex items-center gap-2">
            <span className="text-emerald-500">💡</span> IdeeaTa.ai
          </div>
          <p className="text-zinc-500 text-sm">© {new Date().getFullYear()} Toate drepturile rezervate.</p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-6 text-sm font-medium text-zinc-400">
          <Link href="/despre-noi" className="hover:text-emerald-400 transition-colors">Despre Noi</Link>
          <Link href="/contact" className="hover:text-emerald-400 transition-colors">Contact</Link>
          <Link href="/termeni" className="hover:text-emerald-400 transition-colors">Termeni și Condiții</Link>
          <Link href="/privacy" className="hover:text-emerald-400 transition-colors">Confidențialitate</Link>
          <Link href="/cookies" className="hover:text-emerald-400 transition-colors">Politica Cookie</Link>
        </div>
      </div>
    </footer>
  );
}
