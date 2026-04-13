const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const auditService = require('../services/auditService');

router.use(requireAuth);
router.use(requireRole('admin'));

/**
 * GET /api/audit
 * Retrieve audit log entries. Admin only.
 */
router.get('/', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 200);
    const offset = parseInt(req.query.offset) || 0;
    const entries = await auditService.getLog({ limit, offset });
    res.json({ entries });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/audit/export/:userId
 * DSGVO Art. 15 – Export all data for a user. Admin only.
 */
router.get('/export/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    if (Number.isNaN(userId)) return res.status(400).json({ error: 'Ungültige Benutzer-ID' });
    const data = await auditService.exportUserData(userId);
    if (!data) return res.status(404).json({ error: 'Benutzer nicht gefunden' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/audit/anonymize/:userId
 * DSGVO Art. 17 – Anonymize/delete user data. Admin only.
 */
router.post('/anonymize/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    if (Number.isNaN(userId)) return res.status(400).json({ error: 'Ungültige Benutzer-ID' });
    await auditService.anonymizeUser(userId);
    res.json({ ok: true, message: 'Benutzerdaten wurden anonymisiert (DSGVO Art. 17).' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
