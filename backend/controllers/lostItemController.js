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

// @desc    Get all lost items
// @route   GET /api/lost-items
// @access  Public
const getLostItems = async (req, res) => {
  try {
    // 1. Fetch all items and populate the 'user' field with 'name' and 'email'
    const items = await Item.find().populate('user', 'name email').sort({ createdAt: -1 });

    // 2. Return the array of items
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single lost item by ID
// @route   GET /api/lost-items/:id
// @access  Public
const getLostItemById = async (req, res) => {
  try {
    // 1. Fetch the item by ID and populate the 'user' field with 'name' and 'email'
    const item = await Item.findById(req.params.id).populate('user', 'name email');

    // 2. Handle non-existent resource
    if (!item) {
      return res.status(404).json({ message: 'Lost item not found' });
    }

    // 3. Return the item document
    res.status(200).json(item);
  } catch (error) {
    // Handle invalid ObjectId cast error (e.g. malformed ID strings)
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid item ID format' });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged-in user's lost items
// @route   GET /api/lost-items/my-items
// @access  Private (Requires token)
const getMyLostItems = async (req, res) => {
  try {
    // 1. Fetch only items where the user matches req.user.id
    // req.user is set by the authMiddleware (protect)
    const items = await Item.find({ user: req.user.id }).sort({ createdAt: -1 });

    // 2. Return the user's items
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a lost item
// @route   PUT /api/lost-items/:id
// @access  Private (Requires token)
const updateLostItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    // 1. Check if item exists
    if (!item) {
      return res.status(404).json({ message: 'Lost item not found' });
    }

    // 2. Verify ownership (compare item.user ObjectId to req.user.id)
    if (item.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this item' });
    }

    // 3. Perform partial update (fallback to existing properties if not provided)
    item.title = req.body.title || item.title;
    item.description = req.body.description || item.description;
    item.category = req.body.category || item.category;
    item.location = req.body.location || item.location;
    item.date = req.body.date || item.date;
    item.imageUrl = req.body.imageUrl !== undefined ? req.body.imageUrl : item.imageUrl;

    // 4. Save and return updated document
    const updatedItem = await item.save();
    res.status(200).json(updatedItem);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid item ID format' });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a lost item
// @route   DELETE /api/lost-items/:id
// @access  Private (Requires token)
const deleteLostItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    // 1. Check if item exists
    if (!item) {
      return res.status(404).json({ message: 'Lost item not found' });
    }

    // 2. Verify ownership (compare item.user ObjectId to req.user.id)
    if (item.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this item' });
    }

    // 3. Delete document
    await item.deleteOne();

    // 4. Return success response
    res.status(200).json({ message: 'Lost item deleted successfully' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid item ID format' });
    }
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createItem,
  getLostItems,
  getLostItemById,
  getMyLostItems,
  updateLostItem,
  deleteLostItem,
};
