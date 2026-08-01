# AI_MEMORY — IdeeaTa.ai
> Ultima actualizare: 31 Iulie 2026

---

## ⛔ INTERDICȚIE ABSOLUTĂ — Se citește PRIMUL

**NICIUN agent AI, instrument, subagent sau automatizare NU are voie să modifice, creeze, șteargă sau ruleze comenzi asupra codului acestui proiect FĂRĂ acordul expres al utilizatorului.**

Formele acceptate de acord expres:
- `"execută cod"` — execuție imediată
- `"override freeze [nume]"` — deblocare freeze specific
- `"aprob"` / `"da, fă asta"` — confirmare plan de implementare

**Dacă instrucțiunea este ambiguă → CERE CONFIRMARE. NU acționa.**


## DATE PROIECT
- **Cale oficială:** `D:\APLICATII\IdeeaTa-latest_17072026\IdeeaTa-latest`
- **Framework:** Next.js 15.5.20
- **Plăți:** Lemon Squeezy (NU Stripe)
- **Auth + DB:** Firebase (Firestore + Auth)
- **AI:** Gemini 2.5 Flash via `@google/genai`
- **Build verificat cu:** `& "D:\Downloads\npm.ps1" run build`

---

## PACHETE DE TARIFE (FREEZE ABSOLUT)
- **Standard** — 39 RON: descărcări, editare liberă, 2 tonuri
- **Instrumente Profesionale** — 99 RON: 4 tonuri, buton Investitori, buton Fonduri Europene
- Toată logica e în `lib/accessControl.ts` — ÎNGHEȚAT, nu se modifică fără aprobare explicită.

---

## FREEZE (23 Iunie 2026)
- **app/demo/page.tsx** — Funcționează perfect, ÎNGHEȚAT.
- **Sistemul de Login** — Funcționează perfect, ÎNGHEȚAT.
- **app/dashboard/page.tsx** — Funcționează perfect, ÎNGHEȚAT.
- **app/studio/page.tsx** — Funcția generate și secțiunea ToneEditor sunt sub FREEZE absolut.

---

## FREEZE (14 Iulie 2026 — Pasul 1 din ANALIZA_COD.md)
- **backup_siguranta/page.tsx.backup** — Fișier backup mutat aici din /app. NU se mută înapoi.
- **backup_siguranta/page.tsx.test** — Fișier test mutat aici din /app. NU se mută înapoi.
- **lucide-react.d.ts** — Declarație de tip creată la rădăcina proiectului. NU se șterge (rezolvă eroarea TypeScript de build).
- Build verificat: ✅ `✓ Compiled successfully` după Pasul 1.

---

## FREEZE (14 Iulie 2026 — Pasul 2 din ANALIZA_COD.md)
- **app/api/verify-checkout/route.ts** — RESCRIS și Înghețat. Logica Stripe eliminată complet. Citește din Firestore via `adminDb`. NU se reintroduce Stripe. NU se modifică fără aprobare explicită.
- Build verificat: ✅ `✓ Compiled successfully in 10.9s` după Pasul 2.

---

## FREEZE (14 Iulie 2026 — Pasul 3 din ANALIZA_COD.md)
- **hooks/useStudioLoader.ts** — Şters definitiv (era cod mort, niciodati importat). NU se recrează.
- **hooks/useStudioFirebaseSync.ts** — Fișier NOU creat. Conține 2 funcționalități activate: sync localStorage→Firebase la login + încarcare plan după planId din Dashboard. ÎNGHEȚAT.
- **app/studio/page.tsx** — Modificat cu 2 linii (import + apel hook). Restul fișierului neatins. FREEZE restabilit.
- Build verificat: ✅ `✓ Compiled successfully in 10.0s` după Pasul 3.

---

## FREEZE (14 Iulie 2026 — Pasul 4 din ANALIZA_COD.md)
- **components/EditForm.tsx** — Fișier mutat din /app. Conținut identic. Înghețat.
- **components/BudgetChart.tsx** — Fișier mutat din /app. Conținut identic. Înghețat.
- **app/EditForm.tsx** — Śters definitiv. NU se recreează în /app.
- **app/BudgetChart.tsx** — Śters definitiv. NU se recreează în /app.
- Import paths actualizate în demo, start, studio — toate folosește `@/components/EditForm` și `@/components/BudgetChart`.
- Build verificat: ✅ `✓ Compiled successfully in 10.7s` după Pasul 4.

---

