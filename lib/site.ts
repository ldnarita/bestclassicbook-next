export const SITE = {
  name: "Best Classic Book",
  url: "https://bestclassicbook.com",
  description: "Classic book summaries, ranked lists, author guides, and curated recommendations."
};

// Where the full public domain texts live
export const FULL_TEXT_BASE_URL = "https://funbookshelf.com";

/**
 * Convert a path ("/summaries/a-book") or absolute URL into an absolute URL.
 */
export function absUrl(path: string) {
  if (!path) return SITE.url;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${SITE.url}${clean}`;
}
