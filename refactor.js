const fs = require('fs');

let content = fs.readFileSync('c:/Users/nadia/IdeeaTa.ai/app/page.tsx', 'utf8');
const lines = content.split('\n');

// Find the sidebar block
const startIdx = lines.findIndex(l => l.includes('<div className="w-full lg:w-1/3 xl:w-1/4 flex flex-col gap-6 sticky top-8">'));
const endIdx = lines.findIndex((l, i) => i > startIdx && l.includes('</div>') && lines[i+1].includes('</div>') && lines[i+2].includes('</div>') && lines[i+3].includes('</div>') && lines[i+4].includes(') : result && ('));

if (startIdx === -1) {
  console.log("Could not find start of sidebar");
  process.exit(1);
}
console.log("Found sidebar from", startIdx, "to roughly", endIdx);

// Extract the inner sidebar content (from line 734 to 836)
const innerStart = startIdx + 1;
// Find the closing div for the outer sidebar container
let innerEnd = innerStart;
let depth = 1; // we know innerStart is a div
for(let i=innerStart; i<lines.length; i++) {
  if (lines[i].includes('<div')) depth++;
  if (lines[i].includes('</div')) depth--;
  if (depth === 0) {
    innerEnd = i; // this is the closing div of the `w-full lg:w-1/3...`
    break;
  }
}

const sidebarJSX = lines.slice(innerStart, innerEnd).join('\n');

const renderSidebarFn = `  const renderSidebar = () => (
    <div className="w-full lg:w-1/3 xl:w-1/4 flex flex-col gap-6 sticky top-8 print:hidden">
${sidebarJSX}
    </div>
  );\n\n`;

// Insert renderSidebarFn before `return (` which is around line 464
const returnIdx = lines.findIndex(l => l.trim() === 'return (');
lines.splice(returnIdx, 0, renderSidebarFn);

// Now replace the old sidebar with {renderSidebar()}
const newStartIdx = lines.findIndex(l => l.includes('<div className="w-full lg:w-1/3 xl:w-1/4 flex flex-col gap-6 sticky top-8">'));
const newInnerEnd = newStartIdx + (innerEnd - startIdx); // offset

lines.splice(newStartIdx, (newInnerEnd - newStartIdx) + 1, '            {renderSidebar()}');

// Now update the presentation view to use flex layout
const brochureIdx = lines.findIndex(l => l.includes('<div ref={brochureRef}'));
const presentationWrapperStart = `          <div className="flex flex-col lg:flex-row gap-8 items-start w-full">
            <div className="w-full lg:w-2/3 xl:w-3/4">`;
lines.splice(brochureIdx, 0, presentationWrapperStart);

// We need to close the divs after brochure ends.
// Brochure ends just before:
//             <div className="pt-10 border-t border-zinc-800 print:border-none print:pt-4">
// wait, no, brochureRef contains the whole presentation.
// Let's find the closing div of brochureRef.
const newBrochureIdx = lines.findIndex(l => l.includes('<div ref={brochureRef}'));
let bDepth = 0;
let bEndIdx = -1;
for(let i = newBrochureIdx; i < lines.length; i++) {
  if (lines[i].includes('<div')) {
    // count occurrences
    bDepth += (lines[i].match(/<div/g) || []).length;
  }
  if (lines[i].includes('</div')) {
    bDepth -= (lines[i].match(/<\/div/g) || []).length;
  }
  if (bDepth === 0) {
    bEndIdx = i;
    break;
  }
}

if (bEndIdx !== -1) {
  const presentationWrapperEnd = `            </div>
            {renderSidebar()}
          </div>`;
  lines.splice(bEndIdx + 1, 0, presentationWrapperEnd);
}

fs.writeFileSync('c:/Users/nadia/IdeeaTa.ai/app/page.tsx', lines.join('\n'));
console.log("Success!");
