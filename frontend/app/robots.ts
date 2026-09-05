import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/login"],
        disallow: ["/api/", "/admin/", "/teacher/", "/student/", "/unauthorized"],
      },
    ],
    sitemap: "https://cebucecportal.site/sitemap.xml",
    host: "https://cebucecportal.site",
  };
}

