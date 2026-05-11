const mongoose = require('mongoose');
const uri = 'mongodb+srv://jonathandestiny693_db_user:U9ZxyQN1gOT7s0HD@ashford.swptmgw.mongodb.net/?appName=Ashford';

async function test() {
    await mongoose.connect(uri);
    console.log('Connected');

    // Define simple models for the test
    const Course = mongoose.models.Course || mongoose.model('Course', new mongoose.Schema({}, { strict: false }));
    const Event = mongoose.models.Event || mongoose.model('Event', new mongoose.Schema({}, { strict: false }));
    const Module = mongoose.models.Module || mongoose.model('Module', new mongoose.Schema({}, { strict: false }));
    const Lesson = mongoose.models.Lesson || mongoose.model('Lesson', new mongoose.Schema({}, { strict: false }));
    const Assignment = mongoose.models.Assignment || mongoose.model('Assignment', new mongoose.Schema({}, { strict: false }));

    console.log('Deleting...');
    await Course.deleteMany({});
    await Event.deleteMany({});
    await Module.deleteMany({});
    await Lesson.deleteMany({});
    await Assignment.deleteMany({});

    console.log('Done cleanup');
    process.exit(0);
}

test().catch(err => {
    console.error('ERROR:', err);
    process.exit(1);
});
