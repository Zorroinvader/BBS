const { getDb } = require('../db');
const { logEpisode } = require('../lib/dbLog');

async function getAllEpisodes(options = {}) {
  const db = await getDb();
  const {
    page = 1,
    limit = 10,
    series: seriesFilter,
    category: categoryFilter,
    classInfo: classFilter,
    minDurationSeconds,
    maxDurationSeconds,
    q: searchQuery,
  } = options;
  const offset = (page - 1) * limit;

  const conditions = [];
  const countParams = [];
  const listParams = [];

  if (seriesFilter && String(seriesFilter).trim() !== '') {
    conditions.push('series = ?');
    const s = seriesFilter.trim();
    countParams.push(s);
    listParams.push(s);
  }

  if (categoryFilter && String(categoryFilter).trim() !== '') {
    conditions.push('category = ?');
    const c = categoryFilter.trim();
    countParams.push(c);
    listParams.push(c);
  }

  if (classFilter && String(classFilter).trim() !== '') {
    conditions.push('class_info = ?');
    const ci = classFilter.trim();
    countParams.push(ci);
    listParams.push(ci);
  }

  if (typeof minDurationSeconds === 'number' && !Number.isNaN(minDurationSeconds)) {
    conditions.push('duration_seconds >= ?');
    countParams.push(minDurationSeconds);
    listParams.push(minDurationSeconds);
  }

  if (typeof maxDurationSeconds === 'number' && !Number.isNaN(maxDurationSeconds)) {
    conditions.push('duration_seconds <= ?');
    countParams.push(maxDurationSeconds);
    listParams.push(maxDurationSeconds);
  }

  if (searchQuery && String(searchQuery).trim() !== '') {
    const like = '%' + String(searchQuery).trim() + '%';
    conditions.push('(title LIKE ? OR description LIKE ? OR series LIKE ? OR class_info LIKE ?)');
    countParams.push(like, like, like, like);
    listParams.push(like, like, like, like);
  }

  const where = conditions.length ? ' WHERE ' + conditions.join(' AND ') : '';

  const { rows } = await db.query(
    `SELECT id, title, description, audio_path, artwork_path, duration_seconds, publish_date, created_at, series, class_info, category, spotify_url, apple_url, youtube_url
     FROM episodes
     ${where}
     ORDER BY publish_date DESC
     LIMIT ? OFFSET ?`,
    [...listParams, limit, offset]
  );

  const countRow = await db.queryOne('SELECT COUNT(*) as total FROM episodes' + where, countParams);
  return { episodes: rows, total: countRow?.total ?? 0 };
}

async function getEpisodeById(id) {
  const db = await getDb();
  return db.queryOne(
    `SELECT id, title, description, audio_path, artwork_path, duration_seconds, publish_date, created_at, series, class_info, category, spotify_url, apple_url, youtube_url
     FROM episodes WHERE id = ?`,
    [id]
  );
}

