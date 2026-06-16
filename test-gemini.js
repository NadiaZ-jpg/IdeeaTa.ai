const { GoogleGenAI } = require("@google/genai");

async function test() {
  // Use a hardcoded dummy API key for testing, or rely on process.env.GEMINI_API_KEY if we have it locally
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  const instruction = `Generează O SECȚIUNE NOUĂ de text pentru planul de afaceri, referitoare strict la subiectul: "Plan de Marketing". 
      IMPORTANT:
      - NU RETURNĂ planul curent!
      - Returnează EXCLUSIV un JSON care conține doar o singură cheie numită "sectiuni_aditionale".
      - Această cheie trebuie să fie un ARRAY cu un singur obiect în interior, care conține "titlu" și "continut".
      - Conținutul trebuie să fie foarte detaliat, profesional, și formatat cu \\n pentru paragrafe.
      
      Format exact obligatoriu:
      {
        "sectiuni_aditionale": [
          {
            "titlu": "Numele secțiunii cerute",
            "continut": "Textul detaliat..."
          }
        ]
      }`;

  const inputData = {
    nume_afacere: "Ludoteca Cafe",
    viziune_strategie: "Un cafe cu jocuri boardgames."
  };

  const prompt = `Ești un consultant de afaceri expert. 
Aici sunt informațiile de bază ale planului curent pentru context:
${JSON.stringify(inputData)}

SARCINA TA:
${instruction}

Trebuie să răspunzi EXCLUSIV cu un JSON valid.
IMPORTANT PENTRU JSON: 
- NU folosi rânduri noi reale (unescaped newlines) în interiorul string-urilor! Pentru paragrafe, folosește strict '\\n' (escapat).
- FĂRĂ virgule la finalul ultimului element din obiect sau array (fără trailing commas).
NU adăuga formatare markdown, NU adăuga backticks (\`\`\`), NU adăuga text adițional înainte sau după JSON.`;

  console.log("Sending prompt to Gemini...");
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    console.log("RAW RESPONSE:");
    console.log(response.text);
    
    let text = response.text || "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      text = jsonMatch[0];
    }
    
    text = text.replace(/,\s*([}\]])/g, '$1'); 

    try {
      const parsed = JSON.parse(text);
      console.log("PARSED SUCCESSFULLY:", parsed);
    } catch (err) {
      console.error("JSON PARSE ERROR:", err.message);
      console.log("Sanitized Text that failed:", text);
    }
  } catch (err) {
    console.error("API ERROR:", err);
  }
}

test();
