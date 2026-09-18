const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema(
  {
    leadId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Lead contact name is required'],
      trim: true,
    },
    company: {
      type: String,
      required: [true, 'Prospect company name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    interestedService: {
      type: String,
      trim: true,
      default: 'Web Development & Design',
    },
    source: {
      type: String,
      trim: true,
      default: 'Website Inbound',
    },
    status: {
      type: String,
      enum: ['New', 'Contacted', 'Qualified', 'Proposal', 'Won', 'Lost', 'Negotiation', 'Closed', 'new', 'contacted', 'qualified', 'proposal', 'won', 'lost'],
      default: 'New',
    },
    requirements: {
      type: String,
      default: '',
    },
    budget: {
      type: Number,
      min: 0,
      default: 0,
    },
    dealEstimate: {
      type: Number,
      min: 0,
      default: 0,
    },
    salesMemberId: {
      type: String,
      required: [true, 'Assigned Sales Member ID is required'],
      trim: true,
    },
    salesMemberName: {
      type: String,
      trim: true,
      default: '',
    },
    lastContactAt: {
      type: String,
      default: '',
    },
    nextFollowUpAt: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
    isConverted: {
      type: Boolean,
      default: false,
    },
    convertedCustomerId: {
      type: String,
      trim: true,
      default: null,
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

leadSchema.index({ salesMemberId: 1 });
leadSchema.index({ status: 1 });
leadSchema.index({ createdAt: -1 });
leadSchema.index({ salesMemberId: 1, status: 1 });
leadSchema.index({ salesMemberId: 1, createdAt: -1 });
leadSchema.index({ isConverted: 1 });

module.exports = mongoose.model('Lead', leadSchema);
