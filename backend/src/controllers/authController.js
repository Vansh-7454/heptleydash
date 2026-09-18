const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (user) => {
  const secret = process.env.JWT_SECRET || 'heptley_crm_secure_jwt_secret_key_2026';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign(
    {
      id: user._id.toString(),
      role: user.role,
      salesMemberId: user.salesMemberId,
    },
    secret,
    { expiresIn }
  );
};

const authController = {
  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Please provide both email and password.',
        });
      }

      const cleanEmail = email.trim().toLowerCase();
      const user = await User.findOne({ email: cleanEmail });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.',
        });
      }

      if (user.status !== 'active') {
        return res.status(403).json({
          success: false,
          message: 'Your account is deactivated. Please contact an administrator.',
        });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.',
        });
      }

      const token = signToken(user);

      res.status(200).json({
        success: true,
        token,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          salesMemberId: user.salesMemberId,
          phone: user.phone,
          status: user.status,
          createdAt: user.createdAt,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  getMe: async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User profile not found.',
        });
      }

      res.status(200).json({
        success: true,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          salesMemberId: user.salesMemberId,
          phone: user.phone,
          status: user.status,
          createdAt: user.createdAt,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  logout: async (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Logged out successfully.',
    });
  },
};

module.exports = authController;
