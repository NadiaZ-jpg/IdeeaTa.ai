import Link from 'next/link';

export default function TermeniPage() {
  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-300 py-24 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto prose prose-invert prose-emerald text-justify">
        <h1>Termeni și Condiții pentru IdeeaTa.ai</h1>
        <p><strong>Ultima actualizare:</strong> Iunie 2026</p>
        
        <p>Bine ați venit pe <strong>IdeeaTa.ai</strong>! Acești Termeni și Condiții guvernează accesul și utilizarea platformei web IdeeaTa.ai și a serviciilor asociate. Accesând sau utilizând platforma noastră, sunteți de acord să respectați acești Termeni. Dacă nu sunteți de acord cu ei, vă rugăm să nu utilizați serviciul.</p>

        <h2>1. Descrierea Serviciului</h2>
        <p>IdeeaTa.ai este o platformă Software-as-a-Service (SaaS) bazată pe Inteligență Artificială care ajută antreprenorii să genereze modele, structuri și concepte de planuri de afaceri, bugete estimative și analize SWOT.</p>

        <h2>2. Disclaimer și Lipsa Garanțiilor Comerciale / Financiare</h2>
        <div className="bg-red-950/30 border border-red-900/50 p-4 rounded-xl my-6">
          <p className="text-red-400 font-bold mt-0 mb-2">IMPORTANT</p>
          <p className="mb-0">IdeeaTa.ai este un instrument <strong>strict orientativ și educațional</strong>. Nu suntem consultanți financiari, avocați sau contabili.</p>
        </div>
        <ul>
          <li><strong>Fără garanții de succes:</strong> Nu garantăm că aplicarea ideilor sau planurilor de afaceri generate pe această platformă va aduce profit, finanțare sau succes comercial.</li>
          <li><strong>Precizia Datelor (AI):</strong> Informațiile, estimările bugetare și previziunile financiare sunt generate de un algoritm de Inteligență Artificială pe baza unor medii generale ale pieței. Nu ne asumăm răspunderea pentru acuratețea acestor estimări. Este responsabilitatea dumneavoastră exclusivă să validați planul cu experți autorizați înainte de a investi bani sau a solicita fonduri.</li>
        </ul>

        <h2>3. Contul de Utilizator</h2>
        <p>Pentru a utiliza anumite funcții (cum ar fi salvarea planurilor sau funcțiile premium), trebuie să vă creați un cont autentificat prin Google, Facebook sau Email.</p>
        <ul>
          <li>Sunteți responsabil pentru confidențialitatea datelor de autentificare.</li>
          <li>Ne rezervăm dreptul de a suspenda conturile care abuzează de sistem (ex: generarea automată/spam de documente pentru a epuiza resursele AI-ului).</li>
        </ul>

        <h2>4. Plăți și Politica de Rambursare (Refunds)</h2>
        <ul>
          <li><strong>Procesarea Plăților:</strong> Plățile pentru deblocarea funcționalităților premium (ex: „Studio AI Interactiv”, exporturi speciale) sunt procesate securizat exclusiv prin partenerul nostru <strong>Stripe</strong>.</li>
          <li><strong>Fără Rambursări (No Refunds):</strong> Datorită naturii digitale și consumabile ale serviciilor noastre (costuri irecuperabile de procesare AI pentru fiecare generare), <strong>toate achizițiile sunt finale</strong>. Nu se oferă rambursări după ce planul sau deblocarea funcțiilor a fost realizată, cu excepția cazului în care serviciul a fost indisponibil tehnic din cauza noastră.</li>
        </ul>

        <h2>5. Proprietate Intelectuală</h2>
        <ul>
          <li><strong>Datele Generate:</strong> Deveniți proprietarul documentelor (PDF, DOCX, PPTX) și al textelor pe care le descărcați și le puteți folosi în orice scop comercial sau personal doriți.</li>
          <li><strong>Platforma:</strong> Codul sursă, design-ul, interfața grafică și brandul „IdeeaTa.ai” ne aparțin în totalitate și nu pot fi copiate sau reproduse.</li>
        </ul>

        <h2>6. Limitarea Răspunderii</h2>
        <p>IdeeaTa.ai nu va fi răspunzătoare pentru nicio daună directă, indirectă, incidentală, sau pierderi de profit, reputație sau date care rezultă din:</p>
        <ul>
          <li>Utilizarea sau incapacitatea de a utiliza serviciul.</li>
          <li>Acționarea în baza planurilor financiare generate de sistem.</li>
          <li>Accesul neautorizat la serverele noastre unde sunt stocate planurile dumneavoastră.</li>
        </ul>

        <h2>7. Modificări ale Termenilor</h2>
        <p>Ne rezervăm dreptul de a modifica acești termeni în orice moment. Modificările semnificative vor fi notificate pe platformă. Continuarea utilizării după modificare reprezintă acceptul dumneavoastră.</p>

        <h2>8. Date de Contact</h2>
        <p>Pentru orice întrebări referitoare la acești Termeni, vă rugăm să ne contactați la: <a href="mailto:contact@ideeata.ai" className="text-emerald-400">contact@ideeata.ai</a>.</p>
        
        <div className="flex justify-center mt-12 mb-12">
          <Link href="/start" className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-emerald-900/30 no-underline">
            Validează-ți ideea chiar acum
          </Link>
        </div>
      </div>
    </div>
  );
}