## REGULI CRITICE
- Niciodată nu folosi comenzi distructive (git restore, discard, ștergeri în masă) fără plan aprobat.
- Modificările se fac strict pas cu pas, conform `ANALIZA_COD.md`.
- Build-ul se verifică cu `& "D:\Downloads\npm.ps1" run build` după fiecare pas.

---

## FREEZE (14 Iulie 2026 — Master Plan Sesiunile 1+2)
- **app/studio/page.tsx** — Modificări aplicate și înghețate:
  - LIMITATOR GENERARE: 1 generare gratuită per cont (studioGenerateCount în localStorage). Admin + plătiți bypass.
  - LIMITATOR TON: 3 editări gratuite professional_tone (studioToneCount în localStorage). Admin + plătiți bypass.
  - BLOCARE INSTRUMENTE: `optimize_budget` și `add_sections` blocate pentru gratuit logat → PricingModal. Badges PRO afișate corect.
  - RESETARE CONTORI: onSuccess PricingModal resetează studioGenerateCount=0 și studioToneCount=0.
  - isPaid FIRESTORE: câmpul `isPaid: isPlanPaid` salvat în Firestore la generare (pentru Dashboard etichete PRO).
- **app/demo/page.tsx** — Cod mort tier "pro" (Pro Nelimitat) eliminat definitiv. NU se reintroduce.
- Build verificat: ✅ `✓ Compiled successfully in 13.2s` — 23/23 pagini.
- Checkpoint git: `master-plan-sesiunea1+2-limitatoare-blocare-isPaid-curatenie-pro`

---

## FREEZE (15 Iulie 2026 — Sesiunea 3)
- **app/studio/page.tsx** — FEAT-2: guard `!user` adăugat în `generate()` → nelogat vede auth modal imediat. ÎNGHEȚAT.
- **app/dashboard/page.tsx** — FEAT-3: badge avertizare amber „Planul gratuit folosit" vizibil când `studioGenerateCount >= 1`. ÎNGHEȚAT.
- **components/PricingModal.tsx** — COPY-1: 2 iteme noi în lista eu-funds (Buget AI + Adaugă Secțiuni). ÎNGHEȚAT.
- **next.config.ts** — PROD-3: `experimental.turbo` → `turbopack` (warning eliminat). ÎNGHEȚAT.
- **FIX-1 + FIX-2** (Sesiunea 2.5): PricingModal copy ton + landing href /studio. ÎNGHEȚATE.
- Build verificat: ✅ `✓ Compiled successfully in 82s` — 23/23 pagini.
- Checkpoint git: `feat: studio auth guard + dashboard badge + PricingModal features + turbopack fix (Sesiunea 3)`

---

## FREEZE (15 Iulie 2026 — Sesiunea 4)
- **app/page.tsx** — COPY-2: mockup AI v2 (fidel aplicației reale). COPY-3: bandă free tier sub CTA. ÎNGHEȚAT.
- **app/login/page.tsx** — PROD-1A: sendEmailVerification la signup. Butoane Google + Facebook restaurate. QR Code → /demo?start=nou. ÎNGHEȚAT.
- **app/dashboard/page.tsx** — PROD-1B: guard email verification activat (doar providerData=password). ÎNGHEȚAT.
- **components/PricingModal.tsx** — PROD-2: promo codes → process.env.NEXT_PUBLIC_PROMO_*. ÎNGHEȚAT.
- **public/mockup-preview.png** — Imagine AI mockup dashboard (v2, fidelă). NU se înlocuiește fără aprobare.
- **package.json** — qrcode.react instalat. NU se dezinstalează.
- Build verificat: ✅ `✓ Compiled successfully in 39.4s` — 23/23 pagini.
- Checkpoint git local: `CHECKPOINT-15-Iulie-2026` + branch GitHub: `backup-15-iulie-2026`
- Commit Sesiunea 4b: `9a2eb74`

---

## FREEZE (16 Iulie 2026 — Pasul 1: Remediere /shared/[id])
- **app/shared/[id]/page.tsx** — Modificată redirecționarea de la `/?sharedId=${id}` la `/demo?sharedId=${id}` pentru a asigura încărcarea corectă a planului partajat în demo workspace. ÎNGHEȚAT.
- Build verificat: ✅ `✓ Compiled successfully in 34.7s` after Pasul 1.

---

