const mongoose = require('mongoose');

const aiAuditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    userRole: {
      type: String,
      enum: ['admin', 'sales'],
      required: true,
    },
    salesMemberId: {
      type: String,
      default: null,
      index: true,
    },
    userName: {
      type: String,
      default: '',
    },
    requestType: {
      type: String,
      required: true,
      index: true,
    },
    relatedCustomerId: {
      type: String,
      default: null,
      index: true,
    },
    relatedLeadId: {
      type: String,
      default: null,
      index: true,
    },
    promptPreview: {
      type: String,
      default: '',
    },
    toolsUsed: {
      type: [String],
      default: [],
    },
    actionProposed: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    isActionConfirmed: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['success', 'failed', 'rejected_unauthorized'],
      default: 'success',
      index: true,
    },
    errorMessage: {
      type: String,
      default: null,
    },
    durationMs: {
      type: Number,
      default: 0,
    },
    model: {
      type: String,
      default: 'gemini-3.6-flash',
    },
  },
  {
    timestamps: true,
  }
);

aiAuditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AIAuditLog', aiAuditLogSchema);
