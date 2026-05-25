const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Resolve path to load environment variables from the project root
const envLocalPath = path.join(__dirname, '..', '.env.local');
const envPath = path.join(__dirname, '..', '.env');

let envFileToUse = null;
if (fs.existsSync(envLocalPath)) {
  envFileToUse = envLocalPath;
} else if (fs.existsSync(envPath)) {
  envFileToUse = envPath;
}

if (envFileToUse) {
  console.log(`Loading environment from: ${envFileToUse}`);
  require('dotenv').config({ path: envFileToUse });
} else {
  console.log('No .env or .env.local file found in root.');
}

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('ERROR: MONGODB_URI is not defined in environment variables.');
  process.exit(1);
}

// Strip password for safe credentials logging
const maskedUri = uri.replace(/:([^@]+)@/, ':****@');
console.log(`Attempting connection to: ${maskedUri}`);

mongoose.connect(uri, {
  serverSelectionTimeoutMS: 5000, // 5 seconds fast fail timeout
})
.then(() => {
  console.log('\n=============================================');
  console.log('🎉 SUCCESS: Connected to MongoDB successfully!');
  console.log(`Connection State: ${mongoose.connection.readyState} (Connected)`);
  console.log(`Database Name: ${mongoose.connection.db.databaseName}`);
  console.log('=============================================\n');
  process.exit(0);
})
.catch((err) => {
  console.error('\n=============================================');
  console.error('❌ FAILURE: MongoDB connection failed.');
  console.error('Error Details:');
  console.error(err.message || err);
  if (err.stack) {
    console.error('\nStack Trace:');
    console.error(err.stack);
  }
  console.error('=============================================\n');
  process.exit(1);
});
