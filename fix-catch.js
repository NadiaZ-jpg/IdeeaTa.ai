const fs = require('fs');
let c = fs.readFileSync('app/demo/page.tsx', 'utf8');

const searchRegex = /try \{\s*const res = await fetch\('\/api\/share', \{\s*method: 'POST',\s*\}\s*if \(mode === 'pptx'\) \{/s;

const replacement = `try {
          const res = await fetch('/api/share', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ planData: result })
          });
          const data = await res.json();
          if (data.id) generatedShareId = data.id;
        } catch (err) {
          console.warn("Eroare generare share link:", err);
        }
      }

      if (mode === 'pptx' || mode === 'pdf' || mode === 'pdf-summary') {
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      if (mode === 'pptx') {`;

if(c.match(searchRegex)) {
  c = c.replace(searchRegex, replacement);
  fs.writeFileSync('app/demo/page.tsx', c, 'utf8');
  console.log('Restored catch block!');
} else {
  console.log('Could not find the block!');
}
