const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { getDb } = require('../db');
const authService = require('../services/authService');
const { requireAuth, requireRole } = require('../middleware/auth');

router.use(requireAuth);
router.use(requireRole('admin'));

router.get('/', async (req, res) => {
  const db = await getDb();
  const { rows } = await db.query('SELECT id, email, role, created_at FROM users ORDER BY id');
  res.json({ users: rows });
});

router.post('/', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('role').optional().isIn(['admin', 'editor', 'viewer']),
], async (req, res) => {
  const err = validationResult(req);
  if (!err.isEmpty()) return res.status(400).json({ errors: err.array() });
  try {
    const role = req.body.role || 'viewer';
    const id = await authService.createUser(req.body.email, req.body.password, role);
    const db = await getDb();
    const user = await db.queryOne('SELECT id, email, role, created_at FROM users WHERE id = ?', [id]);
    res.status(201).json(user);
  } catch (e) {
    if (e.code === 'SQLITE_CONSTRAINT' || e.code === '23505') return res.status(400).json({ error: 'Email already exists' });
    throw e;
  }
});

module.exports = router;
