const fs = require("fs");
const content = fs.readFileSync("app/demo/page.tsx", "utf8");
const replacement = fs.readFileSync("temp_replace.txt", "utf8");

const startToken = "Instrumente</h3>";
let startIdx = content.indexOf(startToken);
if (startIdx === -1) throw new Error("Could not find start token");

startIdx = content.indexOf("<div className=\"flex flex-col gap-3\">", startIdx);

let openDivs = 0;
let endIdx = -1;
for (let i = startIdx; i < content.length; i++) {
  if (content.substr(i, 4) === "<div") openDivs++;
  if (content.substr(i, 5) === "</div") openDivs--;
  if (openDivs === 0) {
    endIdx = i + 6;
    break;
  }
}

const newContent = content.substring(0, startIdx) + replacement + content.substring(endIdx);
fs.writeFileSync("app/demo/page.tsx", newContent, "utf8");
console.log("Replaced successfully! From " + startIdx + " to " + endIdx);
