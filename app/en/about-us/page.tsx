import Link from 'next/link';

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-300 py-24 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto prose prose-invert prose-emerald">
        <h1 className="text-center text-4xl font-black mb-8">About IdeeaTa.ai</h1>
        
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 mb-12">
          <p className="text-xl text-zinc-300 leading-relaxed m-0 text-center italic">
            "Our mission is to democratize access to professional business planning. We transform the spark of genius in your mind into a concrete business plan in just 2 seconds."
          </p>
        </div>

        <h2>How It All Started</h2>
        <p>We noticed that thousands of early-stage entrepreneurs have fantastic ideas but get stuck in bureaucracy, complicated financial calculations, and the formal drafting of business plans required by investors or banks. Classic consulting takes weeks and costs thousands of euros.</p>
        <p>That is how <strong>IdeeaTa.ai</strong> was born. We combined business expertise with the latest Artificial Intelligence technologies (Google Gemini) to create an assistant capable of structuring, budgeting, and drafting a premium business plan instantly.</p>

        <h2>What We Offer</h2>
        <ul>
          <li><strong>Speed:</strong> The time from idea to final document is reduced to an absolute minimum.</li>
          <li><strong>AI Precision:</strong> We automatically generate SWOT analyses, marketing strategies, and investment budgets.</li>
          <li><strong>Interactive Tools:</strong> Our star feature, the <em>Interactive AI Studio</em>, allows you to adjust the document tone, cut costs, or optimize the plan to attract financing.</li>
          <li><strong>Pitch-Ready Documents:</strong> We export directly to spectacular PDF, editable DOCX (Word), or PPTX (PowerPoint) with interactive charts, exactly as a Business Angel expects to receive them.</li>
        </ul>

        <h2>Our Vision</h2>
        <p>We want to become the #1 digital partner for start-ups in Europe. We believe that no good idea should be lost just because the founder doesn't know how to write a business plan.</p>
        
        <div className="flex justify-center mt-12">
          <Link href="/en/demo" className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-emerald-900/30 no-underline">
            Validate your idea right now
          </Link>
        </div>
      </div>
    </div>
  );
}
