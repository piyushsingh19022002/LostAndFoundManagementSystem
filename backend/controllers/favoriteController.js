const Favorite = require('../models/Favorite');
const Item = require('../models/Item');
const FoundItem = require('../models/FoundItem');

// @desc    Add a listing to user favorites
// @route   POST /api/favorites/:itemId
// @access  Private
const addFavorite = async (req, res) => {
  try {
    const { itemId } = req.params;
    let { itemModel } = req.body;

    // Auto-detect item model type if not explicitly supplied by caller
    if (!itemModel) {
      const isLost = await Item.exists({ _id: itemId });
      if (isLost) {
        itemModel = 'Item';
      } else {
        const isFound = await FoundItem.exists({ _id: itemId });
        if (isFound) {
          itemModel = 'FoundItem';
        } else {
          return res.status(404).json({ message: 'Target item listing not found' });
        }
      }
    } else {
      // Validate provided itemModel format
      if (!['Item', 'FoundItem'].includes(itemModel)) {
        return res.status(400).json({ message: 'Invalid item model type' });
      }

      // Check if listing exists under the specified model
      const model = itemModel === 'Item' ? Item : FoundItem;
      const exists = await model.exists({ _id: itemId });
      if (!exists) {
        return res.status(404).json({ message: 'Target item listing not found' });
      }
    }

    // Check for existing duplicates to maintain database uniqueness constraints
    const alreadyFavorited = await Favorite.findOne({ user: req.user.id, item: itemId });
    if (alreadyFavorited) {
      return res.status(400).json({ message: 'Listing is already favorited' });
    }

    // Persist new favorite relationship
    const favorite = await Favorite.create({
      user: req.user.id,
      item: itemId,
      itemModel,
    });

    res.status(201).json({
      message: 'Listing successfully bookmarked',
      favorite,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove a listing from user favorites
// @route   DELETE /api/favorites/:itemId
// @access  Private
const removeFavorite = async (req, res) => {
  try {
    const { itemId } = req.params;

    const favorite = await Favorite.findOneAndDelete({
      user: req.user.id,
      item: itemId,
    });

    if (!favorite) {
      return res.status(404).json({ message: 'Bookmark record not found' });
    }

    res.json({ message: 'Bookmark successfully removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all bookmarked listings for authenticated user
// @route   GET /api/favorites
// @access  Private
const getFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({ user: req.user.id })
      .populate({
        path: 'item',
        populate: {
          path: 'user',
          select: 'name email',
        },
      })
      .sort({ createdAt: -1 });

    // Filter out and sanitize any bookmarks whose target listing has been deleted
    const validFavorites = favorites.filter((fav) => fav.item !== null);

    res.json(validFavorites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addFavorite,
  removeFavorite,
  getFavorites,
};
