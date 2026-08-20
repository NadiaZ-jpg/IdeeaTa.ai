# Plan de implementare — Audit IdeeaTa.ai (20 august 2026)

**Acoperire obligatorie pe fiecare sesiune:** Desktop · Mobile · Tabletă × RO · EN · ES  
**Ops:** lucru pe `main` → commit → `git push origin main` → server `cd ~/IdeeaTa.ai && ./update.sh`

### Cum citim matricea

| Simbol | Însemnă |
|--------|---------|
| **Must** | Trebuie verificat / reparat în sesiunea asta |
| **Sanity** | Verificare rapidă că nu am stricat |
| **N/A** | Nu se aplică (ex. bug doar Desktop) |
| **Decizie** | Depinde de alegerea produsului (fază E) |

**Tabletă:** după E1 (**E-B**): Mobile UI dacă lățimea &lt; 1024px, Desktop UI dacă ≥ 1024px (client + Client Hints când există). UA rămâne doar hint SSR.

---

## Stare acum (A1–B2 + deploy)

| Sesiune | Status | Desktop | Mobile | Tabletă | RO | EN | ES |
|---------|--------|---------|--------|---------|----|----|-----|
| **A1** Guest list Demo | ✅ | Must ✅ | Sanity ✅ | Sanity | ✅ | ✅ | ✅ |
| **A2** Migrate + Dashboard | ✅ | Must ✅ | Must ✅* | Sanity | ✅ | ✅ | ✅ |
| **B1** Tab-uri QuotaExceeded | ✅ | Must ✅ | Must ✅ | Sanity | ✅ | ✅ | ✅ |
| **B2** Edit vs combine + export | ✅ | Must ✅ | Must ✅ | Sanity | ✅ | ✅ | ✅ |
| **C1** Auth Desktop EN/ES | ✅ | Must ✅ | Sanity | Sanity | ✅ | ✅ | ✅ |
| **C2** Demo Mobile Pro→auth | ✅ | Sanity | Must ✅ | Must* | ✅ | ✅ | ✅ |
| **C3** Studio Mobile tabs+shared | ✅ | Sanity | Must ✅ | Must* | ✅ | ✅ | ✅ |
| **D1** Share Desktop | ✅ | Must ✅ | Sanity | Sanity | ✅ | ✅ | ✅ |
| **D2** Edit manual Demo Mobile | ✅ | Sanity | Must ✅ | Must* | ✅ | ✅ | ✅ |
| **D3** Guest list Demo Mobile | ✅ | Sanity | Must ✅ | Must* | ✅ | ✅ | ✅ |
| **E1** Tabletă **E-B** (width &lt;1024) | ✅ | Sanity | Sanity | Must ✅ | ✅ | ✅ | ✅ |
| **F1** LEI → RON | ✅ | Must ✅ | Must ✅ | Sanity | ✅ | N/A* | N/A* |
| **F2** Redirect legal/resurse | ✅ | Must ✅ | Must ✅ | Sanity | — | ✅ | ✅ |
| **F3** Guest cotă 3 server | ✅ | Must ✅ | Must ✅ | Sanity | ✅ | ✅ | ✅ |
| Ops `./update.sh` | ✅ | — | — | — | — | — | — |

\*A2: migrare/Dashboard pe toate device-urile după login; bug-ul delete-on-name era cross-device.

**Nu reintra în A/B** fără regres.

---

## Principii (toate sesiunile)

1. Doar **`main`**.
2. Dacă bug-ul e pe un ecran, **parity** pe perechea Desktop/Mobile când există același flux.
3. Stringuri RO/EN/ES în `uiStrings` (sau același map ca Login).
4. Acceptanță = bifă pe **matricea sesiunii**, nu doar „merge pe RO Desktop”.
5. La final: `tsc` → FREEZE `AI_MEMORY` → commit → push → `./update.sh`.
6. Smoke producție: **RO Desktop + EN Desktop + 1 telefon real** (nu doar fereastră îngustă).

---

# Faza C — Bug-uri „Rău”

## C1 — Desktop EN/ES: erori login în limba corectă

**Problemă:** pe Demo/Studio **Desktop**, erorile auth apar în RO pe `/en` și `/es`.

### Matrice acoperire

| | Desktop | Mobile | Tabletă |
|--|---------|--------|---------|
| **RO** | Sanity (rămâne RO) | Sanity | Sanity |
| **EN** | **Must** (mesaj EN) | Sanity (deja ok) | Sanity (= Mobile/Desktop după UA) |
| **ES** | **Must** (mesaj ES) | Sanity | Sanity |

