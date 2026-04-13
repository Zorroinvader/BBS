const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const analyticsService = require('../services/analyticsService');

const adminOnly = [requireAuth, requireRole('admin', 'editor')];

/**
 * POST /api/analytics/listen/:episodeId
 * Record a listen event (public, no auth required).
 */
router.post('/listen/:episodeId', async (req, res) => {
  try {
    const episodeId = parseInt(req.params.episodeId, 10);
    if (Number.isNaN(episodeId)) return res.status(400).json({ error: 'Ungültige Episode-ID' });
    const source = req.body.source || 'web';
    await analyticsService.recordListen(episodeId, source);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/analytics/episode/:episodeId
 * Get listen count for a specific episode (admin/editor only).
 */
router.get('/episode/:episodeId', ...adminOnly, async (req, res) => {
  try {
    const episodeId = parseInt(req.params.episodeId, 10);
    if (Number.isNaN(episodeId)) return res.status(400).json({ error: 'Ungültige Episode-ID' });
    const listens = await analyticsService.getEpisodeListens(episodeId);
    res.json({ episodeId, listens });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/analytics
 * Get aggregated platform analytics (admin/editor only).
 */
router.get('/', ...adminOnly, async (req, res) => {
  try {
    const analytics = await analyticsService.getAnalytics();
    res.json(analytics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
