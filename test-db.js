const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const uri = process.env.MONGODB_URI;

async function testConnection() {
    console.log('Attempting to connect to MongoDB...');
    console.log('URI:', uri.replace(/:([^@]+)@/, ':****@')); // Hide password

    const client = new MongoClient(uri, {
        connectTimeoutMS: 5000,
        serverSelectionTimeoutMS: 5000,
    });

    try {
        await client.connect();
        console.log('Successfully connected to MongoDB!');
        const db = client.db();
        const users = await db.collection('users').find({}).toArray();
        console.log(`Total users: ${users.length}`);
        users.forEach(u => {
            console.log(`- ${u.email} [${u.role}]`);
        });
    } catch (err) {
        console.error('Connection failed:');
        console.error(err);
    } finally {
        await client.close();
    }
}

testConnection();
