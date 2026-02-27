require('dotenv').config();
const mongoose = require('mongoose');

const fix = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const db = mongoose.connection.db;
        const collection = db.collection('attendances');

        console.log('🔍 Checking indexes on attendances...');
        const indexes = await collection.indexes();
        console.log('Current indexes:', JSON.stringify(indexes, null, 2));

        const hasIdIndex = indexes.some(idx => idx.name === 'id_1');
        if (hasIdIndex) {
            console.log('🚀 Dropping index id_1...');
            await collection.dropIndex('id_1');
            console.log('✅ Index id_1 dropped successfully');
        } else {
            console.log('ℹ️ Index id_1 not found');
        }

    } catch (err) {
        console.error('❌ Error fixing index:', err);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected');
    }
};

fix();
