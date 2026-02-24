const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const {
  submitFeedback,
  getAnalytics,
  getCategoryBreakdown,
  getRatingTrend,
  getFlaggedFeedback,
} = require('../controllers/feedbackController');

router.post('/', submitFeedback);

router.get('/analytics', protect, authorize('admin'), getAnalytics);
router.get('/analytics/category', protect, authorize('admin'), getCategoryBreakdown);
router.get('/analytics/trend', protect, authorize('admin'), getRatingTrend);
router.get('/flagged', protect, authorize('admin'), getFlaggedFeedback);

module.exports = router;
