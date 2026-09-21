const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipientRole: {
      type: String,
      enum: ['admin', 'sales', 'developer', 'all'],
      default: 'all',
    },
    recipientSalesMemberId: {
      type: String,
      trim: true,
      default: null,
    },
    recipientDeveloperId: {
      type: String,
      trim: true,
      default: null,
    },
    recipientUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    type: {
      type: String,
      required: [true, 'Notification type is required'],
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    targetTab: {
      type: String,
      trim: true,
      default: '',
    },
    targetId: {
      type: String,
      trim: true,
      default: '',
    },
    domainName: {
      type: String,
      trim: true,
      default: '',
    },
    domainExpiryDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ recipientRole: 1, recipientSalesMemberId: 1, read: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ type: 1, targetId: 1, recipientRole: 1, domainExpiryDate: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
