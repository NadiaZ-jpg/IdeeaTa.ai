# 📊 Analiza Completă — IdeeaTa.ai
> **Audit realizat:** 14 Iulie 2026, ora 08:18  
> **Auditor:** Antigravity AI  
> **Versiune cod analizat:** commit `83580e3` (branch principal)

---

## ✅ CE FUNCȚIONEAZĂ CORECT

### 🤖 Generare AI (`/api/generate`)
- Apelul la **Gemini 2.5 Flash** funcționează, cu sistem de retry (3 încercări) și timeout de 60s.
- Prompt-ul este bine structurat pentru a returna un JSON valid conform structurii planului.
- Rate-ul valutar (`fx_rate = 0.201`) este **hardcodat** — nu este dinamic, dar nu e o problemă critică.

### ✏️ Editare AI (`/api/edit`)
- Cele 6 tipuri de editare (Ton, Budget, EU Funds, Investor, Adaugă Secțiuni, Scurtare export) funcționează.
- **Arhitectura paralelă** pentru acțiunile mari (eu_funds, investor_ready, tone) reduce timeout-urile.
- Curățarea agresivă a JSON-ului (`cleanJsonString`) previne erorile de parse.

### 🔐 Autentificare Firebase
- Login cu **email/parolă**, **Google** și **Facebook** sunt implementate.
- Reset parolă prin email funcționează.
- Listener `onAuthStateChanged` funcționează corect.
- Starea utilizatorului (credits, subscripție, planuri deblocate) se sincronizează **în timp real** din Firestore via `onSnapshot`.

### 💾 Persistență Date
- Planurile generate se salvează automat în **localStorage** și în **Firestore** (subcollecția `users/{uid}/plans`).
- Hook-ul `useStudioLoader` gestionează: încărcarea din localStorage, din Firebase (planId), și din link-uri partajate (sharedId).
- Sistemul de **versiuni multiple** (Original / EU Funds / Investor) este implementat și salvat în localStorage.

### 💳 Sistem de Plăți (Lemon Squeezy)
- Checkout-ul trimite corect userId și metadata.
- Webhook-ul verifică semnătura criptografică HMAC-SHA256 — **securitate corectă**.
- Cele 3 tipuri de pachet (`standard`, `eu-funds`, `pro`) se procesează distinct în webhook.

### 📥 Export Documente
- **PPTX** (PowerPoint) — generat client-side cu `pptxgenjs`, slides bine structurate.
- **PDF Prezentare** — generat cu `html-to-image` + `jsPDF`, cu slide-uri din DOM.
- **Word (DOCX)** — generat cu `generateDocxBlob` din `lib/generateDocx.ts`.
- **PDF Sumar Gratuit** — versiune simplificată accesibilă fără plată.

### 🔗 Partajare Planuri
- API-ul `/api/share` salvează planul în Firestore (`shared_plans`) și returnează un ID.
- `/api/share/[id]` recuperează planul după ID pentru vizualizare publică.

### 📊 Dashboard
- Afișează istoricul planurilor din Firestore, ordonat descrescător după dată.
- Redirecționează la `/login` dacă nu ești autentificat.

### 🎨 UX / UI
- Loading states animate (spinner + mesaje dinamice) la generare și la editare AI.
- Reclame AdSense afișate la loading screen (pentru utilizatori fără abonament).
- Copiere protejată (`select-none`, blocarea Ctrl+C/P/S) pentru previzualizare neplătită.

---

## ⚠️ PROBLEME IDENTIFICATE

### 🔴 CRITICĂ #1 — Conflict Dublat de Logică (`useStudioLoader` vs. `page.tsx`)

Hook-ul `useStudioLoader.ts` a fost creat ca componentă separată, dar **nu este importat/utilizat în `page.tsx`**. Acesta este **cod mort**.

În același timp, `page.tsx` conține **aceeași logică** duplicată intern (liniile ~572-680): același listener `popstate`, același cod de citire din localStorage, aceeași setare a `result`.

