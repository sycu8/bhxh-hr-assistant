export type LegalUpdateListItemDto = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  sourceUrl: string;
  sourceName: string;
  legalDocumentType: string | null;
  documentNumber: string | null;
  issuedDateIso: string | null;
  effectiveDateIso: string | null;
  impactLevel: string;
  affectedGroups: string[];
  hrActionRequired: boolean;
  hrActionSummary: string | null;
};
