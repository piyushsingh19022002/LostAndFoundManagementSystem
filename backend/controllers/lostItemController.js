const Item = require('../models/Item');

// @desc    Create a new item
// @route   POST /api/items
// @access  Private (Requires token)
const createItem = async (req, res) => {
  try {
    const { title, description, category, location, date, imageUrl } = req.body;

    // 1. Validate required fields
    if (!title || !description || !category || !location || !date) {
      return res.status(400).json({ message: 'Please add all required fields' });
    }

    // 2. Create the item in database and associate with req.user.id
    const item = await Item.create({
      title,
      description,
      category,
      location,
      date,
      imageUrl,
      user: req.user.id, // Comes from authMiddleware
    });

    // 3. Return the created item
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all items
// @route   GET /api/items
// @access  Public
const getItems = async (req, res) => {
  try {
    // 1. Fetch all items and populate the 'user' field with 'name' and 'email'
    const items = await Item.find().populate('user', 'name email').sort({ createdAt: -1 });

    // 2. Return the array of items
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createItem,
  getItems,
};
