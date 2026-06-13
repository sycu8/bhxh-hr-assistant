import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  applyPublishedLegalHygiene,
  buildCuratedReplacementCorpus,
  type PublishedLegalHygieneRow,
} from "../src/lib/crawl/bhxh-published-legal-hygiene";
import { CURATED_LEGAL_UPDATES } from "../src/lib/data/curated-legal-updates";

const filePath = path.join(
  process.cwd(),
  "src/lib/data/bhxh-published-legal-updates.json",
);

const rows = JSON.parse(readFileSync(filePath, "utf8")) as PublishedLegalHygieneRow[];
const result = applyPublishedLegalHygiene(rows, {
  replacementCorpus: buildCuratedReplacementCorpus(CURATED_LEGAL_UPDATES),
});

writeFileSync(filePath, `${JSON.stringify(result.kept)}\n`, "utf8");
console.log(
  [
    `Hygiene complete: kept ${result.kept.length} of ${rows.length}.`,
    `Irrelevant removed: ${result.removedIrrelevant}.`,
    `Superseded removed: ${result.removedSuperseded}.`,
    `Duplicates removed: ${result.removedDuplicates}.`,
    `Issued dates fixed: ${result.issuedDatesFixed}.`,
  ].join(" "),
);
