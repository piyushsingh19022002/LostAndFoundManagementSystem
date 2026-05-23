const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  addFavorite,
  removeFavorite,
  getFavorites,
} = require('../controllers/favoriteController');

// Secure all endpoints below with the token authentication middleware
router.use(protect);

router.route('/')
  .get(getFavorites);

router.route('/:itemId')
  .post(addFavorite)
  .delete(removeFavorite);

module.exports = router;
