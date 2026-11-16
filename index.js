// index.js
// where your node app starts

// init project
var express = require('express');
var app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
var cors = require('cors');
app.use(cors({optionsSuccessStatus: 200}));  // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});


// Timestamp Microservice API
// GET /api/:date? -> { unix, utc } or { error: 'Invalid Date' }
app.get("/api/:date?", function (req, res) {
  const dateParam = req.params.date;

  let date;

  if (!dateParam) {
    // No date provided: use the current time
    date = new Date();
  } else if (/^-?\d+$/.test(dateParam)) {
    // A string of digits is a Unix timestamp in milliseconds
    date = new Date(Number(dateParam));
  } else {
    // Otherwise parse it as a date string (e.g. "2015-12-25")
    date = new Date(dateParam);
  }

  if (isNaN(date.getTime())) {
    return res.json({ error: 'Invalid Date' });
  }

  res.json({
    unix: date.getTime(),
    utc: date.toUTCString()
  });
});



// Listen on port set in environment variable or default to 3000
var listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