**Riscuri:**
- Hook-ul nu face nimic în prezent — toată logica vine din `page.tsx`.
- Dacă cineva îl importă în viitor fără să știe că logica există deja, va rula **de două ori**, cauzând race conditions și comportament impredictibil.

**Soluție recomandată:** Fie se șterge hook-ul și se păstrează logica din `page.tsx`, fie se importează hook-ul și se elimină logica duplicată din `page.tsx`.

---

### 🔴 CRITICĂ #2 — `verify-checkout` folosește Stripe, dar plata este prin Lemon Squeezy

Fișierul `app/api/verify-checkout/route.ts` importă și folosește **Stripe** (`stripe.checkout.sessions.retrieve`), dar aplicația procesează plăți prin **Lemon Squeezy**. Stripe nu mai este folosit nicăieri altundeva în proiect.

Dacă un utilizator se întoarce după plată cu `?payment_success=true&session_id=...`, funcția va căuta sesiunea în Stripe și va **eșua**. Deblocarea automată după plată prin redirect NU funcționează.

> **Notă:** Deblocarea prin **webhook** funcționează corect. Plata nu se pierde, dar UX-ul după plată este rupt (utilizatorul nu vede confirmarea automată).

**Soluție recomandată:** Înlocuiește logica din `verify-checkout` cu citire directă din Firestore (dacă webhook-ul a scris deja datele), eliminând dependența de Stripe complet.

---

### 🟡 MEDIE #3 — Fișiere `backup` și `test` în folderul `/app`

- `app/page.tsx.backup` (~205KB)
- `app/page.tsx.test` (~205KB)

Acestea nu sunt importate de Next.js, dar prezența lor crește inutil dimensiunea proiectului.

**Soluție recomandată:** Mutate în `backup_siguranta/` sau șterse.

---

### 🟡 MEDIE #4 — `EditForm.tsx` și `BudgetChart.tsx` plasate în `/app`

Aceste componente sunt plasate direct în `/app`, nu în `/components`, contravenind Regulii #14 și convenției Next.js.

**Fișiere afectate:**
- `app/EditForm.tsx`
- `app/BudgetChart.tsx`

**Soluție recomandată:** Mutate în folderul `/components`.

---

### 🟡 MEDIE #5 — Promo Code fără validare server-side

Funcția de cod promoțional setează `promoCodeUnlocked` local în state (client-side), fără nicio verificare server-side. Oricine cu DevTools poate manipula această variabilă.

**Soluție recomandată:** Un endpoint API care verifică codul față de o listă secretă din `.env` sau din Firestore.

---

### 🟢 MICĂ #6 — `devBypass` vizibil în browser

```typescript
const devBypass = process.env.NEXT_PUBLIC_DEV_BYPASS === 'true'
```

Variabilele `NEXT_PUBLIC_` sunt incluse în bundle-ul de client și sunt vizibile în browser. Dacă este activat în Vercel, orice utilizator poate ocoli plata.

**Soluție recomandată:** Eliminat complet sau mutat la o verificare server-side.

---

### 🟢 MICĂ #7 — Verificarea email-ului este dezactivată manual

În `app/dashboard/page.tsx`, linia 21:
```typescript
if (false && user && !user?.emailVerified) { // TEMPORAR OPRIT
```

**Soluție:** Când vrei să îl reactivezi, înlocuiește `false` cu `true`.

---

## 📋 Rezumat Prioritizat

| Prioritate | ID | Problemă | Fișier(e) afectat(e) |
|---|---|---|---|
| 🔴 Critică | #1 | `useStudioLoader` e cod mort / logică duplicată | `hooks/useStudioLoader.ts` + `app/studio/page.tsx` |
| 🔴 Critică | #2 | `verify-checkout` folosește Stripe în loc de Lemon Squeezy | `app/api/verify-checkout/route.ts` |
| 🟡 Medie | #3 | Fișiere backup/test în `/app` | `app/page.tsx.backup`, `app/page.tsx.test` |
| 🟡 Medie | #4 | Componente în `/app` în loc de `/components` | `app/EditForm.tsx`, `app/BudgetChart.tsx` |
| 🟡 Medie | #5 | Promo code validat doar client-side | `app/studio/page.tsx` |
| 🟢 Mică | #6 | `devBypass` ca variabilă publică | `app/studio/page.tsx` |
| 🟢 Mică | #7 | Verificare email dezactivată | `app/dashboard/page.tsx` |

