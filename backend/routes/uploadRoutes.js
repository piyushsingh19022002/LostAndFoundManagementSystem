const express = require('express');
const router = express.Router();
const { uploadImage } = require('../controllers/uploadController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// POST /api/upload
// Access: Protected
router.post('/', protect, upload.single('image'), uploadImage);

module.exports = router;
