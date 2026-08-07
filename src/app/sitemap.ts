import type { MetadataRoute } from "next";
import dbConnect from "@/lib/mongodb";
import Course from "@/models/Course";
import { STATIC_COURSES } from "@/lib/courses-data";
import { slugify } from "@/lib/slugify";

const BASE = "https://www.ashfordandgrayfusionacademy.com";

async function getCourseUrls(now: Date): Promise<MetadataRoute.Sitemap> {
    const urls = new Map<string, MetadataRoute.Sitemap[number]>();

    // Static catalogue entries always resolve, even if the DB is briefly down.
    for (const c of STATIC_COURSES) {
        urls.set(c.id, {
            url: `${BASE}/courses/${c.id}/${slugify(c.title)}`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.85,
        });
    }

    try {
        await dbConnect();
        const dbCourses = await Course.find({ status: "published" }).select("title updatedAt").lean<{ _id: unknown; title: string; updatedAt?: Date }[]>();
        for (const c of dbCourses) {
            const id = String(c._id);
            urls.set(id, {
                url: `${BASE}/courses/${id}/${slugify(c.title)}`,
                lastModified: c.updatedAt || now,
                changeFrequency: "monthly",
                priority: 0.85,
            });
        }
    } catch (err) {
        console.warn("sitemap: course DB fetch failed, using static catalogue only:", err);
    }

    return Array.from(urls.values());
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const now = new Date();

    const staticPages: MetadataRoute.Sitemap = [
        { url: BASE,                               lastModified: now, changeFrequency: "weekly",  priority: 1.0 },
        { url: `${BASE}/about`,                    lastModified: now, changeFrequency: "monthly", priority: 0.9 },
        { url: `${BASE}/academic-programs`,        lastModified: now, changeFrequency: "monthly", priority: 0.9 },
        { url: `${BASE}/programs`,                 lastModified: now, changeFrequency: "monthly", priority: 0.9 },
        { url: `${BASE}/certifications`,           lastModified: now, changeFrequency: "monthly", priority: 0.9 },
        { url: `${BASE}/executive`,                lastModified: now, changeFrequency: "monthly", priority: 0.8 },
        { url: `${BASE}/courses`,                  lastModified: now, changeFrequency: "weekly",  priority: 0.9 },
        { url: `${BASE}/emc`,                       lastModified: now, changeFrequency: "monthly", priority: 0.7 },
        { url: `${BASE}/facilitators`,              lastModified: now, changeFrequency: "monthly", priority: 0.7 },
        { url: `${BASE}/academic-press`,           lastModified: now, changeFrequency: "monthly", priority: 0.7 },
        { url: `${BASE}/press`,                    lastModified: now, changeFrequency: "monthly", priority: 0.6 },
        { url: `${BASE}/partners`,                 lastModified: now, changeFrequency: "monthly", priority: 0.7 },
        { url: `${BASE}/events`,                   lastModified: now, changeFrequency: "weekly",  priority: 0.7 },
        { url: `${BASE}/insights`,                 lastModified: now, changeFrequency: "weekly",  priority: 0.7 },
        { url: `${BASE}/contact`,                  lastModified: now, changeFrequency: "yearly",  priority: 0.8 },
        { url: `${BASE}/privacy`,                  lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
        { url: `${BASE}/terms`,                    lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    ];

    const courseUrls = await getCourseUrls(now);

    return [...staticPages, ...courseUrls];
}
