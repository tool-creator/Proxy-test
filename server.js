const express = require("express");
const puppeteer = require("puppeteer");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

// Homepage with form
app.get("/", (req, res) => {
  res.send(`
    <h2>🌐 Full Web Proxy</h2>
    <form method="GET" action="/proxy">
      <input type="text" name="url" placeholder="https://example.com" style="width:400px" required>
      <button type="submit">Go</button>
    </form>
  `);
});

// Proxy route using Puppeteer
app.get("/proxy", async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) return res.status(400).send("Missing URL");

  try {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.goto(targetUrl, { waitUntil: 'networkidle2' });
    const content = await page.content();
    await browser.close();

    res.set("Content-Type", "text/html");
    res.send(content);
  } catch (err) {
    res.status(500).send("❌ Error fetching page: " + err.message);
  }
});

app.listen(PORT, () => console.log(`✅ Puppeteer proxy running at http://localhost:${PORT}`));
