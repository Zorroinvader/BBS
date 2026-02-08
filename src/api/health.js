const express = require('express');
const router = express.Router();
const config = require('../config');

router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    apiUrl: config.apiUrl,
  });
});

module.exports = router;