## FREEZE (16 Iulie 2026 — Pasul 2: Remediere referințe /start & Arhivare)
- **app/contact/page.tsx**, **app/cookies/page.tsx**, **app/despre-noi/page.tsx**, **app/privacy/page.tsx**, **app/termeni/page.tsx** — Referințe spre `/start` schimbate la `/demo` pentru un parcurs fluid. ÎNGHEȚATE.
- **app/studio/page.tsx** — Schimbată redirecționarea `window.location.href` de la `/start` la `/demo` în resetApp. ÎNGHEȚAT.
- **backup_siguranta/start/page.tsx** — Folderul `/app/start` arhivat complet aici. Cod mort eliminat. NU se reintroduce în `/app`.
- Build verificat: ✅ `✓ Compiled successfully in 30.6s` (22/22 pagini statice).
- Checkpoint Git realizat: `Checkpoint-16-Iulie-2026-09-34-Pasul-2-Complet`

---

## FREEZE (16 Iulie 2026 — Remediat eroare Firestore Runtime)
- **lib/firebase.ts** — Schimbat importul `getFirestore` din `firebase/firestore/lite` în `firebase/firestore`. Acest lucru rezolvă eroarea de runtime din `/studio` prin alinierea tipurilor Firestore în întreaga aplicație client-side. ÎNGHEȚAT.
- Build verificat: ✅ `✓ Compiled successfully in 2.1min` (22/22 pagini statice după golirea cache-ului `.next`).

---

## FREEZE (16 Iulie 2026 — Implementat Bannere Conversie Opțiunea 2 & 3)
- **components/ConversionBanners.tsx** — Componentă React separată creată de la zero, conținând ambele bannere premium cu gradient dinamic, umbre, micro-animații și responsiveness.
- **app/demo/page.tsx** — Importat și randat `<ConversionBanners ... />` la începutul containerului principal, minimizând riscurile de layout.
- Build verificat: ✅ `✓ Compiled successfully in 40s` (22/22 pagini statice).
- Checkpoint Git realizat: `Checkpoint-16-Iulie-2026-11-07-Bannere-Conversie`

---

## FREEZE (16 Iulie 2026 — Remediere warning Turbopack root)
- **next.config.ts** — Schimbat `turbopack.root` din `./` (cale relativă) în `process.cwd()` (cale absolută). Aceasta elimină definitiv avertismentul *„turbopack.root should be absolute”* la pornirea serverului de dezvoltare sau a build-ului. ÎNGHEȚAT.
- Build verificat: ✅ `✓ Compiled successfully in 103s` (22/22 pagini statice, 0 warning-uri).

---

## FREEZE (16 Iulie 2026 — Rezolvare Migrare, Race Condition și Logout Dashboard)
- **app/demo/page.tsx** — Corectat race condition la mount cu `isInitialMount = useRef(true)` (împiedică ștergerea planului din localStorage). Importat și apelat asincron `migrateLocalPlansToFirebase(currentUser)` în `onAuthStateChanged`. ÎNGHEȚAT.
- **app/studio/page.tsx** — Corectat race condition la mount cu `isInitialMount = useRef(true)`. ÎNGHEȚAT.
- **app/dashboard/page.tsx** — Adăugat buton de delogare („Ieși din cont”) și afișarea email-ului utilizatorului conectat în Header. ÎNGHEȚAT.
- Build verificat: ✅ `✓ Compiled successfully` (22/22 pagini statice, 0 erori).
- Checkpoint Git realizat: `Checkpoint-16-Iulie-2026-12-50-Fix-LocalStorage-Dashboard-Logout`

---

## FREEZE (17 Iulie 2026 — Finalizare Raport: Migrare, Guard Email Studio, OG Image, Ștergere Dashboard)
- **app/demo/page.tsx** — Sincronizat asincron cu Firebase la autentificare direct pe pagină, adăugat suport pentru listă de planuri multiple (`demo_plans_list`). ÎNGHEȚAT.
- **app/studio/page.tsx** — Activat email verification guard (pop-up cu trimitere email și redirect la închidere către `/dashboard`). ÎNGHEȚAT.
- **app/dashboard/page.tsx** — Adăugat buton discret de ștergere planuri direct din Dashboard (`Trash2`) cu confirmare nativă (`confirm()`). ÎNGHEȚAT.
- **lib/migrationManager.ts** — Rescris pentru a sprijini migrarea completă a listei de planuri locale `demo_plans_list`. ÎNGHEȚAT.
- **public/og-image.jpg** — Adăugată imaginea OpenGraph (Opțiunea 1) în folderul public pentru rețelele sociale. ÎNGHEȚAT.
- Build verificat: ✅ `✓ Compiled successfully` (22/22 pagini, 0 warning-uri/erori).
- Checkpoint Git realizat: `Checkpoint-17-Iulie-2026-Finalizare-Raport`

