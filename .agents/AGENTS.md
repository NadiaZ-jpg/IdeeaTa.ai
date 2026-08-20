REGULA #1: Înainte de a genera sau modifica orice cod, sunt OBLIGAT să citesc AI_MEMORY.md pentru a respecta interdicțiile.
REGULA #2: Dacă un prompt începe cu [DISCUȚIE], nu ai voie să generezi cod sau să propui modificări de fișiere, ci doar să oferi consultanță text.
REGULA #3: Comanda Rapidă "EXECUTĂ COD" — Trigger: când utilizatorul adaugă "execută cod" la finalul solicitării.
REGULA #4: Pentru pagina /demo, se aplică UX-ul "Regula de Aur": acces mereu necondiționat la pagină, avertisment 'Leave Site' doar dacă există un plan activ, limitarea (3 planuri gratuite) oprește vizitatorul cu Pop-up DOAR la apăsarea butonului "Generează Planul".
REGULA #5: Când se adaugă URL-uri în PDF-uri, se folosește strict domeniul de producție (ex: https://ideeata.ai/), FĂRĂ subdomeniul de teste Vercel.
REGULA #6: Calea oficială și unică a aplicației este E:\NADIA\Aplicatii\IdeeaTa-latest_18062026\IdeeaTa-latest. Toate comenzile de terminal, citirile și modificările de cod vor fi executate strict în acest folder.
REGULA #7: (FREEZE) Structura, designul și logica primei secțiuni din /demo sunt declarate PERFECTE și ÎNGHEȚATE.
REGULA #8: (FREEZE TOTAL /DEMO) Întregul modul /demo (app/demo/page.tsx) este ÎNGHEȚAT. Orice modificare necesită permisiunea explicită "override freeze demo".
REGULA #9: (FREEZE TOTAL /STUDIO) Întregul dosar app/studio este "Seiful" proiectului. Este STRICT INTERZISĂ orice modificare fără permisiunea explicită "override freeze studio".
REGULA #10: (FREEZE TOTAL /LOGIN) Fișierul app/login/page.tsx este ÎNGHEȚAT. Modificare doar cu "override freeze login".
REGULA #11: (FREEZE TOTAL LANDING PAGE) Fișierul app/page.tsx (Landing Page) este ÎNGHEȚAT. Modificare doar cu "override freeze landing".
REGULA #12: Respectarea Strictă a Planului — Este STRICT INTERZISĂ adăugarea de funcționalități sau modificări care NU sunt în planul aprobat.
REGULA #13: (Anti-Câmpii) Pentru ORICE eroare, trebuie OBLIGATORIU un Plan de Implementare aprobat de utilizator înainte să scriu cod.
REGULA #14: (Modularizare) Orice funcționalitate nouă se creează ca fișier/componentă separată în /components, nu direct în page.tsx.
REGULA #15: (Anti-Crash AI) Este INTERZISĂ randarea directă a valorilor de la AI. Toate textele dinamice trec prin funcții de siguranță (formatNumberedText sau safeText).
REGULA #16: (Sertarul Intangibil) Logica de fetch Firebase (StudioDataLoader.tsx) rămâne definitiv izolată. Este INTERZISĂ reintegrarea ei în page.tsx.
REGULA #17: (FREEZE PACHETE) Pachete: Standard (~8 EUR / 39 RON), Editare+Instrumente Profesionale (~20 EUR / 99 RON, cote 10/8/4), Top-up Pro (5 EUR / 25 RON, +5/+4/+2). Cotă + Lemon în lib/proPackQuota*, lemonCheckout, webhook. Modificare doar cu "override freeze pachete".
REGULA #18: (FREEZE ADSENSE) Integrarea Google AdSense este ÎNGHEȚATĂ. Modificare doar cu "override freeze adsense". Scriptul/reclamele rulează DOAR pe Landing + Resurse via `AdBanner` / `loadAdSenseScript`. Este INTERZISă reintroducerea `<AdSenseLoader />` în `app/layout.tsx` (root) fără override — Demo/Studio rămân fără ads.
REGULA #19: (ANTI-DISTRUGERE) Niciodată nu folosi comenzi distructive fără plan aprobat de utilizator.

## FREEZE — Pasul 1 (14 Iulie 2026)
- backup_siguranta/page.tsx.backup — NU se mută înapoi în /app.
- backup_siguranta/page.tsx.test — NU se mută înapoi în /app.
- lucide-react.d.ts (rădăcina proiectului) — NU se șterge. Rezolvă eroarea TypeScript de build.

## FREEZE — Pasul 2 (14 Iulie 2026)
- app/api/verify-checkout/route.ts — ÎNGHEȚAT. Logica Stripe eliminată complet. Citește din Firestore via adminDb. NU se reintroduce Stripe. NU se modifică fără aprobare explicită.

## FREEZE — Pasul 3 (14 Iulie 2026)
- hooks/useStudioLoader.ts — ȘTERS definitiv. NU se recreează.
- hooks/useStudioFirebaseSync.ts — Fișier NOU, ÎNGHEȚAT. Conține sync localStorage→Firebase + încărcare planId din Dashboard. NU se modifică fără aprobare.
- app/studio/page.tsx — FREEZE restabilit. Ultimele modificări: 1 import + 1 apel hook la linia ~522. Orice altă modificare necesită "override freeze studio".

## FREEZE — Pasul 4 (14 Iulie 2026)
- app/EditForm.tsx + app/BudgetChart.tsx — ȘTERSE definitiv. NU se recreează în /app.
- components/EditForm.tsx + components/BudgetChart.tsx — ÎNGHEȚATE. Conținut identic cu originalul. NU se modifică fără aprobare.
- Import paths în demo, start, studio actualizate la @/components/EditForm și @/components/BudgetChart. FREEZE restabilit pe toate 3.

---

## FREEZE — Pasul 1 (16 Iulie 2026)
- app/shared/[id]/page.tsx — DEZGHEȚAT (Aug 2026): redirect localizat via `lib/pdfCtaBehavior.sharedPlanOpenPath` (`/en|/es|/demo?sharedId=`). PDF CTA folosește DIRECT path-ul localizat (nu depinde de `/shared`).
- Build verificat: ✅ `✓ Compiled successfully` (34.7s) după remediere.

