# Raport IdeeaTa.ai — ce merge, ce e șubred, ce e stricat

**Data:** 20 august 2026  
**Pentru:** echipă + oricine vrea să înțeleagă starea produsului (fără jargon greu)  
**Acoperă:** Desktop · Telefon · Tabletă × Română · Engleză · Spaniolă

---

## Cum se citește acest raport

| Cuvânt | Înseamnă |
|--------|----------|
| **Bine** | Funcționează cum trebuie. Utilizatorul poate termina treaba. |
| **Nu e bine** | Merge, dar e confuz, incomplet sau ușor de stricat. Trebuie îmbunătățit. |
| **Rău** | Bug serios: pierdere de date, ecran blocat, text greșit de limbă, sau lipsește o funcție importantă. |

---

## Verdict pe scurt (1 minut)

| Pe ce | Notă | Pe limba omului |
|-------|------|-----------------|
| **Desktop (PC)** | **Bine**, cu câteva găuri | Cel mai complet. Poți genera, edita, exporta, folosi unelte Pro. Lipsesc: buton clar de Share; la login pe site-ul EN/ES unele mesaje de eroare apar tot în română. |
| **Telefon** | **Nu e bine** | Poți genera și exporta. Unele unelte Pro pentru oaspeți nu deschid login-ul corect. Pe Demo nu poți edita textul cu mâna (doar cu AI). Pe Studio, unele tab-uri de variante pot rămâne în urmă. |
| **Tabletă** | **Bine** (E-B) | Demo/Studio după lățime: &lt;1024 → Mobile, ≥1024 → Desktop. Fără layout dedicat (E-C amânat). |
| **Română (RO)** | **Bine** | Limba de bază. Cea mai stabilă. |
| **Engleză (EN)** | **Bine**, cu resturi | Site tradus, exporturi/plăți EUR ok. Login Desktop EN reparat (C1). Redirect limbă pe legal/resurse încă incomplet. |
| **Spaniolă (ES)** | **Nu e bine** → îmbunătățit | Interfață tradusă; fill explicații SWOT/buget întărit (20 aug: timeout + guest fill). Verifică pe generări noi. |

---

## 1. Desktop (calculator / ecran mare)

### Bine
- Generare plan (Demo și Studio).
- Editare manuală a planului.
- Unelte Pro: ton, fonduri UE, investitori, buget, capitole expert.
- Tab-uri de variante (chiar dacă spațiul de pe disc e plin — reparat recent).
- Export PDF, Word, PowerPoint.
- Cont, cote, pachete Standard / Pro, admin nelimitat.
- Landing, resurse, pagini legale, cookie-uri, reclame doar pe pagini de conținut (nu în Studio/Demo).

### Nu e bine
- ~~Nu există un buton clar „Distribuie” pe Desktop~~ — **reparat D1** (Partajează / Share / Compartir în ActionBar).
- Două sisteme de traduceri în paralel → greu de întreținut; unele texte rămân pe lângă.
- Unelte Pro: pe Original = editare (tab nou); pe alt tab = combinație — clarificat în tipuri UI + alerte la cotă 0 (B2, 20 aug). Export = tab-ul activ.

### Rău
- ~~**Erori la login pe Desktop**~~ — **reparat C1** (20 aug): mesaje EN/ES pe Demo/Studio Desktop.

---

## 2. Telefon (mobil)

### Bine
- Generare plan, meniu mobil, unelte Pro în panouri, export, share nativ (trimite link).
- Pe Demo: poți deschide un plan primit pe link.
- Pe Studio: poți genera și edita pe loc (câmpuri / buget).
- Limba UI (RO/EN/ES) în mare parte ok.

### Nu e bine
- Unele drumuri spre „upgrade / top-up” diferă față de Desktop.
- Pe Landing, linkurile Login / Studio din meniu sunt ascunse pe ecran mic (rămâne CTA-ul principal).

### Rău
1. ~~**Oaspete + unealtă Pro pe Demo:**~~ — **reparat C2** (auth modal + stop procesare).
2. ~~**Pe Demo nu există editare manuală**~~ — **reparat D2** (`EditForm` pe telefon).
3. ~~**Pe Studio (telefon): tab-uri după auto-fill**~~ — **reparat C3**.
4. ~~**Pe Studio (telefon): sharedId**~~ — **reparat C3**.

