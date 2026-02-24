const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);

        if (error.message.includes('IP not whitelisted') || error.message.includes('Could not connect to any servers')) {
            console.error('\n> [HINT] This is likely an IP Whitelisting issue in MongoDB Atlas.');
            console.error('> Please ensure your current IP is added to the "Network Access" list in your Atlas Dashboard.');
            console.error('> Visit: https://www.mongodb.com/docs/atlas/security-whitelist/\n');
        }

        process.exit(1);
    }
};

module.exports = connectDB;