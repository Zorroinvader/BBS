const Feed = require('feed').Feed;
const episodeService = require('./episodeService');
const config = require('../config');

async function generateRss() {
  const feed = new Feed({
    title: 'BBS II Wolfsburg Podcasts',
    description: 'Unsere Schule – Unsere Podcasts. Hier findest du alle Folgen, die an der BBS2 produziert werden.',
    link: config.publicUrl,
    feedLinks: { rss2: `${config.publicUrl}/feed.xml` },
    copyright: 'BBS II Wolfsburg',
    language: 'de',
  });

  const { episodes } = await episodeService.getAllEpisodes({ page: 1, limit: 100 });
  for (const ep of episodes) {
    const audioUrl = ep.audio_path
      ? `${config.publicUrl}/uploads/${ep.audio_path.replace(/\\/g, '/')}`
      : null;
    feed.addItem({
      title: ep.title,
      description: ep.description || '',
      link: `${config.publicUrl}/#episode-${ep.id}`,
      date: new Date(ep.publish_date || ep.created_at),
      enclosure: audioUrl ? { url: audioUrl, type: 'audio/mpeg' } : undefined,
    });
  }

  return feed.rss2();
}

module.exports = { generateRss };
