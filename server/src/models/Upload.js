const mongoose = require('mongoose');

const uploadSchema = new mongoose.Schema({
    fileName: String,
    fileUrl: String,
    fileType: String,
    fileSize: Number,
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    publicId: String,
}, { timestamps: true });

const Upload = mongoose.model('Upload', uploadSchema);
module.exports = Upload;
