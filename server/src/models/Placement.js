const mongoose = require('mongoose');

const placementDriveSchema = new mongoose.Schema({
    company: { type: String, required: true },
    role: String,
    ctc: String,
    cutoffCgpa: Number,
    package: String,
    eligibility: String,
    deadline: Date,
    status: { type: String, enum: ['open', 'closed', 'upcoming', 'ongoing', 'completed'], default: 'open' },
    eligibleBranches: [String],
    description: String,
    logo: String,

    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

const PlacementDrive = mongoose.model('PlacementDrive', placementDriveSchema);

const applicationSchema = new mongoose.Schema({
    driveId: { type: mongoose.Schema.Types.ObjectId, ref: 'PlacementDrive', required: true },
    company: String,
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, default: 'applied' },
    appliedAt: { type: Date, default: Date.now },
}, { timestamps: true });

const PlacementApplication = mongoose.model('PlacementApplication', applicationSchema);

module.exports = { PlacementDrive, PlacementApplication };
