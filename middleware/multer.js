const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "/tmp");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname + "_" + Date.now());
  },
});

const upload = multer({ storage: storage }).single("file");

module.exports = upload;
