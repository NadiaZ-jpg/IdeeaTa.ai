const fs = require('fs');
let c = fs.readFileSync('app/demo/page.tsx', 'utf8');

const searchRegex = /const pdf = new jsPDF\(\{\s*orientation: "landscape",\s*if \(i === slidesArray\.length - 1 && mode === 'pdf-summary'\) \{\s*pdf\.link\(1280\/2 - 200, 720 - 180, 400, 100, \{ url: pdfUrl \}\);\s*\}/s;

const replacement = `const pdf = new jsPDF({
          orientation: "landscape",
          unit: "pt",
          format: [1280, 720]
        });

        let pdfUrl = 'https://ideeata.ai/';
        const currentShareId = result?.id || generatedShareId;
        if (currentShareId) {
          pdfUrl = \`https://ideeata.ai/shared/\${currentShareId}\`;
        }

        for (let i = 0; i < slidesArray.length; i++) {
          const slideElement = slidesArray[i] as HTMLElement;
          const dataUrl = await toPng(slideElement, { quality: 1.0, pixelRatio: 2 });
          if (i > 0) pdf.addPage([1280, 720], "landscape");
          pdf.addImage(dataUrl, 'PNG', 0, 0, 1280, 720);
          
          // Dacă este ultimul slide (CTA), nu mai adăugăm link pentru a evita box-ul roz în PDF.
          if (i === slidesArray.length - 1 && mode === 'pdf-summary') {
            // pdf.link(1280/2 - 200, 720 - 180, 400, 100, { url: pdfUrl });
          }`;

if(c.match(searchRegex)) {
  c = c.replace(searchRegex, replacement);
  fs.writeFileSync('app/demo/page.tsx', c, 'utf8');
  console.log('Restored JS PDF block successfully!');
} else {
  console.log('Could not find the broken block!');
}
