import type { MetadataRoute } from "next";

const BASE = "https://www.ashfordandgrayfusionacademy.com";

export default function sitemap(): MetadataRoute.Sitemap {
    const now = new Date();

    const staticPages: MetadataRoute.Sitemap = [
        { url: BASE,                               lastModified: now, changeFrequency: "weekly",  priority: 1.0 },
        { url: `${BASE}/about`,                    lastModified: now, changeFrequency: "monthly", priority: 0.9 },
        { url: `${BASE}/academic-programs`,        lastModified: now, changeFrequency: "monthly", priority: 0.9 },
        { url: `${BASE}/programs`,                 lastModified: now, changeFrequency: "monthly", priority: 0.9 },
        { url: `${BASE}/certifications`,           lastModified: now, changeFrequency: "monthly", priority: 0.9 },
        { url: `${BASE}/executive`,                lastModified: now, changeFrequency: "monthly", priority: 0.8 },
        { url: `${BASE}/courses`,                  lastModified: now, changeFrequency: "weekly",  priority: 0.9 },
        { url: `${BASE}/faculty`,                  lastModified: now, changeFrequency: "monthly", priority: 0.7 },
        { url: `${BASE}/academic-press`,           lastModified: now, changeFrequency: "monthly", priority: 0.7 },
        { url: `${BASE}/press`,                    lastModified: now, changeFrequency: "monthly", priority: 0.6 },
        { url: `${BASE}/partners`,                 lastModified: now, changeFrequency: "monthly", priority: 0.7 },
        { url: `${BASE}/events`,                   lastModified: now, changeFrequency: "weekly",  priority: 0.7 },
        { url: `${BASE}/insights`,                 lastModified: now, changeFrequency: "weekly",  priority: 0.7 },
        { url: `${BASE}/contact`,                  lastModified: now, changeFrequency: "yearly",  priority: 0.8 },
        { url: `${BASE}/privacy`,                  lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
        { url: `${BASE}/terms`,                    lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    ];

    return staticPages;
}