async function createEpisode(data) {
  const db = await getDb();
  const {
    title,
    description,
    audio_path,
    artwork_path,
    duration_seconds,
    created_by,
    series,
    class_info,
    category,
    spotify_url,
    apple_url,
    youtube_url,
  } = data;
  const result = await db.run(
    `INSERT INTO episodes (title, description, audio_path, artwork_path, duration_seconds, created_by, series, class_info, category, spotify_url, apple_url, youtube_url)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      title || '',
      description || '',
      audio_path,
      artwork_path || null,
      duration_seconds || null,
      created_by || null,
      series || null,
      class_info || null,
      category || null,
      spotify_url || null,
      apple_url || null,
      youtube_url || null,
    ]
  );
  const episode = await getEpisodeById(result.lastId);
  logEpisode('upload', {
    id: episode.id,
    title: episode.title,
    audio_path: episode.audio_path,
    created_by: created_by,
  });
  return episode;
}

async function updateEpisode(id, data) {
  const episode = await getEpisodeById(id);
  if (!episode) return null;

  const db = await getDb();
  const updates = [];
  const values = [];
  if (data.title !== undefined) { updates.push('title = ?'); values.push(data.title); }
  if (data.description !== undefined) { updates.push('description = ?'); values.push(data.description); }
  if (data.artwork_path !== undefined) { updates.push('artwork_path = ?'); values.push(data.artwork_path); }
  if (data.duration_seconds !== undefined) { updates.push('duration_seconds = ?'); values.push(data.duration_seconds); }
  if (data.publish_date !== undefined) { updates.push('publish_date = ?'); values.push(data.publish_date); }
  if (data.series !== undefined) { updates.push('series = ?'); values.push(data.series); }
  if (data.class_info !== undefined) { updates.push('class_info = ?'); values.push(data.class_info); }
  if (data.category !== undefined) { updates.push('category = ?'); values.push(data.category); }
  if (data.spotify_url !== undefined) { updates.push('spotify_url = ?'); values.push(data.spotify_url); }
  if (data.apple_url !== undefined) { updates.push('apple_url = ?'); values.push(data.apple_url); }
  if (data.youtube_url !== undefined) { updates.push('youtube_url = ?'); values.push(data.youtube_url); }

  if (updates.length === 0) return episode;
  values.push(id);

  await db.run(`UPDATE episodes SET ${updates.join(', ')} WHERE id = ?`, values);
  return getEpisodeById(id);
}

async function deleteEpisode(id) {
  const db = await getDb();
  const result = await db.run('DELETE FROM episodes WHERE id = ?', [id]);
  return result;
}

async function getDistinctSeries() {
  const db = await getDb();
  const { rows } = await db.query('SELECT DISTINCT series FROM episodes WHERE series IS NOT NULL AND series != ? ORDER BY series', ['']);
  return rows.map((r) => r.series).filter(Boolean);
}

async function getDistinctCategories() {
  const db = await getDb();
  const { rows } = await db.query('SELECT DISTINCT category FROM episodes WHERE category IS NOT NULL AND category != ? ORDER BY category', ['']);
  return rows.map((r) => r.category).filter(Boolean);
}

async function getStats() {
  const db = await getDb();
  const { rows } = await db.query(
    'SELECT duration_seconds, publish_date, series FROM episodes'
  );

  const now = new Date();
  const ms7 = 7 * 24 * 60 * 60 * 1000;
  const ms30 = 30 * 24 * 60 * 60 * 1000;

  let totalDurationSeconds = 0;
  let episodesLast7Days = 0;
  let episodesLast30Days = 0;
  let latestPublishDate = null;
  const seriesSet = new Set();

  for (const row of rows) {
    const dur = row.duration_seconds;
    if (dur !== null && dur !== undefined) {
      const num = typeof dur === 'string' ? parseInt(dur, 10) : Number(dur);
      if (!Number.isNaN(num)) {
        totalDurationSeconds += num;
      }
    }

    if (row.series && String(row.series).trim() !== '') {
      seriesSet.add(String(row.series).trim());
    }

    if (row.publish_date) {
      const pub = new Date(row.publish_date);
      if (!Number.isNaN(pub.getTime())) {
        const diff = now.getTime() - pub.getTime();
        if (diff >= 0 && diff <= ms7) episodesLast7Days += 1;
        if (diff >= 0 && diff <= ms30) episodesLast30Days += 1;
        if (!latestPublishDate || pub > latestPublishDate) {
          latestPublishDate = pub;
        }
      }
    }
  }

  const episodeCount = rows.length;
  const totalMinutes = Math.floor(totalDurationSeconds / 60);
  const streamableHours = Math.round((totalDurationSeconds / 3600) * 10) / 10;
  const displayHours = Math.floor(totalMinutes / 60);
  const displayMinutes = totalMinutes % 60;
  const streamableTime = `${displayHours}:${String(displayMinutes).padStart(2, '0')}`;
  const averageDurationMinutes =
    episodeCount > 0 ? Math.round((totalDurationSeconds / episodeCount) / 60) : 0;

  return {
    activeListeners: 0,
    streamableHours,
    streamableTime,
    episodeCount,
    episodesLast7Days,
    episodesLast30Days,
    averageDurationMinutes,
    uniqueSeriesCount: seriesSet.size,
    mostRecentPublishDate: latestPublishDate ? latestPublishDate.toISOString() : null,
  };
}

module.exports = {
  getAllEpisodes,
  getEpisodeById,
  createEpisode,
  updateEpisode,
  deleteEpisode,
  getDistinctSeries,
  getDistinctCategories,
  getStats,
};
