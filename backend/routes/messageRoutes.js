const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getMessagesByClaim,
  createMessage,
} = require('../controllers/messageController');

// All messages routes require authentication
router.get('/:claimId', protect, getMessagesByClaim);
router.post('/', protect, createMessage);

module.exports = router;
