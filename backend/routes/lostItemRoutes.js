const express = require('express');
const router = express.Router();
const { createItem, getLostItems, getLostItemById, getMyLostItems, updateLostItem, deleteLostItem } = require('../controllers/lostItemController');
const { protect } = require('../middleware/authMiddleware');

// Routes
// POST /api/items -> Protected
router.post('/', protect, createItem);

// GET /api/lost-items -> Public
router.get('/', getLostItems);

// GET /api/lost-items/my-items -> Protected
router.get('/my-items', protect, getMyLostItems);

// GET /api/lost-items/:id -> Public
router.get('/:id', getLostItemById);

// PUT /api/lost-items/:id -> Protected (Ownership verification inside controller)
router.put('/:id', protect, updateLostItem);

// DELETE /api/lost-items/:id -> Protected (Ownership verification inside controller)
router.delete('/:id', protect, deleteLostItem);

module.exports = router;
