const mongoose = require('mongoose');
require('dotenv').config();
const Attendance = require('./models/Attendance');

async function checkData() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');
        const studentId = '2024CS101';
        const records = await Attendance.find({ studentId });
        console.log(`Records for ${studentId}:`, records.length);
        if (records.length > 0) {
            console.log('Sample record:', JSON.stringify(records[0], null, 2));
            const completedLectures = Math.max(...records.map(r => r.total));
            console.log('Completed lectures (max):', completedLectures);
        }
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await mongoose.connection.close();
    }
}

checkData();
