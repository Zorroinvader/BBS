const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const authService = require('../services/authService');

router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], async (req, res) => {
  const err = validationResult(req);
  if (!err.isEmpty()) return res.status(400).json({ errors: err.array() });
  const result = await authService.login(req.body.email, req.body.password);
  if (!result) return res.status(401).json({ error: 'Invalid email or password' });
  res.json(result);
});

module.exports = router;
