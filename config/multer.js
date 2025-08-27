const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage(); // Store files in memory as buffers

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only images (jpeg, jpg, png) are allowed'));
  }
});
// For multiple files with different field names
const multiUpload = upload.fields([
  { name: 'vehicleImage', maxCount: 1 },
  { name: 'registrationImage', maxCount: 1 }
]);

module.exports = upload ;