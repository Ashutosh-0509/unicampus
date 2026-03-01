const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const {
    Event,
    Assignment,
    Book,
    PlacementDrive,
    Notification,
    User
} = require('../models');

const seedAll = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/unicampus';
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB for unified seeding...');

        const student = await User.findOne({ role: 'student' });
        const faculty = await User.findOne({ role: 'faculty' });

        if (!student || !faculty) {
            console.log('ERROR: Need at least one student and one faculty user. Create users via /api/auth/register first.');
            process.exit(1);
        }

        console.log(`Using student: ${student.name} | faculty: ${faculty.name}`);

        // Drop collections to clear stale indexes + data
        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        const colNames = collections.map(c => c.name);

        for (const col of ['events', 'assignments', 'books', 'placementdrives', 'notifications']) {
            if (colNames.includes(col)) {
                await db.collection(col).drop();
                console.log(`Dropped collection: ${col}`);
            }
        }

        // 1. Events
        await Event.insertMany([
            {
                title: 'AI/ML Hackathon 2026',
                description: 'Build cutting-edge AI projects and compete for exciting prizes!',
                type: 'hackathon',
                date: new Date('2026-03-10'),
                time: '10:00 AM',
                venue: 'Computer Lab 3',
                organizer: 'CS Department',
                registrationDeadline: new Date('2026-03-08'),
                maxParticipants: 50,
                registeredStudents: [],
                isActive: true,
                createdBy: faculty._id
            },
            {
                title: 'Cloud Computing Seminar',
                description: 'Deep dive into AWS, Azure, and the future of cloud infrastructure.',
                type: 'seminar',
                date: new Date('2026-03-15'),
                time: '02:00 PM',
                venue: 'Auditorium A',
                organizer: 'IT Club',
                registrationDeadline: new Date('2026-03-13'),
                maxParticipants: 200,
                registeredStudents: [],
                isActive: true,
                createdBy: faculty._id
            },
            {
                title: 'Full-Stack Web Dev Workshop',
                description: 'Hands-on experience with React, Node.js, and MongoDB.',
                type: 'workshop',
                date: new Date('2026-03-20'),
                time: '11:00 AM',
                venue: 'Innovation Lab',
                organizer: 'WebDev Club',
                registrationDeadline: new Date('2026-03-18'),
                maxParticipants: 30,
                registeredStudents: [],
                isActive: true,
                createdBy: faculty._id
            },
            {
                title: 'Annual Cultural Fest',
                description: 'Celebrate creativity with music, dance, and art performances.',
                type: 'cultural',
                date: new Date('2026-04-05'),
                time: '05:00 PM',
                venue: 'Main Ground',
                organizer: 'Cultural Committee',
                registrationDeadline: new Date('2026-04-01'),
                maxParticipants: 500,
                registeredStudents: [],
                isActive: true,
                createdBy: faculty._id
            }
        ]);
        console.log('Events seeded.');

        // 2. Assignments
        await Assignment.insertMany([
            {
                title: 'Database Normalization Exercise',
                subject: 'DBMS',
                description: 'Normalize the provided schema to 3NF and BCNF. Submit ER diagrams.',
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                branch: student.branch || 'Computer Science',
                semester: student.semester || 5,
                assignedBy: faculty._id,
                totalMarks: 20,
                submissions: []
            },
            {
                title: 'React Hooks Deep Dive',
                subject: 'Web Technologies',
                description: 'Implement a fully custom useWindowSize hook and demonstrate it in a mini app.',
                dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
                branch: student.branch || 'Computer Science',
                semester: student.semester || 5,
                assignedBy: faculty._id,
                totalMarks: 15,
                submissions: []
            },
            {
                title: 'Algorithm Analysis Report',
                subject: 'Data Structures',
                description: 'Analyze and compare sorting algorithms with Big-O proof and benchmarks.',
                dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
                branch: student.branch || 'Computer Science',
                semester: student.semester || 5,
                assignedBy: faculty._id,
                totalMarks: 25,
                submissions: []
            }
        ]);
        console.log('Assignments seeded.');

        // 3. Books
        await Book.insertMany([
            {
                isbn: '978-0132350884',
                title: 'Clean Code',
                author: 'Robert C. Martin',
                category: 'Software Engineering',
                totalCopies: 5,
                availableCopies: 5
            },
            {
                isbn: '978-0201633610',
                title: 'Design Patterns',
                author: 'Gang of Four',
                category: 'Architecture',
                totalCopies: 3,
                availableCopies: 3
            },
            {
                isbn: '978-0134190440',
                title: 'The Pragmatic Programmer',
                author: 'Andrew Hunt & David Thomas',
                category: 'Development',
                totalCopies: 10,
                availableCopies: 10
            },
            {
                isbn: '978-0596517748',
                title: 'JavaScript: The Good Parts',
                author: 'Douglas Crockford',
                category: 'Web Development',
                totalCopies: 7,
                availableCopies: 7
            },
            {
                isbn: '978-1491950357',
                title: 'Learning React',
                author: 'Alex Banks & Eve Porcello',
                category: 'Web Development',
                totalCopies: 4,
                availableCopies: 4
            }
        ]);
        console.log('Books seeded.');

        // 4. Placement Drives
        await PlacementDrive.insertMany([
            {
                company: 'Google',
                role: 'Software Engineer II',
                package: '45 LPA',
                eligibility: 'CGPA > 8.5, No active backlogs',
                deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
                description: 'Work on large-scale distributed systems and cloud infrastructure.',
                status: 'open',
                eligibleBranches: ['Computer Science', 'Information Technology'],
                applicants: []
            },
            {
                company: 'Microsoft',
                role: 'Program Manager',
                package: '38 LPA',
                eligibility: 'CGPA > 8.0',
                deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                description: 'Lead product lifecycle for high-impact Azure features.',
                status: 'open',
                eligibleBranches: ['Computer Science', 'Electronics'],
                applicants: []
            },
            {
                company: 'Amazon',
                role: 'SDE-1',
                package: '32 LPA',
                eligibility: 'CGPA > 7.5',
                deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                description: 'Build customer-facing e-commerce solutions at massive scale.',
                status: 'open',
                eligibleBranches: ['Computer Science', 'Information Technology', 'Electronics'],
                applicants: []
            }
        ]);
        console.log('Placement drives seeded.');

        // 5. Notifications
        await Notification.insertMany([
            {
                userId: student._id,
                type: 'assignment',
                title: 'New Assignment Posted',
                message: 'A new DBMS assignment has been posted. Due in 7 days.',
                icon: 'FileText',
                read: false
            },
            {
                userId: student._id,
                type: 'event',
                title: 'Hackathon Registration Open!',
                message: 'Register now for AI/ML Hackathon 2026. Only 50 seats available.',
                icon: 'Sparkles',
                read: false
            },
            {
                userId: student._id,
                type: 'placement',
                title: 'Google Drive is Open',
                message: 'Google SWE drive is now accepting applications. Deadline: 10 days.',
                icon: 'Award',
                read: false
            }
        ]);
        console.log('Notifications seeded.');

        console.log('\n✅ All data seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Seeding error:', error.message);
        process.exit(1);
    }
};

seedAll();
