/**
 * Priority Vietnamese BHXH queries for SEO/GEO benchmark.
 * Each must map to an answer-ready canonical page (/hoi-dap/{slug}).
 */
export type PriorityQuery = {
  id: string;
  query: string;
  expectedSlug: string;
  /** Substring expected in HTML body (answer-first signal). */
  answerSnippet: string;
};

export const PRIORITY_QUERIES: PriorityQuery[] = [
  {
    id: "Q1",
    query: "có bắt buộc tham gia BHXH không",
    expectedSlug: "bat-buoc-tham-gia-bhxh",
    answerSnippet: "phải tham gia BHXH",
  },
  {
    id: "Q2",
    query: "nghỉ không lương 14 ngày có đóng BHXH không",
    expectedSlug: "nghi-khong-luong-14-ngay",
    answerSnippet: "14 ngày",
  },
  {
    id: "Q3",
    query: "mức đóng BHXH BHYT BHTN tính trên lương nào",
    expectedSlug: "muc-dong-bhxh-bhyt-bhtn",
    answerSnippet: "căn cứ đóng",
  },
  {
    id: "Q4",
    query: "nghỉ thai sản được hưởng chế độ như thế nào",
    expectedSlug: "che-do-thai-san-tom-tat",
    answerSnippet: "7 tháng",
  },
  {
    id: "Q5",
    query: "điều kiện hưởng trợ cấp thất nghiệp BHTN",
    expectedSlug: "dieu-kien-tro-cap-that-nghiep",
    answerSnippet: "12 tháng",
  },
  {
    id: "Q6",
    query: "người phụ thuộc giảm trừ thuế TNCN",
    expectedSlug: "nguoi-phu-thuoc-giam-tru",
    answerSnippet: "phụ thuộc",
  },
  {
    id: "Q7",
    query: "lương cơ sở 2026 bao nhiêu",
    expectedSlug: "luong-co-so-2-53-2026",
    answerSnippet: "2,53",
  },
  {
    id: "Q8",
    query: "nghỉ ốm có được hưởng BHXH không",
    expectedSlug: "nghi-om-benh",
    answerSnippet: "ốm đau",
  },
];

export function priorityQueryPath(slug: string): string {
  return `/hoi-dap/${slug}`;
}

/** Resolve a natural-language query to the best priority FAQ slug via curated search. */
export function mapQueryToSlug(
  query: string,
  searchFn: (q: string) => { faq: { slug: string } }[],
): string | null {
  const hits = searchFn(query);
  return hits[0]?.faq.slug ?? null;
}
