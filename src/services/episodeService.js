const { getDb } = require('../db');

async function getAllEpisodes(options = {}) {
  const db = await getDb();
  const { page = 1, limit = 10 } = options;
  const offset = (page - 1) * limit;

  const { rows } = await db.query(
    `SELECT id, title, description, audio_path, artwork_path, duration_seconds, publish_date, created_at
     FROM episodes
     ORDER BY publish_date DESC
     LIMIT ? OFFSET ?`,
    [limit, offset]
  );

  const countRow = await db.queryOne('SELECT COUNT(*) as total FROM episodes');
  return { episodes: rows, total: countRow?.total ?? 0 };
}

async function getEpisodeById(id) {
  const db = await getDb();
  return db.queryOne(
    `SELECT id, title, description, audio_path, artwork_path, duration_seconds, publish_date, created_at
     FROM episodes WHERE id = ?`,
    [id]
  );
}

async function createEpisode(data) {
  const db = await getDb();
  const { title, description, audio_path, artwork_path, duration_seconds, created_by } = data;
  const result = await db.run(
    `INSERT INTO episodes (title, description, audio_path, artwork_path, duration_seconds, created_by)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [title || '', description || '', audio_path, artwork_path || null, duration_seconds || null, created_by || null]
  );
  return getEpisodeById(result.lastId);
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

async function getStats() {
  const db = await getDb();
  const countRow = await db.queryOne('SELECT COUNT(*) as total FROM episodes');
  const durationRow = await db.queryOne('SELECT COALESCE(SUM(duration_seconds), 0) as total FROM episodes');
  const total = durationRow?.total ?? 0;
  const totalNum = typeof total === 'string' ? parseInt(total) : Number(total);
  const hours = Math.floor(totalNum / 3600);
  const epCount = countRow?.total ?? 0;
  const episodeCount = typeof epCount === 'string' ? parseInt(epCount) : Number(epCount);
  return {
    activeListeners: 0,
    streamableHours: hours,
    episodeCount,
  };
}

module.exports = {
  getAllEpisodes,
  getEpisodeById,
  createEpisode,
  updateEpisode,
  deleteEpisode,
  getStats,
};
