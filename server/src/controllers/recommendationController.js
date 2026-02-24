const RecommendationLetter = require('../models/RecommendationLetter');
const mongoose = require('mongoose');
const { User, PlacementDrive, Notification } = require('../models');
const { v4: uuidv4 } = require('uuid');
const { success, error } = require('../utils/apiResponse');

async function resolveUserObjectId(identifier, role) {
  const query = [{ id: identifier }, { studentId: identifier }, { facultyId: identifier }];
  if (mongoose.Types.ObjectId.isValid(String(identifier))) {
    query.push({ _id: identifier });
  }
  const user = await User.findOne({
    role,
    $or: query,
  });
  return user || null;
}

async function resolveDriveObjectId(driveId) {
  const query = [{ id: driveId }];
  if (mongoose.Types.ObjectId.isValid(String(driveId))) {
    query.push({ _id: driveId });
  }
  const drive = await PlacementDrive.findOne({
    $or: query,
  });
  return drive || null;
}

async function saveLetter(req, res) {
  try {
    const { studentId, driveId, letterContent, facultyId } = req.body;

    if (!studentId || !driveId || !letterContent) {
      return error(res, 'studentId, driveId and letterContent are required', 400);
    }

    const student = await resolveUserObjectId(studentId, 'student');
    if (!student) return error(res, 'Student not found', 404);

    const drive = await resolveDriveObjectId(driveId);
    if (!drive) return error(res, 'Placement drive not found', 404);

    const faculty = await resolveUserObjectId(req.user?.userId || facultyId || req.user?.id, 'faculty');
    if (!faculty) return error(res, 'Faculty not found', 404);

    const letter = await RecommendationLetter.findOneAndUpdate(
      {
        facultyId: faculty._id,
        studentId: student._id,
        driveId: drive._id,
      },
      {
        $set: {
          letterContent,
          status: 'draft',
        },
      },
      { new: true, upsert: true },
    ).populate('studentId', 'name branch cgpa studentId');

    return success(res, letter, 'Draft saved');
  } catch (e) {
    return error(res, 'Failed to save recommendation draft', 500, e.message);
  }
}

async function submitLetter(req, res) {
  try {
    const letter = await RecommendationLetter.findById(req.params.id)
      .populate('studentId', 'id studentId name')
      .populate('facultyId', 'name');

    if (!letter) return error(res, 'Letter not found', 404);

    const requesterFacultyId = req.user?.userId;
    if (!requesterFacultyId || String(letter.facultyId?._id) !== String(requesterFacultyId)) {
      return error(res, 'Forbidden: this letter does not belong to you', 403);
    }

    letter.status = 'submitted';
    letter.submittedAt = new Date();
    await letter.save();

    await Notification.create({
      id: uuidv4(),
      userId: letter.studentId?.id || letter.studentId?.studentId || String(letter.studentId?._id),
      type: 'recommendation',
      title: 'Recommendation Submitted',
      message: `A recommendation letter has been submitted for you by ${letter.facultyId?.name || 'faculty'}.`,
      read: false,
      createdAt: new Date().toISOString(),
    });

    return success(res, letter, 'Recommendation submitted');
  } catch (e) {
    return error(res, 'Failed to submit recommendation', 500, e.message);
  }
}

async function getMyLetters(req, res) {
  try {
    const query = { facultyId: req.user?.userId };

    if (req.query.driveId) {
      const drive = await resolveDriveObjectId(req.query.driveId);
      if (drive) query.driveId = drive._id;
    }

    const letters = await RecommendationLetter.find(query)
      .populate('studentId', 'name branch cgpa studentId')
      .sort({ createdAt: -1 })
      .lean();

    return success(res, letters);
  } catch (e) {
    return error(res, 'Failed to fetch letters', 500, e.message);
  }
}

async function getStudentLetters(req, res) {
  try {
    const student = await resolveUserObjectId(req.params.studentId, 'student');
    if (!student) return error(res, 'Student not found', 404);

    const letters = await RecommendationLetter.find({ studentId: student._id })
      .populate('facultyId', 'name')
      .sort({ createdAt: -1 })
      .lean();

    return success(res, letters);
  } catch (e) {
    return error(res, 'Failed to fetch student letters', 500, e.message);
  }
}

module.exports = {
  saveLetter,
  submitLetter,
  getMyLetters,
  getStudentLetters,
};