---

## 🗺️ PLAN DE REZOLVARE PAS CU PAS

> Ordinea este calculată după: impact maxim + risc minim de a strica ceva.

---

### 📌 PASUL 1 — Curățare Fișiere (10 minute, risc ZERO)
**Ce facem:** Mutăm fișierele backup din `/app` în `/backup_siguranta`.

**De ce primul:** Nu atinge niciun cod activ. Zero risc. Curățăm terenul de lucru.

**Fișiere:**
- `app/page.tsx.backup` → `backup_siguranta/page.tsx.backup`
- `app/page.tsx.test` → `backup_siguranta/page.tsx.test`

**Verificare:** `npm run build` trebuie să treacă fără erori.

---

### 📌 PASUL 2 — Fix `verify-checkout` (30 minute, risc MIC)
**Ce facem:** Înlocuim toată logica Stripe cu o citire directă din Firestore. Logica va fi:
1. Primim `session_id` și `tier` din URL.
2. Citim documentul utilizatorului din Firestore.
3. Dacă webhook-ul a scris deja (`subscriptionActive`, `euFundsUnlocked`, `unlockedPlans`), returnăm `success: true`.
4. Dacă nu (webhook întârziat), returnăm `pending: true` și frontend-ul afișează un mesaj „Se procesează...".

**De ce al doilea:** Fix direct, fișier izolat, nu atinge UI-ul. Repară UX-ul după plată.

**Fișiere modificate:**
- `app/api/verify-checkout/route.ts` — rescris complet (eliminat Stripe, adăugat Firestore Admin)

**Verificare:** Test manual: fă o plată de test în Lemon Squeezy și urmărește dacă apare confirmarea.

---

### 📌 PASUL 3 — Curățare Logică Duplicată `useStudioLoader` (45 minute, risc MEDIU)
**Ce facem:** Alegem o strategie clară: **păstrăm logica în `page.tsx`** și **ștergem hook-ul mort** `useStudioLoader.ts`.

> Motivul: hook-ul nu este testat în producție (nu e importat nicăieri), deci este mai sigur să îl eliminăm decât să îl activăm și să introducem un comportament nou neașteptat.

**Pași:**
1. Ștergem fișierul `hooks/useStudioLoader.ts`.
2. Verificăm că nu există niciun import al lui în proiect.
3. Păstrăm neatinsă logica existentă din `page.tsx` (liniile ~572-680).

**Fișiere modificate:**
- `hooks/useStudioLoader.ts` — ȘTERS
- `app/studio/page.tsx` — verificat că nu importă hook-ul

**Verificare:** `npm run build` + test manual: generează un plan, dă refresh, dă Back — planul trebuie să rămână.

---

### 📌 PASUL 4 — Mutare Componente în `/components` (20 minute, risc MIC)
**Ce facem:** Mutăm `EditForm.tsx` și `BudgetChart.tsx` din `/app` în `/components` și actualizăm importurile.

**Pași:**
1. Copiem `app/EditForm.tsx` → `components/EditForm.tsx`
2. Copiem `app/BudgetChart.tsx` → `components/BudgetChart.tsx`
3. Actualizăm importul din `app/studio/page.tsx`:
   - `from "../EditForm"` → `from "@/components/EditForm"`
   - `from '../BudgetChart'` → `from '@/components/BudgetChart'`
4. Ștergem fișierele originale din `/app`.

**Fișiere modificate:**
- `app/studio/page.tsx` — 2 linii de import
- `components/EditForm.tsx` — [NOU]
- `components/BudgetChart.tsx` — [NOU]
- `app/EditForm.tsx` — [ȘTERS]
- `app/BudgetChart.tsx` — [ȘTERS]

**Verificare:** `npm run build`.

---

