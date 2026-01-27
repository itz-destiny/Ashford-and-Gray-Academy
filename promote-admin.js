const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const uri = process.env.MONGODB_URI;

async function promoteAdmin(email) {
    console.log(`Connecting to MongoDB to promote ${email}...`);
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db();
        const users = db.collection('users');

        const result = await users.updateOne(
            { email: email },
            { $set: { role: 'admin' } }
        );

        if (result.matchedCount === 0) {
            console.log(`User ${email} not found in database.`);
        } else if (result.modifiedCount === 0) {
            console.log(`User ${email} already has admin role or role was not changed.`);
        } else {
            console.log(`Successfully promoted ${email} to admin.`);
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.close();
    }
}

const email = process.argv[2];
if (!email) {
    console.log('Usage: node promote-admin.js <email>');
    process.exit(1);
}

promoteAdmin(email);
