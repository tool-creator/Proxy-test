const express = require("express");
const fetch = require("node-fetch");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send(`
    <h2>🐙 GitHub Proxy</h2>
    <form method="GET" action="/proxy">
      <input type="text" name="url" placeholder="https://github.com/user/repo" style="width:300px" required>
      <button type="submit">Go</button>
    </form>
    <p>Example: https://github.com/vercel/next.js</p>
  `);
});

// Proxy GitHub page or raw content
app.get("/proxy", async (req, res) => {
  let targetUrl = req.query.url;

  if (!targetUrl) return res.status(400).send("Missing URL");

  // Force GitHub raw content if possible
  if (targetUrl.includes("github.com") && !targetUrl.includes("raw.githubusercontent.com")) {
    targetUrl = targetUrl.replace("github.com", "raw.githubusercontent.com").replace("/blob/", "/");
  }

  try {
    const response = await fetch(targetUrl, {
      headers: { "User-Agent": "GitHub-Proxy" }
    });

    if (!response.ok) throw new Error(`GitHub returned ${response.status}`);
    const type = response.headers.get("content-type") || "text/plain";
    res.set("content-type", type);
    const data = await response.text();
    res.send(data);
  } catch (err) {
    res.status(500).send("❌ Error fetching GitHub content: " + err.message);
  }
});

app.listen(PORT, () => console.log(`✅ GitHub proxy running at http://localhost:${PORT}`));
