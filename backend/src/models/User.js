const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    role: {
      type: String,
      enum: ['admin', 'sales'],
      default: 'sales',
      required: true,
    },
    salesMemberId: {
      type: String,
      trim: true,
      default: null,
      sparse: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Validation rule: salesMemberId is required when role === 'sales'
userSchema.pre('validate', function (next) {
  if (this.role === 'sales' && !this.salesMemberId) {
    this.invalidate('salesMemberId', 'Sales members require a valid salesMemberId');
  } else if (this.role === 'admin') {
    this.salesMemberId = null;
  }
  next();
});

// Hash password prior to saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Safe JSON serialization (never leak password hash)
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.__v;
  return user;
};

// Indexes
userSchema.index({ role: 1, status: 1 });

module.exports = mongoose.model('User', userSchema);
