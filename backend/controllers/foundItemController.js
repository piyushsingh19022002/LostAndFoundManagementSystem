const FoundItem = require('../models/FoundItem');

// @desc    Create a new found item report
// @route   POST /api/found-items
// @access  Private (Requires JWT token)
const createFoundItem = async (req, res) => {
  try {
    const { title, description, location, imageUrl, dateFound } = req.body;

    // 1. Validate required fields
    if (!title || !description || !location || !dateFound) {
      return res.status(400).json({ message: 'Please add all required fields: title, description, location, dateFound' });
    }

    // 2. Create the found item document and associate with the authenticated user
    const item = await FoundItem.create({
      title,
      description,
      category: 'Found',   // Always "Found" for this collection
      location,
      imageUrl,
      dateFound,
      user: req.user.id,   // Injected by the protect middleware
    });

    // 3. Respond with 201 Created and the created document
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all found items (public feed)
// @route   GET /api/found-items
// @access  Public
const getFoundItems = async (req, res) => {
  try {
    // 1. Fetch all found items, populating reporter name/email, sorted newest first
    const items = await FoundItem.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    // 2. Return the array
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single found item by ID
// @route   GET /api/found-items/:id
// @access  Public
const getFoundItemById = async (req, res) => {
  try {
    // 1. Query by ID and populate user reference
    const item = await FoundItem.findById(req.params.id).populate('user', 'name email');

    // 2. Handle 404
    if (!item) {
      return res.status(404).json({ message: 'Found item not found' });
    }

    // 3. Return the document
    res.status(200).json(item);
  } catch (error) {
    // Handle malformed ObjectId strings
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid item ID format' });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get the logged-in user's found item reports
// @route   GET /api/found-items/my-items
// @access  Private (Requires JWT token)
const getMyFoundItems = async (req, res) => {
  try {
    // 1. Filter items to only those belonging to the caller
    const items = await FoundItem.find({ user: req.user.id }).sort({ createdAt: -1 });

    // 2. Return the user's items
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a found item report
// @route   PUT /api/found-items/:id
// @access  Private (Requires JWT token + ownership)
const updateFoundItem = async (req, res) => {
  try {
    const item = await FoundItem.findById(req.params.id);

    // 1. Handle 404
    if (!item) {
      return res.status(404).json({ message: 'Found item not found' });
    }

    // 2. Verify ownership — compare ObjectId (toString) against req.user.id
    if (item.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this item' });
    }

    // 3. Partial update — fallback to existing values if a field is not provided
    item.title       = req.body.title       || item.title;
    item.description = req.body.description || item.description;
    item.location    = req.body.location    || item.location;
    item.dateFound   = req.body.dateFound   || item.dateFound;
    item.status      = req.body.status      || item.status;
    item.imageUrl    = req.body.imageUrl !== undefined ? req.body.imageUrl : item.imageUrl;

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

// @desc    Delete a found item report
// @route   DELETE /api/found-items/:id
// @access  Private (Requires JWT token + ownership)
const deleteFoundItem = async (req, res) => {
  try {
    const item = await FoundItem.findById(req.params.id);

    // 1. Handle 404
    if (!item) {
      return res.status(404).json({ message: 'Found item not found' });
    }

    // 2. Verify ownership
    if (item.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this item' });
    }

    // 3. Delete the document
    await item.deleteOne();

    // 4. Return success
    res.status(200).json({ message: 'Found item deleted successfully' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid item ID format' });
    }
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createFoundItem,
  getFoundItems,
  getFoundItemById,
  getMyFoundItems,
  updateFoundItem,
  deleteFoundItem,
};
