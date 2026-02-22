import { absUrl, SITE } from "@/lib/site";

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: it.name,
      item: absUrl(it.path)
    }))
  };
}

export function articleJsonLd(params: {
  title: string;
  path: string;
  description: string;
  datePublished?: string;
  dateModified?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: params.title,
    description: params.description,
    mainEntityOfPage: absUrl(params.path),
    url: absUrl(params.path),
    publisher: {
      "@type": "Organization",
      name: SITE.name,
      url: SITE.url
    },
    ...(params.datePublished ? { datePublished: params.datePublished } : {}),
    ...(params.dateModified ? { dateModified: params.dateModified } : {})
  };
}

export function bookSummaryJsonLd(params: {
  title: string;
  authorName: string;
  description: string;
  path: string;
  imagePath?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Book",
    name: params.title,
    author: { "@type": "Person", name: params.authorName },
    description: params.description,
    url: absUrl(params.path),
    ...(params.imagePath ? { image: absUrl(params.imagePath) } : {})
  };
}

export function itemListJsonLd(params: {
  name: string;
  description: string;
  path: string;
  items: Array<{ name: string; path: string }>;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: params.name,
    description: params.description,
    url: absUrl(params.path),
    itemListElement: params.items.map((it, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: it.name,
      url: absUrl(it.path)
    }))
  };
}
export function faqJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer
      }
    }))
  };
}