---

## 3. Tabletă

### Bine (după E-B, 20 Aug 2026)
- **Demo / Studio** aleg UI după **lățimea ecranului**: &lt;1024px → Mobile, ≥1024px → Desktop (nu doar User-Agent).
- iPad lat și fereastră îngustă pe PC primesc layout previzibil; landing rămâne responsive CSS.

### Notă
- Nu există încă un **al treilea** layout „tablet dedicat” (E-C amânat). Pe mid-width (&lt;1024) folosești Mobile (cu grid tabletă deja în Demo/Studio Mobile).

---

## 4. Română · Engleză · Spaniolă

### Română — Bine
- Rute, texte, planuri AI, monedă **RON**, pagini legale și resurse.
- Cea mai testată și cea mai stabilă.

### Engleză — Nu e bine (cu un punct Rău)
- **Bine:** pagini `/en`, exporturi, plăți EUR, SEO.
- **Rău:** pe Desktop, unele erori de autentificare apar în română.
- **Nu e bine:** ~~redirect limbă pe legal/resurse~~ — **reparat F2**.

### Spaniolă — Nu e bine
- **Bine:** pagini `/es`, interfață tradusă, EUR, umplere automată a explicațiilor goale la generare.
- **Nu e bine:** uneori SWOT / buget ies cu titluri ok dar explicații goale (mai ales la început); AI-ul e mai fragil decât pe RO/EN.
- **Rău (același ca EN):** erori auth pe Desktop pot fi în română.

**Important:** bug-urile de pe telefon/tabletă (spinner, tab-uri, share) apar **la fel pe toate limbile** — nu sunt „probleme de spaniolă”, ci probleme de ecran.

---

## 5. Zonele produsului (toate pe scurt)

| Zonă | Desktop | Telefon | Tabletă | RO | EN | ES |
|------|---------|---------|---------|----|----|-----|
| Landing | Bine | Nu e bine | Nu e bine | Bine | Bine | Bine |
| Demo — generare | Bine | Bine | Nu e bine | Bine | Bine | Bine |
| Demo — oaspete → cont | Bine | Nu e bine | Nu e bine | Bine | Bine | Bine |
| Demo — editare manuală | Bine | **Rău** | Nu e bine | Bine | Bine | Bine |
| Demo — unelte Pro | Bine | Nu e bine* | Nu e bine | Bine | Bine | Bine |
| Studio — generare / plan | Bine | Bine | Nu e bine | Bine | Bine | Bine |
| Studio — tab-uri variante | Bine | **Rău** | Nu e bine | Bine | Bine | Bine |
| Export PDF/Word/PPT | Bine | Bine | Nu e bine | Bine | Bine | Bine |
| Distribuire (Share) | **Rău** | Nu e bine** | Nu e bine | Bine | Bine | Bine |
| Dashboard (proiectele mele) | Bine | Bine | Nu e bine | Bine | Bine | Bine |
| Login / cont | Bine**** | Bine | Nu e bine | Bine | Nu e bine**** | Nu e bine**** |
| Prețuri / upgrade | Bine | Nu e bine | Nu e bine | Bine | Bine | Bine |
| Resurse + reclame | Bine | Bine | Bine | Bine | Bine | Bine |
| Pagini legale / contact | Bine | Bine | Bine | Bine | Bine | Bine |
| Calitate text AI | Bine | Bine | Bine | Bine | Bine | Nu e bine |
| Publicare pe server | Bine | Bine | Bine | Bine | Bine | Bine |

\* Pe telefon: login la Pro pentru oaspeți poate eșua (vezi mai sus).  
\*\* Pe telefon Demo share inbound e ok; pe Studio telefon link-ul shared nu încarcă.  
\*\*\* ~~Dashboard delete pe nume~~ — **reparat în A2** (20 Aug 2026).  
\*\*\*\* Pagina Login dedicată e tradusă; modalul de pe Demo/Studio **Desktop** poate arăta erori în română pe EN/ES.

---

## 6. Lista „Rău” — ce trebuie reparat (prioritar)

