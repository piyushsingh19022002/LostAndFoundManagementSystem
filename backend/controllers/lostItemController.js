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

const getLostItems = async (req, res) => {
  try {
    // 1. Extract and sanitize query parameters for pagination
    let page = parseInt(req.query.page, 10);
    let limit = parseInt(req.query.limit, 10);

    if (isNaN(page) || page <= 0) page = 1;
    if (isNaN(limit) || limit <= 0) limit = 10;
    if (limit > 100) limit = 100; // API protection boundary to prevent oversized payloads

    const skip = (page - 1) * limit;

    // 2. Extract optional search/filter query parameters
    const { search, category, location } = req.query;

    // 3. Build a dynamic filter object
    const filter = {};

    // Text search: case-insensitive partial match on title or description
    if (search && search.trim()) {
      filter.$or = [
        { title:       { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    // Exact match on category
    if (category && category.trim() && category !== 'All') {
      filter.category = category.trim();
    }

    // Partial case-insensitive match on location
    if (location && location.trim()) {
      filter.location = { $regex: location.trim(), $options: 'i' };
    }

    // 4. Get total count of matching items concurrently with paginated find
    const totalItems = await Item.countDocuments(filter);

    // 5. Query MongoDB with projection, skip, and limit
    const items = await Item.find(filter)
      .select('title description category location date imageUrl status user createdAt')
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(totalItems / limit);

    // 6. Return metadata-driven JSON response
    res.status(200).json({
      items,
      page,
      totalPages,
      totalItems,
    });
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
    if (item.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Unauthorized' });
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
    if (item.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Unauthorized' });
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
