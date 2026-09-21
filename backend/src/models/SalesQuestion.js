const mongoose = require('mongoose');

const salesQuestionSchema = new mongoose.Schema(
  {
    questionId: {
      type: String,
      required: [true, 'Question ID is required'],
      unique: true,
      trim: true,
    },
    subject: {
      type: String,
      trim: true,
      default: '',
    },
    question: {
      type: String,
      required: [true, 'Question content is required'],
      trim: true,
    },
    customerId: {
      type: String,
      trim: true,
      default: null,
    },
    websiteId: {
      type: String,
      trim: true,
      default: null,
    },
    askedBySalesMemberId: {
      type: String,
      required: [true, 'Asking sales member ID is required'],
      trim: true,
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
      default: 'MEDIUM',
      required: true,
    },
    status: {
      type: String,
      enum: ['OPEN', 'IN_PROGRESS', 'ANSWERED', 'CLOSED'],
      default: 'OPEN',
      required: true,
    },
    answer: {
      type: String,
      trim: true,
      default: '',
    },
    answeredBy: {
      type: String,
      trim: true,
      default: '',
    },
    answeredAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
salesQuestionSchema.index({ status: 1 });
salesQuestionSchema.index({ askedBySalesMemberId: 1 });
salesQuestionSchema.index({ customerId: 1 });
salesQuestionSchema.index({ websiteId: 1 });
salesQuestionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('SalesQuestion', salesQuestionSchema);
