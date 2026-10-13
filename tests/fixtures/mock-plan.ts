/**
 * Plan de afaceri mock folosit în toate testele Playwright.
 * Structura respectă interfața BusinessPlan din lib/normalizePlanResult.ts.
 */
export const MOCK_PLAN = {
  id: "Test_Cafenea_1234567890",
  nume: "Cafenea Test",
  descriere: "O cafenea modernă în centrul orașului",
  analiza_swot: {
    puncte_tari: [
      {
        titlu: "Locație centrală",
        explicatie_tehnica:
          "Amplasament în zona cu cel mai mare trafic pietonal din oraș.",
      },
      {
        titlu: "Concept unic",
        explicatie_tehnica:
          "Design interior diferit față de lanțurile existente.",
      },
    ],
    puncte_slabe: [
      {
        titlu: "Capital limitat",
        explicatie_tehnica:
          "Fonduri insuficiente pentru expansiune rapidă în primii 2 ani.",
      },
    ],
    oportunitati: [
      {
        titlu: "Piață în creștere",
        explicatie_tehnica:
          "Consumul de cafea specialty crește cu 15% anual în România.",
      },
    ],
    amenintari: [
      {
        titlu: "Concurență intensă",
        explicatie_tehnica:
          "Prezența lanțurilor internaționale Starbucks și Costa în zonă.",
      },
    ],
  },
  plan_financiar: {
    buget_investitii: [
      {
        item: "Echipamente cafenea",
        cost: "15000",
        explicatie: "Espressor profesional La Marzocco și accesorii.",
      },
      {
        item: "Mobilier și design interior",
        cost: "10000",
        explicatie: "Mobilier personalizat, iluminat și decorațiuni.",
      },
      {
        item: "Licențe și autorizații",
        cost: "2000",
        explicatie: "Autorizație sanitară, PSI, funcționare.",
      },
    ],
    strategie_financiara:
      "Recuperarea investiției în 18 luni prin vânzări de minimum 200 clienți/zi la un bon mediu de 25 RON.",
  },
  plan_operational: {
    descriere_flux:
      "Comandă la casă → preparare de barista → servire în maxim 3 minute.",
    resurse_umane: "2 bariști calificați + 1 casier, program 8:00–22:00.",
    locatie_dotari:
      "Spațiu de 80mp în centrul orașului, amenajat complet cu zona de bar și 20 locuri.",
  },
  viziune_strategie: {
    obiective_scurt:
      "Atingerea breakeven operațional în primele 6 luni de funcționare.",
    obiective_mediu:
      "Deschiderea celei de-a doua locații în termen de 2 ani.",
    misiune_valori:
      "Oferim cea mai bună cafea din oraș cu un serviciu impecabil și o atmosferă prietenoasă.",
  },
  analiza_pietei: {
    clienti_tinta:
      "Profesioniști cu vârste între 25-45 ani, iubitori de cafea de calitate.",
    concurenta:
      "Starbucks și lanțuri locale — diferențierea prin specialty coffee și experiență autentică.",
    strategie_marketing:
      "Social media (Instagram/TikTok), card de loialitate, parteneriate cu firmele din zonă.",
  },
  selectedCurrency: "RON",
};

/** Răspunsul complet al API-ului /api/generate cu planul mock. */
export const MOCK_GENERATE_RESPONSE = {
  ideas: [JSON.stringify(MOCK_PLAN)],
  fx_rate: 0.201,
};

/** Răspunsul API-ului /api/share. */
export const MOCK_SHARE_RESPONSE = {
  id: "test-share-id-abc123",
  url: "/shared/test-share-id-abc123",
};

/** Planul în format EN (câmpurile rămân aceleași, AI returnează în limba selectată). */
export const MOCK_PLAN_EN = {
  ...MOCK_PLAN,
  id: "Test_Cafenea_EN_1234567890",
  selectedCurrency: "EUR",
  plan_financiar: {
    ...MOCK_PLAN.plan_financiar,
    buget_investitii: MOCK_PLAN.plan_financiar.buget_investitii.map((item) => ({
      ...item,
      cost: item.cost,
    })),
  },
};

export const MOCK_GENERATE_RESPONSE_EN = {
  ideas: [JSON.stringify(MOCK_PLAN_EN)],
  fx_rate: 0.201,
};
