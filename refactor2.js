const fs = require('fs');

let content = fs.readFileSync('c:/Users/nadia/IdeeaTa.ai/app/page.tsx', 'utf8');
const lines = content.split('\n');

// 1. Widen containers
// For isEditing (line 645 in restored file)
const editContainerIdx = lines.findIndex(l => l.includes('animate-in fade-in slide-in-from-bottom-10 print:hidden'));
if (editContainerIdx !== -1) {
  lines[editContainerIdx] = lines[editContainerIdx].replace(/max-w-\w+/, 'w-full max-w-[98%] xl:max-w-[120rem]');
}

// For presentation view (line 770 in restored file)
const presContainerIdx = lines.findIndex(l => l.includes('animate-in fade-in slide-in-from-bottom-10') && !l.includes('print:hidden'));
if (presContainerIdx !== -1) {
  lines[presContainerIdx] = lines[presContainerIdx].replace(/max-w-6xl/, 'w-full max-w-[98%] xl:max-w-[120rem] px-4 2xl:px-8');
}

// 2. Extract Sidebar
const startIdx = lines.findIndex(l => l.includes('<div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-8 shadow-xl sticky top-8">'));
if (startIdx !== -1) {
  // The outer div of the sidebar is <div className="flex flex-col gap-6"> at startIdx - 1
  const outerStartIdx = startIdx - 1;
  let outerEndIdx = outerStartIdx;
  let depth = 1; // for <div className="flex flex-col gap-6">
  for(let i=outerStartIdx+1; i<lines.length; i++) {
    if (lines[i].includes('<div')) depth += (lines[i].match(/<div/g) || []).length;
    if (lines[i].includes('</div')) depth -= (lines[i].match(/<\/div/g) || []).length;
    if (depth === 0) {
      outerEndIdx = i;
      break;
    }
  }

  // The sidebar content
  const sidebarJSX = lines.slice(outerStartIdx+1, outerEndIdx).join('\n');
  const renderSidebarFn = `  const renderSidebar = () => (
    <div className="w-full lg:w-2/5 xl:w-1/3 flex flex-col gap-6 sticky top-8 print:hidden">
${sidebarJSX}
    </div>
  );\n\n`;

  const returnIdx = lines.findIndex(l => l.trim() === 'return (');
  lines.splice(returnIdx, 0, renderSidebarFn);

  // Now replace the old grid and sidebar
  const gridIdx = lines.findIndex(l => l.includes('<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">'));
  const editFormEndIdx = lines.findIndex((l, i) => i > gridIdx && l.includes('</div') && lines[i-1].includes('EditForm'));
  
  // Actually, we know outerEndIdx shifted because of splice. Let's recalculate based on lines length.
  // Wait, `lines.splice` at `returnIdx` pushes everything down!
  // Instead of recalculating, let's just do it string-based on the original content, or be careful.
}
