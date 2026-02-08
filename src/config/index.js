const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  host: process.env.HOST || '0.0.0.0',
  publicUrl: (process.env.PUBLIC_URL || `http://localhost:${process.env.PORT || '3000'}`).replace(/\/$/, ''),
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  dbPath: process.env.DB_PATH || './data/podcasts.db',
  databaseUrl: process.env.DATABASE_URL,
  corsOrigin: process.env.CORS_ORIGIN,
};

config.apiUrl = `${config.publicUrl}/api`;
if (!config.corsOrigin) config.corsOrigin = config.publicUrl;

module.exports = config;
