require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function fix() {
    await mongoose.connect(process.env.MONGODB_URI); // ✅ fixed
    const db = mongoose.connection.db;

    const newPassword = 'Test1234';
    const hash = await bcrypt.hash(newPassword, 10);

    await db.collection('users').updateOne(
        { email: 'ashutoshamale69@gmail.com' },
        {
            $set: {
                password: hash,
                status: 'active',
                tokenVersion: 0
            }
        }
    );

    console.log('✅ User fixed! Login with password:', newPassword);
    await mongoose.disconnect();
}

fix();