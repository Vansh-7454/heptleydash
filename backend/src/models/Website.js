const mongoose = require('mongoose');

const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i;

const websiteSchema = new mongoose.Schema(
  {
    websiteId: {
      type: String,
      required: [true, 'Website ID is required'],
      unique: true,
      trim: true,
    },
    websiteName: {
      type: String,
      required: [true, 'Website name is required'],
      trim: true,
    },
    websiteUrl: {
      type: String,
      required: [true, 'Website URL is required'],
      trim: true,
      validate: {
        validator: function (v) {
          if (!v) return false;
          return urlRegex.test(v) || v.startsWith('http://') || v.startsWith('https://');
        },
        message: 'Please provide a valid website URL',
      },
    },
    projectType: {
      type: String,
      trim: true,
      default: 'Full-Stack Web Application',
    },
    customerId: {
      type: String,
      trim: true,
      default: null,
    },
    status: {
      type: String,
      enum: ['DEVELOPMENT', 'TESTING', 'LIVE', 'MAINTENANCE', 'PAUSED', 'ARCHIVED', 'ACTIVE'],
      default: 'DEVELOPMENT',
      required: true,
    },
    startDate: {
      type: String,
      trim: true,
      default: () => new Date().toISOString().split('T')[0],
    },
    hostingProvider: {
      type: String,
      trim: true,
      default: '',
    },
    hostingNotes: {
      type: String,
      trim: true,
      default: '',
    },
    repositoryUrl: {
      type: String,
      trim: true,
      default: '',
    },
    deploymentUrl: {
      type: String,
      trim: true,
      default: '',
    },
    technologyStack: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    internalNotes: {
      type: String,
      trim: true,
      default: '',
    },
    // Embedded Domain Information
    domainName: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    domainStartDate: {
      type: Date,
      default: null,
    },
    domainExpiryDate: {
      type: Date,
      default: null,
    },
    domainRegistrar: {
      type: String,
      trim: true,
      default: '',
    },
    domainAutoRenew: {
      type: Boolean,
      default: false,
    },
    domainStatus: {
      type: String,
      enum: ['ACTIVE', 'EXPIRING_SOON', 'EXPIRED', 'PENDING'],
      default: 'ACTIVE',
    },
    domainNotes: {
      type: String,
      trim: true,
      default: '',
    },
    // Client & Domain Documentation PDF (stored as Base64 Data URI with small size in KB)
    domainDocumentPdf: {
      type: String,
      default: '',
    },
    domainDocumentName: {
      type: String,
      trim: true,
      default: '',
    },
    domainDocumentSizeKb: {
      type: Number,
      default: 0,
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

websiteSchema.methods.calculateDomainStatus = function () {
  if (!this.domainExpiryDate) return 'ACTIVE';
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const expiry = new Date(this.domainExpiryDate);
  expiry.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'EXPIRED';
  if (diffDays <= 30) return 'EXPIRING_SOON';
  return 'ACTIVE';
};

websiteSchema.methods.getDaysRemaining = function () {
  if (!this.domainExpiryDate) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const expiry = new Date(this.domainExpiryDate);
  expiry.setHours(0, 0, 0, 0);
  return Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
};

websiteSchema.pre('save', function (next) {
  if (this.domainExpiryDate) {
    this.domainStatus = this.calculateDomainStatus();
  }
  next();
});

// Indexes
websiteSchema.index({ status: 1 });
websiteSchema.index({ customerId: 1 });
websiteSchema.index({ domainExpiryDate: 1 });
websiteSchema.index({ domainStatus: 1 });

module.exports = mongoose.model('Website', websiteSchema);

