const mongoose = require('mongoose');

const domainSchema = new mongoose.Schema(
  {
    domainId: {
      type: String,
      required: [true, 'Domain ID is required'],
      unique: true,
      trim: true,
    },
    domainName: {
      type: String,
      required: [true, 'Domain name is required'],
      trim: true,
      lowercase: true,
    },
    websiteId: {
      type: String,
      required: [true, 'Connected website ID is required'],
      trim: true,
    },
    customerId: {
      type: String,
      trim: true,
      default: null,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date / registered date is required'],
    },
    expiryDate: {
      type: Date,
      required: [true, 'Expiry date is required'],
    },
    registrar: {
      type: String,
      required: [true, 'Domain registrar is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'EXPIRING_SOON', 'EXPIRED'],
      default: 'ACTIVE',
      required: true,
    },
    autoRenew: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    createdBy: {
      type: String,
      trim: true,
      default: 'system',
    },
    updatedBy: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

domainSchema.methods.calculateStatus = function () {
  if (!this.expiryDate) return 'ACTIVE';
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const expiry = new Date(this.expiryDate);
  expiry.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'EXPIRED';
  if (diffDays <= 30) return 'EXPIRING_SOON';
  return 'ACTIVE';
};

domainSchema.methods.getDaysRemaining = function () {
  if (!this.expiryDate) return 0;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const expiry = new Date(this.expiryDate);
  expiry.setHours(0, 0, 0, 0);
  return Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
};

// Indexes
domainSchema.index({ websiteId: 1 });
domainSchema.index({ expiryDate: 1 });
domainSchema.index({ status: 1 });
domainSchema.index({ customerId: 1 });

module.exports = mongoose.model('Domain', domainSchema);
