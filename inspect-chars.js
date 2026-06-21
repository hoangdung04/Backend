import fs from "fs";

const content = fs.readFileSync("../paragraphs_dump_all.txt", "utf8");
const lines = content.split("\n");

lines.forEach(line => {
  if (line.includes("P[1988]")) {
    console.log("Line:", line);
    for (let i = 0; i < line.length; i++) {
      console.log(`Char ${i}: '${line[i]}' (Code: ${line.charCodeAt(i)})`);
    }
  }
});
