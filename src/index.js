const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config');
const healthRouter = require('./api/health');
const authRouter = require('./api/auth');
const episodesRouter = require('./api/episodes');
const dbLogRouter = require('./api/dbLog');
const statsRouter = require('./api/stats');
const usersRouter = require('./api/users');
const { generateRss } = require('./services/rss');
const { getDb } = require('./db');
const authService = require('./services/authService');

const app = express();

app.set('trust proxy', 1);

const corsOptions = {
  origin: config.corsOrigin?.includes(',') ? config.corsOrigin.split(',').map(s => s.trim()) : config.corsOrigin,
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/stats', statsRouter);
app.use('/api/episodes', episodesRouter);
app.use('/api/db-log', dbLogRouter);
app.use('/api/users', usersRouter);

app.get('/feed.xml', async (req, res) => {
  try {
    const xml = await generateRss();
    res.type('application/rss+xml').send(xml);
  } catch (err) {
    res.status(500).send('RSS generation failed');
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.use(express.static(path.join(__dirname, '../public')));

async function start() {
  const db = await getDb();
  const countRow = await db.queryOne('SELECT COUNT(*) as c FROM users');
  const count = countRow?.c ?? 0;
  const num = typeof count === 'string' ? parseInt(count) : Number(count);
  if (num === 0) {
    await authService.createUser('admin@bbs2-wob.de', 'admin123', 'admin');
  }

  app.listen(config.port, config.host, () => {
    console.log(`Podcast platform running at http://${config.host === '0.0.0.0' ? 'localhost' : config.host}:${config.port}`);
    console.log(`API connection string: ${config.apiUrl}`);
  });
}

start().catch(err => {
  console.error('Failed to start:', err);
  process.exit(1);
});

module.exports = app;
