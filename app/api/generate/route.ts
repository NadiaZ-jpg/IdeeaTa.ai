import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { skill } = await req.json();

    const prompt = `
Generate a comprehensive business plan in Romanian based on the following skill or business idea: "${skill}".
Return the result strictly as a valid JSON object with the following structure:
{
  "nume": "Business Name",
  "slogan": "A catchy slogan",
  "descriere": "Detailed description of the business",
  "analiza_swot": {
    "puncte_tari": [
      { "titlu": "Strength 1", "explicatie_tehnica": "Explanation" }
    ],
    "puncte_slabe": [
      { "titlu": "Weakness 1", "explicatie_tehnica": "Explanation" }
    ],
    "oportunitati": [
      { "titlu": "Opportunity 1", "explicatie_tehnica": "Explanation" }
    ],
    "amenintari": [
      { "titlu": "Threat 1", "explicatie_tehnica": "Explanation" }
    ]
  },
  "buget_detaliat": [
    { "item": "Equipment/Service", "explicatie": "Reasoning", "cost": "15000 LEI" },
    { "item": "Another requirement", "explicatie": "Reasoning", "cost": "2000 LEI" }
  ],
  "functionalitati_cheie": [
    { "titlu": "Funcționalitate Cheie 1", "descriere": "Descriere detaliată a modului în care funcționează sau cum ajută afacerea" }
  ]
}
Include at least 5-6 budgeted items, and 3-4 key business features or functionalities. 
Do not include any other text besides the JSON block. Do not format with markdown block quotes (\`\`\`json) if possible, but if you do, it will be stripped out.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: prompt,
    });

    const text = response.text;

    return NextResponse.json({
      fx_rate: 0.201, // 1 RON = 0.20 EUR approximately
      ideas: [text]
    });
  } catch (error: any) {
    console.error("Error generating content:", error);
    const isServiceUnavailable = error?.status === 503 || error?.message?.includes('503') || error?.message?.includes('high demand') || error?.message?.includes('UNAVAILABLE');
    const isRateLimited = error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('quota') || error?.message?.includes('RESOURCE_EXHAUSTED');
    
    let errorMessage = "Nu am putut genera planul de afaceri. Te rugăm să încerci din nou.";
    let statusCode = 500;
    
    if (isServiceUnavailable) {
        errorMessage = "AI-ul este momentan foarte solicitat. Te rugăm să încerci din nou în câteva momente.";
        statusCode = 503;
    } else if (isRateLimited) {
        errorMessage = "Ai depășit limita de utilizare (Quota Exceeded). Te rugăm să aștepți un minut și să încerci din nou.";
        statusCode = 429;
    }
    
    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}
