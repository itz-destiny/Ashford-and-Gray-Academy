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
        const enrollments = await db.collection('enrollments').find({}).toArray();

        console.log('--- USERS ---');
        users.forEach(u => console.log(`UID: ${u.uid}, Email: ${u.email}, Name: ${u.displayName}`));

        console.log('\n--- ENROLLMENTS ---');
        enrollments.forEach(e => console.log(`UserID (Link): ${e.userId}, CourseID: ${e.courseId}`));
    } catch (err) {
        console.error('Connection failed:');
        console.error(err);
    } finally {
        await client.close();
    }
}

testConnection();
