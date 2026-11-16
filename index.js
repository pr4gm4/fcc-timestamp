require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

// parse both the HTML form (urlencoded) and JSON request bodies
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

// In-memory store: short_url -> original URL, and the reverse to reuse ids
const urls = new Map();
const shortUrlByOriginalUrl = new Map();
let nextShortUrl = 1;

// A valid URL must be http(s)://<host>/... as required by the project.
// Hostnames without a dot (e.g. http://localhost:3000) are accepted on purpose:
// fCC tests the project against its own URL, which may be localhost.
function isValidUrl(value) {
  if (typeof value !== 'string') return false;

  let parsed;
  try {
    parsed = new URL(value);
  } catch (err) {
    return false;
  }

  return (
    (parsed.protocol === 'http:' || parsed.protocol === 'https:') &&
    parsed.hostname.length > 0
  );
}

// POST /api/shorturl -> { original_url, short_url } or { error: 'invalid url' }
app.post('/api/shorturl', function (req, res) {
  const originalUrl = req.body.url;

  if (!isValidUrl(originalUrl)) {
    return res.json({ error: 'invalid url' });
  }

  let shortUrl = shortUrlByOriginalUrl.get(originalUrl);
  if (shortUrl === undefined) {
    shortUrl = nextShortUrl++;
    urls.set(shortUrl, originalUrl);
    shortUrlByOriginalUrl.set(originalUrl, shortUrl);
  }

  res.json({ original_url: originalUrl, short_url: shortUrl });
});

// GET /api/shorturl/:short_url -> redirect to the original URL
app.get('/api/shorturl/:short_url', function (req, res) {
  const originalUrl = urls.get(Number(req.params.short_url));

  if (!originalUrl) {
    return res
      .status(404)
      .json({ error: 'No short URL found for the given input' });
  }

  res.redirect(originalUrl);
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
