import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-300 py-24 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto prose prose-invert prose-emerald text-justify">
        <h1>Politica de Confidențialitate (Privacy Policy)</h1>
        <p><strong>Ultima actualizare:</strong> Iunie 2026</p>

        <p>La <strong>IdeeaTa.ai</strong>, confidențialitatea și securitatea datelor dumneavoastră sunt prioritare. Această Politică de Confidențialitate explică modul în care colectăm, utilizăm, protejăm și, după caz, partajăm datele dumneavoastră personale în conformitate cu Regulamentul General privind Protecția Datelor (GDPR).</p>

        <h2>1. Ce Date Colectăm?</h2>
        <p>Când utilizați IdeeaTa.ai, putem colecta următoarele categorii de date:</p>
        <ul>
          <li><strong>Date de Autentificare și Profil:</strong> Numele, adresa de e-mail, fotografia de profil (atunci când vă autentificați prin Google sau Facebook prin Firebase Auth).</li>
          <li><strong>Datele Generate de Utilizator (User Content):</strong> Ideile de afaceri introduse, planurile de afaceri generate, opțiunile de buget și link-urile distribuite (share). Acestea sunt stocate în siguranță în baza noastră de date Firestore, pentru a vă permite accesul la ele din secțiunea "Contul Meu".</li>
          <li><strong>Date de Tranzacție:</strong> Dacă faceți upgrade la funcții premium, nu colectăm și nu stocăm direct datele cardului dumneavoastră. Toate procesările de plăți sunt realizate securizat de către <strong>Stripe</strong>. Noi primim doar confirmarea plății și un ID de tranzacție.</li>
          <li><strong>Date Tehnice și de Utilizare:</strong> Adresa IP, tipul de browser, dispozitivul folosit și date analitice de bază colectate pentru optimizarea platformei și combaterea abuzurilor (ex: rate limiting).</li>
        </ul>

        <h2>2. Cum Utilizăm Datele Colectate?</h2>
        <ul>
          <li><strong>Pentru a furniza serviciul:</strong> Procesarea ideii dvs. prin intermediul API-urilor AI (Google Gemini) pentru a vă returna planul de afaceri.</li>
          <li><strong>Pentru a salva istoricul:</strong> Stocarea planurilor în Firebase pentru ca dvs. să le puteți accesa și edita ulterior.</li>
          <li><strong>Pentru a procesa plăți:</strong> Validarea accesului la „Studio AI Interactiv” în urma plății prin Stripe.</li>
          <li><strong>Pentru suport și securitate:</strong> Prevenirea fraudelor, investigarea erorilor (bug tracking) și acordarea de suport tehnic dacă ne contactați.</li>
          <li><strong>Comunicare:</strong> Pentru a vă trimite e-mailuri tranzacționale (chitanțe, resetare parolă) și, ocazional, e-mailuri de onboarding, de la care vă puteți dezabona oricând.</li>
        </ul>

        <h2>3. Partajarea Datelor cu Terțe Părți</h2>
        <p>Nu vindem datele dvs. personale. Datele sunt partajate exclusiv cu procesatorii de servicii (Sub-processors) strict necesari funcționării platformei:</p>
        <ul>
          <li><strong>Google (Firebase / Firestore):</strong> Pentru găzduirea bazei de date, autentificare și stocarea planurilor.</li>
          <li><strong>Google (Gemini AI):</strong> Pentru a genera textul. Rețineți că trimitem doar fragmentele de text (prompt-urile) introduse de dvs. Nu trimitem datele dvs. de identificare personală la motorul AI.</li>
          <li><strong>Stripe:</strong> Pentru a vă procesa în siguranță plățile.</li>
          <li><strong>Google AdSense:</strong> Dacă sunt afișate reclame, furnizorii de publicitate pot folosi tehnologii proprii pentru reclame personalizate (vezi Politica de Cookie-uri).</li>
        </ul>

        <h2>4. Drepturile Dumneavoastră (GDPR)</h2>
        <p>Dacă sunteți rezident în Spațiul Economic European (SEE), aveți următoarele drepturi:</p>
        <ol>
          <li><strong>Dreptul de Acces:</strong> Puteți solicita o copie a datelor pe care le deținem.</li>
          <li><strong>Dreptul la Ștergere ("Dreptul de a fi uitat"):</strong> Puteți solicita ștergerea definitivă a contului dvs. și a tuturor planurilor din baza noastră de date trimițând un e-mail la adresa de mai jos. Datele vor fi șterse în maxim 30 de zile.</li>
          <li><strong>Dreptul la Rectificare:</strong> Ne puteți cere corectarea datelor greșite.</li>
          <li><strong>Dreptul de Retragere a Consimțământului:</strong> Puteți revoca în orice moment acordul pentru cookies sau comunicări comerciale.</li>
        </ol>

        <h2>5. Securitatea Datelor</h2>
        <ul>
          <li><strong>Criptare:</strong> Datele transmise între browserul dvs. și serverele noastre, precum și baza de date Firestore, sunt criptate în tranzit și în repaus.</li>
          <li><strong>Link-uri de Share:</strong> Dacă folosiți funcția de "Distribuie (Share)" a planului de afaceri, URL-ul generat va fi public pentru oricine are link-ul, așadar tratați-l cu responsabilitate.</li>
        </ul>

        <h2>6. Contact</h2>
        <p>Pentru a vă exercita drepturile GDPR sau pentru alte întrebări privind confidențialitatea, ne puteți contacta la: <a href="mailto:contact@ideeata.ai" className="text-emerald-400">contact@ideeata.ai</a>.</p>
        
        <div className="flex justify-center mt-12 mb-12">
          <Link href="/start" className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-emerald-900/30 no-underline">
            Validează-ți ideea chiar acum
          </Link>
        </div>
      </div>
    </div>
  );
}
