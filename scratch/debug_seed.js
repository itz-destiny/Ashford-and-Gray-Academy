const mongoose = require('mongoose');
const uri = 'mongodb+srv://jonathandestiny693_db_user:U9ZxyQN1gOT7s0HD@ashford.swptmgw.mongodb.net/?appName=Ashford';

async function test() {
    await mongoose.connect(uri);
    console.log('Connected');

    // Manually define models if needed or just use simple objects if testing validation
    // But let's try to find the error in seed logic.
    
    // I suspect the error might be related to the 'Supports' models or circular refs.
    // Let's check if we can just import them and run.
}

test().catch(console.error);
