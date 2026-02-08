const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb } = require('../db');
const config = require('../config');

function hashPassword(password) {
  return bcrypt.hashSync(password, 10);
}

function verifyPassword(password, hash) {
  return bcrypt.compareSync(password, hash);
}

function createToken(userId) {
  return jwt.sign({ userId }, config.jwtSecret, { expiresIn: '7d' });
}

async function login(email, password) {
  const db = await getDb();
  const user = await db.queryOne('SELECT id, email, password_hash, role FROM users WHERE email = ?', [email]);
  if (!user || !verifyPassword(password, user.password_hash)) return null;
  return {
    token: createToken(user.id),
    user: { id: user.id, email: user.email, role: user.role },
  };
}

async function createUser(email, password, role = 'viewer') {
  const db = await getDb();
  const hash = hashPassword(password);
  const result = await db.run('INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)', [email, hash, role]);
  return result.lastId;
}

async function getUserById(id) {
  const db = await getDb();
  return db.queryOne('SELECT id, email, role FROM users WHERE id = ?', [id]);
}

module.exports = { hashPassword, verifyPassword, createToken, login, createUser, getUserById };
