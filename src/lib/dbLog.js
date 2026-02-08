const { EventEmitter } = require('events');

const dbLog = new EventEmitter();
dbLog.setMaxListeners(50);

function logEpisode(event, data) {
  const entry = {
    type: 'episode',
    event,
    ...data,
    ts: new Date().toISOString(),
  };
  dbLog.emit('entry', entry);
  return entry;
}

module.exports = { dbLog, logEpisode };