### Task-uri
1. Inventar mesaje hardcodate RO în `DemoDesktop` + `StudioDesktop`.
2. Aliniere la aceleași chei ca Login dedicat / Mobile.
3. Nu schimba copy pe Mobile decât dacă e drift evident.

### Acceptanță
- `/en/demo` + `/es/demo` Desktop: parolă greșită → EN / ES.
- `/demo` Desktop: tot RO.
- Mobile EN/ES: neschimbat (sanity).
- Tabletă: același rezultat ca device-ul pe care cade (Must doar dacă e Desktop UA).

**Estimare:** 0,5–1 sesiune · **Risc:** mic

---

## C2 — Demo Mobile: oaspete + unealtă Pro → auth

**Problemă:** pe telefon, guest + Pro → spinner / fără modal auth.

### Matrice acoperire

| | Desktop | Mobile | Tabletă |
|--|---------|--------|---------|
| **RO** | Sanity (Desktop deja deschide auth) | **Must** | **Must** dacă UI = Mobile |
| **EN** | Sanity | **Must** | **Must** dacă UI = Mobile |
| **ES** | Sanity | **Must** | **Must** dacă UI = Mobile |

### Task-uri
1. Gate „necesită cont” → `setShowAuthModal(true)` + stop spinner.
2. Același pattern pe toate localele (fără texte doar RO).
3. Sanity Studio Mobile dacă același bug.

### Acceptanță
- Guest pe telefon real RO/EN/ES: unealtă Pro → modal/sheet auth, fără blocaj.
- Desktop: Pro guest tot deschide auth (sanity).
- Tabletă tip iPad (Mobile UI): același Must ca Mobile.

**Estimare:** 0,5–1 · **Risc:** mic–mediu

---

## C3 — Studio Mobile: tab-uri după auto-fill + `sharedId`

**Problemă:** (a) tab-uri rămân în urmă după fill; (b) link shared nu încarcă pe Studio telefon (Demo da).

### Matrice acoperire

| | Desktop | Mobile | Tabletă |
|--|---------|--------|---------|
| **RO** | Sanity (fill + tabs Desktop) | **Must** (tabs + shared) | **Must** dacă Mobile UI |
| **EN** | Sanity | **Must** | **Must** dacă Mobile UI |
| **ES** | Sanity (fill ES e mai fragil — Must pe Mobile) | **Must** | **Must** dacă Mobile UI |

### Task-uri
1. Fill → sync `versions[activeVersionId]` + `result`.
2. Load `sharedId` pe Studio Mobile ca pe Demo (hook comun dacă e natural).
3. Nu rupe Dashboard→Studio handoff (Desktop + Mobile).

### Acceptanță
- Studio telefon RO/EN/ES: după fill, tab activ = ecran.
- Link shared Studio pe telefon RO/EN/ES: planul se încarcă.
- Desktop Studio: sanity tabs + shared dacă există.
- Tabletă Mobile-UI: Must ca Mobile.

**Estimare:** 1–1,5 · **Risc:** mediu

**Ordine C:** C1 → C2 → C3

---

# Faza D — Funcții / UX

## D1 — Share pe Desktop

### Matrice

| | Desktop | Mobile | Tabletă |
|--|---------|--------|---------|
| **RO** | **Must** (buton + copy/link) | Sanity (share nativ există) | Sanity / Must dacă Desktop UI |
| **EN** | **Must** | Sanity | idem |
| **ES** | **Must** | Sanity | idem |

**Acceptanță:** Demo + Studio Desktop, 3 limbi: un click → link util + feedback.  
**Estimare:** 0,5–1

---

## D2 — Demo Mobile: editare manuală

### Matrice

| | Desktop | Mobile | Tabletă |
|--|---------|--------|---------|
| **RO** | Sanity (edit există) | **Must** | **Must** dacă Mobile UI |
| **EN** | Sanity | **Must** | **Must** dacă Mobile UI |
| **ES** | Sanity | **Must** | **Must** dacă Mobile UI |

**Acceptanță:** pe telefon, edit text + salvare pe tab activ, RO/EN/ES.  
**Estimare:** 1–2

---

## D3 — Guest list Demo Mobile (plasă ca A1)

### Matrice

| | Desktop | Mobile | Tabletă |
|--|---------|--------|---------|
| **RO** | Sanity (A1) | **Must** | **Must** dacă Mobile UI |
| **EN** | Sanity | **Must** | idem |
| **ES** | Sanity | **Must** | idem |

