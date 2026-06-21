const fs = require('fs');
let c = fs.readFileSync('app/demo/page.tsx', 'utf8');

const searchRegex = /pdf\.link\(0, 0, 1280, 720, \{ url: pdfUrl \}\);/s;

const replacement = `const btn = slideElement.querySelector('.bg-emerald-500');
            if (btn) {
              const rect = btn.getBoundingClientRect();
              const slideRect = slideElement.getBoundingClientRect();
              const scaleX = 1280 / slideRect.width;
              const scaleY = 720 / slideRect.height;
              const x = (rect.left - slideRect.left) * scaleX;
              const y = (rect.top - slideRect.top) * scaleY;
              const w = rect.width * scaleX;
              const h = rect.height * scaleY;
              pdf.link(x, y, w, h, { url: pdfUrl });
            } else {
              pdf.link(1280/2 - 150, 420, 300, 80, { url: pdfUrl });
            }`;

if(c.match(searchRegex)) {
  c = c.replace(searchRegex, replacement);
  fs.writeFileSync('app/demo/page.tsx', c, 'utf8');
  console.log('Fixed PDF link to exact button coordinates using DOM!');
} else {
  console.log('Could not find the link to replace!');
}