1. **Desktop EN/ES: mesaje de login în română.**  
2. **Demo telefon: oaspete + unealtă Pro → nu se deschide autentificarea / rămâne blocat.**  
3. **Studio telefon: tab-urile de variante pot rămâne vechi** după completarea automată.  
4. **Studio telefon: link de plan partajat nu încarcă.**  
5. **Demo telefon: fără editare manuală** (doar AI).  
6. **Desktop: fără buton Share clar.**  
7. **Tabletă: fără experiență dedicată** (alegere greșită telefon vs PC).

~~Dashboard șterge pe nume~~ — **rezolvat A2.**

---

## 7. Lista „Nu e bine” — datorii / UX

- Confuzie cote Pro: editare vs combinare variante — **rezolvat B2** (tips + alerte).  
- ~~Două sisteme de traduceri~~ — **F4 Faza 1**: entry canonic `lib/i18n.ts` (datele încă în uiStrings + translations).
- ~~Cod Desktop/Telefon aproape dublat~~ — **F5 Faza 1**: `buildGenerateRequestBody` shared; merge UI = F5b.
- ~~Redirect automat de limbă doar pe câteva pagini~~ — **F2**: și legal/resurse.  
- ~~Limita de 3 planuri ca oaspete doar pe client~~ — **F3**: și pe server (IP/zi).
- ~~Uneori scrie „LEI”, alteori „RON”~~ — **reparat F1** (etichetă unică **RON**).
- Cod Desktop/Telefon aproape dublat → reparațiile trebuie făcute de 4 ori și se uită pe unele ecrane.  
- Pe server: dacă se publică greșit (fără scriptul de deploy), site-ul poate rămâne alb (deja s-a întâmplat; există `deploy.sh` ca regulă).

---

## 8. Ce e deja reparat recent (context)

- **A1 / D3:** pe Desktop și pe telefon, planurile de oaspete ajung (și se actualizează) în listă înainte de cont.
- **B1:** uneltele Pro creează tab-uri chiar dacă spațiul local e plin.  
- **A2:** Dashboard nu mai șterge pe nume; migrarea e pe id (planuri distincte cu același nume rămân).  
- **B2:** tipuri + alerte edit vs combine; export pe tab-ul activ.  
- **Admin:** conturile admin au cote nelimitate.  
- **ES:** umplere automată a explicațiilor goale la generare.  
- **Deploy:** script care copiază fișierele necesare ca site-ul să nu se rupă după update.
- **C1–C3 · D1–D3 · E1 (E-B):** auth EN/ES Desktop, Demo Mobile Pro→auth, Studio Mobile, share Desktop, EditForm Demo Mobile, guest list Mobile, tabletă după lățime.

**Încă pe listă (plan):**  
- F5b (merge Desktop+Mobile) și E-C layout dedicat = separat. F4c (PricingModal / banners / Mobile section titles) ✅.

---

## 9. Ce facem mai departe (ordine recomandată, pe limba omului)

1. Publicare pe server a ultimelor reparații (A2 + B2, dacă încă lipsește pe Hetzner).  
2. Traducerea mesajelor de login pe Desktop (EN/ES).  
3. Repararea pe telefon: login la Pro pentru oaspeți + tab-uri Studio.  
4. Share pe Desktop + încărcare plan partajat pe Studio telefon.  
5. ~~Decizie tabletă~~ — **E-B făcut** (lățime &lt;1024 → Mobile).  
6. Pe termen lung: un singur „creier” de cod pentru Desktop și telefon, ca să nu se mai strice pe unul și pe celălalt nu.

---

## 10. Pentru testeri (fără DevTools sofisticat)

| Vrei să testezi… | Fă așa |
|------------------|--------|
| Telefon real | Folosește telefonul, nu doar fereastra îngustă pe PC. |
| „Mod telefon” pe PC | Activează și emularea de dispozitiv mobil (altfel poți vedea Desktop). |
| iPad / tabletă | Lățime ≥1024 → UI Desktop; &lt;1024 → UI Mobile (E-B). |
| EN / ES login pe PC | Încearcă Greșit parola pe Demo Desktop — dacă vezi română, e bug-ul cunoscut. |
| Două planuri cu același nume | După A2: ambele trebuie să apară în Dashboard (id-uri diferite). |

---

*Document generat din analiza codului și a logicii aplicației (Demo, Studio, Dashboard, limbi, deploy). Nu înlocuiește testarea manuală pe dispozitive reale.*
