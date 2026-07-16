import Link from 'next/link';

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-300 py-24 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto prose prose-invert prose-emerald text-justify">
        <h1>Politica de Cookie-uri</h1>
        <p><strong>Ultima actualizare:</strong> Iunie 2026</p>

        <p>Pentru a asigura buna funcționare a platformei <strong>IdeeaTa.ai</strong> și pentru a vă oferi o experiență de utilizare optimă, folosim module cookie și tehnologii similare. Prin accesarea site-ului, sunteți de acord cu utilizarea cookie-urilor conform acestei politici.</p>

        <h2>1. Ce sunt cookie-urile?</h2>
        <p>Cookie-urile sunt fișiere text mici, stocate de browserul dvs. pe dispozitivul de pe care navigați, care ajută site-ul web să vă rețină acțiunile și preferințele (cum ar fi autentificarea în cont sau setările de limbă) pe o perioadă de timp.</p>

        <h2>2. Tipuri de Cookie-uri pe care le utilizăm</h2>
        
        <h3>A. Cookie-uri Strict Necesare (Obligatorii)</h3>
        <p>Aceste cookie-uri sunt esențiale pentru ca aplicația IdeeaTa.ai să funcționeze corect. Ele nu pot fi oprite.</p>
        <ul>
          <li><strong>Autentificare (Firebase):</strong> Mențin sesiunea dumneavoastră activă după ce v-ați logat cu Google sau Facebook. Fără ele, ar trebui să vă logați din nou la fiecare click.</li>
          <li><strong>Procesare Plăți (Stripe):</strong> Stripe utilizează cookie-uri și elemente locale pentru detectarea fraudelor și asigurarea securității datelor bancare în timpul plății.</li>
          <li><strong>Salvarea Temporară a Planului (Local Storage):</strong> Salvăm temporar planul pe care îl scrieți în memoria browserului (Local Storage) pentru ca, dacă închideți accidental fereastra, să nu vă pierdeți munca.</li>
        </ul>

        <h3>B. Cookie-uri Analitice și de Performanță</h3>
        <p>Acestea ne ajută să înțelegem cum interacționează utilizatorii cu aplicația noastră (de exemplu, care sunt cele mai folosite tipuri de grafice sau unde se blochează utilizatorii), pentru a putea îmbunătăți interfața.</p>
        <ul>
          <li>Datele colectate sunt de obicei anonimizate.</li>
        </ul>

        <h3>C. Cookie-uri de Publicitate și Targeting (Google AdSense)</h3>
        <p>Deoarece folosim Google AdSense pentru a susține parțial dezvoltarea platformei:</p>
        <ul>
          <li>Furnizorii terță parte, inclusiv Google, utilizează module cookie pentru a difuza anunțuri pe baza vizitelor anterioare ale dvs. pe acest site sau pe alte site-uri web.</li>
          <li>Cookie-urile de publicitate Google permit partenerilor săi să afișeze anunțuri relevante.</li>
          <li>Puteți renunța la afișarea anunțurilor personalizate (din partea Google) accesând <a href="https://adssettings.google.com/" target="_blank" rel="noreferrer" className="text-emerald-400">Setările pentru Reclame Google</a>.</li>
        </ul>

        <h2>3. Cum Puteți Gestiona Cookie-urile?</h2>
        <ul>
          <li><strong>Din browserul dvs.:</strong> Majoritatea browserelor vă permit să vizualizați, să ștergeți sau să blocați modulele cookie pentru toate site-urile sau doar pentru anumite site-uri. Vă rugăm să rețineți că blocarea cookie-urilor Strict Necesare va face imposibilă logarea în contul dvs. IdeeaTa.ai.</li>
          <li><strong>Opt-out AdSense:</strong> Pe lângă linkul menționat mai sus, puteți folosi site-uri precum www.aboutads.info pentru a renunța la anumite cookie-uri de urmărire folosite de diverși furnizori.</li>
        </ul>

        <h2>4. Modificări</h2>
        <p>Vom actualiza periodic această Politică de Cookie-uri. Orice schimbare va fi valabilă imediat după afișarea variantei revizuite pe site.</p>

        <p><em>Dacă aveți întrebări suplimentare, ne găsiți la: <a href="mailto:contact@ideeata.ai" className="text-emerald-400">contact@ideeata.ai</a>.</em></p>
        
        <div className="flex justify-center mt-12 mb-12">
          <Link href="/demo" className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-emerald-900/30 no-underline">
            Validează-ți ideea chiar acum
          </Link>
        </div>
      </div>
    </div>
  );
}
