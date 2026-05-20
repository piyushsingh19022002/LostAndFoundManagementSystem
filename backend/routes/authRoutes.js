const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getDashboardStats } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/dashboard-stats', protect, getDashboardStats);

module.exports = router;
