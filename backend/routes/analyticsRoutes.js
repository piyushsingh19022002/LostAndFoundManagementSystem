const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');
const {
  getDashboardAnalytics,
  getUserGrowthAnalytics,
  getClaimAnalytics,
  getModerationAnalytics,
} = require('../controllers/analyticsController');

// All routes are private and admin-only
router.use(protect);
router.use(adminOnly);

router.get('/dashboard', getDashboardAnalytics);
router.get('/growth', getUserGrowthAnalytics);
router.get('/claims', getClaimAnalytics);
router.get('/moderation', getModerationAnalytics);

module.exports = router;
