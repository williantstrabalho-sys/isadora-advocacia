import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // áreas privadas/funcionais não devem ser indexadas
      disallow: ["/dashboard", "/portal", "/api", "/login", "/redefinir"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
