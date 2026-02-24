const express = require('express');
const router = express.Router();
const {
  getRooms,
  addRoom,
  updateRoom,
  submitComplaint,
  getComplaints,
} = require('../controllers/hostelController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getRooms);
router.post('/', addRoom);
router.put('/:id', updateRoom);
router.get('/complaints', getComplaints);
router.post('/complaints', submitComplaint);

module.exports = router;
