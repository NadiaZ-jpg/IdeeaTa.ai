# AI_MEMORY — IdeeaTa.ai
> Ultima actualizare: 17 August 2026 (Sesiunea 1 Refactorizare)

---

## ⛔ INTERDICȚIE ABSOLUTĂ — Se citește PRIMUL

**NICIUN agent AI, instrument, subagent sau automatizare NU are voie să modifice, creeze, șteargă sau ruleze comenzi asupra codului acestui proiect FĂRĂ acordul expres al utilizatorului.**

Formele acceptate de acord expres:
- `"execută cod"` — execuție imediată
- `"override freeze [nume]"` — deblocare freeze specific
- `"aprob"` / `"da, fă asta"` — confirmare plan de implementare

**Dacă instrucțiunea este ambiguă → CERE CONFIRMARE. NU acționa.**


## 🛡️ CHECKLIST PRE-FLIGHT OBLIGATORIU (REGULILE 21 & 22)
Înainte de a redacta orice plan de implementare, checklist de task-uri sau de a propune cod, asistentul AI **este obligat** să scrie în mod explicit în gândirea sa (thinking window) starea următoarelor verificări:
1. **Verificarea Celor 3 Limbi:** Planul afectează traduceri? Dacă da, modificarea a fost documentată pentru toate cele 3 limbi (`ro`, `en`, `es`)?
2. **Verificarea Celor 3 Ecrane (Desktop, Tabletă, Mobil):** Modificarea din `/demo` sau `/studio` are corespondent pe mobil/tabletă (`DemoMobile.tsx` / `StudioMobile.tsx`) sau desktop (`DemoDesktop.tsx` / `StudioDesktop.tsx`)? Dacă da, ambele instanțe au fost modificate chirurgical și sincronizate?
3. **Verificare Valută:** Pe paginile internaționale (EN/ES), comutatorul de valută este ascuns și rulează exclusiv în `EUR`?
4. **Verificare Target-uri Tactile (Tap Targets):** Elementele tactile noi/modificate de pe mobil/tabletă au padding intern și margini negative pentru a atinge minimum 44px?
5. **Verificare Ghilimele & JSON:** Am instruit AI-ul/Gemini (în prompts) să utilizeze exclusiv ghilimele simple (`'`) în interiorul valorilor text și să nu folosească caractere de rând nou neescapate real?
6. **Verificare Chirurgicală (Fără Citire Monoliți):** Fișierele peste 500 de linii (cum ar fi `DemoDesktop.tsx`, `StudioDesktop.tsx` etc.) au fost investigate prin căutări chirurgicale (`grep_search` și intervale mici de citire de 50-100 linii)?
7. **Verificare Duplicare Cod (DRY):** Există funcții helper sau JSX duplicat pe care le pot muta într-un utilitar comun (cum ar fi `lib/planHelpers.ts` sau `components/ActionBar.tsx`)?

Dacă oricare dintre aceste verificări este omisă în procesul de planificare, asistentul este în stare de încălcare de regulă.


## DATE PROIECT
- **Cale oficială:** `D:\APLICATII\IdeeaTa-latest_17072026\IdeeaTa-latest`
- **Framework:** Next.js 15.5.20
- **Plăți:** Lemon Squeezy (NU Stripe)
- **Auth + DB:** Firebase (Firestore + Auth)
- **AI:** Gemini 2.5 Flash via `@google/genai`
- **Build verificat cu:** `& "D:\Downloads\npm.ps1" run build`

---

## PACHETE DE TARIFE (FREEZE ABSOLUT)
- **Standard** — ~8 EUR / 39 RON: descărcări, editare liberă, tonuri formal/creativ; unlock per-plan (`standardPackageActive`), NU `isPaid` account-wide
- **Editare + Instrumente Profesionale** — ~20 EUR / 99 RON: tot Standard + instrumente Pro + **cote finite** 10 generări / 8 editări Pro / 4 combinații (NU nelimitat)
- **Top-up Pro** — 5 EUR / 25 RON: doar dacă ai deja pachetul Pro; adaugă **+5 / +4 / +2**; doar pe Dashboard (nu în PricingModal)
- Toată logica pachete/cote: `lib/proPackQuota.ts`, `lib/proPackQuotaAdmin.ts`, `lib/lemonCheckout.ts`, `lib/planQuota.ts`, webhook/checkout — ÎNGHEȚAT, nu se modifică fără `override freeze pachete`.

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
- **Traducere Placeholders Formular și Modale (Sesiunea 4 - 1 August 2026):**
  * Importat `UI_STRINGS` în `DemoMobile.tsx` și `StudioMobile.tsx` și instanțiat `const ui = UI_STRINGS[locale]`.
  * Localizat placeholders pentru adresa de e-mail și parolă din formularele de autentificare din `DemoMobile.tsx` folosind `ui.emailPlaceholder` și `ui.passwordPlaceholder`.
  * Localizat eticheta și placeholderul formularului generatorului de idei în `DemoMobile.tsx` folosind `t("businessIdeaLabel", locale)` și `ui.inputPlaceholder`.
  * Adăugat placeholder localizat în sertarul editorului manual de text (`editingField`) din `StudioMobile.tsx`.
  * Build local validat: ✅ `✓ Compiled successfully in 7.3s` (44/44 pagini static pre-randate).
- **Corecție Valute și CAEN în Documentele de Export (Sesiunea 5 - 1 August 2026):**
  * Unificat și implementat algoritmul complet de conversie valutară bidirecțională (LEI ➔ EUR și EUR ➔ LEI) în exporturile Word (`generateDocx.ts`) și PowerPoint (`generatePptx.ts`) pe baza ratei de schimb fixe (`0.201`).
  * Tradus și localizat etichetele `caenCode` în documentele generate pentru a evita utilizarea CAEN în EN/ES (înlocuit cu "Industry Category" în engleză și "Categoría de Negocio" în spaniolă).
  * Build local final validat: ✅ `✓ Compiled successfully in 8.5s` (44/44 pagini static pre-randate).
- **Optimizări Premium UI/UX Mobile & Tabletă (Sesiunea 6 - 1 August 2026):**
  * Adăugat tranziții de intrare `animate-in fade-in slide-in-from-bottom-2 duration-200` pe ecranele active din `DemoMobile.tsx` și `StudioMobile.tsx`.
  * Redesegnat Tab Bar sub formă de Segmented Control cu `backdrop-blur-md` și pastilă activă text-emerald cu umbră 3D (`shadow-md shadow-black/40`).
  * Mărit padding-ul tab-urilor la `py-3 md:py-2.5` pe mobile.
  * Extins target-ul de tap (min 44px) la editările inline din `StudioMobile.tsx` prin padding invizibil și margini negative (`p-2 -m-2 inline-flex min-w-[36px] min-h-[36px]`).
  * Build local final validat: ✅ `✓ Compiled successfully in 8.5s` (44/44 pagini static pre-randate).
