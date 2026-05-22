const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title'],
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    category: {
      type: String,
      required: [true, 'Please specify if it is Lost or Found'],
      enum: ['Lost', 'Found'],
    },
    location: {
      type: String,
      required: [true, 'Please add a location'],
    },
    date: {
      type: Date,
      required: [true, 'Please add a date'],
    },
    imageUrl: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['lost', 'found', 'claimed'],
      default: 'lost',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for query performance optimization
itemSchema.index({ title: 1 });
itemSchema.index({ category: 1 });
itemSchema.index({ location: 1 });
itemSchema.index({ createdAt: -1 });
itemSchema.index({ user: 1 });

module.exports = mongoose.model('Item', itemSchema);
