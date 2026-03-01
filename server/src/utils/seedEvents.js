const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const Event = require('../models/Event');
const User = require('../models/User');

const seedEvents = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/unicampus';

        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB for seeding...');

        // Find an admin or faculty to be the creator
        let creator = await User.findOne({ role: { $in: ['admin', 'faculty'] } });

        if (!creator) {
            console.log('No admin/faculty found. Seeding a temporary admin...');
            creator = new User({
                name: 'System Admin',
                email: 'admin@nit.edu',
                password: 'password123',
                role: 'admin',
                status: 'active'
            });
            await creator.save();
        }

        const sampleEvents = [
            {
                title: 'Cloud Tech Seminar',
                description: 'Join us for an insightful session on Cloud Computing and AWS services.',
                type: 'seminar',
                date: new Date('2026-03-05'),
                time: '10:00 AM - 12:30 PM',
                venue: 'Main Auditorium',
                organizer: 'Department of Computer Science',
                registrationDeadline: new Date('2026-03-04'),
                maxParticipants: 100,
                createdBy: creator._id
            },
            {
                title: 'AI/ML Hackathon',
                description: '24-hour hackathon to solve real-world problems using Artificial Intelligence.',
                type: 'hackathon',
                date: new Date('2026-03-10'),
                time: '9:00 AM (March 10) - 9:00 AM (March 11)',
                venue: 'IT Block - Labs 1-4',
                organizer: 'AI Club',
                registrationDeadline: new Date('2026-03-08'),
                maxParticipants: 50,
                createdBy: creator._id
            },
            {
                title: 'Campus Cultural Fest',
                description: 'Annual cultural celebration featuring music, dance, and art.',
                type: 'cultural',
                date: new Date('2026-03-15'),
                time: '4:00 PM - 10:00 PM',
                venue: 'Campus Grounds',
                organizer: 'Student Council',
                registrationDeadline: new Date('2026-03-14'),
                maxParticipants: 500,
                createdBy: creator._id
            },
            {
                title: 'Web Dev Workshop',
                description: 'Hands-on workshop on modern web technologies like React and Next.js.',
                type: 'workshop',
                date: new Date('2026-03-20'),
                time: '11:00 AM - 4:00 PM',
                venue: 'Seminar Hall 2',
                organizer: 'Tech Innovators Club',
                registrationDeadline: new Date('2026-03-18'),
                maxParticipants: 40,
                createdBy: creator._id
            },
            {
                title: 'Placement Preparation Seminar',
                description: 'Expert advice on cracking top companies and building a strong resume.',
                type: 'seminar',
                date: new Date('2026-03-25'),
                time: '2:00 PM - 5:00 PM',
                venue: 'Placement Cell Hall',
                organizer: 'Placement Committee',
                registrationDeadline: new Date('2026-03-24'),
                maxParticipants: 150,
                createdBy: creator._id
            }
        ];

        await Event.deleteMany({}); // Optional: Clear existing events
        await Event.insertMany(sampleEvents);

        console.log('Successfully seeded 5 sample events!');
        process.exit();
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

seedEvents();
