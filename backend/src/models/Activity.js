const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    activityId: {
      type: String,
      trim: true,
    },
    customerId: {
      type: String,
      default: null,
    },
    leadId: {
      type: String,
      default: null,
    },
    salesMemberId: {
      type: String,
      required: [true, 'Sales Member ID is required'],
      trim: true,
    },
    salesMemberName: {
      type: String,
      trim: true,
      default: '',
    },
    entityName: {
      type: String,
      trim: true,
      default: '',
    },
    title: {
      type: String,
      required: [true, 'Activity title is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['Call', 'Email', 'Meeting', 'Note', 'Follow-up', 'Payment', 'Status-change', 'Status Change', 'call', 'email', 'meeting', 'note', 'follow-up', 'payment', 'status-change', 'status change'],
      default: 'Note',
    },
    description: {
      type: String,
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

activitySchema.index({ salesMemberId: 1 });
activitySchema.index({ customerId: 1 });
activitySchema.index({ createdAt: -1 });
activitySchema.index({ customerId: 1, createdAt: -1 });
activitySchema.index({ leadId: 1, createdAt: -1 });
activitySchema.index({ salesMemberId: 1, createdAt: -1 });

module.exports = mongoose.model('Activity', activitySchema);
