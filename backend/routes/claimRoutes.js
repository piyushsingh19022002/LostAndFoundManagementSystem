const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createClaim,
  getMyClaims,
  getReceivedClaims,
  updateClaimStatus,
  getClaimById,
} = require('../controllers/claimController');

// All claims routes require authentication
router.post('/', protect, createClaim);
router.get('/my-claims', protect, getMyClaims);
router.get('/received', protect, getReceivedClaims);
router.get('/:id', protect, getClaimById);
router.put('/:id', protect, updateClaimStatus);

module.exports = router;
