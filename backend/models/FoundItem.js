const mongoose = require('mongoose');

// FoundItem Schema — mirrors LostItem structure but represents a physically found object
// 'category' is kept for UI filtering but always defaults to 'Found'
const foundItemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title for the found item'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
      trim: true,
    },
    category: {
      type: String,
      default: 'Found',
      enum: ['Found'],
    },
    location: {
      type: String,
      required: [true, 'Please add where you found the item'],
      trim: true,
    },
    imageUrl: {
      type: String,
      default: '',
    },
    dateFound: {
      type: Date,
      required: [true, 'Please add the date you found the item'],
    },
    status: {
      type: String,
      enum: ['found', 'claimed', 'returned'],
      default: 'found',
    },
    // Reference to the User who reported the found item
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  {
    // Automatically adds createdAt and updatedAt fields
    timestamps: true,
  }
);

module.exports = mongoose.model('FoundItem', foundItemSchema);
