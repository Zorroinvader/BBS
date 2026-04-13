const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const redcircle = require('../services/redcircle');
const episodeService = require('../services/episodeService');
const config = require('../config');

const adminOnly = [requireAuth, requireRole('admin', 'editor')];

/**
 * GET /api/distribution/status
 * Returns the RedCircle connection status and platform distribution overview.
 */
router.get('/status', ...adminOnly, async (req, res) => {
  try {
    const status = redcircle.getStatus();
    const distribution = await redcircle.getDistributionStatus();
    res.json({ redcircle: status, distribution });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/distribution/publish/:id
 * Publish a specific episode to RedCircle for automatic distribution
 * to Spotify, YouTube, and Schulradio.
 */
router.post('/publish/:id', ...adminOnly, async (req, res) => {
  try {
    const ep = await episodeService.getEpisodeById(req.params.id);
    if (!ep) return res.status(404).json({ error: 'Episode nicht gefunden' });

    const audioUrl = ep.audio_path
      ? `${config.publicUrl}/uploads/${ep.audio_path.replace(/\\/g, '/')}`
      : null;
    if (!audioUrl) return res.status(400).json({ error: 'Episode hat keine Audio-Datei' });

    const artworkUrl = ep.artwork_path
      ? `${config.publicUrl}/uploads/${ep.artwork_path.replace(/\\/g, '/')}`
      : null;

    const result = await redcircle.publishEpisode({
      title: ep.title,
      description: ep.description,
      audioUrl,
      artworkUrl,
      durationSeconds: ep.duration_seconds,
    });

    if (result.success && result.platforms) {
      const updates = {};
      if (result.platforms.spotify) updates.spotify_url = result.platforms.spotify;
      if (result.platforms.youtube) updates.youtube_url = result.platforms.youtube;
      if (Object.keys(updates).length > 0) {
        await episodeService.updateEpisode(ep.id, updates);
      }
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/distribution/analytics
 * Returns show-level analytics from RedCircle.
 */
router.get('/analytics', ...adminOnly, async (req, res) => {
  try {
    const analytics = await redcircle.getShowAnalytics();
    res.json(analytics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
