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
REGULA #17: (FREEZE PACHETE) Există fix 2 pachete: Standard (39 RON) și Instrumente Profesionale (99 RON). Logica în lib/accessControl.ts este ÎNGHEȚATĂ. Modificare doar cu "override freeze pachete".
REGULA #18: (FREEZE ADSENSE) Integrarea Google AdSense este ÎNGHEȚATĂ. Modificare doar cu "override freeze adsense".
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
- app/shared/[id]/page.tsx — ÎNGHEȚAT. Redirecționarea modificată la `/demo?sharedId=${id}` pentru a asigura randarea corectă a planurilor partajate.
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

## FREEZE TOTAL — Inventar Complet Sesiunea 16 Iulie 2026

### Fișiere ÎNGHEȚATE (nu se modifică fără override explicit):
| Fișier | Motivul Freeze |
|---|---|
| `app/demo/page.tsx` | REGULA #8 — Funnel Try-Before-You-Buy perfect |
| `app/studio/page.tsx` | REGULA #9 — Seiful aplicației |
| `app/login/page.tsx` | REGULA #10 |
| `app/page.tsx` | REGULA #11 — Landing Page |
| `app/shared/[id]/page.tsx` | Pasul 1 — Redirecționare corectă la `/demo` pentru planuri partajate |
| `app/contact/page.tsx`, `app/cookies/page.tsx`, `app/despre-noi/page.tsx`, `app/privacy/page.tsx`, `app/termeni/page.tsx` | Pasul 2 — Înlocuit referințe `/start` cu `/demo` |
| `lib/firebase.ts` | Aliniere import Firestore la nivel client-side (remediere eroare runtime /studio) |
| `app/api/verify-checkout/route.ts` | Pasul 2 — Lemon Squeezy, fără Stripe |
| `hooks/useStudioFirebaseSync.ts` | Pasul 3 — Sync Firebase |
| `components/EditForm.tsx` | Pasul 4 — Mutat din /app |
| `components/BudgetChart.tsx` | Pasul 4 — Mutat din /app |
| `components/StudioDataLoader.tsx` | REGULA #16 — Sertarul intangibil |
| `lib/accessControl.ts` | REGULA #17 — 2 pachete fixe |
| `components/PricingModal.tsx` | REGULA #17 — Structura pachete |

### Fișiere ȘTERSE definitiv (nu se recreează) / ARHIVATE:
- `app/EditForm.tsx`
- `app/BudgetChart.tsx`
- `hooks/useStudioLoader.ts`
- `app/start/` (mutat în `backup_siguranta/start/`)
- `backup_siguranta/page.tsx.backup`
- `backup_siguranta/page.tsx.test`

### Build verificat la finalul sesiunii:
- ✅ `✓ Compiled successfully in 2.1min` (după curățare cache `.next`)
- ✅ `✓ Generating static pages (22/22)`
- ✅ Zero erori TypeScript



