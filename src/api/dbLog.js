const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const { dbLog } = require('../lib/dbLog');

const adminOnly = [requireAuth, requireRole('admin', 'editor')];

router.get('/', ...adminOnly, (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  const send = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
    res.flush?.();
  };

  const onEntry = (entry) => send(entry);

  dbLog.on('entry', onEntry);
  send({ type: 'connected', ts: new Date().toISOString(), msg: 'Live DB-Log verbunden' });

  const keepalive = setInterval(() => {
    res.write(': keepalive\n\n');
    res.flush?.();
  }, 30000);

  req.on('close', () => {
    clearInterval(keepalive);
    dbLog.off('entry', onEntry);
  });
});

module.exports = router;
