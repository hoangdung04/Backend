import fs from "fs";

const content = fs.readFileSync("../paragraphs_dump_all.txt", "utf8");
const lines = content.split("\n");

console.log("=== INCORRECTLY STYLED CAPTIONS (Normal Style) ===");
lines.forEach((line, idx) => {
  // Check if the paragraph contains "Hình X.Y" or "Bảng X.Y" but style is Normal
  const isFigOrTable = /Text='(Hình|Bảng)\s+\d+(\.\d+)*[:\.]/.test(line);
  const isNormal = line.includes("Style='Normal'");
  
  if (isFigOrTable && isNormal) {
    console.log(`Line ${idx}: ${line}`);
  }
});
