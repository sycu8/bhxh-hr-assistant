import type { LegalUpdateListItemDto } from "@/lib/legal-updates/types";
import {
  isWithinIssuanceRange,
  matchesLegalUpdateSearch,
  parseDateInput,
} from "@/lib/legal-updates/list-utils";

export type LegalUpdateListFilters = {
  q?: string;
  from?: string;
  to?: string;
};

export function filterLegalUpdateItems(
  items: LegalUpdateListItemDto[],
  filters: LegalUpdateListFilters,
): LegalUpdateListItemDto[] {
  const q = filters.q?.trim() ?? "";
  const from = parseDateInput(filters.from ?? "");
  const to = parseDateInput(filters.to ?? "");

  return items.filter((item) => {
    if (
      !matchesLegalUpdateSearch(
        {
          title: item.title,
          summary: item.summary,
          documentNumber: item.documentNumber,
          sourceName: item.sourceName,
        },
        q,
      )
    ) {
      return false;
    }
    return isWithinIssuanceRange(
      {
        issuedDate: item.issuedDateIso,
        effectiveDate: item.effectiveDateIso,
      },
      from,
      to,
    );
  });
}