---

## FREEZE (17 Iulie 2026 — Izolare Mobil/Tabletă & Rezolvare Race Condition Dashboard)
- **hooks/useDeviceDetect.ts** — Hook client-side pentru detecția ecranelor sub 1024px (Mobile/Tablet). ÎNGHEȚAT.
- **components/DemoDesktop.tsx** — Izolat componenta desktop a generatorului Demo. ÎNGHEȚAT.
- **components/StudioDesktop.tsx** — Izolat componenta desktop a paginii Studio. ÎNGHEȚAT.
- **components/DemoMobile.tsx** / **components/StudioMobile.tsx** — Pagini premium complete și responsive (mobil/tabletă) cu tab-uri tactile, bottom-sheets pentru editare manuală și personalizarea tonului prin AI, perfect integrate cu Firestore. ÎNGHEȚATE.
- **app/demo/page.tsx** / **app/studio/page.tsx** — Rescrise ca simple dispatchere (dispecerate client-side) bazate pe `useDeviceDetect`. ÎNGHEȚATE.
- **app/dashboard/page.tsx** — Apelat `migrateLocalPlansToFirebase(currentUser)` înainte de a face query la planurile utilizatorului pentru a elimina definitiv race condition-ul la prima logare/înregistrare. ÎNGHEȚAT.
- **tsconfig.json** — Eliminat `"baseUrl": "."` pentru a rezolva conflictul de sintaxă cu `"moduleResolution": "bundler"` raportat în VS Code. ÎNGHEȚAT.

---

## FREEZE (17 Iulie 2026 — Sincronizare, Cale Nouă și Checkpoint)
- **Cale oficială**: Actualizat calea oficială la `D:\APLICATII\IdeeaTa-latest_17072026\IdeeaTa-latest` în `AI_MEMORY.md`.
- **Sincronizare**: Workspace-ul activ `e:\NADIA\Aplicatii\IdeeaTa-latest` sincronizat 100% cu noul cod de mobil/tabletă și istoricul Git de 27 de commit-uri.
- **Checkpoint Git**: `Checkpoint-17-Iulie-2026-Sincronizare-Si-Cale-Noua`.

---

## FREEZE (19 Iulie 2026 — Localizare Exporturi & PDF-uri)
- **lib/generateDocx.ts** — Adăugat suport complet pentru localizarea documentelor Word (titluri secțiuni, etichete tabele și formatele de preț/monedă) pentru limba spaniolă (`es`) și engleză (`en`). ÎNGHEȚAT.
- **lib/generatePptx.ts** — Transformat în utilitar comun pentru generarea prezentărilor localizate cu dicționare de traduceri PPTX. ÎNGHEȚAT.
- **components/DemoDesktop.tsx** — Refactorizat pentru a folosi utilitarul comun `generatePptx` și apelarea corectă a `generateDocxBlob` cu locale. ÎNGHEȚAT.
- **components/StudioDesktop.tsx** — Refactorizat pentru a folosi utilitarul comun `generatePptx`, apelarea `generateDocxBlob` cu locale, dinamizarea footer-ului PDF conform limbii selectate și corectarea URL-urilor de redirecționare conform REGULII #5 (folosește strict `ideeata.ai`). ÎNGHEȚAT.

---

## FREEZE (23 Iulie 2026 — Remedieri Traduceri Complete & Detecție Limbă Browser)
- **components/DemoDesktop.tsx** — Corectat 10 ternare în modalele de Export și Auth pentru a afișa corect limba spaniolă (`locale === "es"`). ÎNGHEȚAT.
- **components/StudioDesktop.tsx** — Corectat 17 ternare (AI loadere, butoane editare/reset, tab-uri versiuni, bară download, tooltip Standard Package). ÎNGHEȚAT.
- **app/demo/page.tsx**, **app/studio/page.tsx**, **app/dashboard/page.tsx**, **app/login/page.tsx** — Adăugată logica automată de detecție a limbii browserului (bazată pe `localStorage` și `navigator.language`) cu redirecționare automată la sub-rutele corespunzătoare `/es/` și `/en/`. ÎNGHEȚATE.
- **Build verificat local:** ✅ `✓ Compiled successfully in 7.1s` — 43/43 pagini statice generate (RO, EN, ES complete).
- **Server Hetzner (`167.233.93.47`):**
  - Confirmat setup cu PM2 (procese active: ideeata, Dashboard, Watchdog).
  - Confirmat că autostart-ul la boot al PM2 este activ (`enabled` ✅).
  - Rulate actualizările de sistem și kernel (`sudo apt update && sudo apt upgrade -y`).
  - Repornit complet serverul (`sudo reboot`) cu succes. Noul kernel `7.0.0-28-generic` este acum activ.

