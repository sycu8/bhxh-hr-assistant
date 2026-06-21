import type { JsonLdGraph } from "@/lib/seo/structured-data";

type JsonLdProps = {
  data: JsonLdGraph | JsonLdGraph[];
};

/** Renders schema.org JSON-LD for crawlers and AI answer engines. */
export function JsonLd({ data }: JsonLdProps) {
  const payload = Array.isArray(data) ? data : [data];
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  );
}
