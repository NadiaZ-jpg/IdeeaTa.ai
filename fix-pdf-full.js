const fs = require('fs');
let c = fs.readFileSync('app/demo/page.tsx', 'utf8');

const searchRegex = /pdf\.link\(1280\/2 - 150, 420, 300, 80, \{ url: pdfUrl \}\);/s;
const replacement = `pdf.link(0, 0, 1280, 720, { url: pdfUrl });`;

if(c.match(searchRegex)) {
  c = c.replace(searchRegex, replacement);
  fs.writeFileSync('app/demo/page.tsx', c, 'utf8');
  console.log('Fixed PDF link to cover whole slide!');
} else {
  console.log('Could not find the link to replace!');
}