---

## FREEZE (24 Iulie 2026 — Remediere Probleme Audit completă: Faza 1 + Faza 2)
- **app/api/validate-promo/route.ts** — Logica securizată împotriva utilizării multiple, limite de folosire și tier-uri dinamice. ÎNGHEȚAT.
- **app/api/generate/route.ts** — Soft auth guard cu limitare backend (4 planuri gratuite), localizare prompt română. ÎNGHEȚAT.
- **app/api/edit/route.ts** — Localizare spaniolă în prompt-ul general de editare. ÎNGHEȚAT.
- **app/api/debug-env/route.ts** & **app/api/test-share/route.ts** — Guard-uri de producție (404). ÎNGHEȚATE.
- **lib/migrationManager.ts** — Timestamp-uri unice pentru planuri multiple și golire securizată `localStorage` post-migrare. ÎNGHEȚAT.
- **package.json** — Stripe exclus complet, `firebase-admin` în devDependencies. ÎNGHEȚAT.
- **components/StudioDesktop.tsx** — Eliminat bypass local, integrat localizare modal e-mail, placeholders multilingve, formatare unificată. ÎNGHEȚAT.
- **components/DemoDesktop.tsx** — Transmitere JWT Token Firebase pe server, localizare placeholders și redirecționare login, formatare unificată. ÎNGHEȚAT.
- **components/PricingModal.tsx** — Buton dedicat „Aplică” și state local `promoInput` pentru UX pe mobil. ÎNGHEȚAT.
- **app/dashboard/DashboardContent.tsx** — Înlocuit confirmarea nativă cu butoane de confirmare inline directly în carduri. ÎNGHEȚAT.
- **next.config.ts** — Configurare bypass circular ESLint în build. ÎNGHEȚAT.
- **app/demo/DemoContent.tsx** & **app/studio/StudioContent.tsx** — Mount state conditionat pentru a rezolva definitiv Hydration mismatch și layout-flash. ÎNGHEȚATE.
- **components/DemoMobile.tsx** & **components/StudioMobile.tsx** — Eliminat bypass local, formatare unificată prin `@/lib/utils`. ÎNGHEȚATE.
- **Build verificat local:** ✅ `✓ Compiled successfully in 19.2s` — 44/44 pagini statice generate (RO, EN, ES complete).
- **Checkpoint Git realizat:** `Checkpoint-24-Iulie-2026-Remediere-Audit-Complet-Faza1-Faza2`

---

## FREEZE (25 Iulie 2026 — Sprint 3: Localizare Completă Alerte, Fallbacks și Instrumente AI)
- **components/DemoDesktop.tsx** / **components/StudioDesktop.tsx** — Localizate 100% toate dialogurile de alertă și confirmare (confirmare credite descărcare, blocare copiere, avertisment demo, erori generare/salvare). Trimis prop-ul `locale` către graficul `BudgetPieChart`. ÎNGHEȚATE.
- **components/DemoMobile.tsx** / **components/StudioMobile.tsx** — Localizate toate alerte native (generare, erori AI edit, salvări pdf). ÎNGHEȚATE.
- **components/BudgetChart.tsx** — Adăugat prop-ul `locale` în `BudgetPieChart` și dinamizat fallback-ul `"Investiție"` → `"Investment"` / `"Inversión"` / `"Investiție"`. ÎNGHEȚAT.
- **lib/generateDocx.ts** / **lib/generatePptx.ts** — Localizat fallback-ul `"Investiție"` în mod dinamic pe baza parametrului `locale` în tabele, slide-uri și grafice native. ÎNGHEȚATE.
- **app/api/edit/route.ts** —
  - Integrat `buildMetaPrompt` în paralel în `Promise.all` pentru a traduce și localiza dinamic datele generale (nume, slogan, formă juridică localizată, CAEN) și lista completă de buget în limba selectată pe pagină.
  - Actualizate prompturile de optimizare buget pentru a traduce articolele și justificările în limba selectată în timpul recalculării costurilor. ÎNGHEȚAT.
- **Build verificat local:** ✅ `✓ Compiled successfully in 8.9s` — 44/44 pagini statice generate (RO, EN, ES complete).

---

