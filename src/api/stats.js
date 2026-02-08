const express = require('express');
const router = express.Router();
const episodeService = require('../services/episodeService');

router.get('/', async (req, res) => {
  try {
    const stats = await episodeService.getStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
