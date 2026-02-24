const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const Resource = require('../models/Resource');
const { User, Notification } = require('../models');
const { emitToBranch } = require('../services/notificationService');
const { success, error } = require('../utils/apiResponse');

async function postResource(req, res) {
  try {
    const {
      title,
      type,
      url,
      description,
      subjectCode,
      branch,
      semester,
      isPinned,
      postedBy,
    } = req.body;

    if (!title || !type || !subjectCode || !branch || !semester) {
      return error(res, 'title, type, subjectCode, branch and semester are required', 400);
    }

    const resourceData = {
      id: uuidv4(),
      title,
      type: String(type).toLowerCase(),
      url: url || '',
      description: description || '',
      subjectCode,
      branch,
      semester: Number(semester),
      postedBy: req.user?.userId || postedBy,
      isPinned: String(isPinned) === 'true' || isPinned === true,
      createdAt: new Date().toISOString(),
    };

    if (resourceData.type === 'pdf' && req.file) {
      resourceData.fileUrl = `/uploads/resources/${req.file.filename}`;
    }

    const resource = await Resource.create(resourceData);

    emitToBranch(branch, 'resource:new', {
      title: resource.title,
      subjectCode: resource.subjectCode,
      postedBy: resource.postedBy,
    });

    const students = await User.find({ role: 'student', branch, semester: Number(semester) }).lean();
    if (students.length > 0) {
      await Notification.insertMany(students.map((s) => ({
        id: uuidv4(),
        userId: s.id || s.studentId || String(s._id),
        type: 'resource',
        title: 'New Resource Posted',
        message: `New resource posted for ${subjectCode}: ${title}`,
        read: false,
        createdAt: new Date().toISOString(),
      })));
    }

    return success(res, resource, 'Resource posted successfully', 201);
  } catch (e) {
    return error(res, 'Failed to post resource', 500, e.message);
  }
}

async function getResources(req, res) {
  try {
    const { subjectCode, branch, semester } = req.query;
    const filter = {};
    if (subjectCode) filter.subjectCode = subjectCode;
    if (branch) filter.branch = branch;
    if (semester) filter.semester = Number(semester);

    const resources = await Resource.find(filter)
      .sort({ isPinned: -1, createdAt: -1 })
      .populate('postedBy', 'name')
      .lean();

    return success(res, resources);
  } catch (e) {
    return error(res, 'Failed to fetch resources', 500, e.message);
  }
}

async function pinResource(req, res) {
  try {
    const existing = await Resource.findById(req.params.id);
    if (!existing) return error(res, 'Resource not found', 404);

    existing.isPinned = !existing.isPinned;
    await existing.save();

    return success(res, existing, 'Resource pin status updated');
  } catch (e) {
    return error(res, 'Failed to update pin status', 500, e.message);
  }
}

async function deleteResource(req, res) {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return error(res, 'Resource not found', 404);

    if (resource.fileUrl) {
      const relPath = resource.fileUrl.replace('/uploads/', '');
      const absPath = path.join(__dirname, '..', '..', 'uploads', relPath);
      if (fs.existsSync(absPath)) {
        fs.unlinkSync(absPath);
      }
    }

    await Resource.findByIdAndDelete(req.params.id);
    return success(res, null, 'Resource deleted');
  } catch (e) {
    return error(res, 'Failed to delete resource', 500, e.message);
  }
}

module.exports = {
  postResource,
  getResources,
  pinResource,
  deleteResource,
};
