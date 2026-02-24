const { v4: uuidv4 } = require('uuid');
const { HostelRoom, HostelComplaint } = require('../models');

// @desc    Get all hostel rooms
// @route   GET /api/hostel
// @access  Private
const getRooms = async (req, res) => {
    try {
        const { block, status } = req.query;
        const filter = {};
        if (block) filter.block = block;
        if (status) filter.status = status;

        const rooms = await HostelRoom.find(filter).lean();
        res.json(rooms);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch rooms' });
    }
};

// @desc    Add a new hostel room
// @route   POST /api/hostel
// @access  Private (Admin)
const addRoom = async (req, res) => {
    try {
        const room = await HostelRoom.create({
            id: uuidv4(),
            ...req.body,
            occupants: [],
            status: 'available',
        });
        res.status(201).json(room);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add room' });
    }
};

// @desc    Update a hostel room
// @route   PUT /api/hostel/:id
// @access  Private (Admin)
const updateRoom = async (req, res) => {
    try {
        const room = await HostelRoom.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
        if (!room) return res.status(404).json({ error: 'Room not found' });
        res.json(room);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update room' });
    }
};

// @desc    Submit a hostel complaint
// @route   POST /api/hostel/complaints
// @access  Private
const submitComplaint = async (req, res) => {
    try {
        const complaint = await HostelComplaint.create({
            id: uuidv4(),
            ...req.body,
            status: 'open',
        });
        res.status(201).json(complaint);
    } catch (error) {
        res.status(500).json({ error: 'Failed to submit complaint' });
    }
};

// @desc    Get all hostel complaints
// @route   GET /api/hostel/complaints
// @access  Private
const getComplaints = async (req, res) => {
    try {
        const complaints = await HostelComplaint.find().sort({ createdAt: -1 }).lean();
        res.json(complaints);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch complaints' });
    }
};

module.exports = {
    getRooms,
    addRoom,
    updateRoom,
    submitComplaint,
    getComplaints,
};
