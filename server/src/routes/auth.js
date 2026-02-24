const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getMe,
  logoutUser,
  studentSignup,
  getPendingSignups,
  approveSignup,
  rejectSignup,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Standard auth routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', protect, logoutUser);
router.get('/me', protect, getMe);

// Student signup routes
router.post('/student-signup', studentSignup);
router.get('/pending-signups', protect, getPendingSignups);
router.post('/approve-signup/:id', protect, approveSignup);
router.post('/reject-signup/:id', protect, rejectSignup);

module.exports = router;










