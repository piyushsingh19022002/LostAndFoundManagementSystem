const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    // Dynamic reference allowing bookmarks to resolve to either Item (Lost) or FoundItem (Found) collections
    item: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'itemModel',
    },
    itemModel: {
      type: String,
      required: true,
      enum: ['Item', 'FoundItem'],
    },
  },
  {
    timestamps: true,
  }
);

// Optimize database queries and prevent duplicate bookmarks per user
favoriteSchema.index({ user: 1 });
favoriteSchema.index({ item: 1 });
favoriteSchema.index({ user: 1, item: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);
