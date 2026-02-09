const express = require('express');
const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');
const Parser = require('rss-parser');
const { requireAuth, requireRole } = require('../middleware/auth');
const episodeService = require('../services/episodeService');

const router = express.Router();
const adminOnly = [requireAuth, requireRole('admin', 'editor')];
const parser = new Parser();

function downloadToFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(destPath);
    const req = client.get(url, (res) => {
      if (res.statusCode !== 200) {
        file.close(() => fs.unlink(destPath, () => {}));
        return reject(new Error(`Download failed with status ${res.statusCode}`));
      }
      res.pipe(file);
      file.on('finish', () => file.close(() => resolve()));
    });
    req.on('error', (err) => {
      file.close(() => fs.unlink(destPath, () => {}));
      reject(err);
    });
  });
}

router.post('/rss', ...adminOnly, async (req, res) => {
  try {
    const { url, category } = req.body || {};
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'RSS URL required' });
    }
    const trimmedUrl = url.trim();
    if (!/^https?:\/\//i.test(trimmedUrl)) {
      return res.status(400).json({ error: 'RSS URL must start with http:// or https://' });
    }
    const importCategory = (category && String(category).trim()) || 'Archiv';

    const feed = await parser.parseURL(trimmedUrl);
    const items = feed.items || [];
    if (!items.length) {
      return res.status(400).json({ error: 'Keine Einträge im RSS-Feed gefunden.' });
    }

    const uploadsDir = path.join(__dirname, '../../uploads');
    const audioDir = path.join(uploadsDir, 'audio');
    if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });

    const createdEpisodes = [];
    const maxItems = 30;

    for (const item of items.slice(0, maxItems)) {
      const enclosureUrl = item.enclosure && item.enclosure.url;
      if (!enclosureUrl) continue;

      const safeTitle = (item.title || 'ohne-titel').replace(/[^a-z0-9\-]+/gi, '-').toLowerCase();
      const fileName = `rss_${Date.now()}_${safeTitle}.mp3`;
      const destPath = path.join(audioDir, fileName);

      try {
        await downloadToFile(enclosureUrl, destPath);
      } catch (_) {
        continue;
      }

      const audioRel = path.relative(uploadsDir, destPath).replace(/\\/g, '/');
      const title = item.title || 'Ohne Titel';
      const description =
        item.contentSnippet || item.content || item.summary || item.description || '';

      const ep = await episodeService.createEpisode({
        title,
        description,
        audio_path: audioRel,
        artwork_path: null,
        duration_seconds: null,
        created_by: req.user?.id,
        series: null,
        class_info: null,
        category: importCategory,
      });
      createdEpisodes.push({ id: ep.id, title: ep.title });
    }

    return res.json({
      importedCount: createdEpisodes.length,
      category: importCategory,
      episodes: createdEpisodes,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;

