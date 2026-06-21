import fs from "fs";

const content = fs.readFileSync("../paragraphs_dump_all.txt", "utf8");
const lines = content.split("\n");

console.log("=== SEARCH FOR FIG 4 & TABLE 4 ===");
lines.forEach((line, idx) => {
  if (line.includes("Hình 4.") || line.includes("Bảng 4.")) {
    console.log(`Line ${idx}: ${line}`);
  }
});
