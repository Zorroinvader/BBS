const express = require('express');
const router = express.Router();
const config = require('../config');
const { getDb } = require('../db');

router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    await db.queryOne('SELECT 1');
    res.json({
      status: 'ok',
      db: 'connected',
      apiUrl: config.apiUrl,
    });
  } catch (err) {
    res.status(503).json({
      status: 'error',
      db: 'disconnected',
      error: err.message,
    });
  }
});

module.exports = router;
