// index.js
// where your node app starts

// init project
require('dotenv').config();
var express = require('express');
var app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC
var cors = require('cors');
app.use(cors({ optionsSuccessStatus: 200 })); // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

// trust the reverse proxy (e.g. freeCodeCamp's) so req.ip reflects the client
app.set('trust proxy', true);

// Request Header Parser API
// GET /api/whoami -> { ipaddress, language, software }
app.get('/api/whoami', function (req, res) {
  res.json({
    // req.ip is the leftmost X-Forwarded-For entry thanks to `trust proxy`
    ipaddress: req.ip || req.socket.remoteAddress || 'unknown',
    // "*" is the HTTP default when the client expresses no language preference
    language: req.headers['accept-language'] || '*',
    software: req.headers['user-agent'] || 'unknown'
  });
});

// listen for requests :)
var listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