### 📌 PASUL 5 — Securizare Promo Code (60 minute, risc MIC)
**Ce facem:** Creăm un endpoint API `/api/validate-promo` care verifică codul față de o listă secretă din `.env`.

**Pași:**
1. Adăugăm în `.env.local`: `PROMO_CODES=COD1:standard,COD2:eu-funds,COD3:full-access`
2. Creăm `app/api/validate-promo/route.ts`:
   - Primește `{ code, userId }` prin POST.
   - Verifică codul față de lista din `PROMO_CODES`.
   - Returnează `{ valid: true, tier: "standard" }` sau `{ valid: false }`.
3. Modificăm logica din `page.tsx` (funcția `handlePromoCode`) să apeleze API-ul în loc să verifice local.

**Fișiere modificate:**
- `app/api/validate-promo/route.ts` — [NOU]
- `app/studio/page.tsx` — funcția `handlePromoCode` (câteva linii)
- `.env.local` — adăugat `PROMO_CODES`
- `.env.example` — adăugat exemplu `PROMO_CODES`

**Verificare:** Test manual cu un cod valid și unul invalid.

---

### 📌 PASUL 6 — Eliminare `devBypass` (5 minute, risc ZERO)
**Ce facem:** Verificăm dacă `NEXT_PUBLIC_DEV_BYPASS` este setat în Vercel. Dacă nu, lăsăm codul ca atare (nu face nimic). Dacă da, îl eliminăm din Vercel Environment Variables.

**Notă:** Codul în sine nu e periculos dacă variabila de mediu nu e setată în producție. Prioritate scăzută.

---

### 📌 PASUL 7 — Reactivare Verificare Email (opțional, la decizia ta)
**Ce facem:** Schimbăm `if (false &&` cu `if (` în `app/dashboard/page.tsx` linia 21.

**Notă:** Fă asta DOAR dacă vrei ca utilizatorii să fie obligați să verifice emailul. Dacă nu, lasă dezactivat.

---

## 📅 Estimare Totală

| Pas | Timp estimat | Risc |
|---|---|---|
| Pasul 1 — Curățare fișiere | 10 min | 🟢 Zero |
| Pasul 2 — Fix verify-checkout | 30 min | 🟢 Mic |
| Pasul 3 — Curățare useStudioLoader | 45 min | 🟡 Mediu |
| Pasul 4 — Mutare componente | 20 min | 🟢 Mic |
| Pasul 5 — Securizare promo code | 60 min | 🟢 Mic |
| Pasul 6 — Eliminare devBypass | 5 min | 🟢 Zero |
| Pasul 7 — Reactivare email (opțional) | 5 min | 🟢 Zero |
| **TOTAL** | **~3 ore** | |

---

## 📝 Status Implementare

| Pas | Status | Data finalizării |
|---|---|---|
| Pasul 1 — Curățare fișiere | ✅ Finalizat | 14 Iulie 2026 |
| Pasul 2 — Fix verify-checkout | ✅ Finalizat | 14 Iulie 2026 |
| Pasul 3 — Curățare useStudioLoader | ✅ Finalizat | 14 Iulie 2026 |
| Pasul 4 — Mutare componente | ✅ Finalizat | 14 Iulie 2026 |
| Pasul 5 — Securizare promo code | ⏳ Neînceput | — |
| Pasul 6 — Eliminare devBypass | ⏳ Neînceput | — |
| Pasul 7 — Reactivare email | ⏳ Opțional | — |

---

## 📋 PLAN DE IMPLEMENTARE DETALIAT — PASUL 2

### Context

Aplicația folosește **Lemon Squeezy** pentru plăți, dar fișierul `app/api/verify-checkout/route.ts` apelează **Stripe** — un furnizor de plăți care nu mai este folosit nicăieri în proiect. Rezultat: UX-ul de confirmare după plată este complet rupt.

### Fluxul actual (RUPT) 🔴

```
1. Utilizatorul plătește pe Lemon Squeezy
2. Lemon Squeezy redirecționează la:
   /studio?payment_success=true&session_id=XXX&tier=standard
3. page.tsx apelează → /api/verify-checkout?session_id=XXX
4. verify-checkout caută sesiunea XXX în STRIPE ← EȘUEAZĂ (nu există acolo)
5. Returnează eroare → data.success = false
6. Utilizatorul NU vede confirmarea. Planul rămâne blocat vizual.
```

