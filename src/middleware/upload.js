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

const artworkUpload = multer({
  storage: artworkStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowed.includes(file.mimetype) || file.originalname.match(/\.(jpg|jpeg|png)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Only jpg and png images allowed'));
    }
  },
});

module.exports = { audioUpload, artworkUpload };
