const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    type: {
        type: String,
        required: true,
        enum: ['hackathon', 'seminar', 'workshop', 'cultural'],
        lowercase: true
    },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    venue: { type: String, required: true },
    organizer: { type: String, required: true },
    registrationDeadline: { type: Date, required: true },
    maxParticipants: { type: Number, required: true },
    registeredStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    image: { type: String },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