## FREEZE — Pasul 2 (16 Iulie 2026)
- app/contact/page.tsx, app/cookies/page.tsx, app/despre-noi/page.tsx, app/privacy/page.tsx, app/termeni/page.tsx — Referințe spre `/start` schimbate la `/demo` pentru un parcurs fluid. ÎNGHEȚATE.
- app/studio/page.tsx — Schimbată redirecționarea `window.location.href` de la `/start` la `/demo` în resetApp. ÎNGHEȚAT.
- backup_siguranta/start/page.tsx — Folderul `/app/start` arhivat complet aici. Cod mort eliminat. NU se reintroduce în `/app`.
- Build verificat: ✅ `✓ Compiled successfully in 30.6s` (22/22 pagini statice).
- Checkpoint Git realizat: `Checkpoint-16-Iulie-2026-09-34-Pasul-2-Complet`

---

## REGULA #20: (INTERDICȚIE ABSOLUTĂ — Toți Agenții AI)

**NICIUN agent AI, instrument automat, subagent, sau comandă autonomă NU are voie să:**
- Modifice, creeze, șteargă sau redenumească orice fișier din proiect
- Ruleze comenzi cu efect asupra codului (build, deploy, git, npm install, etc.)
- Propună sau execute refactorizări, optimizări, sau „îmbunătățiri" nesolicitate

**FĂRĂ acordul expres al utilizatorului în forma:**
> `"execută cod"` / `"override freeze [nume]"` / `"aprob"` / `"da, fă asta"`

**Această regulă se aplică TUTUROR fișierelor, INDIFERENT dacă sunt sau nu sub freeze individual.**

Orice agent care primește o instrucțiune ambiguă trebuie să CEARĂ CONFIRMARE înainte de orice acțiune.

---

## REGULA #21: (Aliniere Totală & Standarde de Planificare pe Sesiuni)

**Orice agent AI este OBLIGAT să se asigure că orice depanare (debug), analiză, evaluare (audit), modificare, optimizare, plan de implementare, checklist de task-uri sau raport final (walkthrough):**

1. **Acoperă 100% toate cele 3 limbi active:** Română (`ro`), Engleză (`en`) și Spaniolă (`es`). Toate auditurile, analizele sau documentele de evaluare lingvistică trebuie să cuprindă starea tuturor celor trei limbi. Dacă se adaugă sau modifică elemente vizuale, acestea se localizează imediat în toate cele 3 limbi în `uiStrings.ts`.
2. **Acoperă toate tipurile de ecrane:** Desktop, Tabletă și Mobil. Orice analiză de uzabilitate sau modificare la nivel de UI/layout în `/demo` sau `/studio` trebuie testată și propagată corespunzător atât pe desktop, cât și pe mobil/tabletă (`DemoDesktop` / `DemoMobile` și `StudioDesktop` / `StudioMobile`).
3. **Respectă specificațiile tehnice unice și critice ale platformei (CRITIC):**
   * **Valute pe Internațional:** Pe ecranele internaționale (`en` / `es`), comutatorul de valută (Toggle LEI/EUR) trebuie să fie **ascuns**, iar interfața și documentele generate trebuie să ruleze **exclusiv în EUR**.
   * **Target-uri Tactile (Tap Targets):** Pe ecranele tactile (Mobil / Tabletă), butoanele mici sau compacte (ex: `✏️ Editează`, `✕ Șterge`, legăturile text) trebuie să folosească **target-uri tactile de minimum 44px** (implementate prin padding intern și margin negative: `p-2 -m-2 inline-flex min-w-[36px] min-h-[36px]`), în timp ce pe desktop se păstrează designul minimalist.
   * **Siguranța JSON & Randare AI:** Toate textele dinamice venite de la LLM trebuie randate obligatoriu prin funcția de siguranță `safeString` pentru a preveni crash-ul React. Orice instrucțiune nouă dată AI-ului trebuie să-i interzică utilizarea ghilimelelor duble (`"`) în interiorul valorilor și a liniilor noi reale.
   * **Domeniul de Producție Oficial:** Orice link generat, cod QR sau footer de document trebuie să folosească strict domeniul oficial `https://ideeata.ai/`.
   * **Securitate & Control Acces (Paywall):** Toate verificările de acces premium sau limite (ex: maxim 3 planuri generate pe Demo, deblocarea exporturilor profesionale) trebuie legate exclusiv de starea abonamentului/creditelor din Firestore (`onSnapshot` în timp real, pe baza UID-ului autentificat). **Este strict interzisă reintroducerea oricărui tip de `devBypass` local sau test-mode care ar putea fi exploatat în producție.** Orice promo-code sau preț afișat trebuie validat doar prin backend (`/api/validate-promo`) pe baza regulilor de preț centralizate din `lib/priceHelper.ts`.
4. **Standardizarea Planului de Implementare (Regula de Aur):**
   * Orice propunere din `implementation_plan.md` trebuie divizată obligatoriu în **Sesiuni de lucru individuale clare**.
   * Fiecare sesiune din plan trebuie să ruleze respectând strict **Regula de Aur a Dezvoltării Sigure**:
     `ÎNCEPUT Sesiune ➔ Executare Cod ➔ Validare Build/TS (npx tsc --noEmit + npm run build) ➔ FINAL Sesiune (Freeze, Sincronizare AI_MEMORY.md, Git Commit & Push checkpoint tag)`.
   * Este strict interzisă începerea unei sesiuni noi de lucru dacă sesiunea precedentă nu a fost complet validată local, comise modificările și împinse pe GitHub.

---

## REGULA #22: (Eficiență, Modularitate și Optimizare Tokeni AI)

**Pentru a preveni saturarea memoriei contextului (context window), a asigura o arhitectură curată și a minimiza consumul inutil de tokeni, toți agenții AI trebuie să respecte următoarele directive stricte:**

