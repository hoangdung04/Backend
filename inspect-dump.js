import fs from "fs";

const content = fs.readFileSync("../paragraphs_dump.txt", "utf8");
const lines = content.split("\n");

console.log("=== SEARCH FOR CHAPTERS ===");
lines.forEach(line => {
  if (line.toLowerCase().includes("chương") || line.toLowerCase().includes("chuong")) {
    console.log(line);
  }
});

console.log("\n=== SEARCH FOR SECTION 4.1 ===");
lines.forEach(line => {
  if (line.includes("4.1")) {
    console.log(line);
  }
});
