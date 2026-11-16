const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// In-memory store: _id -> { _id, username, log: [{ description, duration, date }] }
const users = new Map();

function publicUser(user) {
  return { username: user.username, _id: user._id };
}

// Parse a "yyyy-mm-dd" query parameter, returns null when absent/invalid
function parseDateOnly(value) {
  if (typeof value !== 'string' || value === '') return null;
  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date;
}

// POST /api/users -> { username, _id }
app.post('/api/users', (req, res) => {
  const username = req.body.username;

  if (typeof username !== 'string' || username === '') {
    return res.status(400).json({ error: 'username is required' });
  }

  const user = {
    username: username,
    _id: crypto.randomUUID(),
    log: []
  };

  users.set(user._id, user);
  res.json(publicUser(user));
});

// GET /api/users -> [{ username, _id }, ...]
app.get('/api/users', (req, res) => {
  res.json([...users.values()].map(publicUser));
});

// POST /api/users/:_id/exercises -> user object with the exercise fields added
app.post('/api/users/:_id/exercises', (req, res) => {
  const user = users.get(req.params._id);

  if (!user) {
    return res.status(404).json({ error: 'user not found' });
  }

  const description = req.body.description;
  const duration = Number(req.body.duration);

  if (typeof description !== 'string' || description === '') {
    return res.status(400).json({ error: 'description is required' });
  }

  if (!Number.isFinite(duration) || duration <= 0) {
    return res.status(400).json({ error: 'duration must be a positive number' });
  }

  let date;
  if (req.body.date) {
    date = new Date(req.body.date);
    if (isNaN(date.getTime())) {
      return res.status(400).json({ error: 'invalid date' });
    }
  } else {
    // No date supplied: use the current date
    date = new Date();
  }

  user.log.push({ description: description, duration: duration, date: date });

  res.json({
    _id: user._id,
    username: user.username,
    date: date.toDateString(),
    description: description,
    duration: duration
  });
});

// GET /api/users/:_id/logs?from=&to=&limit= -> user object + count + log
app.get('/api/users/:_id/logs', (req, res) => {
  const user = users.get(req.params._id);

  if (!user) {
    return res.status(404).json({ error: 'user not found' });
  }

  let log = user.log.slice();

  const from = parseDateOnly(req.query.from);
  if (from) {
    log = log.filter((exercise) => exercise.date >= from);
  }

  const to = parseDateOnly(req.query.to);
  if (to) {
    // include the whole "to" day
    to.setUTCHours(23, 59, 59, 999);
    log = log.filter((exercise) => exercise.date <= to);
  }

  if (req.query.limit !== undefined) {
    const limit = parseInt(req.query.limit, 10);
    if (Number.isInteger(limit) && limit > 0) {
      log = log.slice(0, limit);
    }
  }

  res.json({
    _id: user._id,
    username: user.username,
    count: log.length,
    log: log.map((exercise) => ({
      description: exercise.description,
      duration: exercise.duration,
      date: exercise.date.toDateString()
    }))
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
