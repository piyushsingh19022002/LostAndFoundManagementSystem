const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Please add a message'],
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['claim_created', 'claim_approved', 'claim_rejected', 'system'],
    },
    isRead: {
      type: Boolean,
      required: true,
      default: false,
    },
    relatedClaim: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ClaimRequest',
    },
    relatedItem: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'itemModel',
    },
    itemModel: {
      type: String,
      enum: ['Item', 'FoundItem'],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Notification', notificationSchema);
