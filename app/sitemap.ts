import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { listMarkdownSlugs } from "@/lib/content";
import lists from "@/content/lists.json";
import authors from "@/content/authors.json";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE.url;

  const summarySlugs = await listMarkdownSlugs("content/summaries");
  const blogSlugs = await listMarkdownSlugs("content/blog");

  const now = new Date();

  const routes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now },
    { url: `${base}/summaries`, lastModified: now },
    { url: `${base}/lists`, lastModified: now },
    { url: `${base}/authors`, lastModified: now },
    { url: `${base}/blog`, lastModified: now },

    ...summarySlugs.map((s) => ({ url: `${base}/summaries/${s}`, lastModified: now })),
    ...blogSlugs.map((s) => ({ url: `${base}/blog/${s}`, lastModified: now })),
    ...lists.map((l) => ({ url: `${base}/lists/${l.slug}`, lastModified: now })),
    ...authors.map((a) => ({ url: `${base}/authors/${a.slug}`, lastModified: now }))
  ];

  return routes;
}
