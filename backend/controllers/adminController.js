const User = require('../models/User');
const Item = require('../models/Item');
const FoundItem = require('../models/FoundItem');
const ClaimRequest = require('../models/ClaimRequest');
const Message = require('../models/Message');
const Notification = require('../models/Notification');

// @desc    Get all users (paginated)
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    let page = parseInt(req.query.page, 10);
    let limit = parseInt(req.query.limit, 10);

    if (isNaN(page) || page <= 0) page = 1;
    if (isNaN(limit) || limit <= 0) limit = 10;
    if (limit > 100) limit = 100;

    const skip = (page - 1) * limit;

    const totalUsers = await User.countDocuments();
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      users,
      page,
      totalPages: Math.ceil(totalUsers / limit),
      totalUsers,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all items (unified lost + found, sorted by newest)
// @route   GET /api/admin/items
// @access  Private/Admin
const getAllItems = async (req, res) => {
  try {
    const lostItems = await Item.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    const foundItems = await FoundItem.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    // Combine and sort by createdAt descending
    const combined = [...lostItems, ...foundItems].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    res.json(combined);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete any item (lost or found)
// @route   DELETE /api/admin/item/:id
// @access  Private/Admin
const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;

    // Search and delete in Lost Items (Item model) first
    let item = await Item.findById(id);
    if (item) {
      await Item.findByIdAndDelete(id);
      // Clean up claim requests for this item
      await ClaimRequest.deleteMany({ item: id });
      return res.json({ message: 'Lost item deleted successfully by admin' });
    }

    // Search and delete in Found Items
    item = await FoundItem.findById(id);
    if (item) {
      await FoundItem.findByIdAndDelete(id);
      // Clean up claim requests for this item
      await ClaimRequest.deleteMany({ item: id });
      return res.json({ message: 'Found item deleted successfully by admin' });
    }

    res.status(404).json({ message: 'Item not found in database' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a user and all their associated data
// @route   DELETE /api/admin/user/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Admins cannot delete themselves through this route
    if (req.user.id === id) {
      return res.status(400).json({ message: 'You cannot delete your own administrator account' });
    }

    // 1. Delete user items and found items
    await Item.deleteMany({ user: id });
    await FoundItem.deleteMany({ user: id });

    // 2. Delete user claim requests (either as owner or claimer)
    await ClaimRequest.deleteMany({ $or: [{ claimer: id }, { owner: id }] });

    // 3. Delete messages involving user
    await Message.deleteMany({ $or: [{ sender: id }, { receiver: id }] });

    // 4. Delete notifications for user
    await Notification.deleteMany({ user: id });

    // 5. Finally delete the user account
    await User.findByIdAndDelete(id);

    res.json({ message: 'User and all associated data deleted successfully by admin' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get dashboard analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
const getAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalLostItems = await Item.countDocuments({ category: 'Lost' });
    const totalFoundItems = await FoundItem.countDocuments();
    const totalClaims = await ClaimRequest.countDocuments();

    res.json({
      totalUsers,
      totalLostItems,
      totalFoundItems,
      totalClaims,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllUsers,
  getAllItems,
  deleteItem,
  deleteUser,
  getAnalytics,
};
