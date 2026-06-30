import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: [
                    "/admin/",
                    "/dashboard/",
                    "/instructor/",
                    "/registrar/",
                    "/finance/",
                    "/course-registrar/",
                    "/meeting/",
                    "/account/",
                    "/payments/",
                    "/api/",
                    "/login/",
                    "/(public)/seed/",
                ],
            },
        ],
        sitemap: "https://www.ashfordandgrayfusionacademy.com/sitemap.xml",
    };
}
