const mongoose = require('mongoose');

const financeRecordSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: { type: String, enum: ['fee', 'scholarship', 'salary', 'fine'], required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['paid', 'pending', 'overdue'], default: 'pending' },
    dueDate: Date,
    paidDate: Date,
    description: String,
    transactionId: String,
}, { timestamps: true });

const FinanceRecord = mongoose.model('FinanceRecord', financeRecordSchema);
module.exports = FinanceRecord;