1. **Citire Chirurgicală (Fără Monoliți Integrali):** Este strict interzisă citirea integrală a fișierelor care depășesc 500 de linii (cum ar fi `DemoDesktop.tsx`, `StudioDesktop.tsx`, `DemoMobile.tsx`, `StudioMobile.tsx`), **<u>cu excepția cazului în care este absolut necesară o analiză completă de refactorizare</u>**. În caz de depanare sau investigație, se folosește mai întâi `grep_search` pentru a localiza problema, iar citirea fișierului se face strict pe intervale **mici de linii (ex: maximum 50-100 de linii în jurul zonei afectate)**.
2. **Prioritate: Fișier Nou vs Modificare Monolit:** Pentru orice funcționalitate sau corecție nouă, **prima soluție obligatorie este crearea unui fișier/componentă separată nouă** (în `/components` sau `/lib`). Doar dacă acest lucru este imposibil din punct de vedere tehnic sau structural, se poate recurge la modificarea fișierelor mari existente. În acest caz, modificările se vor face strict chirurgical, pe bucăți de text de **5-20 de linii** (folosind `replace_file_content` sau `multi_replace_file_content`), fiind interzisă rescrierea unor blocuri mari de cod.
3. **Interdicție de Duplicare a Codului (Principiul DRY):** Este strict interzisă duplicarea logicii (funcții helper, calcule, stiluri) sau a blocurilor repetitive de JSX între fișiere distincte (cum ar fi componentele de Desktop și cele de Mobile). Orice bucată de cod refolosibilă trebuie extrasă imediat într-un fișier utilitar comun (ex: în `/lib` sau sub-componente în `/components`) și importată unde este necesar.
4. **Continuitate la Schimbarea Modelului în Chat:** Dacă utilizatorul comută modelul AI din selectorul de chat în timpul sesiunii, noul model are obligația ca prim pas să verifice `task.md` și `AI_MEMORY.md` pentru a prelua exact starea curentă a lucrului, prevenind re-analizarea redundantă a codebase-ului.
5. **Alegerea Inteligentă a Modelului (AI Model Selection):** Când se lansează subagenți sau task-uri secundare, se va alege modelul optim în funcție de complexitate. Sarcini simple de citire, căutare (grep) sau diagnosticare se vor rula pe modele rapide (`flash` sau `flash_lite`). Modelele mari de raționament (`pro` sau `inherit` la nivel pro) vor fi rezervate exclusiv pentru refactorizări, scriere de cod nou sau debugging complex.
6. **Limitarea Încercărilor la Erori (Anti-Infinite-Loop):** In caz de eroare de build sau compilare, agentul are dreptul la maximum 2 încercări independente de remediere rapidă. Dacă eroarea persistă, agentul este obligat să se oprească, să ceară feedback-ul utilizatorului sau să redacteze un plan formal de depanare, evitând modificările recursive oarbe.
7. **Prevenirea Duplicării de Cod în Chat:** Este interzisă afișarea blocurilor mari de cod direct în fereastra de chat. Toate propunerile extinse de cod trebuie salvate în fișiere de plan/artifacte (`.md`), iar în chat se vor trimite doar explicații text succinte și link-uri către fișierele respective.
8. **Evitarea Dependențelor/Pachetelor Noi (No Unsolicited Packages):** Este interzisă instalarea de dependințe externe (`npm install`) fără acordul utilizatorului, dacă funcționalitatea poate fi scrisă nativ sau folosind pachetele deja existente în proiect (cum ar fi `lucide-react`, `pptxgenjs`, `docx`, `jspdf`).
9. **Conservarea Comentariilor și a Documentației Existente (Preserve Context):** Comentariile existente de cod, JSDoc și notele de debug trebuie păstrate intacte în timpul modificărilor. Eliminarea lor abuzivă este strict interzisă.
10. **Fără Polling / Interogări în Loop:** După lansarea unei comenzi asincrone în terminal (`npm run build` sau `npx tsc`), se va aștepta notificarea automată a sistemului. Este interzisă verificarea repetată a statusului sau citirea logurilor în loop.

---

## REGULA #23: (Deploy Hetzner — Next.js `standalone` + PM2)

**Producție:** `ideeata.ai` pe Hetzner (`167.233.93.47`), app PM2 `ideeata`, cwd `/root/IdeeaTa.ai/.next/standalone`, `output: 'standalone'` în `next.config.ts`.

1. **OBLIGATORIU după fiecare `npm run build` pe server:** copierea asset-urilor în standalone **înainte** de `pm2 restart`:
   - `.next/static` → `.next/standalone/.next/static`
   - `public` → `.next/standalone/public`
   - `.env` → `.next/standalone/.env` (păstrează FIREBASE_* etc.)
