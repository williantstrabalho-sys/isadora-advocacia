import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import type { BlogPost } from "@/lib/types";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE_URL.replace(/\/$/, "");

  const fixas: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/blog`, changeFrequency: "weekly", priority: 0.8 },
    {
      url: `${base}/politica-privacidade`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("blog_posts")
      .select("slug, created_at")
      .eq("publicado", true)
      .returns<Pick<BlogPost, "slug" | "created_at">[]>();
    const posts = (data ?? []).map((p) => ({
      url: `${base}/blog/${p.slug}`,
      lastModified: new Date(p.created_at),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));
    return [...fixas, ...posts];
  } catch {
    return fixas;
  }
}
