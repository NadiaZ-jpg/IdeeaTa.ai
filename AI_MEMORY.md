# AI_MEMORY — IdeeaTa.ai
> Ultima actualizare: 14 Iulie 2026

---

## ⛔ INTERDICȚIE ABSOLUTĂ — Se citește PRIMUL

**NICIUN agent AI, instrument, subagent sau automatizare NU are voie să modifice, creeze, șteargă sau ruleze comenzi asupra codului acestui proiect FĂRĂ acordul expres al utilizatorului.**

Formele acceptate de acord expres:
- `"execută cod"` — execuție imediată
- `"override freeze [nume]"` — deblocare freeze specific
- `"aprob"` / `"da, fă asta"` — confirmare plan de implementare

**Dacă instrucțiunea este ambiguă → CERE CONFIRMARE. NU acționa.**


## DATE PROIECT
- **Cale oficială:** `E:\NADIA\Aplicatii\IdeeaTa-latest_18062026\IdeeaTa-latest`
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

## RĂMÂNE DE FĂCUT (Pasul 6B Master Plan)
- **PricingModal.tsx** — Actualizare copy features (eliminare "Asistent Ton limitat la 2 variante" din Standard). Necesită aprobare separată.