2. **Fără pasul de mai sus** → HTML nou + chunk-uri 404 → `ChunkLoadError` / „Application error: a client-side exception…”.
3. **Script oficial în repo:** `deploy.sh` (rădăcina proiectului). Pe server: `chmod +x deploy.sh && ./deploy.sh` (sau `bash deploy.sh`). Nu se inventează un alt flux de deploy care omite copierea staticului.
4. Agenții **nu** rulează deploy pe Hetzner fără acordul expres al utilizatorului (vezi REGULA #20).

---

## FREEZE TOTAL — Inventar Complet Sesiunea 17 Iulie 2026

### Fișiere ÎNGHEȚATE (nu se modifică fără override explicit):
| Fișier | Motivul Freeze |
|---|---|
| `app/demo/page.tsx` | Dispecerat client-side pentru mobil/desktop |
| `app/studio/page.tsx` | Dispecerat client-side pentru mobil/desktop |
| `app/login/page.tsx` | Guard-uri autentificare și butoane Google/Facebook active |
| `app/page.tsx` | Landing Page |
| `app/dashboard/page.tsx` | Afișare planuri, delogare, ștergere directă și migrare asincronă la mount |
| `app/shared/[id]/page.tsx` | Redirect localizat RO/EN/ES via `lib/pdfCtaBehavior` |
| `lib/pdfCtaBehavior.ts` | Comportament unic CTA PDF (URL, link-uri, currency toggle, redirect) |
| `app/contact/page.tsx`, `app/cookies/page.tsx`, `app/despre-noi/page.tsx`, `app/privacy/page.tsx`, `app/termeni/page.tsx` | Înlocuit referințe `/start` cu `/demo` |
| `lib/firebase.ts` | Aliniere import Firestore și `authDomain: window.location.host` pentru login social |
| `lib/migrationManager.ts` | Migrare automată a planurilor multiple din `demo_plans_list` la login |
| `app/api/verify-checkout/route.ts` | Lemon Squeezy integration, fără Stripe |
| `hooks/useStudioFirebaseSync.ts` | Sync Firestore pentru planurile din Dashboard |
| `hooks/useDeviceDetect.ts` | Hook client-side pentru detecția ecranelor sub 1024px (Mobile/Tablet) |
| `components/DemoDesktop.tsx` | Logica completă și designul desktop al generatorului Demo |
| `components/StudioDesktop.tsx` | Logica completă și designul desktop al paginii Studio |
| `components/DemoMobile.tsx` | Interfața de mobil pentru Demo (schelet / de implementat în Phase 2) |
| `components/StudioMobile.tsx` | Interfața de mobil pentru Studio (schelet / de implementat în Phase 2) |
| `components/EditForm.tsx` | Editare secțiuni plan, mutat din /app |
| `components/BudgetChart.tsx` | Grafic buget investiții, mutat din /app |
| `components/StudioDataLoader.tsx` | Sertarul intangibil de fetch |
| `lib/accessControl.ts` | Logica pachetelor de prețuri (Standard vs Profesionale) |
| `components/PricingModal.tsx` | Structura pachete și coduri promoționale |
| `components/ConversionBanners.tsx` | Bannere de conversie premium în demo |
| `next.config.ts` | Configurare rewrites auth și turbopack root absolut |
| `lib/promptConfig.ts` | Centralizat reguli și schelete AI (RO/EN/ES) |

### Fișiere ȘTERSE definitiv (nu se recreează) / ARHIVATE:
- `app/EditForm.tsx`
- `app/BudgetChart.tsx`
- `hooks/useStudioLoader.ts`
- `app/start/` (mutat în `backup_siguranta/start/`)
- `backup_siguranta/page.tsx.backup`
- `backup_siguranta/page.tsx.test`

---

## ISTORIC CHECKPOINT-URI RECENTE

### Checkpoint-16-Iulie-2026-12-50-Fix-LocalStorage-Dashboard-Logout
- Corectat race condition la mount în demo și studio (cu `isInitialMount = useRef(true)`).
- Adăugat buton de logout în Dashboard și afișat email în Header.
- Integrat asincron `migrateLocalPlansToFirebase(currentUser)` în `onAuthStateChanged` pe demo.

### Checkpoint-17-Iulie-2026-Finalizare-Raport
- Adăugat suport pentru listă de planuri multiple (`demo_plans_list`) în `migrationManager.ts` și demo.
- Activat email verification guard pe pagina Studio cu redirect la închidere către `/dashboard`.
- Adăugat buton discret de ștergere planuri direct din Dashboard (`Trash2`).
- Adăugată imagine OpenGraph `public/og-image.jpg`.

### Checkpoint-17-Iulie-2026-Izolare-Mobil-Si-Race-Condition
- Izolat codul desktop masiv din `/demo` și `/studio` în componente separate.
- Adăugate dispecerate client-side și hook-ul custom `useDeviceDetect`.
- Aşteptat finalizarea asincronă a migrării în Dashboard înainte de a efectua query-ul pe colecția de planuri din Firestore (rezolvare definitivă race condition).

### Build verificat la final:
- ✅ `✓ Compiled successfully`
- ✅ `✓ Generating static pages (22/22)`
- ✅ Zero erori TypeScript sau warning-uri de compilare.

---

## FREEZE TOTAL — Actualizare Sesiunea 19 Iulie 2026

### Fișiere ÎNGHEȚATE suplimentar (nu se modifică fără override explicit):
| Fișier | Motivul Freeze |
|---|---|
| `lib/generateDocx.ts` | Localizare completă export Word (titluri, tabele, monede) |
| `lib/generatePptx.ts` | Utilitar comun localizat pentru export PPTX |
| `app/api/edit/route.ts` | Definit variabila `isEn` pentru remediere eroare tipuri în build |
| `components/LandingPageContent.tsx` | Corectat tag JSX neînchis care bloca pre-randarea Next.js |
| `app/demo/DemoContent.tsx` | Extins tipul prop-ului `locale` la `"ro" | "en" | "es"` |
| `app/studio/StudioContent.tsx` | Extins tipul prop-ului `locale` la `"ro" | "en" | "es"` |
| `components/DemoMobile.tsx` | Corectat tipul prop-ului `locale` |
| `components/StudioMobile.tsx` | Corectat tipul prop-ului `locale` |
| `app/dashboard/DashboardContent.tsx` | Corectat tipul prop-ului `locale` |
| `app/login/LoginContent.tsx` | Corectat tipul prop-ului `locale` |
| `components/ConversionBanners.tsx` | Corectat tipul prop-ului `locale` din interface |
| `components/EditForm.tsx` | Corectat tipul prop-ului `locale` |
| `components/PricingModal.tsx` | Corectat tipul prop-ului `locale` din interface, trimitere `userId` la validare |
| `lib/exchangeRate.ts` | Utilitar server-side localizat cu cache de 12h pentru rate EUR/RON |
| `app/api/validate-promo/route.ts` | Validare server-side promo codes în Firestore `/promo_codes` |

---

## ISTORIC CHECKPOINT-URI RECENTE

### Checkpoint-19-Iulie-2026-Localizare-Exporturi-Si-PDF-Complet
- Localizarea completă a exporturilor Word (DOCX) și PowerPoint (PPTX) în spaniolă (`es`) și engleză (`en`).
- Înlocuirea logicii PPTX inline din `DemoDesktop.tsx` și `StudioDesktop.tsx` cu utilitarul comun.
- Dinamizarea footer-ului PDF-urilor în Studio în funcție de limba utilizatorului.
- Corectarea link-urilor din PDF-uri pentru a folosi strict domeniul oficial `ideeata.ai` (respectarea REGULII #5).
- Rezolvarea tuturor erorilor de compilare (sintaxă în `LandingPageContent` și tipuri în edit route, prop-uri locale etc.).
- Build verificat la final: ✅ `✓ Compiled successfully` (4.7s), ✅ `✓ Generating static pages (43/43)`.

### Checkpoint-19-Iulie-2026-Faza2-Mobil-Si-Securitate-Complet
- Sincronizarea datelor de permisiuni Firestore în `StudioMobile.tsx` prin listener `onSnapshot` în timp real.
- Integrarea selectorului elegant de exporturi (Word / PPTX / PDF) direct în layout-ul de mobil.
- Mutarea validării codurilor promoționale în backend prin endpoint API `/api/validate-promo` legat la Firestore `/promo_codes`.
- Implementarea cursurilor valutare dinamice cache-uite prin utilitarul `exchangeRate.ts` apelat în API `/api/generate`.
- Rezolvarea tuturor problemelor de tipuri TypeScript și build final trecut 100% cu succes (`✓ Compiled successfully` în 5.0s pe 43/43 pagini).

### Checkpoint-23-Iulie-2026-Pachet-Major-36-Commits
- Remediat 10 ternare în DemoDesktop și 17 în StudioDesktop pentru traducerile complete în spaniolă (ES).
- Implementat detecția automată a limbii browserului/sistemului în app/demo, app/studio, app/dashboard, app/login.
- Actualizat serverul Hetzner: instalat actualizări pachete și kernel nou (`7.0.0-28-generic`), verificat autostart PM2, repornit serverul complet în siguranță.
- Pregătit pachetul cumulat de 36 de commit-uri (35 locale anterioare + 1 commit localizare) pentru deploy live.
- Build local validat cu succes (`✓ Compiled successfully` în 7.1s, 43/43 pagini statice generate).

### Checkpoint-24-Iulie-2026-Remediere-Audit-Complet-Faza1-Faza2
- Finalizat implementarea întregului plan de remediere audit:
  - Faza 1: validate-promo securizat complet (limite și tier-uri), token JWT enforțat, prompt localizat în ES și RO în backend, curățare coliziuni în migrationManager, securizat api debug rute.
  - Faza 2: eliminat devBypass din toate cele 4 ecrane, localizat modal e-mail și placeholders, buton dedicat promo pe mobil, confirmări inline în Dashboard, protecții hydration în dispatchere pentru a opri flash-ul visual, unificat formatObjectNumbers centralizat.
- Proiect compilat local cu succes: ✅ `✓ Compiled successfully in 19.2s` (44/44 pagini statice generate).

### Checkpoint-30-Iulie-2026-Remediere-Traduceri-Si-Crash-EditForm
- Implementat logica centralizată de prețuri în `lib/priceHelper.ts` și eliminat funcțiile redundante din componente.
- Actualizat `lib/uiStrings.ts` cu chei pentru paywall, subtitluri și exporturi, aplicate în DemoDesktop, StudioDesktop și PDF-uri.
- Ascuns complet toggle-ul de valută pentru limbile internaționale (EN/ES rulează strict pe Euro), păstrând conversia doar pe RO.
- Injectat funcția de protecție `safeString` în `EditForm.tsx` pentru a curăța output-ul AI (obiecte vs string-uri) și a preveni blocajele / crash-urile React (Eroarea #31).
- Curățat documentele PDF (StudioPdfSlides, StudioPresentationSlides) de string-uri hardcodate în română (ex. "Distribuția Costurilor").
- Proiect compilat local cu succes: ✅ `✓ Compiled successfully in 6.4s` (44/44 pagini statice generate).

### Checkpoint-30-Iulie-2026-Refactorizare-Sesiunea1-PlanHelpers
- Creat `lib/planHelpers.ts` cu 3 funcții helper pure și documentate: `truncateText`, `splitTextIntoSlides`, `getDynamicTextSize`.
- Eliminate 55 linii de cod duplicat din `components/StudioDesktop.tsx`.
- Eliminate 55 linii de cod duplicat din `components/DemoDesktop.tsx`.
- Ambele fișiere înlocuiesc definițiile inline cu `import { truncateText, splitTextIntoSlides, getDynamicTextSize } from '@/lib/planHelpers'`.
- TypeScript check: ✅ zero erori (`npx tsc --noEmit`).
- Git commit: `refactor: extrageți funcțiile helper duplicate în lib/planHelpers.ts (Sesiunea 1)`.
- **Câștig net: -110 linii** din fișierele monolitice.
- **Status refactorizare:** ✅ Sesiunea 1 completă.

### Fișiere ÎNGHEȚATE suplimentar (Sesiunea 1 Refactorizare):
| Fișier | Motivul Freeze |
|---|---|
| `lib/planHelpers.ts` | Funcții helper pure comune pentru StudioDesktop și DemoDesktop |

### Checkpoint-30-Iulie-2026-Refactorizare-Sesiunea2-useUIState
- Creat `hooks/useUIState.ts` cu 14 variabile de stare UI izolate: modale, dropdown-uri, tab-uri de navigare.
- Eliminate din `components/StudioDesktop.tsx`: 10 declarații `useState` înlocuite cu import hook.
- Eliminate din `components/DemoDesktop.tsx`: 7 declarații `useState` + 1 declarație duplicată ștearsă.
- **Variabile izolate:** `showPricingModal`, `showQrModal`, `showBmcModal`, `showAuthModal`, `showPaywall`, `showExpertDrawer`, `showVerificationModal`, `verificationSent`, `showVersionDropdown`, `showStudioExportModal`, `showExamples`, `mockupTab`, `innerMockupTab`.
- **Variabile de business PĂSTRATE în componentă (risc ridicat):** `result`, `versions`, `user`, `credits`, `isPaid`, `loading`, `isDownloading`, `isEditing` — toate conectate la listeners Firebase sau fluxuri async AI.
- TypeScript check: ✅ zero erori (`npx tsc --noEmit`).
- Git commit: `refactor: izolat starea UI in hooks/useUIState.ts (Sesiunea 2)`.
- **Câștig net: -18 linii** din fișierele monolitice (valoarea reală = izolarea semantică pentru debugging rapid).
- **Status refactorizare:** ✅ Sesiunea 2 completă. Urmează Sesiunea 3 (RISC RIDICAT — hooks/usePlanState.ts).

### Fișiere ÎNGHEȚATE suplimentar (Sesiunea 2 Refactorizare):
| Fișier | Motivul Freeze |
|---|---|
| `hooks/useUIState.ts` | Starea pură UI (modale, dropdown-uri, tab-uri) comune pentru StudioDesktop și DemoDesktop |

### Checkpoint-30-Iulie-2026-Refactorizare-Sesiunea4-ActionBar
- Creat `components/ActionBar.tsx` (175 linii) cu bara completă de acțiuni: Reset, Edit + Tooltip, Currency Toggle, Download Buttons (free + premium) + Tooltip, buton upgrade 🔒.
- Eliminate din `components/StudioDesktop.tsx`: 114 linii JSX înlocuite cu `<ActionBar mode="studio" ... />`.
- Eliminate din `components/DemoDesktop.tsx`: 114 linii JSX înlocuite cu `<ActionBar mode="demo" ... />`.
- Componenta acceptă prop `mode: "demo" | "studio"` pentru a condiționa `onShowExportModal` (specific Demo) vs `onDownloadAction` direct (specific Studio).
- Prop `showCurrencyToggle={locale === "ro"}` — toggle-ul LEI/EUR ascuns pentru EN/ES.
- Corecție TypeScript: `onDownloadAction` tipizat cu union exact `'pdf-summary' | 'pdf' | 'pptx' | 'word'`.
- **Constatare importantă (Sesiunile 4-8 revizuite):** Planul utilizatorului este randat exclusiv prin `EditForm.tsx` (deja izolat). Nu există blocuri inline de plan în Desktop. Sesiunile 4-8 au fost reorientate: ActionBar ✅, MockupPreview, VersionHistoryDropdown, useExportActions.
- TypeScript check: ✅ zero erori (`npx tsc --noEmit`).
- Git commit: `refactor: extras ActionBar.tsx din StudioDesktop si DemoDesktop (Sesiunea 4)`.
- **Câștig net: -228 linii** din fișierele monolitice.
- **Status refactorizare:** ✅ Sesiunea 4 completă. Urmează Sesiunea 5 (MockupPreview.tsx — risc zero).

### Fișiere ÎNGHEȚATE suplimentar (Sesiunea 4 Refactorizare):
| Fișier | Motivul Freeze |
|---|---|
| `components/ActionBar.tsx` | Bara de acțiuni (Reset, Edit, Currency, Download) comună pentru StudioDesktop și DemoDesktop |

### Checkpoint-30-Iulie-2026-Refactorizare-Sesiunea5-MockupPreview
- Creat `components/MockupPreview.tsx` cu 227 linii.
- Extrase tab-urile statice (Rezumat, SWOT, Buget, Strategie), graficele animate, secțiunea typing live și Before/After din ambele pagini (StudioDesktop și DemoDesktop).
- **Câștig net: -249 linii** din fișierele monolitice.
- TypeScript check: ✅ zero erori (`npx tsc --noEmit`).
- Git commit: `refactor: extras MockupPreview.tsx cu exemplul static animat (Sesiunea 5)`.
- **Status refactorizare:** ✅ Sesiunea 5 completă.

### Fișiere ÎNGHEȚATE suplimentar (Sesiunea 5 Refactorizare):
| Fișier | Motivul Freeze |
|---|---|
| `components/MockupPreview.tsx` | Componentă izolată pentru vizualizarea inițială a planului Demo static |

### Checkpoint-30-Iulie-2026-Refactorizare-Sesiunea6-VersionHistory
- Creat `components/VersionHistoryDropdown.tsx` with 130 linii.
- Extrase logicile de navigare între versiuni (dropdown pentru Studio, tab-uri pentru Demo).
- **Câștig net: -90 linii** din fișierele monolitice.
- TypeScript check: ✅ zero erori (`npx tsc --noEmit`).
- Git commit: `refactor: extras VersionHistoryDropdown.tsx (Sesiunea 6)`.
- **Status refactorizare:** ✅ Sesiunea 6 completă.

### Fișiere ÎNGHEȚATE suplimentar (Sesiunea 6 Refactorizare):
| Fișier | Motivul Freeze |
|---|---|
| `components/VersionHistoryDropdown.tsx` | Componentă izolată pentru meniul de versiuni (Original, EU Funds, Investitor) |

### Checkpoint-30-Iulie-2026-Refactorizare-Sesiunea7-ExportActions
- Creat hook-ul pur `hooks/useExportActions.ts`.
- Extrasă logica masivă de descărcare (PDF, PPTX, Word) din `StudioDesktop.tsx` și `DemoDesktop.tsx`.
- **Câștig net: -140 linii per fișier** din monoliți.
- TypeScript check: ✅ zero erori (`npx tsc --noEmit`).
- Git commit: `refactor: extras logica de export în hooks/useExportActions.ts (Sesiunea 7)`.
- **Status refactorizare:** ✅ Sesiunea 7 completă.

### Fișiere ÎNGHEȚATE suplimentar (Sesiunea 7 Refactorizare):
| Fișier | Motivul Freeze |
|---|---|
| `hooks/useExportActions.ts` | Hook pur pentru gestionarea descărcărilor documentelor generate |

### Checkpoint-30-Iulie-2026-Refactorizare-Modulara-Completa
- Eliminat complet codul mort (`jspdf`, `html-to-image`, funcțiile de export duplicate) din cele 2 fișiere Desktop.
- **Rulare `npm run build` completă cu 0 erori TypeScript și 100% succes pe paginile statice.**
- **Sesiunea 8 (Testare și Consolidare Finală) — COMPLETĂ.**
- Refactorizarea arhitecturală s-a încheiat cu succes! Structura a fost decuplată, monoliții Desktop sunt mai ușor de mentenat, iar funcționalitatea UI/UX este neatinsă.

### Checkpoint-30-Iulie-2026-Securitate-Gitignore
- Rezolvat incident de securitate semnalat de GitHub (Scurgere de chei Firebase/Google și Stripe în `.env`).
- Adăugat `.env` și `.env.local` în `.gitignore` și făcut commit `chore: eliminare .env din repozitoriu pentru securitate`.
- Cheia Firebase "Browser key" a fost rotită manual din Google Cloud Console și pusă sub restricții HTTP Referrer (`*ideeata.ai/*` și `http://localhost:*`).

### Checkpoint-30-Iulie-2026-UX-Instrumente-Si-Localizare
- Corectat bug-ul de UX în `DemoLeftSidebar` și `StudioLeftSidebar`: săgeata de dropdown (▲/▼) de la asistentul "Rescrie Tonul" a fost ascunsă pentru utilizatorii neautentificați, prevenind inducerea în eroare (deoarece acțiunea deschide modalul de login, nu un dropdown).
- Eliminat "hardcoding-ul" în limba română din `DemoLeftSidebar` pentru denumirile instrumentelor AI (ex. *Rescrie Tonul, Formal & Academic, Optimizează Bugetul*).
- Legat toate etichetele instrumentelor la obiectul de traduceri `uiStrings` pentru o experiență perfect nativă în RO, EN și ES.
- Git commit efectuat cu succes, iar build-ul Next.js a trecut în 8.5 secunde (0 erori TypeScript).

### Fișiere ÎNGHEȚATE suplimentar (UX & Localizare Sidebars):
| Fișier | Motivul Freeze |
|---|---|
| `components/sidebars/DemoLeftSidebar.tsx` | Localizare completă, texte dinamice prin `uiStrings`, eliminare săgeată dropdown pentru vizitatori. |
| `components/sidebars/StudioLeftSidebar.tsx` | Eliminare săgeată dropdown pentru conturi nelogate. |

### Checkpoint-30-Iulie-2026-UX-ExpertDrawer-Responsiv
- Implementată soluție UX hibridă pentru `ExpertSectionsDrawer.tsx`.
- Pe telefoane (mobil, sub `md`), categoriile rămân cu swipe orizontal (`overflow-x-auto no-scrollbar`) pentru a salva spațiu vertical.
- Pe desktop/tablete mari (peste `md`), categoriile folosesc `flex-wrap` automat, fiind expuse pe 1-2 rânduri, asigurând vizibilitate 100% și eliminând necesitatea de a folosi scroll orizontal ciudat cu mouse-ul.
- Build validat 100% cu succes în Next.js.

### Fișiere ÎNGHEȚATE suplimentar (Expert Drawer):
| Fișier | Motivul Freeze |
|---|---|
| `components/modals/ExpertSectionsDrawer.tsx` | Optimizare responsivă categorii (flex-wrap desktop, carusel swipe mobil). |

### Checkpoint-30-Iulie-2026-Bugfix-JSON-Keys-Buget
- Corectat un bug critic în `app/api/edit/route.ts` unde acțiunile de "Optimizare Buget" și "Plan Profesionist" (prin `buildMetaPrompt`) instruiau modelul LLM să traducă cheile JSON (`item` și `explicatie`) în loc de conținutul lor.
- S-a aplicat fix-ul pentru toate cele 3 limbi (RO, EN, ES) stipulând: "ESTE STRICT INTERZIS să modifici numele cheilor JSON (ele trebuie să rămână 'item' și 'explicatie')".
- Această remediere asigură compatibilitatea cu `EditForm.tsx` (care se așteaptă la cheile exacte `item` și `explicatie` pentru randarea input-urilor).
- Build validat 100% cu succes în Next.js.

### Fișiere ÎNGHEȚATE suplimentar (API Edit):
| Fișier | Motivul Freeze |
|---|---|
| `app/api/edit/route.ts` | Instrucțiuni stricte (DO NOT RENAME KEYS) adăugate pentru `optimize_budget` și `buildMetaPrompt` (RO/EN/ES). |

### Checkpoint-30-Iulie-2026-Bugfix-Investitor-Si-Butoane-Verzi
- Remediere critică a butoanelor verzi "Start" de pe paginile statice (About Us, Contact, Cookies, Privacy, Terms) în toate limbile (RO, EN, ES). A fost adăugat parametrul `?start=nou` pentru a curăța `localStorage` la click.
- Remediere critică a bug-ului "Buget Gol" în instrumentele de rescriere de ton (Plan Profesionist, Fonduri UE, etc.). Apelul paralel la `buildMetaPrompt` a fost dezactivat pentru aceste acțiuni (evitând consumul inutil de tokeni și erorile de tip "empty array" ale AI-ului pe traduceri circulare).
- Adăugat mecanism de protecție (fallback robust) în `app/api/edit/route.ts` astfel încât dacă `parsedMeta.buget_investitii` nu este un array valid, sistemul să preia obligatoriu bugetul din planul curent original (`result.plan_financiar.buget_investitii`).
- Build validat 100% cu succes în Next.js, fără erori TypeScript.

### Fișiere ÎNGHEȚATE suplimentar (Statice & API Edit):
| Fișier | Motivul Freeze |
|---|---|
| Paginile Statice (RO/EN/ES) | `contact`, `cookies`, `despre-noi`, `privacy`, `termeni` — butoanele verzi folosesc STRICT ruta `?start=nou`. |
| `app/api/edit/route.ts` | Optimizat pentru a nu traduce meta-date la acțiunile mari (isBigAction). Logica de fallback a bugetului (`Array.isArray`) este ÎNGHEȚATĂ. |

### Checkpoint-30-Iulie-2026-Localizare-Mockup-Complet
- Remediere eroare de mixare a limbilor (RO peste EN/ES) pe paginile Demo si Studio.
- Extins `lib/uiStrings.ts` cu peste 40 de chei noi de traducere pentru continutul complet al exemplului "Cafenea de Specialitate Urban Beans".
- Refactorizat `components/MockupPreview.tsx` pentru a folosi exclusiv textele dinamice din `uiStrings.ts`.
- Curatat `components/DemoDesktop.tsx` de texte hardcodate in romana ("Cum arata un plan generat?").
- Build validat 100% cu succes in Next.js, fara erori TypeScript.

### Fisiere ÎNGHEȚATE suplimentar (Localizare Mockup):
| Fisier | Motivul Freeze |
|---|---|
| `components/MockupPreview.tsx` | Complet localizat si legat la `uiStrings.ts`. Text hardcodat eliminat complet. |
| `components/DemoDesktop.tsx` | Referinte la `uiStrings.ts` pentru titluri deasupra mockup-ului. |
| `lib/uiStrings.ts` | Extins cu forma completa a mock-ului pentru RO, EN, ES. |

### Checkpoint-30-Iulie-2026-Remediere-UX-Localizare-Editare
- Aplicata Regula de Aur a Localizarii in \components/DemoDesktop.tsx\ si \components/StudioDesktop.tsx\ (modul isEditing).
- Eliminate textele hardcodate in romana ('Studio Editare', 'Anuleaza', 'Confirma').
- Condiționat afisarea selectorului LEI/EUR in ActionBar doar cand \locale === "ro"
- Build validat 100% cu succes in Next.js (44/44 pagini statice generate).

### Checkpoint - Plan de Implementare - Localizare Nume Fisiere Descarcate
- Adaugat fileBrochure in uiStrings.ts pentru a traduce numele fisierului PPTX.
- Inlocuit string-urile hardcodate din hooks/useExportActions.ts si lib/generatePptx.ts cu variabilele din dictionar (t.filePresentation, t.fileSummaryFree, etc.).
- Fisierele salvate pe calculatorul utilizatorului isi preiau acum dinamic numele in limba corespunzatoare (RO, EN, ES).
- Build validat 100% cu succes in Next.js (44/44 pagini statice generate).

### Checkpoint-31-Iulie-2026-Localizare-PDF-Complet
- Extins dicționarul `uiStrings.ts` cu proprietățile `paywallDescStudio` și `protectedContentPrint`, și încorporat tag-urile HTML de design direct în variabile.
- Eliminat hardcodările textului românesc de pe slide-ul final (Call-to-Action) din `DemoPdfSlides.tsx` și `StudioPdfSlides.tsx`.
- Eliminat textul de protecție print ascuns (doar în română) din `DemoDesktop.tsx`.
- Efectuat validarea detaliată a linkurilor universale din PDF (`https://ideeata.ai/shared/{ID}`) și confirmat logica de auto-redirecționare inteligentă pe limba vizitatorului.
- Build validat cu succes (100% pagini statice generate, 0 erori).


### Checkpoint-31-Iulie-2026-Fix-Auth-Localhost-Si-Email
- Corectat `getAuthDomain` în `lib/firebase.ts` pentru a folosi domeniul implicit pe localhost, rezolvând blocajul SSL la pop-up-ul Google.
- Modificat `app/api/auth/send-verification/route.ts` pentru a genera link-uri de verificare stabile timp de 72 de ore (fără `handleCodeInApp`) și cu redirecționare dinamică (localhost vs producție).
- Git commited & pushed. Working tree 100% curat.


### Checkpoint-31-Iulie-2026-Centralizare-promptConfig
- Creat `lib/promptConfig.ts` centralizând toate regulile și scheletele de generare / editare pe limbi (RO/EN/ES).
- Refactorizat `/api/generate` și `/api/edit` pentru a folosi helper-ele din `promptConfig.ts`.
- Verificat build Next.js (44/44 pagini statice generate cu succes).
- Git committed & pushed. Working tree curat.


### Checkpoint-31-Iulie-2026-Uniformizare-Moneda-LEI-EUR
- Unificat managementul monedei (LEI / EUR) în toate secțiunile (AI generator/editor, Firestore sync, EditForm, documente exportate).
- AI generează direct în moneda selectată (LEI sau EUR) și salvează proprietatea `selectedCurrency`.
- Interfața (Desktop și Mobil) încarcă și sincronizează automat moneda salvată pe plan.
- Corectat double-conversion bugs în `priceHelper.ts`, `generateDocx.ts` și `generatePptx.ts`.
- Adăugat badge-uri colorate pentru monedă pe cardurile de planuri în Dashboard (`app/dashboard/DashboardContent.tsx`).
- Adăugat badge-ul verde de deblocare gratuită `🔒 Cont Gratuit` pe butonul "Rescrie tonul" din Demo Sidebar pentru vizitatorii nelogați.
- Corectat coordonatele link-ului de paywall în PDF-ul exportat (`hooks/useExportActions.ts`) pentru a acoperi tot slide-ul final de CTA, asigurând click-ul garantat pe orice cititor PDF.
- Verificat build Next.js: ✅ `✓ Compiled successfully`, ✅ `✓ Generating static pages (44/44)`.
- Git committed & pushed.

### Checkpoint-20-August-2026-S7-Deploy-Standalone-Fix
- Sesiunea 7 (mobile/tabletă RO/EN/ES) pe branch `cursor/pdf-cta-locale-and-plan-fill`.
- Incident live: `ChunkLoadError` pe `ideeata.ai` după rebuild — cauza = `.next/static` necopiat în `.next/standalone` (nu AdSense).
- Remediat pe Hetzner: `cp -a .next/static .next/standalone/.next/` + `public` + `pm2 restart ideeata`.
- `deploy.sh` adăugat în repo (REGULA #23).
- Layout: `<NetworkStatusIndicator />` în root; **fără** `<AdSenseLoader />` în root (REGULA #18).

