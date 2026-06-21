import type { CuratedFaq } from "@/lib/data/curated-faqs";
import { absoluteUrl } from "@/lib/site-url";

const SCHEMA_CONTEXT = "https://schema.org";

export type JsonLdGraph = Record<string, unknown>;

function citationToCreativeWork(c: CuratedFaq["citations"][number]) {
  const url = c.sourceUrl.startsWith("/")
    ? absoluteUrl(c.sourceUrl)
    : c.sourceUrl;
  return {
    "@type": "CreativeWork",
    name: c.title,
    url,
    ...(c.legalArticle ? { citation: c.legalArticle } : {}),
  };
}

/** FAQPage + BreadcrumbList for answer-ready FAQ detail pages (SEO + GEO). */
export function buildFaqPageJsonLd(params: {
  faq: CuratedFaq;
  topicTitle?: string;
}): JsonLdGraph[] {
  const pageUrl = absoluteUrl(`/hoi-dap/${params.faq.slug}`);
  const citations = params.faq.citations.map(citationToCreativeWork);

  const faqPage: JsonLdGraph = {
    "@context": SCHEMA_CONTEXT,
    "@type": "FAQPage",
    "@id": `${pageUrl}#faq`,
    url: pageUrl,
    inLanguage: "vi-VN",
    mainEntity: [
      {
        "@type": "Question",
        name: params.faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: params.faq.answer,
          ...(citations.length > 0 ? { citation: citations } : {}),
        },
      },
    ],
    ...(citations.length > 0 ? { isBasedOn: citations } : {}),
  };

  const breadcrumb: JsonLdGraph = {
    "@context": SCHEMA_CONTEXT,
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Trang chủ",
        item: absoluteUrl("/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Hỏi đáp",
        item: absoluteUrl("/hoi-dap"),
      },
      ...(params.topicTitle
        ? [
            {
              "@type": "ListItem",
              position: 3,
              name: params.topicTitle,
              item: absoluteUrl(`/topics/${params.faq.categorySlug}`),
            },
            {
              "@type": "ListItem",
              position: 4,
              name: params.faq.question.slice(0, 80),
              item: pageUrl,
            },
          ]
        : [
            {
              "@type": "ListItem",
              position: 3,
              name: params.faq.question.slice(0, 80),
              item: pageUrl,
            },
          ]),
    ],
  };

  return [faqPage, breadcrumb];
}

/** Site-wide WebSite + Organization for crawl/index (SearchAction for Sitelinks). */
export function buildSiteJsonLd(): JsonLdGraph[] {
  const siteUrl = absoluteUrl("/");
  return [
    {
      "@context": SCHEMA_CONTEXT,
      "@type": "WebSite",
      "@id": `${siteUrl}#website`,
      url: siteUrl,
      name: "Cổng kiến thức bảo hiểm FPT Telecom",
      description:
        "Tra cứu BHXH, BHYT, BHTN và chế độ lao động theo tài liệu đã duyệt.",
      inLanguage: "vi-VN",
      publisher: { "@id": `${siteUrl}#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${absoluteUrl("/search")}?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@context": SCHEMA_CONTEXT,
      "@type": "Organization",
      "@id": `${siteUrl}#organization`,
      name: "FPT Telecom",
      url: "https://fpt.vn",
    },
  ];
}

/** Article schema for published legal update detail. */
export function buildLegalUpdateJsonLd(params: {
  title: string;
  slug: string;
  summary: string | null;
  sourceUrl: string;
  sourceName: string;
  issuedDate: Date | null;
}): JsonLdGraph {
  const pageUrl = absoluteUrl(`/legal-updates/${params.slug}`);
  return {
    "@context": SCHEMA_CONTEXT,
    "@type": "Article",
    "@id": `${pageUrl}#article`,
    headline: params.title,
    url: pageUrl,
    inLanguage: "vi-VN",
    description: params.summary ?? undefined,
    datePublished: params.issuedDate?.toISOString(),
    isBasedOn: {
      "@type": "CreativeWork",
      name: params.sourceName,
      url: params.sourceUrl,
    },
    publisher: {
      "@type": "Organization",
      name: "FPT Telecom HR/C&B",
    },
  };
}
