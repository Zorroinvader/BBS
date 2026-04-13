const { getDb } = require('../db');

/**
 * Record a listen event for an episode.
 */
async function recordListen(episodeId, source = 'web') {
  const db = await getDb();
  await db.run(
    'INSERT INTO listen_events (episode_id, source) VALUES (?, ?)',
    [episodeId, source]
  );
}

/**
 * Get listen count for a specific episode.
 */
async function getEpisodeListens(episodeId) {
  const db = await getDb();
  const row = await db.queryOne(
    'SELECT COUNT(*) as total FROM listen_events WHERE episode_id = ?',
    [episodeId]
  );
  const total = row?.total ?? 0;
  return typeof total === 'string' ? parseInt(total, 10) : Number(total);
}

/**
 * Get aggregated listener analytics for the whole platform.
 */
async function getAnalytics() {
  const db = await getDb();

  const totalRow = await db.queryOne('SELECT COUNT(*) as total FROM listen_events');
  const totalListens = Number(totalRow?.total ?? 0);

  const last7Row = await db.queryOne(
    "SELECT COUNT(*) as total FROM listen_events WHERE listened_at >= datetime('now', '-7 days')"
  );
  const listensLast7Days = Number(last7Row?.total ?? 0);

  const last30Row = await db.queryOne(
    "SELECT COUNT(*) as total FROM listen_events WHERE listened_at >= datetime('now', '-30 days')"
  );
  const listensLast30Days = Number(last30Row?.total ?? 0);

  const { rows: topEpisodes } = await db.query(
    `SELECT e.id, e.title, COUNT(l.id) as listen_count
     FROM listen_events l
     JOIN episodes e ON e.id = l.episode_id
     GROUP BY e.id, e.title
     ORDER BY listen_count DESC
     LIMIT 10`
  );

  const { rows: sourceBreakdown } = await db.query(
    `SELECT source, COUNT(*) as count FROM listen_events GROUP BY source ORDER BY count DESC`
  );

  return {
    totalListens,
    listensLast7Days,
    listensLast30Days,
    topEpisodes: topEpisodes.map(r => ({
      id: r.id,
      title: r.title,
      listens: Number(r.listen_count),
    })),
    sourceBreakdown: sourceBreakdown.map(r => ({
      source: r.source,
      count: Number(r.count),
    })),
  };
}

module.exports = { recordListen, getEpisodeListens, getAnalytics };
