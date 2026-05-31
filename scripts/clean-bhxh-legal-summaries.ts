import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  cleanBhxhLegalBody,
  summarizeLegalDocumentText,
} from "../src/lib/text/bhxh-content";

type Row = {
  title: string;
  summary: string | null;
  body: string;
};

const filePath = path.join(
  process.cwd(),
  "src/lib/data/bhxh-published-legal-updates.json",
);

const rows = JSON.parse(readFileSync(filePath, "utf8")) as Row[];

let hotlineBefore = 0;
let hotlineAfter = 0;

for (const row of rows) {
  if ((row.summary ?? "").includes("Hotline") || row.body.includes("Hotline")) {
    hotlineBefore += 1;
  }
  row.summary = summarizeLegalDocumentText(row.body, row.title);
  row.body = cleanBhxhLegalBody(row.body);
  if ((row.summary ?? "").includes("Hotline") || row.body.includes("Hotline")) {
    hotlineAfter += 1;
  }
}

writeFileSync(filePath, `${JSON.stringify(rows)}\n`, "utf8");
console.log(
  `Cleaned ${rows.length} rows. Hotline before: ${hotlineBefore}, after: ${hotlineAfter}.`,
);
