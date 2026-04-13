const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const authService = require('../services/authService');
const auditService = require('../services/auditService');

router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], async (req, res) => {
  const err = validationResult(req);
  if (!err.isEmpty()) return res.status(400).json({ errors: err.array() });
  const result = await authService.login(req.body.email, req.body.password);
  if (!result) {
    await auditService.log({
      action: 'login_failed',
      resource: 'auth',
      details: `Fehlgeschlagener Login-Versuch: ${req.body.email}`,
      ipAddress: req.ip,
    });
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  await auditService.log({
    userId: result.user.id,
    action: 'login',
    resource: 'auth',
    details: `Erfolgreicher Login: ${result.user.email}`,
    ipAddress: req.ip,
  });
  res.json(result);
});

module.exports = router;
