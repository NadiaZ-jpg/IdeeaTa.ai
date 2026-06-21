const fs = require('fs');

try {
    let backup = fs.readFileSync('app/demo/page_demo_freeze_perfect.tsx.backup', 'utf8');
    let current = fs.readFileSync('app/demo/page.tsx', 'utf8');

    // --- 1. REPLACE ALL_EXAMPLES ---
    const backupExStart = backup.indexOf('  const ALL_EXAMPLES = [');
    const backupExEnd = backup.indexOf('  const [examplesList');
    if (backupExStart === -1 || backupExEnd === -1) {
        throw new Error('Could not find ALL_EXAMPLES in backup.');
    }
    const backupExamples = backup.substring(backupExStart, backupExEnd);

    const currExStart = current.indexOf('  const ALL_EXAMPLES = [');
    const currExEnd = current.indexOf('  const [examplesList');
    if (currExStart === -1 || currExEnd === -1) {
        throw new Error('Could not find ALL_EXAMPLES in current.');
    }
    
    current = current.substring(0, currExStart) + backupExamples + current.substring(currExEnd);

    // --- 2. REPLACE THE LANDING PAGE BLOCK ---
    const backupMainStart = backup.indexOf('        {!result && (');
    const backupMainEnd = backup.indexOf('      {isEditing && result ? (');
    if (backupMainStart === -1 || backupMainEnd === -1) {
        throw new Error('Could not find {!result && ( bounds in backup.');
    }
    const backupLanding = backup.substring(backupMainStart, backupMainEnd);

    const currMainStart = current.indexOf('        {!result && (');
    const currMainEnd = current.indexOf('      {isEditing && result ? (');
    if (currMainStart === -1 || currMainEnd === -1) {
        throw new Error('Could not find {!result && ( bounds in current.');
    }
    
    current = current.substring(0, currMainStart) + backupLanding + current.substring(currMainEnd);

    fs.writeFileSync('app/demo/page.tsx', current, 'utf8');
    console.log('Successfully restored FREEZE for Demo Landing Page and Examples.');
} catch (e) {
    console.error(e.message);
}
