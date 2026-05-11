const mongoose = require('mongoose');
const uri = 'mongodb+srv://jonathandestiny693_db_user:U9ZxyQN1gOT7s0HD@ashford.swptmgw.mongodb.net/?appName=Ashford';

async function test() {
    console.log('Connecting...');
    await mongoose.connect(uri);
    console.log('Connected');

    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));

    // Try deleting from a collection directly via the native driver to see if it works
    const result = await mongoose.connection.db.collection('courses').deleteMany({});
    console.log('Deleted courses:', result.deletedCount);
    
    process.exit(0);
}

test().catch(err => {
    console.error('ERROR:', err);
    process.exit(1);
});
