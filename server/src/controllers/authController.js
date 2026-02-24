const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { success, error } = require('../utils/apiResponse');

const generateToken = (id, version = 0) => {
    return jwt.sign({ id, version }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// Helper to handle Mongoose errors cleanly
const handleDbError = (err, res) => {
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(e => e.message).join(', ');
        return error(res, messages, 400);
    }
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue || {})[0] || 'field';
        return error(res, `${field} already in use. Please use a different value.`, 400);
    }
    return error(res, err.message, 500);
};

const registerUser = async (req, res) => {
    try {
        const { name, email, password, role, rollNumber, facultyId, branch, year, semester } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return error(res, 'An account with this email already exists', 400);
        }

        const user = await User.create({
            name,
            email,
            password,
            role: role || 'student',
            rollNumber,
            facultyId,
            branch,
            year,
            semester,
            status: (role === 'student' || !role) ? 'pending_approval' : 'active'
        });

        if (user) {
            return success(res, {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                rollNumber: user.rollNumber,
                branch: user.branch,
                year: user.year,
                semester: user.semester,
            }, 'User registered successfully', 201);
        } else {
            return error(res, 'Invalid user data', 400);
        }
    } catch (err) {
        return handleDbError(err, res);
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, identifier, password } = req.body;
        const loginId = email || identifier;

        if (!loginId) {
            return res.status(400).json({ message: 'Please provide an email or identifier', code: 'MISSING_IDENTIFIER' });
        }

        const user = await User.findOne({
            $or: [
                { email: loginId.toLowerCase() },
                { rollNumber: loginId }
            ]
        }).select('+password');

        if (!user) {
            return res.status(404).json({ message: 'User not found', code: 'USER_NOT_FOUND' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid identifier or password', code: 'INVALID_PASSWORD' });
        }

        // Check status AFTER password is verified
        if (user.status === 'pending_approval') {
            return res.status(403).json({ message: 'Account pending approval', code: 'ACCOUNT_PENDING_APPROVAL' });
        }

        if (user.status === 'rejected') {
            return res.status(403).json({
                message: 'Account rejected',
                code: 'ACCOUNT_REJECTED',
                rejectionReason: user.rejectionReason || 'No reason provided'
            });
        }

        if (user.status !== 'active') {
            return res.status(403).json({ message: `Account is ${user.status}`, code: 'ACCOUNT_INACTIVE' });
        }

        return success(res, {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
            rollNumber: user.rollNumber,
            branch: user.branch,
            year: user.year,
            semester: user.semester,
            token: generateToken(user._id, user.tokenVersion),
        }, 'Login successful');

    } catch (err) {
        return handleDbError(err, res);
    }
};

const logoutUser = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            user.tokenVersion = (user.tokenVersion || 0) + 1;
            await user.save();
            return success(res, null, 'Logged out successfully');
        }
        return error(res, 'User not found', 404);
    } catch (err) {
        return handleDbError(err, res);
    }
};

const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            return success(res, user);
        }
        return error(res, 'User not found', 404);
    } catch (err) {
        return handleDbError(err, res);
    }
};

const studentSignup = async (req, res) => {
    req.body.role = 'student';
    return registerUser(req, res);
};

const getPendingSignups = async (req, res) => {
    try {
        const pending = await User.find({ role: 'student', status: 'pending_approval' });
        return success(res, pending);
    } catch (err) {
        return handleDbError(err, res);
    }
};

const approveSignup = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return error(res, 'User not found', 404);

        user.status = 'active';
        await user.save();
        return success(res, user, 'Student approved successfully');
    } catch (err) {
        return handleDbError(err, res);
    }
};

const rejectSignup = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return error(res, 'User not found', 404);

        user.status = 'rejected';
        user.rejectionReason = req.body.reason || 'Application not accepted';
        await user.save();

        return success(res, null, 'Student signup rejected');
    } catch (err) {
        return handleDbError(err, res);
    }
};

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    getMe,
    studentSignup,
    getPendingSignups,
    approveSignup,
    rejectSignup
};