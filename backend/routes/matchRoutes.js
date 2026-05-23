const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getMatches } = require('../controllers/matchController');

// All matching routes are private
router.use(protect);

router.get('/:itemId', getMatches);

module.exports = router;
