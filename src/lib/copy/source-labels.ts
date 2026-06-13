import type { CuratedSourceLabel } from "@/lib/data/curated-faqs";

export const SOURCE_LABEL_COPY: Record<CuratedSourceLabel, string> = {
  OFFICIAL_LAW: "Văn bản pháp luật",
  INTERNAL_POLICY: "Chính sách nội bộ",
  REFERENCE_ARTICLE: "Bài tham khảo",
  HR_APPROVED: "HR đã duyệt",
};

export const CONFIDENCE_LABEL_COPY = {
  HIGH: "Tin cậy cao",
  MEDIUM: "Tin cậy trung bình",
  LOW: "Tin cậy thấp — nên hỏi HR",
} as const;
