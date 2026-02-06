const mongoose = require('mongoose');

const uri = "mongodb+srv://jonathandestiny693_db_user:U9ZxyQN1gOT7s0HD@ashford.swptmgw.mongodb.net/?appName=Ashford";

console.log("Attempting to connect to MongoDB...");
console.log("URI:", uri.replace(/:([^:@]+)@/, ':****@')); // hiding password

mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000 // 5 seconds timeout for quick feedback
})
    .then(() => {
        console.log("SUCCESS: Connected to MongoDB!");
        process.exit(0);
    })
    .catch(err => {
        console.error("FAILURE: Could not connect to MongoDB.");
        console.error("Error Name:", err.name);
        console.error("Error Message:", err.message);
        if (err.name === 'MongooseServerSelectionError') {
            console.error("HINT: This usually means your IP address is not whitelisted in MongoDB Atlas or a firewall is blocking port 27017.");
        }
        process.exit(1);
    });
