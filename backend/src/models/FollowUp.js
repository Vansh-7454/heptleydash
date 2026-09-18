const mongoose = require('mongoose');

const followUpSchema = new mongoose.Schema(
  {
    followUpId: {
      type: String,
      unique: true,
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
    entityType: {
      type: String,
      enum: ['Customer', 'Lead'],
      default: 'Customer',
    },
    entityName: {
      type: String,
      required: [true, 'Contact or entity name is required'],
      trim: true,
    },
    company: {
      type: String,
      trim: true,
      default: '',
    },
    salesMemberId: {
      type: String,
      required: [true, 'Sales Member ID is required'],
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'Follow-up title or topic is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['Call', 'Email', 'Meeting', 'WhatsApp', 'Other'],
      default: 'Call',
    },
    priority: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium',
    },
    date: {
      type: String,
      required: [true, 'Scheduled date is required'],
    },
    time: {
      type: String,
      default: '11:00 AM',
    },
    scheduledAt: {
      type: Date,
      default: Date.now,
    },
    note: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Pending', 'Completed', 'Cancelled', 'Overdue', 'Rescheduled', 'pending', 'completed', 'cancelled', 'overdue', 'rescheduled'],
      default: 'Pending',
    },
    completedAt: {
      type: Date,
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

// Pre-validate normalization to prevent casing and enum mismatch errors
followUpSchema.pre('validate', function (next) {
  if (this.status) {
    const s = this.status.trim().toLowerCase();
    const map = {
      pending: 'Pending',
      completed: 'Completed',
      cancelled: 'Cancelled',
      overdue: 'Overdue',
      rescheduled: 'Rescheduled',
    };
    this.status = map[s] || this.status;
  }
  if (this.entityType) {
    const e = this.entityType.trim().toLowerCase();
    this.entityType = e === 'lead' ? 'Lead' : 'Customer';
  }
  if (this.type) {
    const t = this.type.trim().toLowerCase();
    const typeMap = {
      call: 'Call',
      email: 'Email',
      meeting: 'Meeting',
      whatsapp: 'WhatsApp',
      other: 'Other',
    };
    this.type = typeMap[t] || this.type;
  }
  next();
});

followUpSchema.index({ salesMemberId: 1 });
followUpSchema.index({ status: 1 });
followUpSchema.index({ date: 1, time: 1 });
followUpSchema.index({ salesMemberId: 1, date: 1, status: 1 });
followUpSchema.index({ customerId: 1, date: 1 });
followUpSchema.index({ leadId: 1, date: 1 });

module.exports = mongoose.model('FollowUp', followUpSchema);
