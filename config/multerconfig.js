const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const Module = require('module');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname,'../public/images/assets'));
  },
   filename: function (req, file, cb) {
    crypto.randomBytes(12, function (err, name) {
      if (err) return cb(err);  // handle error safely
      const fn = name.toString('hex') + path.extname(file.originalname);
      cb(null, fn);
    });
  }
})

const upload = multer({ storage: storage })

module.exports = upload

