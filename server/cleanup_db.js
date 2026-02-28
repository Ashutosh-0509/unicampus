const mongoose = require('mongoose');
require('dotenv').config();
const Attendance = require('./src/models/Attendance');

async function cleanup() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const studentId = '2024CS101';
        const records = await Attendance.find({ studentId });
        console.log(`Found ${records.length} total records for ${studentId}`);

        const toKeep = {};
        records.forEach(r => {
            // Keep the one with the latest updatedAt or highest total
            if (!toKeep[r.subject] || new Date(r.updatedAt) > new Date(toKeep[r.subject].updatedAt)) {
                toKeep[r.subject] = r;
            }
        });

        const idsToKeep = Object.values(toKeep).map(r => r._id);
        const result = await Attendance.deleteMany({
            studentId,
            _id: { $nin: idsToKeep }
        });

        console.log(`🗑️ Cleaned ${result.deletedCount} duplicate records.`);

        // Also verify the remaining records
        const final = await Attendance.find({ studentId });
        console.log('Final records:');
        final.forEach(f => console.log(`- ${f.subject}: ${f.attended}/${f.total} (${f.percentage}%)`));

    } catch (err) {
        console.error('💥 Cleanup error:', err.message);
    } finally {
        await mongoose.connection.close();
    }
}

cleanup();