## FREEZE (26 Iulie 2026 — Sprint 4: Rezolvare UX, Acces PRO, Istoric Versiuni și AI Retry)
- **components/DemoDesktop.tsx** —
  - Definit `hasStandardAccess` (descărcări + primele 2 tonuri) și `hasProAccess` (instrumente PRO) pentru a asigura blocarea scurgerii de drepturi PRO către Standard.
  - Deblocat parent-ul "Rescrie Tonul" (se deschide liber pentru toți utilizatorii), primele 2 tonuri libere, ultimele 2 blocate cu insigna `🔒 PRO`.
  - Actualizat instrumentele (*Plan Profesionist*, *Fonduri Europene*, *Optimizare Buget*) să utilizeze `hasProAccess`.
  - Istoric Versiuni din Demo acum randează dinamic toate versiunile folosite (`original`, `ton_edit`, `eu_funds`, `budget_edit`, `expert_sections`, `investor`) și utilizează `"original"` ca bază curată pentru noi editări.
  - Integrat modalul de bibliotecă de secțiuni experte `showExpertDrawer` adaptat pentru local. ÎNGHEȚAT.
- **app/api/edit/route.ts** —
  - Adăugat parametrul `isRetry` în POST body și injectat instrucțiuni de concizie și densitate redusă (max 1-2 paragrafe scurte per secțiune) pentru a finaliza rapid și a ocoli timeout-urile. ÎNGHEȚAT.
- **app/api/validate-promo/route.ts** & **components/PricingModal.tsx** —
  - Implementat local credentials check bypass (`isDevBypass` pe localhost) pentru a asigura funcționarea `ADMIN_NADIA` local.
  - Modalul de pricing detectează bypass-ul și scrie client-side permisiunile direct în Firestore documentul user-ului (`users/${userId}`). ÎNGHEȚATE.
- **lib/generateDocx.ts** —
  - Forțat generarea nativă în-memory pe Canvas a graficului doughnut, ignorând datele base64 goale din DOM, garantând desenarea legendelor și a diagramelor în Word export. ÎNGHEȚAT.
- **Build verificat local:** ✅ `✓ Compiled successfully in 19.2s` — 44/44 pagini statice generate.

---

## FREEZE (26 Iulie 2026 — Sprint 5: Eliminare „AI” și Corectare scrollbar-uri în modal)
- **components/DemoDesktop.tsx** / **components/StudioDesktop.tsx** — Redenumit titlul ferestrei de eroare din `"AI Processing Error"` / `"Eroare la procesarea AI"` / `"Error de procesamiento IA"` în `"Processing Error"` / `"Eroare la procesare"` / `"Error de procesamiento"` pentru a elimina cuvântul „AI” din interfață. ÎNGHEȚATE.
- **app/globals.css** —
  - Adăugat prefixul universal `*` la toate regulile de scrollbar (`*::-webkit-scrollbar` etc.) pentru a asigura forțarea barelor discrete și premium pe elementele de scroll interioare din modal.
  - Extins regula `.no-scrollbar` cu selectori extenși (`display: none !important;` și `scrollbar-width: none !important;`) pentru a asigura eliminarea completă a scrollbar-ului de sub butoanele filtrelor de categorii. ÎNGHEȚAT.
- **app/api/edit/route.ts** — Înăsprit limitarea de densitate pentru `isRetry` (Gemini este instruit să returneze doar 1 paragraf scurt de max 2 propoziții per secțiune, omițând liste/narațiuni lungi) pentru a asigura o procesare sub 2 secunde. ÎNGHEȚAT.
- **Build verificat local:** ✅ `✓ Compiled successfully in 7.2s` — 44/44 pagini statice generate.

---

