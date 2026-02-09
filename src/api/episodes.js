const express = require('express');
const router = express.Router();
const path = require('path');
const episodeService = require('../services/episodeService');
const { episodeUpload, artworkUpload } = require('../middleware/upload');
const { requireAuth, requireRole } = require('../middleware/auth');
const config = require('../config');
const mm = require('music-metadata');

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
    series: ep.series || null,
    classInfo: ep.class_info || null,
    category: ep.category || null,
    spotifyUrl: ep.spotify_url || null,
    appleUrl: ep.apple_url || null,
    youtubeUrl: ep.youtube_url || null,
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
    const series = req.query.series ? String(req.query.series).trim() : undefined;
    const category = req.query.category ? String(req.query.category).trim() : undefined;
    const classInfo = req.query.class ? String(req.query.class).trim() : undefined;
    const minDurationSeconds = req.query.minDurationSeconds ? parseInt(req.query.minDurationSeconds, 10) : undefined;
    const maxDurationSeconds = req.query.maxDurationSeconds ? parseInt(req.query.maxDurationSeconds, 10) : undefined;
    const q = req.query.q ? String(req.query.q).trim() : undefined;
    const { episodes, total } = await episodeService.getAllEpisodes({
      page,
      limit,
      series,
      category,
      classInfo,
      minDurationSeconds,
      maxDurationSeconds,
      q,
    });
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

router.get('/meta/series', async (req, res) => {
  try {
    const series = await episodeService.getDistinctSeries();
    res.json({ series });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/meta/categories', async (req, res) => {
  try {
    const categories = await episodeService.getDistinctCategories();
    res.json({ categories });
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

router.post('/', ...adminOnly, episodeUpload, async (req, res) => {
  try {
    const audioFile = req.files && req.files.audio && req.files.audio[0];
    if (!audioFile) return res.status(400).json({ error: 'Audio file required' });
    const title = (req.body.title && String(req.body.title).trim()) ? String(req.body.title).trim() : null;
    if (!title) return res.status(400).json({ error: 'Title (name of the episode) is required. Please enter a display name, e.g. "Einführung".' });
    const description = req.body.description || '';
    const series = req.body.series ? String(req.body.series).trim() : null;
    const category = req.body.category ? String(req.body.category).trim() : null;
    const classInfo = req.body.class_info ? String(req.body.class_info).trim() : null;
    const spotifyUrl = req.body.spotify_url ? String(req.body.spotify_url).trim() : null;
    const appleUrl = req.body.apple_url ? String(req.body.apple_url).trim() : null;
    const youtubeUrl = req.body.youtube_url ? String(req.body.youtube_url).trim() : null;
    let durationSeconds = null;
    try {
      const meta = await mm.parseFile(audioFile.path);
      if (meta && meta.format && typeof meta.format.duration === 'number') {
        durationSeconds = Math.round(meta.format.duration);
      }
    } catch (e) {
      // ignore – we will try browser-provided fallback below
    }
    if (durationSeconds == null && req.body.duration_seconds) {
      const bodyDur = parseInt(req.body.duration_seconds, 10);
      if (!Number.isNaN(bodyDur) && bodyDur > 0) {
        durationSeconds = bodyDur;
      }
    }
    const uploadsDir = path.join(__dirname, '../../uploads');
    const audioRel = path.relative(uploadsDir, audioFile.path).replace(/\\/g, '/');

    let artworkPath = null;
    const artworkFile = req.files && req.files.artwork && req.files.artwork[0];
    if (artworkFile) {
      artworkPath = path.relative(uploadsDir, artworkFile.path).replace(/\\/g, '/');
    }

    const episode = await episodeService.createEpisode({
      title: title,
      description,
      audio_path: audioRel,
      artwork_path: artworkPath,
      duration_seconds: durationSeconds,
      created_by: req.user?.id,
      series,
      class_info: classInfo,
      category,
      spotify_url: spotifyUrl,
      apple_url: appleUrl,
      youtube_url: youtubeUrl,
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

router.post('/:id/artwork', ...adminOnly, artworkUpload.single('artwork'), async (req, res) => {
  try {
    const ep = await episodeService.getEpisodeById(req.params.id);
    if (!ep) return res.status(404).json({ error: 'Episode not found' });
    if (!req.file) return res.status(400).json({ error: 'Artwork file required' });
    const uploadsDir = path.join(__dirname, '../../uploads');
    const artworkRel = path.relative(uploadsDir, req.file.path).replace(/\\/g, '/');
    const updated = await episodeService.updateEpisode(req.params.id, { artwork_path: artworkRel });
    res.json(toPublicEpisode(updated));
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
