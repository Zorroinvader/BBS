const Feed = require('feed').Feed;
const episodeService = require('./episodeService');
const config = require('../config');

async function generateRss() {
  const feed = new Feed({
    title: 'BBS II Wolfsburg Podcasts',
    description: 'Unsere Schule – Unsere Podcasts. Hier findest du alle Folgen, die an der BBS2 produziert werden.',
    id: config.publicUrl,
    link: config.publicUrl,
    image: `${config.publicUrl}/images/logo_bbs2wob.png`,
    favicon: `${config.publicUrl}/favicon.ico`,
    feedLinks: { rss2: `${config.publicUrl}/feed.xml` },
    copyright: 'BBS II Wolfsburg',
    language: 'de',
    author: {
      name: 'BBS II Wolfsburg',
      link: config.publicUrl,
    },
  });

  // High-level category so podcast apps can classify the show
  feed.addCategory('Education');

  const { episodes } = await episodeService.getAllEpisodes({ page: 1, limit: 100 });
  for (const ep of episodes) {
    const audioUrl = ep.audio_path
      ? `${config.publicUrl}/uploads/${ep.audio_path.replace(/\\/g, '/')}`
      : null;
    const durationSeconds = ep.duration_seconds || ep.durationSeconds || null;
    const categories = [];
    if (ep.series) categories.push(ep.series);
    if (ep.category) categories.push(ep.category);
    if (ep.class_info || ep.classInfo) categories.push(ep.class_info || ep.classInfo);

    feed.addItem({
      title: ep.title,
      description: ep.description || '',
      link: `${config.publicUrl}/#episode-${ep.id}`,
      date: new Date(ep.publish_date || ep.created_at),
      id: String(ep.id),
      author: feed.options.author,
      category: categories.map((c) => ({ name: c })),
      enclosure: audioUrl ? { url: audioUrl, type: 'audio/mpeg' } : undefined,
    });
  }

  return feed.rss2();
}

module.exports = { generateRss };
