const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: {
        type: String, required: true, unique: true,
        trim: true, lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email']
    },
    rollNumber: { type: String, unique: true, sparse: true, trim: true },
    facultyId: { type: String, unique: true, sparse: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ['student', 'faculty', 'admin'], default: 'student' },
    branch: { type: String, trim: true },
    year: { type: Number },
    semester: { type: Number },
    tokenVersion: { type: Number, default: 0 },
    status: {
        type: String,
        enum: ['active', 'inactive', 'suspended', 'pending_approval', 'rejected'],
        default: 'pending_approval'
    },
    rejectionReason: { type: String, default: '' }
}, { timestamps: true });

userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;