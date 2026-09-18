const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
  {
    customerId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
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
    alternatePhone: {
      type: String,
      trim: true,
      default: '',
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
    website: {
      type: String,
      trim: true,
      default: '',
    },
    // Service
    service: {
      type: String,
      required: [true, 'Service domain is required'],
      trim: true,
    },
    package: {
      type: String,
      trim: true,
      default: 'Custom Engagement',
    },
    startDate: {
      type: String,
      default: () => new Date().toISOString().split('T')[0],
    },
    endDate: {
      type: String,
      default: '',
    },
    projectStatus: {
      type: String,
      enum: ['Onboarding', 'In Progress', 'Completed', 'Delivered', 'On Hold', 'Cancelled', 'Planning', 'Review'],
      default: 'Onboarding',
    },
    customerStatus: {
      type: String,
      enum: ['Active', 'Onboarding', 'Completed', 'On Hold', 'Cancelled', 'Inactive', 'Lead'],
      default: 'Active',
    },
    status: {
      type: String,
      default: 'Active',
    },
    // Sales Allocation
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
    leadSource: {
      type: String,
      trim: true,
      default: 'Direct Inbound',
    },
    dealValue: {
      type: Number,
      min: 0,
      default: 0,
    },
    discount: {
      type: Number,
      min: 0,
      default: 0,
    },
    finalAmount: {
      type: Number,
      min: 0,
      default: 0,
    },
    // Payment Metrics
    totalAmount: {
      type: Number,
      min: 0,
      default: 0,
    },
    amountPaid: {
      type: Number,
      min: 0,
      default: 0,
    },
    remainingAmount: {
      type: Number,
      min: 0,
      default: 0,
    },
    paymentStatus: {
      type: String,
      enum: ['Paid', 'Partial', 'Pending', 'Overdue'],
      default: 'Pending',
    },
    paymentMethod: {
      type: String,
      trim: true,
      default: 'Bank Wire',
    },
    lastPaymentDate: {
      type: String,
      default: '',
    },
    // Notes
    notes: {
      type: String,
      default: '',
    },
    internalRemarks: {
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

// Automatic financial calculations before saving
customerSchema.pre('save', function (next) {
  const dealValue = Math.max(0, Number(this.dealValue) || 0);
  const discount = Math.max(0, Number(this.discount) || 0);
  this.dealValue = dealValue;
  this.discount = discount;
  this.finalAmount = Math.max(0, dealValue - discount);
  this.totalAmount = this.finalAmount;

  let paid = Math.max(0, Number(this.amountPaid) || 0);
  if (this.finalAmount > 0 && paid > this.finalAmount) {
    paid = this.finalAmount; // Prevent amountPaid exceeding final total
  }
  this.amountPaid = paid;
  this.remainingAmount = Math.max(0, this.finalAmount - paid);

  if (this.finalAmount > 0 && paid >= this.finalAmount) {
    this.paymentStatus = 'Paid';
  } else if (paid > 0) {
    this.paymentStatus = 'Partial';
  } else if (this.paymentStatus !== 'Overdue') {
    this.paymentStatus = 'Pending';
  }

  next();
});

// Indexes for fast lookup & role filtering
customerSchema.index({ salesMemberId: 1 });
customerSchema.index({ email: 1 });
customerSchema.index({ customerStatus: 1 });
customerSchema.index({ createdAt: -1 });
customerSchema.index({ salesMemberId: 1, createdAt: -1 });
customerSchema.index({ salesMemberId: 1, customerStatus: 1 });
customerSchema.index({ salesMemberId: 1, paymentStatus: 1 });

module.exports = mongoose.model('Customer', customerSchema);
