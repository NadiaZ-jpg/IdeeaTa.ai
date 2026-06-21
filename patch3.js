const fs = require('fs');
let code = fs.readFileSync('app/demo/page.tsx', 'utf8');
const lines = code.split('\n');

let start = -1;
let end = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('if (!user && !isSharedView && !result) {')) {
    start = i;
  }
  if (start !== -1 && lines[i].includes('return (') && lines[i+1].includes('<main')) {
    end = i - 1;
    break;
  }
}

if (start !== -1 && end !== -1) {
  lines.splice(start, end - start + 1);
  fs.writeFileSync('app/demo/page.tsx', lines.join('\n'));
  console.log('Successfully removed auth block from line ' + start + ' to ' + end);
} else {
  console.log('Could not find auth block.');
}
