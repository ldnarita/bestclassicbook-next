import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import lists from "@/content/lists.json";
import authors from "@/content/authors.json";
import path from "path";
import { promises as fs } from "fs";

async function mtime(p: string) {
  try {
    const st = await fs.stat(p);
    return st.mtime;
  } catch {
    // If file not found for some reason, fall back to "now"
    return new Date();
  }
}

async function dirMarkdownSlugsWithTimes(dir: string) {
  const absDir = path.join(process.cwd(), dir);
  const files = await fs.readdir(absDir);
  const md = files.filter((f) => f.endsWith(".md"));

  return Promise.all(
    md.map(async (f) => {
      const slug = f.replace(/\.md$/, "");
      const fileTime = await mtime(path.join(absDir, f));
      return { slug, lastModified: fileTime };
    })
  );
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE.url;

  const summaries = await dirMarkdownSlugsWithTimes("content/summaries");
  const blogs = await dirMarkdownSlugsWithTimes("content/blog");

  const listsTime = await mtime(path.join(process.cwd(), "content/lists.json"));
  const authorsTime = await mtime(path.join(process.cwd(), "content/authors.json"));

  // For “section pages” you can use the json time or the latest child time.
  const summariesIndexTime =
    summaries.reduce((max, x) => (x.lastModified > max ? x.lastModified : max), new Date(0)) || new Date();

  const blogIndexTime =
    blogs.reduce((max, x) => (x.lastModified > max ? x.lastModified : max), new Date(0)) || new Date();

  return [
    { url: `${base}/`, lastModified: new Date() },

    { url: `${base}/summaries`, lastModified: summariesIndexTime },
    { url: `${base}/lists`, lastModified: listsTime },
    { url: `${base}/authors`, lastModified: authorsTime },
    { url: `${base}/blog`, lastModified: blogIndexTime },

    ...summaries.map((s) => ({ url: `${base}/summaries/${s.slug}`, lastModified: s.lastModified })),
    ...blogs.map((b) => ({ url: `${base}/blog/${b.slug}`, lastModified: b.lastModified })),
    ...lists.map((l) => ({ url: `${base}/lists/${l.slug}`, lastModified: listsTime })),
    ...authors.map((a) => ({ url: `${base}/authors/${a.slug}`, lastModified: authorsTime }))
  ];
}