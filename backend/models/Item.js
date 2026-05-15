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

module.exports = mongoose.model('Item', itemSchema);
