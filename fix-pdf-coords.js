const fs = require('fs');
let c = fs.readFileSync('app/demo/page.tsx', 'utf8');

const searchRegex = /const pdf = new jsPDF\(\{\s*orientation: "landscape",\s*unit: "pt",\s*format: \[1280, 720\]\s*\}\);\s*let pdfUrl = 'https:\/\/ideeata\.ai\/';\s*const currentShareId = result\?\.id \|\| generatedShareId;\s*if \(currentShareId\) \{\s*pdfUrl = `https:\/\/ideeata\.ai\/shared\/\$\{currentShareId\}`;\s*\}\s*for \(let i = 0; i < slidesArray\.length; i\+\+\) \{\s*const slideElement = slidesArray\[i\] as HTMLElement;\s*const dataUrl = await toPng\(slideElement, \{ quality: 1\.0, pixelRatio: 2 \}\);\s*if \(i > 0\) pdf\.addPage\(\[1280, 720\], "landscape"\);\s*pdf\.addImage\(dataUrl, 'PNG', 0, 0, 1280, 720\);\s*\/\/ Dacă este ultimul slide \(CTA\), nu mai adăugăm link pentru a evita box-ul roz în PDF\.\s*if \(i === slidesArray\.length - 1 && mode === 'pdf-summary'\) \{\s*\/\/ pdf\.link\(1280\/2 - 200, 720 - 180, 400, 100, \{ url: pdfUrl \}\);\s*\}/s;

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
          
          // Adăugăm un link invizibil fix deasupra butonului verde
          if (i === slidesArray.length - 1 && mode === 'pdf-summary') {
            pdf.link(1280/2 - 150, 420, 300, 80, { url: pdfUrl });
          }`;

if(c.match(searchRegex)) {
  c = c.replace(searchRegex, replacement);
  fs.writeFileSync('app/demo/page.tsx', c, 'utf8');
  console.log('Fixed PDF link coordinates!');
} else {
  console.log('Could not find the block to replace!');
}
