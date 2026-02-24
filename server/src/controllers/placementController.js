const { v4: uuidv4 } = require('uuid');
const { PlacementDrive, User, Notification } = require('../models');
const { emitToBranch } = require('../services/notificationService');
const { getIO } = require('../config/socket');

async function createDrive(req, res) {
  try {
    const drive = await PlacementDrive.create({
      ...req.body,
      postedBy: req.user?.userId,
    });

    const eligibleStudents = await User.find({
      role: 'student',
      cgpa: { $gte: Number(drive.cgpaCutoff) },
      branch: { $in: drive.eligibleBranches || [] },
    }).lean();

    if (eligibleStudents.length > 0) {
      await Notification.insertMany(
        eligibleStudents.map((student) => ({
          id: uuidv4(),
          userId: student.id || student.studentId || String(student._id),
          message: `🎯 New placement drive: ${drive.company} — ${drive.role}. Apply before ${new Date(drive.lastDateToApply).toLocaleDateString()}.`,
          title: 'New Placement Drive',
          type: 'placement',
          read: false,
          createdAt: new Date().toISOString(),
        })),
      );
    }

    (drive.eligibleBranches || []).forEach((branch) => {
      emitToBranch(branch, 'placement:new', {
        company: drive.company,
        role: drive.role,
        driveId: drive._id,
      });
    });

    return res.status(201).json({ success: true, drive, notifiedCount: eligibleStudents.length });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to create placement drive', details: e.message });
  }
}

async function getAllDrives(req, res) {
  try {
    const drives = await PlacementDrive.find().sort({ createdAt: -1 }).lean();
    return res.json(drives);
  } catch (e) {
    return res.status(500).json({ error: 'Failed to fetch drives', details: e.message });
  }
}

async function getDriveById(req, res) {
  try {
    const drive = await PlacementDrive.findById(req.params.id).lean();
    if (!drive) return error(res, 'Drive not found', 404);
    return success(res, drive);
  } catch (e) {
    return error(res, 'Failed to fetch drive', 500, e.message);
  }
}

async function updateDrive(req, res) {
  try {
    const drive = await PlacementDrive.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    if (!drive) return error(res, 'Drive not found', 404);
    return success(res, drive, 'Drive updated');
  } catch (e) {
    return error(res, 'Failed to update drive', 500, e.message);
  }
}

async function deleteDrive(req, res) {
  try {
    const deleted = await PlacementDrive.findByIdAndDelete(req.params.id);
    if (!deleted) return error(res, 'Drive not found', 404);
    await PlacementApplication.deleteMany({ driveId: req.params.id });
    return success(res, null, 'Drive deleted');
  } catch (e) {
    return error(res, 'Failed to delete drive', 500, e.message);
  }
}

async function getStudentDrives(req, res) {
  try {
    const student = await User.findById(req.user?.userId).lean();
    if (!student || student.role !== 'student') return error(res, 'Student not found', 404);

    const today = new Date();
    const drives = await PlacementDrive.find({
      cgpaCutoff: { $lte: Number(student.cgpa || 0) },
      eligibleBranches: student.branch,
      status: { $ne: 'closed' },
      lastDateToApply: { $gte: today },
    }).sort({ createdAt: -1 }).lean();

    const driveIds = drives.map((d) => d._id);
    const appliedSet = new Set(
      (await PlacementApplication.find({ driveId: { $in: driveIds }, studentId: student._id }).select('driveId').lean())
        .map((a) => String(a.driveId)),
    );

    const result = drives.map((d) => ({
      ...d,
      hasApplied: appliedSet.has(String(d._id)),
    }));

    return success(res, result);
  } catch (e) {
    return error(res, 'Failed to fetch student drives', 500, e.message);
  }
}

async function applyToDrive(req, res) {
  try {
    const student = await User.findById(req.user?.userId);
    if (!student || student.role !== 'student') return error(res, 'Student not found', 404);

    const drive = await PlacementDrive.findById(req.params.id);
    if (!drive) return error(res, 'Drive not found', 404);

    if (Number(student.cgpa || 0) < Number(drive.cgpaCutoff || 0)) {
      return error(res, 'You are not eligible for this drive', 400);
    }

    if (!(drive.eligibleBranches || []).includes(student.branch)) {
      return error(res, 'Your branch is not eligible for this drive', 400);
    }

    const alreadyApplied = await PlacementApplication.findOne({ driveId: drive._id, studentId: student._id });
    if (alreadyApplied) return error(res, 'Already applied to this drive', 400);

    await PlacementDrive.findByIdAndUpdate(drive._id, { $addToSet: { applicants: student._id } });
    await PlacementApplication.create({ driveId: drive._id, studentId: student._id, appliedAt: new Date(), status: 'applied' });

    const updatedDrive = await PlacementDrive.findById(drive._id).lean();
    const count = (updatedDrive?.applicants || []).length;

    const io = getIO();
    if (io) {
      io.to(`drive:${String(drive._id)}`).emit('placement:applied', { driveId: String(drive._id), count });
    }

    return success(res, {
      receiptId: uuidv4(),
      company: drive.company,
      role: drive.role,
      appliedAt: new Date().toISOString(),
    }, 'Application submitted');
  } catch (e) {
    return error(res, 'Failed to apply', 500, e.message);
  }
}

async function getApplicants(req, res) {
  try {
    const drive = await PlacementDrive.findById(req.params.id)
      .populate('applicants', 'name branch cgpa email resumeUrl skills')
      .lean();

    if (!drive) return error(res, 'Drive not found', 404);

    return success(res, {
      total: (drive.applicants || []).length,
      applicants: drive.applicants || [],
    });
  } catch (e) {
    return error(res, 'Failed to fetch applicants', 500, e.message);
  }
}

async function getEligibleStudents(req, res) {
  try {
    const drive = await PlacementDrive.findById(req.params.id).lean();
    if (!drive) return error(res, 'Drive not found', 404);

    const students = await User.find({
      role: 'student',
      cgpa: { $gte: Number(drive.cgpaCutoff) },
      branch: { $in: drive.eligibleBranches || [] },
    }).select('name branch cgpa studentId email').lean();

    return success(res, students);
  } catch (e) {
    return error(res, 'Failed to fetch eligible students', 500, e.message);
  }
}

module.exports = {
  createDrive,
  getAllDrives,
  getStudentDrives,
  getDriveById,
  updateDrive,
  deleteDrive,
  applyToDrive,
  getApplicants,
  getEligibleStudents,
};
