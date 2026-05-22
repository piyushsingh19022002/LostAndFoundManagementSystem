const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getDashboardStats,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/dashboard-stats', protect, getDashboardStats);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

module.exports = router;
