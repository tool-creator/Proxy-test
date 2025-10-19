const express = require("express");
const fetch = require("node-fetch");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

// Homepage with form
app.get("/", (req, res) => {
  res.send(`
    <h2>🌐 Generic Web Proxy</h2>
    <form method="GET" action="/proxy">
      <input type="text" name="url" placeholder="https://example.com" style="width:400px" required>
      <button type="submit">Go</button>
    </form>
  `);
});

// Proxy route
app.get("/proxy", async (req, res) => {
  let targetUrl = req.query.url;

  if (!targetUrl) return res.status(400).send("Missing URL");

  // Add http:// if missing
  if (!/^https?:\/\//i.test(targetUrl)) {
    targetUrl = "http://" + targetUrl;
  }

  try {
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Accept": "*/*",
      }
    });

    // Forward content type
    const contentType = response.headers.get("content-type") || "text/html";
    res.set("Content-Type", contentType);

    // Stream response directly
    const body = await response.text();
    res.send(body);

  } catch (err) {
    res.status(500).send("❌ Error fetching URL: " + err.message);
  }
});

app.listen(PORT, () => console.log(`✅ Proxy running at http://localhost:${PORT}`));
