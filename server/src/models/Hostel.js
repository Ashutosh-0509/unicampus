const mongoose = require('mongoose');

const hostelSchema = new mongoose.Schema({
    roomNumber: { type: String, required: true, unique: true },
    block: String,
    capacity: Number,
    occupants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    status: { type: String, enum: ['available', 'full', 'maintenance'], default: 'available' },
}, { timestamps: true });

const Hostel = mongoose.model('Hostel', hostelSchema);
module.exports = Hostel;
