const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const Doubt = require('../models/Doubt');
const User = require('../models/User');

const seedDoubts = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/unicampus';
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB for seeding doubts...');

        const student = await User.findOne({ role: 'student' });
        const faculty = await User.findOne({ role: 'faculty' });

        if (!student) {
            console.log('No student found for seeding.');
            process.exit(1);
        }

        const sampleDoubts = [
            {
                title: 'How to implement Dijkstra Algorithm in Java?',
                description: 'I am struggling with the priority queue implementation for Dijkstra. Can someone provide a clean snippet?',
                subject: 'Computer Science',
                studentId: student._id,
                status: 'open',
                responses: [
                    {
                        sender: faculty ? faculty.name : 'Prof. Sharma',
                        senderId: faculty ? faculty._id : null,
                        message: 'You should use the PriorityQueue class with a custom Comparator. Here is a hint: pq.add(new Node(node, distance)).'
                    }
                ]
            },
            {
                title: 'Confusion in Maxwells Equations',
                description: 'Can someone explain the physical significance of the displacement current term in Ampere-Maxwell law?',
                subject: 'Physics',
                studentId: student._id,
                status: 'open',
                responses: []
            },
            {
                title: 'Integration by Parts help',
                description: 'I keep getting stuck on integrating x^2 * ln(x). Which part should be u and which should be dv?',
                subject: 'Mathematics',
                studentId: student._id,
                status: 'resolved',
                responses: [
                    {
                        sender: 'AI Buddy',
                        message: 'Using the LIATE rule, Logarithmic functions come before Algebraic. So, set u = ln(x) and dv = x^2 dx!'
                    }
                ]
            }
        ];

        await Doubt.deleteMany({});
        await Doubt.insertMany(sampleDoubts);

        console.log('Successfully seeded 3 sample doubts!');
        process.exit();
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

seedDoubts();
