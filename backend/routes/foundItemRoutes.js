const express = require('express');
const router = express.Router();
const {
  createFoundItem,
  getFoundItems,
  getFoundItemById,
  getMyFoundItems,
  updateFoundItem,
  deleteFoundItem,
} = require('../controllers/foundItemController');
const { protect } = require('../middleware/authMiddleware');

// POST /api/found-items — Protected: only authenticated users can report found items
router.post('/', protect, createFoundItem);

// GET /api/found-items — Public: anyone can browse the found items feed
router.get('/', getFoundItems);

// GET /api/found-items/my-items — Protected: returns only the caller's reports
// IMPORTANT: static route /my-items MUST be declared BEFORE the dynamic /:id route
// to prevent Express from treating 'my-items' as an ObjectId parameter
router.get('/my-items', protect, getMyFoundItems);

// GET /api/found-items/:id — Public: retrieve a single found item's details
router.get('/:id', getFoundItemById);

// PUT /api/found-items/:id — Protected: only owner can update
router.put('/:id', protect, updateFoundItem);

// DELETE /api/found-items/:id — Protected: only owner can delete
router.delete('/:id', protect, deleteFoundItem);

module.exports = router;
