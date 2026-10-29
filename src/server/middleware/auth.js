const jwt = require('jsonwebtoken');
const User = require('../models/User');

const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No token provided.',
      });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'heptley_crm_secure_jwt_secret_key_2026';

    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (jwtErr) {
      if (jwtErr.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Authentication token has expired. Please log in again.',
        });
      }
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token.',
      });
    }

    let user = await User.findById(decoded.id);
    if (!user && decoded.salesMemberId) {
      user = await User.findOne({ salesMemberId: decoded.salesMemberId });
    }
    if (!user && decoded.developerId) {
      user = await User.findOne({ developerId: decoded.developerId });
    }
    if (!user && decoded.role === 'admin') {
      user = await User.findOne({ role: 'admin' });
    }
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User account not found.',
      });
    }

    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact an administrator.',
      });
    }

    // Attach authenticated identity to request
    req.user = {
      id: user._id.toString(),
      userId: user._id.toString(),
      role: user.role,
      salesMemberId: user.salesMemberId,
      developerId: user.developerId,
      email: user.email,
      name: user.name,
    };

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { requireAuth };
