const { getDb } = require('../db');

/**
 * DSGVO-konformes Audit-Logging.
 * Protokolliert alle relevanten Zugriffe und Änderungen für Datenschutz-Compliance.
 */

/**
 * Log an auditable action.
 *
 * @param {object} entry
 * @param {number} [entry.userId] - The user performing the action
 * @param {string} entry.action - Action type (login, create, update, delete, access, export)
 * @param {string} [entry.resource] - Resource type (episode, user, settings)
 * @param {number} [entry.resourceId] - ID of the affected resource
 * @param {string} [entry.details] - Additional details
 * @param {string} [entry.ipAddress] - Client IP address
 */
async function log(entry) {
  const db = await getDb();
  await db.run(
    `INSERT INTO audit_log (user_id, action, resource, resource_id, details, ip_address)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      entry.userId || null,
      entry.action,
      entry.resource || null,
      entry.resourceId || null,
      entry.details || null,
      entry.ipAddress || null,
    ]
  );
}

/**
 * Get audit log entries with optional filters.
 */
async function getLog(options = {}) {
  const db = await getDb();
  const { limit = 50, offset = 0, userId, action, resource } = options;
  const conditions = [];
  const params = [];

  if (userId) { conditions.push('user_id = ?'); params.push(userId); }
  if (action) { conditions.push('action = ?'); params.push(action); }
  if (resource) { conditions.push('resource = ?'); params.push(resource); }

  const where = conditions.length ? ' WHERE ' + conditions.join(' AND ') : '';
  const { rows } = await db.query(
    `SELECT id, user_id, action, resource, resource_id, details, ip_address, created_at
     FROM audit_log ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  return rows;
}

/**
 * DSGVO Art. 15 – Recht auf Auskunft.
 * Export all data associated with a user.
 */
async function exportUserData(userId) {
  const db = await getDb();
  const user = await db.queryOne('SELECT id, email, role, created_at FROM users WHERE id = ?', [userId]);
  if (!user) return null;

  const { rows: episodes } = await db.query(
    'SELECT id, title, description, publish_date, created_at FROM episodes WHERE created_by = ?',
    [userId]
  );

  const { rows: auditEntries } = await db.query(
    'SELECT action, resource, resource_id, details, created_at FROM audit_log WHERE user_id = ? ORDER BY created_at DESC LIMIT 100',
    [userId]
  );

  return {
    user: { id: user.id, email: user.email, role: user.role, createdAt: user.created_at },
    episodes,
    auditLog: auditEntries,
    exportedAt: new Date().toISOString(),
  };
}

/**
 * DSGVO Art. 17 – Recht auf Löschung.
 * Anonymize all data for a specific user (soft delete).
 */
async function anonymizeUser(userId) {
  const db = await getDb();
  await db.run(
    "UPDATE users SET email = 'deleted_' || id || '@anonym.local', password_hash = 'DELETED', role = 'viewer' WHERE id = ?",
    [userId]
  );
  await db.run(
    'UPDATE episodes SET created_by = NULL WHERE created_by = ?',
    [userId]
  );
  await log({
    userId: null,
    action: 'anonymize',
    resource: 'user',
    resourceId: userId,
    details: 'DSGVO Art. 17 Löschantrag durchgeführt',
  });
}

module.exports = { log, getLog, exportUserData, anonymizeUser };
