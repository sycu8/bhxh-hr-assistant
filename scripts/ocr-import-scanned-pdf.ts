/**
 * Raster scanned PDF pages (PDFium WASM), OCR (tesseract.js vie+eng),
 * chunk text, replace DocumentChunk rows for a known storagePath.
 *
 * Usage:
 *   pnpm run pdf:ocr-import -- --dry-run --maxPages=1
 *   pnpm run pdf:ocr-import -- --pdf=public/docs/366-QD-BHXH-2026.pdf
 *
 * Requires DATABASE_URL unless --dry-run.
 */
import "dotenv/config";
import { PDFiumLibrary, type PDFiumPageRenderOptions } from "@hyzyla/pdfium";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { createWorker, type Worker } from "tesseract.js";
import { getDb } from "../src/lib/db/prisma";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DEFAULT_REL_PDF = "public/docs/366-QD-BHXH-2026.pdf";
const DEFAULT_STORAGE_PATH = "/docs/366-QD-BHXH-2026.pdf";
const MAX_CHUNK_CHARS = 1400;

function parseArgs(argv: string[]) {
  const out: {
    dryRun: boolean;
    maxPages: number | null;
    pdf: string;
    storagePath: string;
    savePngDir: string | null;
  } = {
    dryRun: false,
    maxPages: null,
    pdf: path.join(process.cwd(), DEFAULT_REL_PDF),
    storagePath: DEFAULT_STORAGE_PATH,
    savePngDir: null,
  };
  for (const a of argv) {
    if (a === "--dry-run") out.dryRun = true;
    else if (a.startsWith("--maxPages="))
      out.maxPages = Math.max(1, parseInt(a.split("=")[1] || "1", 10));
    else if (a.startsWith("--pdf=")) out.pdf = path.resolve(process.cwd(), a.slice(6));
    else if (a.startsWith("--storagePath=")) out.storagePath = a.slice(14);
    else if (a.startsWith("--savePngDir="))
      out.savePngDir = path.resolve(process.cwd(), a.slice(13));
  }
  return out;
}

async function renderToPng(
  options: PDFiumPageRenderOptions,
): Promise<Uint8Array> {
  return sharp(options.data, {
    raw: {
      width: options.width,
      height: options.height,
      channels: 4,
    },
  })
    .png()
    .toBuffer();
}

function normalizeWhitespace(s: string): string {
  return s
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function chunkText(full: string, pageNum: number): Array<{ content: string; meta: object }> {
  const text = normalizeWhitespace(full);
  if (!text) return [];
  const parts: string[] = [];
  let rest = text;
  while (rest.length > 0) {
    if (rest.length <= MAX_CHUNK_CHARS) {
      parts.push(rest);
      break;
    }
    let cut = rest.lastIndexOf("\n\n", MAX_CHUNK_CHARS);
    if (cut < MAX_CHUNK_CHARS / 2) cut = rest.lastIndexOf("\n", MAX_CHUNK_CHARS);
    if (cut < MAX_CHUNK_CHARS / 2) cut = MAX_CHUNK_CHARS;
    parts.push(rest.slice(0, cut).trim());
    rest = rest.slice(cut).trim();
  }
  return parts.map((content, i) => ({
    content,
    meta: { ocr: true, ocrPage: pageNum, ocrPart: i },
  }));
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!fs.existsSync(args.pdf)) {
    console.error("PDF not found:", args.pdf);
    process.exit(1);
  }

  const pdfBytes = fs.readFileSync(args.pdf);
  const library = await PDFiumLibrary.init();
  const document = await library.loadDocument(pdfBytes);

  let worker: Worker | null = null;
  try {
    worker = await createWorker(["vie", "eng"]);
  } catch (e) {
    console.error("Tesseract worker failed (network needed first run for lang data):", e);
    await library.destroy();
    process.exit(1);
  }

  const allChunks: Array<{ content: string; meta: object }> = [];
  let n = 0;
  for (const page of document.pages()) {
    n += 1;
    if (args.maxPages !== null && n > args.maxPages) break;

    const image = await page.render({
      scale: 2.5,
      render: renderToPng,
    });
    const pngBuf = Buffer.from(image.data);
    if (args.savePngDir) {
      fs.mkdirSync(args.savePngDir, { recursive: true });
      fs.writeFileSync(path.join(args.savePngDir, `page-${page.number}.png`), pngBuf);
    }

    const {
      data: { text },
    } = await worker.recognize(pngBuf);
    const pageLabel = page.number + 1;
    const pageChunks = chunkText(text, pageLabel);
    console.log(
      `Page ${pageLabel}: OCR ${text.length} chars -> ${pageChunks.length} chunk(s)`,
    );
    if (args.dryRun && pageChunks[0]) {
      console.log("--- preview ---\n", pageChunks[0].content.slice(0, 600), "\n---");
    }
    allChunks.push(...pageChunks);
  }

  document.destroy();
  library.destroy();
  await worker.terminate();

  if (args.dryRun) {
    console.log(
      `Dry run done. Total chunks that would be written: ${allChunks.length}`,
    );
    return;
  }

  const prisma = getDb();
  const doc = await prisma.document.findFirst({
    where: { storagePath: args.storagePath },
  });
  if (!doc) {
    console.error(
      `No Document with storagePath=${args.storagePath}. Run prisma seed or create the row first.`,
    );
    await prisma.$disconnect();
    process.exit(1);
  }

  await prisma.documentChunk.deleteMany({ where: { documentId: doc.id } });
  await prisma.documentChunk.createMany({
    data: allChunks.map((c, i) => ({
      documentId: doc.id,
      chunkIndex: i,
      content: c.content,
      metadata: c.meta as object,
    })),
  });

  console.log(
    `Updated document ${doc.id}: ${allChunks.length} OCR chunk(s) for ${args.storagePath}`,
  );
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
