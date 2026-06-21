import https from "https";

const pages = [
  { key: "Fenghuang 1", url: "https://unsplash.com/photos/a-bridge-spans-over-water-with-houses-fenghuang-ancient-town-china-tuo-jiang-river-p14W8-6qS0k" },
  { key: "Fenghuang 2", url: "https://unsplash.com/photos/a-row-of-boats-floating-on-top-of-a-river-next-to-buildings-10R-1w1S3qM" },
  { key: "Shangri-La 1", url: "https://unsplash.com/photos/golden-temple-complex-on-a-hillside-overlooking-water-G_B9J-oP3rQ" },
  { key: "Shangri-La 2", url: "https://unsplash.com/photos/beautiful-golden-and-colorful-buddhist-temple-on-hillside-p8T4fS3uK0A" }
];

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    }, (res) => {
      let data = "";
      res.on("data", (chunk) => data += chunk);
      res.on("end", () => resolve(data));
    }).on("error", reject);
  });
}

async function main() {
  for (let page of pages) {
    console.log(`Fetching ${page.key}...`);
    try {
      const html = await fetchPage(page.url);
      const regex = /https:\/\/images\.unsplash\.com\/photo-([a-zA-Z0-9-]+)\?/g;
      let match;
      const ids = new Set();
      while ((match = regex.exec(html)) !== null) {
        ids.add(match[1]);
      }
      console.log(`Results for ${page.key}:`);
      for (let id of ids) {
        console.log(`  - https://images.unsplash.com/photo-${id}?q=80&w=800`);
      }
    } catch (e) {
      console.error(`Failed ${page.key}:`, e.message);
    }
  }
}

main();