## FREEZE (31 Iulie 2026 — Sesiunea Uniformizare Monedă, Badge-uri & PDF paywall link)
- **lib/promptConfig.ts** — Adăugat parametru `currency` în helper-ele de AI generate și edit, adaptat scheletul de buget și costuri în EUR pentru RO, rezolvat eroare sintaxă. ÎNGHEȚAT.
- **app/api/generate/route.ts** & **app/api/edit/route.ts** — Trimitere dinamică a monedei către AI și injectare `selectedCurrency` în baza de date. ÎNGHEȚATE.
- **hooks/useStudioFirebaseSync.ts** — Citește `selectedCurrency` la încărcare plan din Firestore și setează UI state `currency`. ÎNGHEȚAT.
- **components/StudioDesktop.tsx** — Salvează `selectedCurrency: currency` în payload-ul Firestore la orice sincronizare (persistență la editare). ÎNGHEȚAT.
- **components/EditForm.tsx** & Desktop/Mobile pages — Propagare prop `currency` către grafic circular și placeholders input-uri cost adaptate monedei planului. ÎNGHEȚATE.
- **lib/priceHelper.ts** & **lib/generatePptx.ts** — Adăugat protecție `hasEur` pentru a opri dubla conversie (dacă sumele au deja "EUR" sau "€") și implementat formatare bidirecțională automată. ÎNGHEȚATE.
- **app/dashboard/DashboardContent.tsx** — Adăugat badge-uri colorate pentru monedă (`LEI` sau `EUR`) în lista de proiecte din Dashboard. ÎNGHEȚAT.
- **components/sidebars/DemoLeftSidebar.tsx** — Afișat insignă verde `🔒 Cont Gratuit` (sau `🔒 Free Account` / `🔒 Cuenta Gratis`) pe butonul "Rescrie tonul" pentru vizitatorii nelogați. ÎNGHEȚAT.
- **hooks/useExportActions.ts** — Extins coordonatele link-ului de paywall în PDF-ul exportat la `0, 0, 1280, 720` (toată suprafața slide-ului CTA) pentru click garantat, și salvat `locale` la crearea link-ului partajat. ÎNGHEȚAT.
- **app/shared/[id]/page.tsx** — Server-side fetch pentru a citi locale-ul planului din Firestore și redirecționare inteligentă localizată (`/demo`, `/en/demo`, `/es/demo`). ÎNGHEȚAT.
- **components/pdf/DemoPdfSlides.tsx** & **components/pdf/StudioPdfSlides.tsx** — Aplicat styling cu gradient premium strălucitor (emerald → teal, border tridimensional și glow shadow) pe butonul de paywall final din PDF. ÎNGHEȚATE.
- **Build verificat local:** ✅ `✓ Compiled successfully in 6.0s` — 44/44 pagini statice generate (RO, EN, ES complete).
- **Git committed & pushed.** Working tree curat.
- **Rezolvare duplicare planuri & crash-uri în Studio:**
  * Eliminat sincronizarea `current_generated_plan` localStorage redundantă din `hooks/useStudioFirebaseSync.ts` care genera planuri multiple (migrarea este acum 100% securizată și curățată exclusiv în `migrationManager.ts`).
  * Modificat `useStudioFirebaseSync.ts` pentru a păstra parametrul `planId` în URL-ul paginii (`?planId=XYZ&view=idea`) în loc să îl șteargă la încărcare.
  * Modificat `components/StudioDesktop.tsx` pentru a actualiza URL-ul browserului în fundal cu `planId` generat la prima salvare sau generare a planului.
  * Astfel, salvările succesive actualizează același document în loc de duplicate, prevenind ștergerile accidentale din curățarea de fundal din Dashboard.
  * Build local validat: ✅ `✓ Compiled successfully in 10.2s` (44/44 pagini static pre-randate).
- **Sistem de Ramificare (Branching) și Selector Segmented Control de Versiuni:**
  * Creat componenta nouă `components/VersionSelector.tsx` ce implementează un Segmented Control orizontal fluid, cu pictograme localizate, ascunzându-se automat dacă există doar o singură versiune (fără dropdown-uri redundante).
  * Modificat `components/StudioDesktop.tsx` și `components/DemoDesktop.tsx` pentru a trimite planul curent vizualizat (`result`) ca bază a optimizărilor AI în loc de `versions.original`, permițând combinarea optimizărilor (ex: Buget Optimizat pe variantă de Fonduri UE).
  * Modificat generarea cheilor de versiuni în `handleAiEdit` pentru a folosi timestamp-uri (`ton_friendly_[timestamp]`, `budget_[timestamp]`, `eu_funds_[timestamp]`, `investor_[timestamp]`), oferind suport nelimitat pentru versiuni multiple și evitând suprascrierile.
  * Șters fișierul vechi redundant `components/VersionHistoryDropdown.tsx`.
  * Build local validat: ✅ `✓ Compiled successfully in 8.5s` (44/44 pagini static pre-randate).
- **Corectare Validare Instantă Cod Promoțional (1 August 2026):**
  * S-au adăugat citirile lipsă ale stărilor `isPaid` și `promoCodeUnlocked` din snapshot-ul Firestore în ascultătorii `onSnapshot` din `DemoDesktop.tsx`, `StudioDesktop.tsx` și `StudioMobile.tsx`.
  * S-au actualizat callback-urile `onSuccess` ale modalei `PricingModal` din toate cele 3 ecrane pentru a executa actualizări locale instantanee ale stărilor React (`isPaid`, `euFundsUnlocked`, `subscriptionActive`, `promoCodeUnlocked`) în funcție de `tier`-ul returnat de API.
  * Acest lucru rezolvă definitiv problema actualizării întârziate a permisiunilor la introducerea codului promoțional (care obliga utilizatorul să dea refresh paginii).
  * Build local validat: ✅ `✓ Compiled successfully in 12.4s` (44/44 pagini static pre-randate).
