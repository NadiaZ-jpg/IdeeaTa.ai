import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatNumberedText = (text: string | undefined) => {
  if (typeof text !== 'string') return text;
  let formatted = text;
  
  // Remove redundant AI intro text for objectives (case insensitive)
  formatted = formatted.replace(/^(?:În primul an:?|În următorii(?:\s*\d+(?:-\d+)?\s*ani)?:?|Obiective(?:le)?[^:]*:?|Pentru primul an:?|Pe termen scurt:?|Pe termen mediu:?)\s*/i, '');
  
  // Remove Markdown bold markers entirely since they render literally in the UI
  formatted = formatted.replace(/\*\*/g, '');

  // Remove stray asterisks (e.g. stranded bullet points) at the start or end of lines
  formatted = formatted.replace(/^\s*\*\s*/gm, '');
  formatted = formatted.replace(/\s*\*\s*$/gm, '');
  
  // Normalize spacing to fix inconsistent gaps
  // 1. Collapse multiple newlines (even with spaces between them) into exactly 2 newlines
  formatted = formatted.replace(/\n\s*\n+/g, '\n\n');
  
  // 2. Ensure list items have exactly ONE newline before them to keep lists compact and consistent
  formatted = formatted.replace(/\n+\s*(\d+\.)\s+/g, '\n$1 ');

  // 3. Insert newline before inline numbered items (e.g. "... text. 2. Text...")
  formatted = formatted.replace(/([.!?])\s+(\d+\.)\s+/g, '$1\n$2 ');

  // Grammatical fixes
  // 1. Remove leading commas or punctuation left over from prefixes
  formatted = formatted.replace(/^[\s,;.-]+/, '');
  
  // 2. Capitalize the first letter of every sentence or list item
  formatted = formatted.replace(/(^|\n|[.!?]\s+)([^a-zA-ZăâîșțĂÂÎȘȚ]*)([a-zăâîșț])/g, (match, p1, p2, p3) => {
    return p1 + p2 + p3.toUpperCase();
  });

  // 3. Lowercase letters following a semicolon (enumeration)
  formatted = formatted.replace(/;\s+([A-ZĂÂÎȘȚ])/g, (match, letter) => {
    return '; ' + letter.toLowerCase();
  });
  
  return formatted.trim();
};

export const formatObjectNumbers = (obj: any): any => {
  if (typeof obj === 'string') {
    return formatNumberedText(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map(formatObjectNumbers);
  }
  if (obj !== null && typeof obj === 'object') {
    const newObj: any = {};
    for (const key in obj) {
      newObj[key] = formatObjectNumbers(obj[key]);
    }
    return newObj;
  }
  return obj;
};
