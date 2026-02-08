const express = require('express');
const router = express.Router();
const path = require('path');
const episodeService = require('../services/episodeService');
const { audioUpload } = require('../middleware/upload');
const { requireAuth, requireRole } = require('../middleware/auth');
const config = require('../config');

const adminOnly = [requireAuth, requireRole('admin', 'editor')];

function getPublicUrl(filePath) {
  if (!filePath) return null;
  const rel = filePath.replace(/\\/g, '/');
  const suffix = rel.includes('uploads') ? rel.split('uploads')[1].replace(/^[/\\]/, '') : rel;
  return `${config.publicUrl}/uploads/${suffix}`;
}

function toPublicEpisode(ep) {
  if (!ep) return null;
  return {
    id: ep.id,
    title: ep.title,
    description: ep.description,
    audioUrl: getPublicUrl(ep.audio_path),
    artworkUrl: ep.artwork_path ? getPublicUrl(ep.artwork_path) : null,
    durationSeconds: ep.duration_seconds,
    publishDate: ep.publish_date,
    createdAt: ep.created_at,
  };
}

router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const { episodes, total } = await episodeService.getAllEpisodes({ page, limit });
    const totalNum = typeof total === 'string' ? parseInt(total) : Number(total);
    const publicEpisodes = episodes.map(toPublicEpisode);
    res.json({
      episodes: publicEpisodes,
      total: totalNum,
      page,
      limit,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const ep = await episodeService.getEpisodeById(req.params.id);
    if (!ep) return res.status(404).json({ error: 'Episode not found' });
    res.json(toPublicEpisode(ep));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', ...adminOnly, audioUpload.single('audio'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Audio file required' });
    const title = req.body.title || req.file.originalname;
    const description = req.body.description || '';
    const durationSeconds = req.body.duration_seconds ? parseInt(req.body.duration_seconds) : null;
    const artworkPath = req.body.artwork_path || null;
    const uploadsDir = path.join(__dirname, '../../uploads');
    const audioRel = path.relative(uploadsDir, req.file.path).replace(/\\/g, '/');

    const episode = await episodeService.createEpisode({
      title,
      description,
      audio_path: audioRel,
      artwork_path: artworkPath,
      duration_seconds: durationSeconds,
      created_by: req.user?.id,
    });
    res.status(201).json(toPublicEpisode(episode));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id', ...adminOnly, async (req, res) => {
  try {
    const ep = await episodeService.updateEpisode(req.params.id, req.body);
    if (!ep) return res.status(404).json({ error: 'Episode not found' });
    res.json(toPublicEpisode(ep));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', ...adminOnly, async (req, res) => {
  try {
    const result = await episodeService.deleteEpisode(req.params.id);
    const changes = typeof result.changes === 'string' ? parseInt(result.changes) : Number(result.changes || 0);
    if (changes === 0) return res.status(404).json({ error: 'Episode not found' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
