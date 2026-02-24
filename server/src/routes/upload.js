const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { Upload } = require('../models');
const { upload, uploadToCloudinary } = require('../utils/cloudinary');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

// POST /api/upload
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const folder = req.body.folder || 'smart_campus/general';
    const result = await uploadToCloudinary(req.file.path, folder);

    const record = await Upload.create({
      id: uuidv4(),
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      url: result.url,
      publicId: result.publicId,
      provider: result.provider,
      uploadedBy: req.user.id,
      folder,
    });

    res.json(record);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/upload/multiple
router.post('/multiple', upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files provided' });
    }

    const folder = req.body.folder || 'smart_campus/general';
    const results = [];

    for (const file of req.files) {
      const result = await uploadToCloudinary(file.path, folder);
      const record = await Upload.create({
        id: uuidv4(),
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        url: result.url,
        publicId: result.publicId,
        provider: result.provider,
        uploadedBy: req.user.id,
        folder,
      });
      results.push(record);
    }

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/upload
router.get('/', async (req, res) => {
  try {
    const { userId, folder } = req.query;
    const filter = {};
    if (userId) filter.uploadedBy = userId;
    if (folder) filter.folder = folder;

    const data = await Upload.find(filter).sort({ createdAt: -1 }).lean();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch uploads' });
  }
});

module.exports = router;
