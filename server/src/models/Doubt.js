const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema({
    sender: { type: String, required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

const doubtSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    subject: { type: String, required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
        type: String,
        enum: ['open', 'resolved'],
        default: 'open'
    },
    responses: [responseSchema]
}, { timestamps: true });

const Doubt = mongoose.model('Doubt', doubtSchema);

module.exports = Doubt;
