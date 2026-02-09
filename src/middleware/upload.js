const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const audioStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(uploadsDir, 'audio');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = (path.extname(file.originalname) || '.mp3').toLowerCase();
    const name = `episode_${Date.now()}${ext}`;
    cb(null, name);
  },
});

const artworkStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(uploadsDir, 'artwork');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const name = `artwork_${Date.now()}${ext}`;
    cb(null, name);
  },
});

/** Single storage that routes by field name for multipart forms with audio + optional artwork */
const episodeUploadStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'audio') {
      const dir = path.join(uploadsDir, 'audio');
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      return cb(null, dir);
    }
    if (file.fieldname === 'artwork') {
      const dir = path.join(uploadsDir, 'artwork');
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      return cb(null, dir);
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    if (file.fieldname === 'audio') {
      const ext = (path.extname(file.originalname) || '.mp3').toLowerCase();
      return cb(null, `episode_${Date.now()}${ext}`);
    }
    if (file.fieldname === 'artwork') {
      const ext = path.extname(file.originalname) || '.jpg';
      return cb(null, `artwork_${Date.now()}${ext}`);
    }
    cb(null, file.originalname);
  },
});

function episodeFileFilter(req, file, cb) {
  if (file.fieldname === 'audio') {
    const allowed = ['audio/mpeg', 'audio/mp3', 'audio/x-m4a', 'audio/m4a'];
    if (allowed.includes(file.mimetype) || file.originalname.match(/\.(mp3|m4a)$/i)) {
      return cb(null, true);
    }
    return cb(new Error('Nur mp3 und m4a erlaubt'));
  }
  if (file.fieldname === 'artwork') {
    const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (allowed.includes(file.mimetype) || file.originalname.match(/\.(jpg|jpeg|png|webp)$/i)) {
      return cb(null, true);
    }
    return cb(new Error('Nur JPG, PNG oder WebP erlaubt'));
  }
  cb(null, true);
}

const audioUpload = multer({
  storage: audioStorage,
  limits: { fileSize: 200 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['audio/mpeg', 'audio/mp3', 'audio/x-m4a', 'audio/m4a'];
    if (allowed.includes(file.mimetype) || file.originalname.match(/\.(mp3|m4a)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Only mp3 and m4a files allowed'));
    }
  },
});

/** Accepts multipart with audio (required) and optional artwork (cover image) */
const episodeUpload = multer({
  storage: episodeUploadStorage,
  limits: { fileSize: 200 * 1024 * 1024 },
  fileFilter: episodeFileFilter,
}).fields([
  { name: 'audio', maxCount: 1 },
  { name: 'artwork', maxCount: 1 },
]);

const artworkUpload = multer({
  storage: artworkStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (allowed.includes(file.mimetype) || file.originalname.match(/\.(jpg|jpeg|png|webp)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Only jpg, png or webp allowed'));
    }
  },
});

module.exports = { audioUpload, artworkUpload, episodeUpload };
