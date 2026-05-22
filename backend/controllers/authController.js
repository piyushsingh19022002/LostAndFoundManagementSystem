const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Helper function to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // 1. Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please add all required fields' });
    }

    // 2. Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 3. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'user'
    });

    // 5. Send response with token
    if (user) {
      // Send welcome onboarding email asynchronously
      const { sendWelcomeEmail } = require('../services/emailService');
      sendWelcomeEmail(user).catch(err => console.error('Failed to send welcome email:', err));

      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate inputs
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // 2. Check for user email
    const user = await User.findOne({ email });

    // 3. Compare password
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get dashboard statistics for the logged-in user
// @route   GET /api/auth/dashboard-stats
// @access  Private (Requires token)
const getDashboardStats = async (req, res) => {
  try {
    const Item = require('../models/Item');
    const FoundItem = require('../models/FoundItem');

    // Count user's specific reports
    const totalLostItems = await Item.countDocuments({ user: req.user.id });
    const totalFoundItems = await FoundItem.countDocuments({ user: req.user.id });

    // Retrieve recent reports (limit to 5)
    const recentLostItems = await Item.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(5);
      
    const recentFoundItems = await FoundItem.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      totalLostItems,
      totalFoundItems,
      recentLostItems,
      recentFoundItems,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Please add an email address' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Return 200 to prevent user enumeration security issues
      return res.status(200).json({ message: 'If an account exists with that email, a password reset link has been sent.' });
    }

    // Generate secure random token
    const rawToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    // Expiration: 10 minutes from now
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    await user.save();

    // Reset URL
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password/${rawToken}`;

    // Send email
    const { sendPasswordResetEmail } = require('../services/emailService');
    await sendPasswordResetEmail(user, resetUrl);

    res.status(200).json({ message: 'Password reset link sent to your email.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error processing forgot password request' });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: 'Please provide a new password' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Hash token received in URL parameters
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with matching token and valid expiration
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired password reset token' });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update password and clear reset fields
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({ message: 'Password updated successfully. You can now login.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error resetting password' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getDashboardStats,
  forgotPassword,
  resetPassword,
};