- **Adăugat REGULA #21 (Aliniere Totală și Regula de Aur) - 1 August 2026:**
  * Creat și adăugat oficial REGULA #21 în `.agents/AGENTS.md`, forțând alinierea totală lingvistică (RO/EN/ES) și pe toate dispozitivele (Desktop/Mobil/Tabletă) pentru orice analiză, evaluare, debug, plan de implementare sau walkthrough, precum și respectarea strictă a specificațiilor tehnice unice (excluziv EUR pe EN/ES, 44px tap targets pe mobil, randare sigură safeString, domeniu oficial https://ideeata.ai/ și securitate paywall reală fără devBypass).
  * Enforțat structura de planificare pe sesiuni bazată pe "Regula de Aur".
- **Adăugat REGULA #22 (Eficiență, Modularitate și Optimizare Tokeni) - 1 August 2026:**
  * Creat și adăugat oficial REGULA #22 în `.agents/AGENTS.md` pentru a optimiza sever consumul de tokeni și calitatea codului.
  * Interzis citirea completă a monoliților de peste 500 de linii (cu excepția analizelor de refactorizare solicitate direct) și limitat citirea la 50-100 de linii.
  * Stabilit prioritatea creării de fișiere/componente noi separate, limitând editările de monoliți existenți la modificări chirurgicale de 5-20 de linii.
  * Enforțat principiul DRY (interdicție duplicare cod desktop/mobil).
  * Structurat tranziția între modelele AI în chat (citire obligatorie `task.md` și `AI_MEMORY.md` ca memorie RAM de sesiune).
  * Optimizat selectarea modelului AI (Flash pentru research, Pro doar pentru debug/refactorizări complexe).
  * Limitat încercările oarbe la erori de build (maximum 2 încercări înainte de a opri execuția și a cere asistență).
  * Interzis trimiterea de blocuri mari de cod în chat (doar linkuri spre diff-uri/fișiere .md).
  * Interzis adăugarea de pachete noi nesolicitate și forțat conservarea comentariilor de cod.
- **Corectare Traduceri Desktop (Sesiunea 7 - 1 August 2026):**
  * Pasat proprietatea `locale={locale}` la apelul componentei `<EditForm>` în `DemoDesktop.tsx`, corectând afișarea în limba română a textelor din formular pe paginile EN/ES.
  * Localizat elementele din `DemoLeftSidebar.tsx` (butoanele AI de adaptare fonduri UE, plan profesionist și optimizare buget, precum și sfaturile de subsol) pentru a utiliza traducerile din `uiStrings.ts` în loc de texte românești hardcodate.
  * Build local final validat: ✅ `✓ Compiled successfully in 6.7s` (44/44 pagini static pre-randate).
- **Corectare Afișare Cost Estimat în EditForm (Sesiunea 8 - 1 August 2026):**
  * Lărgit containerul de intrare pentru costul estimat (`components/EditForm.tsx`) pe desktop și tabletă de la `md:w-32` (`128px`) la `md:w-44` (`176px`) pentru a asigura vizibilitatea completă a sumelor mari și a valutei (rezolvată problema tăierii literei „R” din „EUR” la valori peste 100,000).
  * Pe mobil s-a păstrat comportamentul responsiv implicit (`w-full` pe layout stivuit), nefiind afectat de decupare.
  * Audit lingvistic rulat pe `DemoMobile.tsx` și `StudioMobile.tsx` pentru a asigura alinierea totală RO/EN/ES pe toate ecranele (zero texte hardcodate în română găsite în codul de mobil).
  * Build local final validat: ✅ `✓ Compiled successfully in 9.3s` (44/44 pagini static pre-randate).
- **Corectare Limbă Generare & Editare în Studio (Sesiunea 9 - 1 August 2026):**
  * Modificat `components/StudioDesktop.tsx` (linia ~932) pentru a asigura că cererea `/api/generate` trimite explicit limba (`locale`) și moneda (`currency`) selectată, reparând anomalia generării în limba română (RO) implicită de pe paginile internaționale EN/ES.
  * Modificat `components/DemoMobile.tsx` și `components/StudioMobile.tsx` pentru a trimite dinamic moneda (`currency`) în apelurile `/api/generate` și `/api/edit`, dedusă automat din limbă (`locale === "ro" ? "LEI" : "EUR"`).
  * Adăugat reguli stricte de traducere și re-generare de limbă în `lib/promptConfig.ts` (`getEditPrompt` și `getSegmentPrompt` pe ramurile `en` și `es`). Acum, orice acțiune de editare AI (ex. „Rewrite Tone”) rulată de pe ecranele EN/ES deblochează traducerea automată și întoarce planul direct în limba selectată, chiar dacă textul original era în română.
  * Adăugat oficial **Checklist Pre-Flight obligatoriu** bazat pe Regulile #21 și #22 la începutul `AI_MEMORY.md` pentru a preveni omisiunile de propagare pe toate ecranele și limbile la nivel de asistenți viitori.
  * Build local final validat: ✅ `✓ Compiled successfully in 6.8s` (44/44 pagini static pre-randate).

## FREEZE (1 August 2026 — Sesiunea 10 - Pasul 1: Remedieri API Backend & Utilitare)
- **app/api/edit/route.ts** — Securizat extragerea proprietății `strategie_financiara` din obiectul returnat de Gemini în paralel, prevenind transformarea textului în obiect. Adăugat returnarea `editedPlan` în corpul răspunsului pentru compatibilitate cu mobile (`DemoMobile` și `StudioMobile`). ÎNGHEȚAT.
- **lib/utils.ts** — Adăugat protecție în `formatNumberedText` (cu adnotare explicită de tip returnat `: string`) pentru ca, în caz de primire accidentală a unui obiect, să îi extragă recursiv primul string în loc să returneze obiectul brut, oferind imunitate client-side la erorile de tip React child. ÎNGHEȚAT.
- **Build verificat local:** ✅ `✓ Compiled successfully` — toate paginile statice generate (44/44).
- **Checkpoint Git intermediar realizat:** `checkpoint-sesiunea10-pasul1`

## FREEZE (1 August 2026 — Sesiunea 10 - Pasul 2: Remedieri Trailing Commas Client-Side)
- **components/DemoDesktop.tsx** — Adăugat curățarea prin regex a virgulelor terminale (`trailing commas`) din răspunsul JSON primit de la AI înainte de apelarea `JSON.parse` (linia ~947). ÎNGHEȚAT.
- **components/StudioDesktop.tsx** — Adăugat curățarea prin regex a virgulelor terminale din răspunsul JSON primit de la AI înainte de apelarea `JSON.parse` (linia ~961). ÎNGHEȚAT.
- **components/DemoMobile.tsx** — Adăugat curățarea prin regex a virgulelor terminale înainte de `JSON.parse` la importul planului generat de AI pe layout-ul de mobil (linia ~318). ÎNGHEȚAT.
- **Build verificat local:** ✅ `✓ Compiled successfully` — toate paginile statice generate (44/44).
- **Checkpoint Git final realizat:** `Checkpoint-01-August-2026-RemedieriStudio-Complet`

