const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * @desc    Middleware to protect routes and verify JWT
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token, exclude password
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return res.status(401).json({ error: 'Not authorized, user not found' });
      }

      // Check user status
      if (user.status !== 'active') {
        return res.status(403).json({ error: `User account is ${user.status}` });
      }

      // Single active session logic: Check if token version matches
      if (typeof user.tokenVersion !== 'undefined' && decoded.version !== user.tokenVersion) {
        return res.status(401).json({ error: 'Session expired or invalidated, please login again' });
      }

      // Add user to request object
      req.user = user;
      next();
    } catch (error) {
      console.error('Auth Middleware Error:', error.message);

      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired, please login again' });
      }

      res.status(401).json({ error: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ error: 'Not authorized, no token' });
  }
};

const { authorize } = require('./roleMiddleware');

module.exports = { protect, authorize };

