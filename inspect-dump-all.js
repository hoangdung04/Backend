import fs from "fs";

const content = fs.readFileSync("../paragraphs_dump_all.txt", "utf8");
const lines = content.split("\n");

console.log("=== SEARCH FOR CHAPTERS ===");
lines.forEach((line, idx) => {
  if (line.toLowerCase().includes("chương") || line.toLowerCase().includes("chuong")) {
    console.log(`Line ${idx}: ${line}`);
  }
});

console.log("\n=== SEARCH FOR 4.1. ===");
let index41 = -1;
lines.forEach((line, idx) => {
  if (line.includes("Text='4.1.")) {
    console.log(`Line ${idx}: ${line}`);
    index41 = idx;
  }
});

if (index41 !== -1) {
  console.log("\n=== 15 LINES BEFORE 4.1. ===");
  const start = Math.max(0, index41 - 15);
  for (let i = start; i < index41; i++) {
    console.log(`Line ${i}: ${lines[i]}`);
  }
}
