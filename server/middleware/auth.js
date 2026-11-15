const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - require valid JWT
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route. Please log in.'
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'bitm_secure_jwt_secret_token_ballari_2024_key_99'
    );

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.'
      });
    }

    if (user.status === 'deactivated') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact college administration.'
      });
    }

    if (user.status === 'pending') {
      return res.status(403).json({
        success: false,
        message: 'Your account registration is pending admin approval.'
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token. Please log in again.'
    });
  }
};

// Role-based authorization
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role (${req.user ? req.user.role : 'unauthenticated'}) is not authorized to access this resource`
      });
    }
    next();
  };
};

// Optional auth (for public pages that show extra if logged in)
exports.optionalAuth = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'bitm_secure_jwt_secret_token_ballari_2024_key_99'
      );
      req.user = await User.findById(decoded.id);
    } catch (err) {
      req.user = null;
    }
  }
  next();
};
