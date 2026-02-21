export const SITE = {
  name: "Best Classic Book",
  domain: "bestclassicbook.com",
  url: "https://bestclassicbook.com",
  description:
    "Modern, trustworthy summaries and ranked lists of public domain classic books. Read full texts on FunBookShelf.com.",
  socials: {
    x: "https://x.com/",
    github: "https://github.com/"
  },
  funnelTarget: {
    name: "FunBookShelf",
    url: "https://funbookshelf.com"
  }
} as const;

export function absUrl(path: string) {
  if (!path.startsWith("/")) path = `/${path}`;
  return `${SITE.url}${path}`;
}