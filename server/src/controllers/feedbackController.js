const { Feedback } = require('../models');

function getSentimentByRating(rating) {
  if (rating >= 4) return 'positive';
  if (rating === 3) return 'neutral';
  return 'negative';
}

async function submitFeedback(req, res) {
  try {
    const { category, rating, comment, tags = [], branch, semester } = req.body;
    if (!category || !rating) {
      return error(res, 'category and rating are required', 400);
    }

    const ratingNumber = Number(rating);
    const sentiment = getSentimentByRating(ratingNumber);

    await Feedback.create({
      category,
      rating: ratingNumber,
      comment: comment || '',
      tags,
      sentiment,
      branch: branch || req.user?.branch,
      semester: semester || req.user?.semester,
      submittedAt: new Date(),
    });

    return res.status(201).json({ message: 'Thank you for your feedback!' });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to submit feedback', details: e.message });
  }
}

async function getAnalytics(req, res) {
  try {
    const [overallAgg] = await Feedback.aggregate([
      {
        $group: {
          _id: null,
          totalCount: { $sum: 1 },
          averageRating: { $avg: '$rating' },
          positiveCount: { $sum: { $cond: [{ $eq: ['$sentiment', 'positive'] }, 1, 0] } },
          neutralCount: { $sum: { $cond: [{ $eq: ['$sentiment', 'neutral'] }, 1, 0] } },
          negativeCount: { $sum: { $cond: [{ $eq: ['$sentiment', 'negative'] }, 1, 0] } },
        },
      },
    ]);

    const byCategoryRaw = await Feedback.aggregate([
      {
        $group: {
          _id: '$category',
          avgRating: { $avg: '$rating' },
          count: { $sum: 1 },
          positive: { $sum: { $cond: [{ $eq: ['$sentiment', 'positive'] }, 1, 0] } },
          neutral: { $sum: { $cond: [{ $eq: ['$sentiment', 'neutral'] }, 1, 0] } },
          negative: { $sum: { $cond: [{ $eq: ['$sentiment', 'negative'] }, 1, 0] } },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const recentFlagged = await Feedback.find({ rating: { $lte: 2 } })
      .sort({ submittedAt: -1 })
      .limit(10)
      .select('category rating comment submittedAt')
      .lean();

    const totalCount = overallAgg?.totalCount || 0;
    const positiveCount = overallAgg?.positiveCount || 0;
    const neutralCount = overallAgg?.neutralCount || 0;
    const negativeCount = overallAgg?.negativeCount || 0;

    const overall = {
      totalCount,
      averageRating: Number((overallAgg?.averageRating || 0).toFixed(2)),
      positiveCount,
      neutralCount,
      negativeCount,
      positivePercent: totalCount ? Number(((positiveCount / totalCount) * 100).toFixed(1)) : 0,
      neutralPercent: totalCount ? Number(((neutralCount / totalCount) * 100).toFixed(1)) : 0,
      negativePercent: totalCount ? Number(((negativeCount / totalCount) * 100).toFixed(1)) : 0,
    };

    const byCategory = byCategoryRaw.map((c) => ({
      category: c._id,
      avgRating: Number((c.avgRating || 0).toFixed(2)),
      count: c.count,
      positive: c.positive,
      neutral: c.neutral,
      negative: c.negative,
    }));

    return res.json({
      overall,
      byCategory,
      recentFlagged,
    });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to fetch analytics', details: e.message });
  }
}

async function getCategoryBreakdown(req, res) {
  try {
    const { category } = req.query;
    if (!category) return error(res, 'category is required', 400);

    const records = await Feedback.find({ category }).sort({ submittedAt: -1 }).lean();

    const totalCount = records.length;
    const avgRating = totalCount
      ? Number((records.reduce((sum, r) => sum + Number(r.rating || 0), 0) / totalCount).toFixed(2))
      : 0;

    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    records.forEach((r) => {
      const key = Number(r.rating || 0);
      if (ratingDistribution[key] !== undefined) ratingDistribution[key] += 1;
    });

    const recentComments = records
      .filter((r) => r.comment)
      .slice(0, 10)
      .map((r) => ({
        rating: r.rating,
        comment: r.comment,
        submittedAt: r.submittedAt,
      }));

    return success(res, {
      avgRating,
      totalCount,
      ratingDistribution,
      recentComments,
    });
  } catch (e) {
    return error(res, 'Failed to fetch category breakdown', 500, e.message);
  }
}

async function getRatingTrend(req, res) {
  try {
    const period = req.query.period || '30days';
    const dayMap = { '7days': 7, '30days': 30, '90days': 90 };
    const days = dayMap[period] || 30;

    const from = new Date();
    from.setDate(from.getDate() - days);

    const trend = await Feedback.aggregate([
      { $match: { submittedAt: { $gte: from } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$submittedAt' },
          },
          avgRating: { $avg: '$rating' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          date: '$_id',
          avgRating: { $round: ['$avgRating', 2] },
          count: 1,
        },
      },
    ]);

    return success(res, trend);
  } catch (e) {
    return error(res, 'Failed to fetch rating trend', 500, e.message);
  }
}

async function getFlaggedFeedback(req, res) {
  try {
    const flagged = await Feedback.find({ rating: { $lte: 2 } })
      .sort({ submittedAt: -1 })
      .select('category rating comment tags sentiment submittedAt')
      .lean();

    return success(res, flagged);
  } catch (e) {
    return error(res, 'Failed to fetch flagged feedback', 500, e.message);
  }
}

module.exports = {
  submitFeedback,
  getAnalytics,
  getCategoryBreakdown,
  getRatingTrend,
  getFlaggedFeedback,
};
