const mongoose = require('mongoose');

const claimRequestSchema = new mongoose.Schema(
  {
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
    claimer: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    message: {
      type: String,
      required: [true, 'Please add a message or proof of ownership'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ClaimRequest', claimRequestSchema);
