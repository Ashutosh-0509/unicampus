const mongoose = require('mongoose');

const maintenanceTicketSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    roomNumber: String,
    category: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ['pending', 'in-progress', 'resolved'], default: 'pending' },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    assignedTo: String,
    resolvedAt: Date,
}, { timestamps: true });

const MaintenanceTicket = mongoose.model('MaintenanceTicket', maintenanceTicketSchema);
module.exports = MaintenanceTicket;
