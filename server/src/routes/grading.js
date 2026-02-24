const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { saveGrades, exportGradesCSV } = require('../controllers/gradingController');

router.use(protect, authorize('faculty'));

router.post('/save', saveGrades);
router.get('/export-csv', exportGradesCSV);

module.exports = router;
