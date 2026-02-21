import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export function baseMetadata(overrides?: Partial<Metadata>): Metadata {
  const title = overrides?.title ?? SITE.name;
  const description = overrides?.description ?? SITE.description;

  return {
    metadataBase: new URL(SITE.url),
    title,
    description,
    alternates: overrides?.alternates ?? { canonical: "/" },
    openGraph: {
      title: typeof title === "string" ? title : SITE.name,
      description: typeof description === "string" ? description : SITE.description,
      url: SITE.url,
      siteName: SITE.name,
      type: "website"
    },
    twitter: { card: "summary_large_image" },
    ...overrides
  };
}