## FREEZE (6 August 2026 — Sesiunea S1: Load sharedId pe Mobile/Tablet)
- **hooks/useSharedPlanLoader.ts** — Fișier NOU. Helper-e `fetchSharedPlan`, `readSharedIdFromLocation`, `clearSharedIdFromUrl`, `resetDemoShareCounters` + hook `useSharedPlanLoader` pentru încărcarea `?sharedId=` via `/api/share/{id}`. Acoperă RO/EN/ES (fără UI nou; același API pe toate limbile). Tabletă = același arbore Mobile (&lt;1024).
- **components/DemoDesktop.tsx** — Înlocuire chirurgicală a fetch-ului inline cu helper-ele din hook (comportament neschimbat).
- **components/DemoMobile.tsx** — (override freeze demo mobile) Integrat `useSharedPlanLoader`: load shared plan pe Mobile/Tablet, `isSharedView` real pentru ConversionBanners, skip restore localStorage când există share, ecran negru scurt în timpul check. Studio neatinss (fără override studio).
- **Build verificat local:** ✅ `npx tsc --noEmit` OK · `npm run build` OK (pagini RO/EN/ES incl. /demo, /en/demo, /es/demo).
- **Acoperire REGULA #21:** RO/EN/ES (rute locale neschimbate) · Desktop + Mobile/Tablet pe Demo.

## FREEZE (6 August 2026 — Sesiunea S2: Create share durable pe Mobile)
- **lib/sharePlan.ts** — Fișier NOU. `createSharedPlan`, `buildSharedPlanUrl` (ideeata.ai), `createAndCopySharedPlanLink` — REGULA #5.
- **lib/uiStrings.ts** — `shareCopied` actualizat + `shareError` nou pe RO/EN/ES.
- **components/DemoMobile.tsx** / **StudioMobile.tsx** — Share nu mai copiază `window.location.href`; creează `/api/share` + clipboard `https://ideeata.ai/shared/{id}`; toast din `ui.shareCopied`.
- **hooks/useExportActions.ts** — DRY: folosește `createSharedPlan` / `buildSharedPlanUrl`.
- **Build verificat local:** ✅ `npx tsc --noEmit` OK · `npm run build` OK
- **Acoperire REGULA #21:** RO/EN/ES (`shareCopied`/`shareError`) · Mobile/Tablet Demo+Studio · Desktop export DRY

## FREEZE (6 August 2026 — Sesiunea S3-B: Studio Mobile mesaj desktop-only)
- **components/StudioMobileGenerateHint.tsx** — Fișier NOU. Empty-state localizat: generare Studio nouă pe desktop; CTA Dashboard + Demo (tap ≥44px).
- **lib/uiStrings.ts** — Chei `studioMobile*` / `studioGenerate*` / `studioLoadingWorkspace` pe RO/EN/ES.
- **components/StudioMobile.tsx** — Înlocuit spinner infinit când lipsește `planId` (sau timeout 4s la plan negăsit) cu `StudioMobileGenerateHint`. Edit pe `planId` existent neschimbat. Varianta A (generate real) amânată.
- **Build verificat local:** ✅ `npx tsc --noEmit` OK · `npm run build` OK
- **Acoperire REGULA #21:** RO/EN/ES · Mobile/Tablet Studio · tap targets pe CTA

## FREEZE (6 August 2026 — Sesiunea S4: Promo paywall fără bypass în production)
- **app/api/validate-promo/route.ts** — Dacă lipsesc credențialele Firebase Admin: în `NODE_ENV=production` răspunde **503** (fără `isDevBypass`). Bypass pe env rămâne **doar** în development; preferă `PROMO_ADMIN` / `PROMO_STANDARD` / `PROMO_FONDURI` (server-only), cu fallback temporar la `NEXT_PUBLIC_*`. Mesaje eroare RO/EN/ES.
- **.env.example** — Documentează Firebase Admin + PROMO_* server-only.
- **PricingModal** — neschimbat; `isDevBypass` client write rămâne doar când API-ul (dev) îl returnează.
- **Ops:** pe Hetzner păstrează FIREBASE_* în `.env` și în `.next/standalone/.env` după rebuild.
- **Build verificat local:** ✅ `npx tsc --noEmit` OK · `npm run build` OK

## FREEZE (6 August 2026 — Sesiunea S5: Metadata SEO localizată RO/EN/ES)
- **lib/siteMetadata.ts** — Fișier NOU. `getSiteMetadata(locale)` cu title, description, keywords, Open Graph pe RO/EN/ES (domeniu ideeata.ai).
- **components/HtmlLang.tsx** — Fișier NOU. Setează `document.documentElement.lang` pe /en și /es.
- **app/en/layout.tsx** / **app/es/layout.tsx** — Metadata EN/ES + HtmlLang.
- **app/layout.tsx** — Folosește `getSiteMetadata('ro')` (fără text hardcodat duplicat).
- **Build verificat local:** ✅ `npx tsc --noEmit` OK · `npm run build` OK (clean `.next`)

## FREEZE (6 August 2026 — Sesiunea S6: Legal RO Stripe → Lemon Squeezy)
- **app/privacy/page.tsx** — 3 mențiuni Stripe → Lemon Squeezy (aliniat EN/ES).
- **app/termeni/page.tsx** — Procesarea plăților: Lemon Squeezy.
- **app/cookies/page.tsx** — Cookie plăți: Lemon Squeezy.
- EN/ES legal: neschimbate (deja Lemon). Zero „Stripe” rămas în paginile legale RO.
- **Build verificat local:** ✅ `npx tsc --noEmit` OK · `npm run build` OK

