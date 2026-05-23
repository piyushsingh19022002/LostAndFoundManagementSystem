const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');
const {
  getAllUsers,
  getAllItems,
  deleteItem,
  deleteUser,
  getAnalytics,
} = require('../controllers/adminController');

// All routes here require authentication and administrator privilege
router.use(protect);
router.use(adminOnly);

router.get('/users', getAllUsers);
router.get('/items', getAllItems);
router.delete('/item/:id', deleteItem);
router.delete('/user/:id', deleteUser);
router.get('/analytics', getAnalytics);

module.exports = router;
