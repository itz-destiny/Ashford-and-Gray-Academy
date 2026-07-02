/**
 * Standalone seed script — run with:
 *   npx tsx scripts/seed.ts
 *
 * Reads MONGODB_URI from .env.local (no Firebase auth required).
 */
import 'dotenv/config';
import { config } from 'dotenv';
import { resolve } from 'path';
import mongoose, { Schema } from 'mongoose';
import { coursesToSeed, eventsToSeed } from '../src/lib/data';

// Load .env.local explicitly
config({ path: resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    console.error('MONGODB_URI not found in .env.local');
    process.exit(1);
}

// Inline schema definitions (mirrors src/models/*)
const CourseSchema = new Schema({
    title: { type: String, required: true },
    category: { type: String, required: true },
    instructorUid: { type: String, index: true },
    instructor: {
        name: { type: String, required: true },
        avatarUrl: { type: String, required: true },
        verified: { type: Boolean, default: false },
    },
    rating: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
    duration: { type: Number, required: true },
    level: { type: String, required: true },
    price: { type: Number, required: true },
    currency: { type: String, default: 'NGN' },
    originalPrice: { type: Number },
    imageUrl: { type: String, required: true },
    imageHint: { type: String, required: true },
    description: { type: String, required: true },
    curriculum: { type: [String], default: [] },
    status: { type: String, enum: ['draft', 'pending', 'published', 'archived'], default: 'draft' },
    whoFor: { type: [String], default: undefined },
    learningOutcomes: {
        type: [{ module: { type: String, required: true }, topics: { type: [String], default: [] } }],
        default: undefined,
    },
    certificationDetails: { type: [String], default: undefined },
    careerOpportunities: { type: [String], default: undefined },
}, { timestamps: true });

const EventSchema = new Schema({
    title: { type: String, required: true },
    description: String,
    date: Date,
    location: String,
    imageUrl: String,
}, { timestamps: true });

async function seed() {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI!);
    console.log('Connected.');

    const Course = mongoose.models.Course || mongoose.model('Course', CourseSchema);
    const Event = mongoose.models.Event || mongoose.model('Event', EventSchema);

    console.log('Dropping existing courses and events...');
    await Course.deleteMany({});
    await Event.deleteMany({});

    console.log(`Inserting ${coursesToSeed.length} courses...`);
    const inserted = await Course.insertMany(coursesToSeed);
    console.log(`Inserted ${inserted.length} courses.`);

    if (eventsToSeed.length > 0) {
        await Event.insertMany(eventsToSeed);
        console.log(`Inserted ${eventsToSeed.length} events.`);
    }

    console.log('\nDone! Courses seeded:');
    inserted.forEach((c: any, i: number) => console.log(`  ${i + 1}. ${c.title} [${c.category}]`));

    await mongoose.disconnect();
    process.exit(0);
}

seed().catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
});