### Fluxul după fix (CORECT) ✅

```
1. Utilizatorul plătește pe Lemon Squeezy
2. Webhook Lemon Squeezy → /api/webhook → scrie în Firestore (async)
3. Lemon Squeezy redirecționează la:
   /studio?payment_success=true&session_id=XXX&tier=standard&userId=UID
4. page.tsx apelează → /api/verify-checkout?session_id=XXX&userId=UID&tier=standard
5. verify-checkout citește documentul utilizatorului din Firestore
6. Dacă webhook-ul a scris deja → returnează { success: true, userId, tier }
7. Dacă nu (întârziere webhook) → returnează { success: false, pending: true }
8. page.tsx afișează confirmarea ✅
```

### Fișier modificat — SINGURUL

#### [MODIFY] `app/api/verify-checkout/route.ts`

**Codul ACTUAL (de înlocuit):**
```typescript
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
  apiVersion: "2023-10-16" as any,
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("session_id");
    if (!sessionId) {
      return NextResponse.json({ error: "Lipseste session_id" }, { status: 400 });
    }
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status === "paid") {
      return NextResponse.json({
        success: true,
        tier: session.metadata?.tier,
        userId: session.metadata?.userId,
        planName: session.metadata?.planName,
      });
    }
    return NextResponse.json({ success: false, status: session.payment_status });
  } catch (error: any) {
    console.error("Error verifying checkout session:", error);
    return NextResponse.json({ error: error.message || "Eroare la verificarea sesiunii Stripe" }, { status: 500 });
  }
}
```

**Codul NOU (propus):**
```typescript
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const tier   = searchParams.get("tier");

    if (!userId) {
      return NextResponse.json({ error: "Lipseste userId" }, { status: 400 });
    }

    const userRef  = adminDb.collection("users").doc(userId);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return NextResponse.json({ success: false, pending: true });
    }

    const data = userSnap.data() || {};

    let isUnlocked = false;
    if (tier === "standard") {
      isUnlocked = Array.isArray(data.unlockedPlans) && data.unlockedPlans.length > 0;
    } else if (tier === "eu-funds") {
      isUnlocked = data.euFundsUnlocked === true;
    } else if (tier === "pro") {
      isUnlocked = data.subscriptionActive === true;
    }

    if (isUnlocked) {
      return NextResponse.json({ success: true, userId, tier });
    }

    return NextResponse.json({ success: false, pending: true });

  } catch (error: any) {
    console.error("Error verifying checkout:", error);
    return NextResponse.json(
      { error: error.message || "Eroare la verificarea platii" },
      { status: 500 }
    );
  }
}
```

### Fișiere care NU se modifică

- `app/studio/page.tsx` — consumă același `data.success`, zero schimbări necesare
- `app/api/webhook/route.ts` — rămâne sursa de adevăr, neatins
- `lib/firebase-admin.ts` — deja exportă `adminDb`, folosit direct
- Orice alt fișier din proiect

### Analiza riscurilor

| Risc | Probabilitate | Impact | Mitigation |
|---|---|---|---|
| Webhook întârzie > 10s | Scăzut | Mic | `pending: true` → UI poate afișa "Se procesează..." |
| Firebase Admin nu e inițializat local | Cert local | Zero pe prod | Credențialele lipsesc local dar sunt pe Vercel |
| page.tsx nu gestionează `pending: true` | Posibil | Mic | Utilizatorul primește deblocarea via `onSnapshot` din Firestore oricum |

### Plan de verificare

1. `npm run build` — build verde fără erori TypeScript
2. Test manual pe Vercel (producție): plată de test → redirect → confirmare vizibilă
3. Freeze pe `app/api/verify-checkout/route.ts` după verificare

### Ce NU se face în acest pas

- Nu se modifică `page.tsx`
- Nu se adaugă logică de retry în frontend
- Nu se schimbă webhook-ul