## FREEZE (6 August 2026 — Sesiunea S7: i18n hygiene)
- **lib/translations.ts** — EN `currencyLabel`: RON → **EUR** (REGULA #21). RO rămâne RON; ES era deja EUR.
- **lib/uiStrings.ts** — Batch diacritice RO pe stringurile principale de UI; adăugat `shareLinkTitle` pe RO/EN/ES.
- **components/DemoMobile.tsx** — title Share din `ui.shareLinkTitle` (fără ternară).
- **Notă:** Desktop rămâne sursa de adevăr pentru fluxuri; Mobile importă helper-ele share/sharedId. Diacritice rămase pe stringuri secundare pot fi batch-uite ulterior.
- **Build verificat local:** ✅ `npx tsc --noEmit` OK · `npm run build` OK

## FREEZE (6 August 2026 — Sesiunea S8: DemoMobile tap targets + beforeunload)
- **components/DemoMobile.tsx** — Tap targets ≥44px pe Share/Export, close Auth/Export, toggle login, Google/Facebook, close versiuni (`p-2 -m-2` / `min-w/h-[36-44px]`). Adăugat `beforeunload` când există plan activ (ca Desktop; exclus shared view / download). Tabletă rămâne pe arborele Mobile (&lt;1024).
- **Build verificat local:** ✅ `npx tsc --noEmit` OK · `npm run build` OK

## RĂMÂNE DE FĂCUT (actualizat 6 Aug — vezi freeze Demo ES/EN de mai jos)
- Deploy Hetzner cu S1–S8 + Demo ES/EN + auth action
- S3-A opțional (generate Studio pe Mobile)

## FREEZE (6 August 2026 — DemoMobile: Inspiră-mă + carusel UX)
- **components/DemoMobile.tsx** — Buton `inspireMeSparkles` (umple textarea, ca Desktop). Carusel păstrat: titlu `businessExamplesTitle`, contor `current/total` (18), hint swipe, peek card (`w-[78%]`), fade dreapta, dots, scrollbar thin. Click exemplu = doar umple textarea (nu mai auto-generate).
- **lib/uiStrings.ts** — `examplesSwipeHint`, `examplesCounter` pe RO/EN/ES.
- **Build verificat local:** ✅ `npx tsc --noEmit` OK · `npm run build` OK

## FREEZE (6 August 2026 — PDF CTA locale RO/EN/ES)
- **lib/pdfCtaBehavior.ts** — Sursa unică: URL CTA PDF (`/es|/en|/demo?sharedId=` pe ideeata.ai), attach link-uri jsPDF, currency toggle pe shared view, redirect locale.
- **hooks/useExportActions.ts** — CTA/footer PDF folosesc `buildPdfCtaUrl` / `attachPdfCtaLinks` (nu mai trec prin `/shared` → `/demo` RO).
- **app/shared/[id]/page.tsx** — Redirect localizat via același modul.
- **DemoDesktop / StudioDesktop** — `shouldShowCurrencyToggle` + load share unificat.
- **Notă:** PDF-urile vechi cu link `/shared/{id}` fără locale rămân pe RO până la regenerare + deploy Hetzner.

## FREEZE (6 August 2026 — Empty ES locatie_dotari / operational fill)
- **lib/normalizePlanResult.ts** — Alias ES/EN pentru `locatie_dotari` / `resurse_umane` / `descriere_flux`; fill pass completează și câmpurile operaționale goale.
- **lib/promptConfig.ts** — Prompt ES/EN: cheia `locatie_dotari` obligatorie, neredenumită.
- **hooks/useCompleteMissingPlanFields.ts** — Re-trigger fill (`fields-v2`) pentru planurile deja încărcate cu secțiuni goale.

## FREEZE (6 August 2026 — Locale entry RO/EN/ES)
- **lib/localeEntry.ts** — Redirect pe preferred/browser păstrează query (`?sharedId=`); cu `sharedId` nu forțează preferred (evită loop + pierdere plan).
- Rute RO: `app/page.tsx`, `demo`, `studio`, `login`, `dashboard` folosesc helper-ul.

## FREEZE (6 August 2026 — MockupPreview i18n)
- **components/MockupPreview.tsx** — zero text RO hardcodat; tab-uri pe chei stabile (`swot`/`FODA`); buget/strategie/grafice/înainte din `UI_STRINGS`.
- **StudioDesktop** — titluri mockup din `ui.howItLooks` / `previewTabs` (ca Demo).
- Pe `/es/demo` mock-ul trebuie să apară în spaniolă după deploy.

## FREEZE (6 August 2026 — ES ActionBar / EditForm / currency)
- **ActionBar** — fallback-uri pe locale (nu mai cade pe RO când lipsește cheia); LEI/EUR doar RO.
- **DemoDesktop / StudioDesktop** — currency default EUR pe EN/ES.
- **EditForm** — etichetă ES: Código CNAE.
- **Notă ops:** `ideeata.ai` fără deploy încă arată UI mixt RO/ES din build vechi.

## FREEZE (6 August 2026 — Demo ES/EN: plan fill, cotă, auth verify)
- **Cotă:** Guest Demo = 3 (`GUEST_DEMO_PLAN_LIMIT`); cont gratuit = 4 planuri Firestore (`FREE_ACCOUNT_PLAN_LIMIT`) — `lib/planQuota.ts`.
- **Migrare:** `migrateLocalPlansToFirebase` — fără duplicate pe nume, respectă limita 4, curăță `demo_plans_list`; logat nu mai scrie în lista locală (evită dubluri).
- **Logout:** `clearLocalPlanState()` pe Dashboard/Demo/Studio — restart curat după delete account.
- **Generate:** `/api/generate` doar normalizează (fără al 2-lea Gemini pe server — viteză); fill pe client `useCompleteMissingPlanFields` (retry, `fields-v4`).
- **normalizePlanResult:** alias ES/EN pentru vision/market/SWOT categorii; merge misiune+valores; fill SWOT+buget compact.
- **promptConfig:** schelet SWOT 4×4 cu explicații pe RO/EN/ES; reguli: fără explicații goale pe itemele 2–4; riscuri ≠ oportunități; EN forțează EUR ca ES.
- **Auth verify:** link email → `/es|/en|/auth/action` (pagină IdeeaTa localizată), nu Firebase hosted EN/RO; `lib/emailVerification.ts` + `AuthActionContent.tsx`.
- **Branch:** `cursor/pdf-cta-locale-and-plan-fill`.
- **Deploy:** necesar pe Hetzner pentru `ideeata.ai`; emailuri vechi de verify rămân pe link Firebase până la resend.

## FREEZE (6 August 2026 — Studio free account: 2 tones)
- **lib/toneQuota.ts** — Sursă unică: `formal`/`creative` free, `persuasive`/`friendly` Pro; limită 3 consumuri (`demoToneEditCount`); `toneVersionKey` pentru EN/ES/RO.
- **Studio/Demo Desktop** — gate înainte de API; **consum cotă doar după succes**; version keys pe chei stabile (nu mai mapează greșit `friendly`→formal).
- **ToneEditor (Mobile)** — fără dublu-increment; afișează câte rescrieri free mai rămân; Pro pe tonurile 3–4.
- **StudioMobile** — versiuni `ton_*` la rewrite; `hasStandardAccess` = StudioPaid || PlanPaid.
- Cont gratuit fără Standard/Pro: doar primele 2 tonuri, max 3 folosiri totale Demo+Studio.
- **Branch:** `cursor/pdf-cta-locale-and-plan-fill`.

## FREEZE (6 August 2026 — Cont gratuit Dashboard/Studio — produs confirmat)
**Reguli produs (NU schimba fără acord explicit):**
- Cont gratuit: **max 4 planuri** generate (Demo migrate + Studio) — `FREE_ACCOUNT_PLAN_LIMIT` în `lib/planQuota.ts` + guard `/api/generate` + Dashboard CTA Pricing.
- Cont gratuit: **max 3 rescrieri ton** totale (Demo+Studio), doar tonurile **formal** + **creative** — `FREE_TONE_EDIT_LIMIT` / `lib/toneQuota.ts`; tonurile 3–4 → PricingModal.
- După 4 planuri / 3 tone: butoanele duc la Pricing (nu generează / nu rescrie).
- **Dashboard cards:** fără badge Free/Gratis/Gratuit pe planuri neplătite; rămân doar **PRO** (plătit) + eticheta valută EUR/LEI — `DashboardContent.tsx`.
- **hooks/useStudioFirebaseSync.ts** — load `planId` cu retry (0/400ms/1s) + `console.warn` (nu `error`) ca să nu apară overlay Next la race Dashboard↔Studio.
- **BuyMeACoffeeModal + public/bmc-qr.png** — QR clar → `https://buymeacoffee.com/ideeata`; copy RO/EN/ES: deschide în browser, nu „Instalează” (PWA BMC titrat IdeeaTa.ai).
- Commit tones: `71600eb`. Branch: `cursor/pdf-cta-locale-and-plan-fill`.

## FREEZE (6 August 2026 — EN/ES Desktop+Mobile parity: free account tones)
**Verificat + aliniat RO/EN/ES pe Desktop și Mobile:**
- Cotă planuri 4 + tone 3 (formal/creative) — același `lib/toneQuota.ts` / `lib/planQuota.ts` pe `/en/*` și `/es/*` (page wrappers trimit `locale`).
- **ToneEditor (Mobile Demo+Studio):** fix import `FREE_TONE_KEYS` (bug Runtime pe select tone); badge + remaining label RO/EN/ES.
- **DemoLeftSidebar / StudioLeftSidebar (Desktop):** același remaining label ca Mobile via `freeToneRemainingLabel(locale)`; Pro pe persuasive/friendly.
- **Demo/Studio Desktop+Mobile handleAiEdit:** gate Pro + free quota + consume după succes — EN/ES identic cu RO (logică pe chei stabile `formal|creative|persuasive|friendly`, nu pe text tradus).
- **Dashboard EN/ES:** limit banner + Pricing fără badge Gratis; EUR pe EN/ES.
- **ToolActionButton:** locked badge `Free w/ account` / `Gratis con cuenta`.
- Branch: `cursor/pdf-cta-locale-and-plan-fill`.

## FREEZE (6 August 2026 — Word DOCX: pie total vs TOTAL ESTIMADO)
**Bug:** pe EN/ES, `TOTAL ESTIMADO` din Word era `sumă × 0.201` (ex. 33000→6633) — `formatPrice` din `generateDocx.ts` trata totalul numeric fără „EUR” ca LEI.
**Fix:**
- `lib/priceHelper.ts` — `parseBudgetCost`, `formatAmountInCurrency`; EN/ES convertesc doar dacă textul are LEI/RON explicit.
- `lib/generateDocx.ts` — totalul final via `formatAmountInCurrency` (fără FX pe sumă); iteme via `formatPriceLocalized`.
- `lib/generatePptx.ts` — același helper (nu mai are formatPrice local greșit).
- PDF/Presentation slides — totalul estimat trimite suma + marker valută ca să nu se reconvertească.
- Acoperă Desktop+Mobile (export comun) pe RO/EN/ES.

## FREEZE (6 August 2026 — Studio tools: language lock + SWOT explanations)
**Bug:** Plan Profesional / Fonduri UE / ton pe ES amestecau EN+ES; SWOT rămânea cu titluri fără `explicatie_tehnica` (placeholder Explicación...).
**Cauze:** instruțiuni cu jargon EN fără blocaj puternic; modelul returna titluri goale la explicații și overwrite-uia planul; client fill nu re-rula după rewrite (`fields-v4` pe același planId).
**Fix:**
- `getEditLanguageLock` pe toate acțiunile `/api/edit` (RO/EN/ES).
- `mergeSwotPreservingExplanations` + `normalizePlanResult` + `fillMissingPlanExplanations` după edit.
- Segment prompts: limba + SWOT cu explicatie_tehnica obligatorie.
- `useCompleteMissingPlanFields` key `fields-v5:e{empty}:s{count}` — re-fill după rewrite.
- Acoperă instrumentele Full/Standard: ton, investor_ready, eu_funds, optimize_budget, add_sections (via același API).

## FREEZE (6 August 2026 — Studio optimize_budget: exact percent)
**Bug:** reducerea bugetului pe Standard/Full Access lăsa Gemini să aplice „aproximativ X%” → total greșit; pe Mobile nu trimitea deloc `targetSection`.
**Fix:**
- `lib/budgetOptimize.ts` — reducere matematică exactă `round(cost * (1 - p/100))` pe iteme; merge cu explicațiile AI.
- `app/api/edit/route.ts` — după merge, forțează costurile din helper (nu se mai încredere în cifrele AI).
- `promptConfig` RO/EN/ES — instrucțiune EXACT %, nu „aproximativ”.
- Desktop: procent valid 1–90; Mobile Studio: `prompt` pentru procent + trimite `targetSection` + versiune `budget_*`.
- Acoperă Studio Desktop+Mobile (API comun) RO/EN/ES.

## FREEZE (6 August 2026 — Studio version stack / Combină cu…)
**Reguli produs în `lib/versionStack.ts` (Desktop+Mobile, RO/EN/ES):**
- Free: max 1 tool pe lanț (tab simplu); **fără** meniu Combină.
- Standard: max **2** tool-uri pe stack.
- Full Access: max **4** tool-uri pe stack.
- **Toolbar pe Original:** fiecare rulare = **tab sibling nou din Original** (stack gol).
- **Toolbar pe tab non-Original** SAU „Combină cu…” (**+**): tool pe conținutul tabului activ → **tab nou** `A + B` (`resolveEditBaseForToolRun`).
- Download = tab activ.
- UI: `VersionSelector` Desktop (`flex-wrap` la overflow) + dropdown istoric Mobile.

## FREEZE (6 August 2026 — Studio tools tip + same-session history tabs)
**Bug:** 2+ instrumente în aceeași sesiune (fără ieșire) nu creau tab-uri — al doilea append-uia pe stack (Free limit 1 → blocat). Mergea doar după ieșire/reintrare.
**Fix + UX (Desktop+Mobile, RO/EN/ES — EN paralel cu RO/ES):**
- `StudioDesktop` / `StudioMobile` `handleAiEdit` via `resolveEditBaseForToolRun`: Original → sibling; alt tab / Combine → append pe stack-ul activ.
- `ui.versionToolsTip` în `lib/uiStrings.ts` (ro/en/es): pe Original = tab nou; pe alt tab = combinație; Standard 2 / Full 4; free fără combinare; download = tab activ.
- Afișare: `StudioLeftSidebar` (Desktop) + `StudioMobile` (sub Istoric), lângă `editorTip`.
- Fișiere: `StudioDesktop.tsx`, `StudioMobile.tsx`, `StudioLeftSidebar.tsx`, `VersionSelector.tsx`, `lib/uiStrings.ts`, `lib/versionStack.ts`.

## FREEZE (6 August 2026 — Studio batch commit: tools quality)
**Înghețat pe branch `cursor/pdf-cta-locale-and-plan-fill`:**
- Cotă free: 4 planuri + 3 tonuri formal/creative (Desktop+Mobile RO/EN/ES).
- Word TOTAL = placintă; BMC QR; Dashboard fără Gratis; planId sync retry.
- Optimize budget % exact; language lock pe toate instrumentele edit; SWOT fără explicații goale după Plan Profesional / Fonduri UE / ton.
- Version stack + tip instrumente + tab-uri sibling în aceeași sesiune + wrap tab-uri.
- Fișiere cheie: `lib/budgetOptimize.ts`, `app/api/edit/route.ts`, `lib/promptConfig.ts`, `lib/normalizePlanResult.ts`, `hooks/useCompleteMissingPlanFields.ts`, Studio/Demo Desktop+Mobile, `lib/versionStack.ts`, `lib/uiStrings.ts`.

## FREEZE (8 August 2026 — Lemon dual store RON/EUR by locale)
**Practică:** 2 magazine Lemon — `ideeta` (RON) + `ideeta-international` (EUR). Checkout ales după **`locale` URL** (nu limba browser): `ro`→RON, `en`/`es`→EUR.
- `lib/lemonCheckout.ts` — URL-uri + `withCheckoutParams` (`userId`, `tier`, email, planName).
- `PricingModal.tsx` + `app/api/checkout/route.ts` — folosesc helper-ul.
- **Test UUIDs EUR:** Standard `fbf29edf-e265-4284-9dfa-62a074ffbdec`; Editing+Tools `bd8eba73-adf3-4e21-aa4a-0e3565d0a3ca`.
- **TODO Live:** înlocui UUID-urile Test cu Live pe ambele store-uri; webhook pe store-ul EUR → același `/api/webhook`.

## FREEZE (8 August 2026 — Dashboard→Studio handoff + istoric stack + pachete)
**Problema:** după fix-urile `planId` (doar Firestore), Mis Planes → Studio putea rata load-ul → ecran „No se pudo cargar…” / redirect.
**Fix (Desktop+Mobile, RO/EN/ES):**
- **`lib/studioPlanHandoff.ts` (NOU)** — `stagePlanForStudioOpen` / `readStagedStudioPlan` / `clearStagedStudioPlan` via `sessionStorage` (Strict Mode safe).
- **`app/dashboard/DashboardContent.tsx`** — la click pe proiect: handoff + `?planId=&view=idea`; header: **Tarife/Pricing/Precios** + `LanguageSwitcher` (căi `/dashboard` `/en/dashboard` `/es/dashboard`); `PricingModal` locale + valută LEI/EUR.
- **`hooks/useStudioFirebaseSync.ts`** — aplică handoff imediat; Firestore confirmă în fundal; `onPlanMissing` doar dacă handoff lipsește.
- **`StudioDesktop` / `StudioMobile`** — fără ecran de eroare plan missing; la eșec fără handoff → redirect silențios `ui.routes.dashboard`; LanguageSwitcher pe Studio; Mobile pachete = `ui.pricing` (nu „Upgrade PRO” hardcodat).
- **`lib/versionStack.ts`** — tab-uri `stack_*` decodează combinația (ex. `tcre-tfor` → aceleași label-uri ca Instrumente: ton creative + formal); `formatVersionTabTitle` RO/EN/ES.
**ÎNGHEȚAT** — nu se scoate handoff-ul și nu se reintroduce ecranul „plan missing” fără aprobare.

## FREEZE (8 August 2026 — Instrumente pe tab non-Original = Combină)
**Regulă (Desktop+Mobile, RO/EN/ES):** pe tab ≠ Original, instrumentele din sidebar se comportă ca **+ Combină** (conținut tab activ + tool → tab nou `A + B`). Limite neschimbate: Free 1 / Standard 2 / Full 4.
- `resolveEditBaseForToolRun` în `lib/versionStack.ts`; folosit în `StudioDesktop` + `StudioMobile` `handleAiEdit`.
- Tip: `ui.versionToolsTip` ro/en/es actualizat.
**ÎNGHEȚAT** — nu se revine la „toate instrumentele = sibling din Original” fără aprobare.

## FREEZE (8 August 2026 — Load tab activ + export suffix + bibliotecă experți)
**Desktop+Mobile, RO/EN/ES:**
- **`lib/studioActiveVersion.ts` (NOU)** — `resolveLoadedStudioPlan` (UI = planul tabului activ, nu top-level Firestore); `buildExportVersionFileSuffix` pe download.
- `useStudioFirebaseSync` + `useExportActions` (+ Demo Desktop/Mobile) folosesc helper-ul.
- Badge bibliotecă: scos „30+”; `expertModulesBadgeLabel` / `expertModulesAllFilterLabel` = `EXPERT_TEMPLATES.length` (acum **9**).
- Sfat nou `ui.expertLibraryTip` (ro/en/es): Fonduri UE → DNSH / Logistică verde / Egalitate (+ Digitalizare); Plan Profesional → Funnel B2B / Prețuri / Matrice riscuri (+ HR). Afișat în `StudioLeftSidebar` + `StudioMobile`.
**ÎNGHEȚAT** — nu se reintroduce „30+” pe badge fără conținut real; nu se încarcă top-level over active tab fără aprobare.

## FREEZE (9 August 2026 — Resurse: conținut extins AdSense)
**override freeze adsense (conținut editorial):**
- Extinse: ghid, fonduri UE, investitori (+ FAQ link buget/SWOT).
- Noi: buget investiții + SWOT cu explicații (RO/EN/ES), rute + hub + sitemap + LanguageSwitcher via `RESOURCE_ARTICLES`.
- UI: `ResourcePage` responsive Desktop+Mobile; ads pe articole/hub neschimbat ca politică.
**ÎNGHEȚAT** — nu se șterg articolele noi fără override.

## FREEZE (9 August 2026 — AdSense: script doar pe Landing + Resurse)
**override freeze adsense:**
- `isAdSenseContentPath` — doar `/`, `/en`, `/es` + `/resurse|en/resources|es/recursos` (+ articole).
- `loadAdSenseScript` no-op pe Demo/Studio/login/dashboard/legal.
- `AdSenseLoader` gated pe pathname; `CookieBanner` salvează doar consent (nu injectează script).
- Hub Resurse: `AdBanner` la final (slot A).
**ÎNGHEȚAT** — nu se reîncarcă adsbygoogle pe tool pages fără override.

## FREEZE (8 August 2026 — Faza B AdSense: pagini Resurse)
**Scop:** conținut public pentru review AdSense („low-value content”).
- Hub + 4 articole RO/EN/ES: `/resurse`, `/en/resources`, `/es/recursos` (+ ghid, fonduri UE, investitori, FAQ). Fără mențiuni „AI / instrumente AI” în copy (doar brand IdeeaTa.ai).
- Conținut: `lib/resourceContent.ts`; UI: `components/ResourcePage.tsx`.
- Footer: link Resurse/Resources/Recursos; `app/sitemap.ts`; `public/robots.txt` → `https://ideeata.ai/sitemap.xml`.

## FREEZE (8 August 2026 — AdSense Faza A+C, override freeze adsense)
**Desktop + Mobile, RO/EN/ES:**
- **A:** scos `AdBanner` din overlay loading/edit (Studio+Demo Desktop) și din banner permanent Mobile tool.
- **C:** ads pe conținut — mid-articol + hub Resurse; landing **după Features, înainte de CTA final** (nu în hero). Slot `3098389905`, format responsive.
- Script global + `ads.txt` neschimbate.
**ÎNGHEȚAT** — nu se reintroduc ads pe loading/tool fără `override freeze adsense`.

## FREEZE (8 August 2026 — Locale paths + Demo stack + AdSense consent)
**override freeze adsense + demo** (aprob audit CRITICAL/HIGH):
- `lib/localePaths.ts` + `LanguageSwitcher`: mapare slug Resurse/Despre/Termeni/Contact/Privacy/Cookies/Demo/Studio/Login/Dashboard (RO↔EN↔ES).
- Demo Desktop: `resolveEditBaseForToolRun` + stack gates + Combine pe `VersionSelector` (ca Studio).
- Demo Mobile: același stack pe `handleAiEdit` + `formatVersionTabTitle` pe istoric.
- AdSense: script **doar după** `cookie_consent` (`lib/adsenseConsent.ts`, `AdSenseLoader`, `CookieBanner`, `AdBanner` nu randează fără consent). Meta `google-adsense-account` rămâne în layout.
**ÎNGHEȚAT** — nu se reîncarcă adsbygoogle înainte de consent fără override.

## FREEZE (9 August 2026 — Pro pack cote finite + top-up 5 EUR)
**override freeze pachete** (produs aprobat):
- Pachet Pro = **10 gen / 8 editări Pro / 4 combinații** (nu unlimited). `euFundsUnlocked` + cote; **NU** setează `isPaid` / `subscriptionActive`.
- `hasUnlimitedGenerateAccess` = doar `isPaid` | `subscriptionActive` (promo `eu-funds` / `full-access` → același pack finit).
- Libs: `lib/proPackQuota.ts`, `lib/proPackQuotaAdmin.ts`; enforce în `/api/generate`, `/api/edit` (+ refund); grant în webhook `eu-funds` + promo.
- Top-up tier `pro-topup`: Lemon EUR/RON link + `*_VARIANT_ID`; checkout cere pack; webhook `+5/+4/+2` + `proPackLastTopupAt`.
- UI: PricingModal 10/8/4; Dashboard butoane egale + hint sub top-up; Studio/Demo Desktop+Mobile remaining + hint top-up; cote epuizate → checkout `pro-topup` (nu Pricing). `lib/proTopupCheckout.ts`.
- `firestore.rules`: protejate câmpurile proPack* — **publicat Firebase 9 Aug 2026**.
- Script manual (local, webhook nu ajunge pe localhost): `scripts/grant-pro-topup-by-email.mjs`.
- Env (`.env.local` / `.env.example`): `LEMON_EUR_PRO_TOPUP`, `LEMON_RON_PRO_TOPUP`, `LEMON_*_PRO_TOPUP_VARIANT_ID`.
**ÎNGHEȚAT** — nu se trece Pro pack la unlimited / nu se scoate top-up fără `override freeze pachete`.

## RĂMÂNE DE FĂCUT
- **Deploy Hetzner** cu env top-up + VARIANT_ID (altfel Lemon order pe live nu creditează)
- Smoke top-up: după plată 5 EUR → cotă 10/8/4 → **15/12/6** (webhook pe URL public, nu doar localhost)
- Webhook Lemon pe **IdeeTa International** (EUR) → `https://ideeata.ai/api/webhook` (același secret)
- Deploy Hetzner (Resurse + relocare AdSense A+C)
- Smoke Desktop+Mobile RO/EN/ES: `/resurse` (+en/es), landing după Features are ad; Studio/Demo loading **fără** ads
- Smoke `sitemap.xml` + `ads.txt` pe ideeata.ai
- **AdSense Sites → Request review** (după deploy; completează și plățile din cont)
- Smoke Mis Planes → Studio: planul se deschide imediat (fără spinner 8s / redirect)
- Smoke Studio Standard/Full ES: Plan Profesional → 100% spaniolă + FODA cu explicații
- Smoke optimize budget 20% → costuri × 0.8; Word TOTAL = placintă
- Smoke free account EN/ES: 4 planuri / 3 tonuri → Pricing
- Smoke Studio EN/ES Desktop+Mobile: pe Original → 2 instrumente = 2 tab-uri; pe tab non-Original → append (ex. Investitori + Buget); **+** Combine Standard 2 / Pro max 4; tab `stack_*` = nume instrumente
- Smoke tip bibliotecă + badge „9 MODULE” (nu 30+) pe Desktop/Mobile RO/EN/ES
- Smoke load plan cu istoric: tab Original arată conținutul Original (nu ultimul top-level salvat)
- Smoke Dashboard header: Tarife/Pricing/Precios + switcher RO/EN/ES pe căi locale
- Lemon: UUID-uri Live când treci din Test
- S3-A opțional (generate Studio pe Mobile)

---

## FREEZE — Sesiunea Audit Securitate (17 August 2026)

### Fișiere modificate și ÎNGHEȚATE:
| Fișier | Modificare |
|---|---|
| `package.json` | `firebase-admin` mutat din `devDependencies` în `dependencies` — critică pentru build-uri container/producție cu `--omit=dev` |
| `app/api/auth/send-verification/route.ts` | Adăugat rate limiting dual: **5 req/oră per IP** + **3 req/oră per email** via `consumeRateLimit` — previne email flooding și blacklist domeniu |

### Build verificat:
- ✅ `✓ Compiled successfully in 41s`
- ✅ `✓ Generating static pages (71/71)`
- ✅ Zero erori TypeScript sau warning-uri de compilare

### Git Checkpoint:
- Commit: `e08a120`
- Mesaj: `security: firebase-admin mut in dependencies + rate limiting pe /api/auth/send-verification (Checkpoint-17-Aug-2026-Audit-Security-Fixes)`
- Branch: `cursor/pdf-cta-locale-and-plan-fill`
- Push: ✅ `To https://github.com/NadiaZ-jpg/IdeeaTa.ai.git`

### Probleme medii identificate în audit (status curent):
1. Monolitism extrem — 4 componente cu ~8.100 linii totale (logică auth duplicată Desktop/Mobile) — **În plan: Sesiunile 2+3**
2. Două sisteme de traduceri paralele (`uiStrings.ts` + `translations.ts`) — **În plan: Sesiunea 4**
3. ~~Două hook-uri de detecție dispozitiv cu breakpoint-uri diferite (768px vs 1024px)~~ — ✅ **REZOLVAT în Sesiunea 1** (`use-mobile.ts` șters)
4. Tipuri `any` excesive deși `strict: true` este activat — **În plan: Sesiunea 5**
5. ~~Memory leak potențial în `memoryBuckets` din `apiRateLimit.ts` (fără cleanup la expirare)~~ — ✅ **REZOLVAT în Sesiunea 1** (sweep 10min + cap 10k)

---

## FREEZE — Sesiunea 1 Refactorizare (17 August 2026)

### Fișiere modificate și ÎNGHEȚATE:
| Fișier | Modificare |
|---|---|
| `hooks/use-mobile.ts` | **Şters definitiv** — hook orfan (0 importuri, vestigiu Shadcn UI, breakpoint 768px în conflict cu `useDeviceDetect` la 1024px). NU se recrează. |
| `lib/apiRateLimit.ts` | Adăugat `sweepExpiredBuckets()` (sweep periodic la 10 min via `setInterval`) + `MEMORY_BUCKET_CAP = 10.000` cu trigger auto-sweep la depășire. ÎNGHEȚAT. |

### Build verificat:
- ✅ `npx tsc --noEmit` — zero erori TypeScript
- ✅ `✓ Compiled successfully in 21.4s`
- ✅ `✓ Generating static pages (71/71)`

### Git Checkpoint:
- Commit: `3d384cd`
- Mesaj: `refactor(S1): sterge hook orfan use-mobile.ts + sweep periodic memory leak apiRateLimit (Checkpoint-17-Aug-2026-Sesiunea1-QuickWins)`
- Branch: `cursor/pdf-cta-locale-and-plan-fill`
- Push: ✅ `To https://github.com/NadiaZ-jpg/IdeeaTa.ai.git`

### Sesiuni rămase din planul de refactorizare:
- **Sesiunea 2:** Extragere `hooks/useAuthUser.ts` — aplicat în DemoDesktop + DemoMobile (~160 linii eliminate)
- **Sesiunea 3:** Extindere `useAuthUser` — aplicat în StudioDesktop + StudioMobile (~280 linii eliminate)
- **Sesiunea 4:** Consolidare i18n — eliminare import dual `translations.ts` din componentele mari
- **Sesiunea 5:** Interfata TypeScript `BusinessPlan` — elimina tipurile `any` din normalizare și export

---

## FREEZE — Sesiunea 2 Refactorizare (18 August 2026)

### Fișiere ÎNGHEȚATE suplimentar:
| Fișier | Modificare |
|---|---|
| `hooks/useAuthUser.ts` | **NOU — ÎNGHEȚAT.** Hook centralizat pentru Auth + Firestore entitlements sync. Returnează: `user`, `isAuthLoading`, 10 stări entitlements, 5 derivate (`isAdmin`, `hasStandardAccess`, `hasProAccess`, `hasProPackQuota`, `versionStackAccess`). Suportă callback `onUserChanged` și flag `createUserDocIfMissing`. |
| `components/DemoDesktop.tsx` | Eliminat: 2 `useState` redundante (user, promoCode), 10 useState entitlements, 2 `useEffect` (onAuthStateChanged + onSnapshot), 2 blocuri de variabile derivate, `isAuthLoading` useState, optimistic updates din `onPlanUnlockedByCredit` și `PricingModal.onSuccess`. Adăugat: apel `useAuthUser`. FREEZE restabilit. |
| `components/DemoMobile.tsx` | Identic cu DemoDesktop: eliminat toate useState + effecte auth duplicate, adăugat `useAuthUser`. FREEZE restabilit. |

### Notă arhitecturală importantă:
- `onPlanUnlockedByCredit` și `PricingModal.onSuccess` nu mai setează direct entitlements local.
- Firestore `onSnapshot` din `useAuthUser` este singura sursă de adevăr — actualizează automat după webhook.
- Comportament identic funcțional, fără race conditions între optimistic updates și Firestore.

### Build verificat:
- ✅ `npx tsc --noEmit` — zero erori TypeScript
- ✅ `✓ Compiled successfully in 10.1s`
- ✅ `✓ Generating static pages (71/71)`

### Git Checkpoint:
- Commit: `5d817b1`
- Mesaj: `refactor(S2): extrage useAuthUser hook, aplicat Demo (-~160 linii duplicate eliminate)`
- Branch: `cursor/pdf-cta-locale-and-plan-fill`
- Push: ✅ `To https://github.com/NadiaZ-jpg/IdeeaTa.ai.git`

---

## FREEZE — Sesiunea 3 Refactorizare (18 August 2026)

### Fișiere ÎNGHEȚATE suplimentar:
| Fișier | Modificare |
|---|---|
| `components/StudioDesktop.tsx` | Eliminat: 10 useState entitlements, `user`+`promoCodeUnlocked` useState, `isAuthLoading` useState, 2 `useEffect` (onAuthStateChanged + onSnapshot), bloc variabile derivate. Adăugat: apel `useAuthUser` cu callback specific Studio (verificare emailVerified, redirect+clear la logout). FREEZE restabilit. |
| `components/StudioMobile.tsx` | Identic cu StudioDesktop: eliminat toate useState + effecte auth duplicate. Hook call plasat DUPĂ `showVerificationModal` declaration (la L158, necesită setShowVerificationModal în scope). Diferență: la logout → `router.push(...)`. FREEZE restabilit. |

### Notă arhitecturală S3:
- **Studio Desktop onUserChanged logout:** `setResult(null)` + `localStorage.removeItem` + `window.location.href` redirect.
- **Studio Mobile onUserChanged logout:** `router.push(login route)` — fără clear localStorage.
- Ambele verifică `emailVerified` → `setShowVerificationModal(true)`.
- `onPlanUnlockedByCredit` și `PricingModal.onSuccess` — optimistic updates eliminate, Firestore actualizează automat.
- StudioDesktop `onSuccess` păstrează resetarea contorilor localStorage (`studioGenerateCount`, `studioToneCount`) — logică locală validă.

### Build verificat:
- ✅ `npx tsc --noEmit` — zero erori TypeScript
- ✅ `✓ Compiled successfully in 6.5s`
- ✅ `✓ Generating static pages (71/71)`

### Git Checkpoint:
- Commit: `eb427f8`
- Mesaj: `refactor(S3): useAuthUser aplicat Studio Desktop+Mobile (~280 linii duplicate eliminate)`
- Branch: `cursor/pdf-cta-locale-and-plan-fill`
- Push: ✅ `To https://github.com/NadiaZ-jpg/IdeeaTa.ai.git`

### Status Plan Refactorizare:
- ✅ S1: Hook orfan + Memory leak
- ✅ S2: useAuthUser creat + aplicat Demo (Desktop + Mobile)
- ✅ S3: useAuthUser aplicat Studio (Desktop + Mobile)
- ⏳ S4: Consolidare i18n — eliminare import dual `translations.ts`
- ⏳ S5: Interfață TypeScript `BusinessPlan` — elimina tipuri `any`
