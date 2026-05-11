const mongoose = require('mongoose');
const uri = 'mongodb+srv://jonathandestiny693_db_user:U9ZxyQN1gOT7s0HD@ashford.swptmgw.mongodb.net/?appName=Ashford';

async function test() {
    await mongoose.connect(uri);
    console.log('Connected');

    // Simple schema for Course
    const CourseSchema = new mongoose.Schema({
        title: String,
        category: String,
        instructor: { name: String, avatarUrl: String, verified: Boolean },
        rating: Number,
        reviews: Number,
        duration: Number,
        level: String,
        price: Number,
        imageUrl: String,
        imageHint: String,
        description: String,
        curriculum: [String],
        status: { type: String, default: 'published' }
    });
    const Course = mongoose.models.Course || mongoose.model('Course', CourseSchema);

    // Data from lib/data.ts (simplified for the script)
    const courses = [
      {
        title: 'Housekeeping and Domestic Management (Certificate)',
        description: 'A comprehensive certification covering all aspects of professional housekeeping and domestic management.',
        category: 'Certification',
        instructor: { name: 'Sarah Ashford', avatarUrl: 'https://picsum.photos/seed/sarah/100/100', verified: true },
        rating: 4.8,
        reviews: 1250,
        duration: 12,
        level: 'Beginner',
        price: 350000,
        imageUrl: '/housekeeping_certificate.png',
        imageHint: 'professional housekeeping setup',
      },
      {
        title: 'Hospitality Management (Certificate)',
        description: 'Master the skills required for high-end hospitality management, from butler services to guest relations.',
        category: 'Certification',
        instructor: { name: 'James Gray', avatarUrl: 'https://picsum.photos/seed/james/100/100', verified: true },
        rating: 4.9,
        reviews: 890,
        duration: 14,
        level: 'Advanced',
        price: 350000,
        imageUrl: '/hospitality_management_certificate.png',
        imageHint: 'luxury hospitality service',
      }
    ];

    console.log('Seeding courses...');
    const created = await Course.insertMany(courses);
    console.log('Seeded:', created.length);

    process.exit(0);
}

test().catch(err => {
    console.error('ERROR:', err);
    process.exit(1);
});
