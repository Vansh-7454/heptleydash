const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    paymentId: {
      type: String,
      unique: true,
      trim: true,
    },
    customerId: {
      type: String,
      required: [true, 'Customer ID is required'],
      trim: true,
    },
    customerName: {
      type: String,
      trim: true,
      default: '',
    },
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [0.01, 'Payment amount must be greater than zero'],
    },
    paymentMethod: {
      type: String,
      trim: true,
      default: 'Bank Wire',
    },
    paymentDate: {
      type: String,
      default: () => new Date().toISOString().split('T')[0],
    },
    reference: {
      type: String,
      trim: true,
      default: '',
    },
    salesMemberId: {
      type: String,
      trim: true,
      default: '',
    },
    notes: {
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

paymentSchema.index({ customerId: 1 });
paymentSchema.index({ salesMemberId: 1 });
paymentSchema.index({ createdAt: -1 });
paymentSchema.index({ customerId: 1, paymentDate: -1 });
paymentSchema.index({ salesMemberId: 1, createdAt: -1 });

module.exports = mongoose.model('Payment', paymentSchema);