- **Corectare Comportament de Scroll după Editări AI Globale (1 August 2026):**
  * S-a modificat logica de derulare automată din callback-ul `setTimeout` din `DemoDesktop.tsx` și `StudioDesktop.tsx`.
  * Pentru acțiunile care modifică planul global (`professional_tone`, `eu_funds_optimization`, `investor_ready`), derularea automată nu mai aliniează `section-general` la marginea de sus (comportament care trăgea ecranul în jos și ascundea butoanele din antet), ci efectuează un scroll fluid către top-ul absolut al paginii (`window.scrollTo({ top: 0, behavior: 'smooth' })`).
  * Păstrat comportamentul de scroll specific pentru acțiunile punctuale (`add_sections` derulează la secțiunea adăugată, `optimize_budget` derulează la secțiunea financiară).
  * Build local validat: ✅ `✓ Compiled successfully in 8.5s` (44/44 pagini static pre-randate).
- **Optimizare Plăcintă de Buget pe Mobile (Sesiunea 1 - 1 August 2026):**
  * Modificat `components/BudgetChart.tsx` pentru a face graficul 100% responsiv. Înlocuit dimensiunile fixe în pixeli (`innerRadius={90}`, `outerRadius={160}`) cu procente native (`innerRadius="55%"`, `outerRadius="85%"`) și flexibilizat înălțimea graficului cu clase responsive Tailwind.
  * Ascuns legenda Recharts pe ecrane sub 1024px (`hidden lg:flex`) pentru a elimina dublarea informațiilor pe telefoane.
  * Actualizat `components/StudioMobile.tsx` și `components/DemoMobile.tsx` pentru a sorta descrescător după cost elementele din tabelul bugetului (aliniere perfectă cu ordinea feliilor din plăcintă).
  * Adăugat indicatori vizuali colorați (buline) în dreptul fiecărei categorii din listele mobile, utilizând aceeași paletă de culori statică ca în graficul Recharts.
  * Build local validat: ✅ `✓ Compiled successfully in 12.2s` (44/44 pagini static pre-randate).
- **Layout Hibrid de Tabletă (Sesiunea 2 - 1 August 2026):**
  * Restructurat fișierele `components/StudioMobile.tsx` și `components/DemoMobile.tsx` pentru a folosi un grid hibrid pe tablete (`md:grid md:grid-cols-12 md:gap-6`).
  * Pe tablete (de la 768px în sus), meniul de tab-uri și istoricul de versiuni se așază în stânga, pe 4 coloane, cu tab-urile stivuite vertical (`md:flex-col`) și cu un design premium tip listă de setări iPad, iar conținutul tab-ului activ se randează în dreapta, pe 8 coloane.
  * În interiorul tab-ului Finanțe, lista de buget și plăcinta se afișează acum side-by-side pe tabletă (`md:grid md:grid-cols-2`).
  * Build local validat: ✅ `✓ Compiled successfully in 11.1s` (44/44 pagini static pre-randate).
- **Integrare Hook Unificat de Export pe Mobil (Sesiunea 3 - 1 August 2026):**
  * Înlocuit logica manuală și simplificată de asamblare PDF din `components/StudioMobile.tsx` și codul gol/schelet din `components/DemoMobile.tsx` cu hook-ul unificat `useExportActions`.
  * Randerat componentele `<StudioPdfSlides>` și `<DemoPdfSlides>` off-screen (`fixed top-[-9999px] left-[-9999px]`) în ambele fișiere de mobil/tabletă, permițând capturarea fidelă a DOM-ului și generarea de documente PDF premium la fel ca pe desktop.
  * Adăugat suport pentru stările de permisiuni Firestore (credite, planuri deblocate) în `DemoMobile.tsx` pentru a asigura sincronizarea în timp real a accesului la descărcări.
  * Legat butoanele de export din antetul mobile direct la modalul/drawer-ul de selecție a formatului de export.
  * Build local validat: ✅ `✓ Compiled successfully in 8.6s` (44/44 pagini static pre-randate).

## RĂMÂNE DE FĂCUT



