const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const {
  createDrive,
  getAllDrives,
  getStudentDrives,
  getDriveById,
  updateDrive,
  deleteDrive,
  applyToDrive,
  getApplicants,
  getEligibleStudents,
} = require('../controllers/placementController');

router.get('/drives/student', protect, authorize('student'), getStudentDrives);
router.post('/drives/:id/apply', protect, authorize('student'), applyToDrive);

router.post('/drives', protect, authorize('admin'), createDrive);
router.get('/drives', protect, authorize('admin'), getAllDrives);
router.get('/drives/:id', protect, getDriveById);
router.patch('/drives/:id', protect, authorize('admin'), updateDrive);
router.delete('/drives/:id', protect, authorize('admin'), deleteDrive);
router.get('/drives/:id/applicants', protect, authorize('admin'), getApplicants);
router.get('/drives/:id/eligible-students', protect, authorize('faculty', 'admin'), getEligibleStudents);

module.exports = router;
