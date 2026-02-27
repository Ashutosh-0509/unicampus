require('dotenv').config();
const mongoose = require('mongoose');

const check = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const db = mongoose.connection.db;
        const collection = db.collection('attendances');

        const count = await collection.countDocuments();
        console.log(`📊 Total records in 'attendances': ${count}`);

        if (count > 0) {
            const sample = await collection.findOne();
            console.log('📋 Sample record:', JSON.stringify(sample, null, 2));
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
};

check();
