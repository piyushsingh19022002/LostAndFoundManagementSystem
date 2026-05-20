const express = require('express');
const router = express.Router();
const { createItem, getItems } = require('../controllers/lostItemController');
const { protect } = require('../middleware/authMiddleware');

// Routes
// POST /api/items -> Protected
router.post('/', protect, createItem);

// GET /api/items -> Public
router.get('/', getItems);

module.exports = router;