**Acceptanță:** 3 generări guest pe telefon → 3 id-uri în listă înainte de signup (RO/EN/ES).  
**Estimare:** 0,5

**Ordine D:** D1 → D3 → D2

---

# Faza E — Tabletă (decizie + implementare)

### Decizie: **E-B** (ales 20 Aug 2026)

| Opțiune | Status | Note |
|---------|--------|------|
| E-A Tablete → mereu Mobile | — | Neales |
| **E-B** Breakpoint lățime (&lt;1024 → Mobile) | ✅ | Implementat E1 |
| E-C Layout tablet dedicat | amânat | Proiect separat |

### E1 — implementat

| | Desktop | Mobile | Tabletă |
|--|---------|--------|---------|
| **RO** | Sanity | Sanity | **Must** ✅ |
| **EN** | Sanity | Sanity | **Must** ✅ |
| **ES** | Sanity | Sanity | **Must** ✅ |

**Acceptanță:** iPad lat (≥1024) → Desktop; fereastră &lt;1024 (orice device) → Mobile; RO/EN/ES demo+studio.  
**Estimare:** E-A/E-B 0,5–1; E-C = în afara acestui sprint.

---

# Faza F — Datorii „Nu e bine”

| ID | Item | Desktop | Mobile | Tabletă | RO | EN | ES | Când |
|----|------|---------|--------|---------|----|----|-----|------|
| F1 | LEI → **RON** consistent | ✅ | Must | Must | Sanity | Must | N/A* | N/A* | ✅ 20 Aug |
| F-ES | Explicații SWOT/buget ES goale | Must | Must | Must | — | — | Must | ✅ 20 Aug (fill timeout + guest) |
| F2 | Redirect limbă legal/resurse | ✅ | Must | Must | Sanity | — | Must | Must | ✅ 20 Aug |
| F3 | Cotă guest 3 și pe server | ✅ | Must | Must | Sanity | Must | Must | Must | ✅ 20 Aug |
| F4 | Un sistem traduceri | Must | Must | Must | Must | Must | Must | **Târziu** |
| F5 | Un creier Desktop+Mobile | Must | Must | Must | — | — | — | **Târziu** |

\*F1 pe EN/ES: verifică că nu apar LEI greșit pe locale EUR.

**B2** — ✅ scos din backlog.

---

## Ordinea globală

```
[Done] A1 A2 B1 B2 + update.sh
        ↓
C1  Login Desktop × EN/ES (+ sanity RO/Mobile/Tablet)
C2  Demo Mobile Pro→auth × RO/EN/ES (+ Tablet Mobile-UI)
C3  Studio Mobile tabs+shared × RO/EN/ES
        ↓
D1  Share Desktop × RO/EN/ES
D3  Guest list Mobile × RO/EN/ES
D2  Edit manual Demo Mobile × RO/EN/ES
        ↓
E   Decizie → E1 pe Tabletă × RO/EN/ES
        ↓
F1–F3   datorii ușoare (toate device × limbi din tabel)
F4–F5   proiecte mari (amânate)
```

---

## Checklist tester pe matrice (după fiecare fază)

| Test | Desktop | Mobile | Tabletă | RO | EN | ES |
|------|---------|--------|---------|----|----|-----|
| Login eroare | Must (C1) | Sanity | Sanity | Sanity | Must | Must |
| Guest Pro → auth | Sanity | Must (C2) | Must* | Must | Must | Must |
| Studio shared + tabs | Sanity | Must (C3) | Must* | Must | Must | Must |
| Share buton | Must (D1) | Sanity | Sanity | Must | Must | Must |
| Guest 3 planuri listă | Sanity A1 | Must (D3) | Must* | Must | Must | Must |
| Edit manual Demo | Sanity | Must (D2) | Must* | Must | Must | Must |
| 2 planuri același nume | Must | Must | Sanity | Must | Must | Must |
| Edit vs combine (B2) | Sanity | Sanity | Sanity | Sanity | Sanity | Sanity |

\*Must pe tabletă când UI = Mobile (sau după regula E).

---

## Ce nu facem

- Branch-uri `cursor/...` — tot pe `main`.
- Refactor mare înainte de C1–C3.
- Sesiune „doar RO” sau „doar Desktop” fără bifă pe matrice.

---

## Următorul pas

**C1–C3 · D1–D3 · E1 · F1–F3** ✅. Urmează **F4–F5** (proiecte mari, târziu) sau alt item.

Spune ce vrei următor.
