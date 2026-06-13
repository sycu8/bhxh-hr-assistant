/**
 * Tạo logo FPT Telecom (khối F/P/T + chữ "FPT Telecom", không có International).
 * Chạy: node scripts/generate-fti-logo.mjs
 */
import sharp from "sharp";
import { copyFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const out = join(root, "public/fti-logo.png");
const backup = join(root, "public/fti-logo-original.png");

// Giữ bản gốc lần đầu (International Telecom) để tái dùng khối F/P/T.
try {
  await copyFile(out, backup);
} catch {
  /* đã có backup hoặc chưa có file */
}

const src = (await sharp(backup).metadata().catch(() => null))
  ? backup
  : out;

const meta = await sharp(src).metadata();
const { width = 200, height = 200 } = meta;

const cropHeight = Math.round(height * 0.58);
const cropWidth = Math.round(width * 0.92);
const left = Math.round((width - cropWidth) / 2);

const blocks = await sharp(src)
  .extract({ left, top: 0, width: cropWidth, height: cropHeight })
  .png()
  .toBuffer();

const blocksB64 = blocks.toString("base64");
const textBand = 34;
const totalW = cropWidth;
const totalH = cropHeight + textBand;
const textY = cropHeight + 24;

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${totalW}" height="${totalH}" viewBox="0 0 ${totalW} ${totalH}">
  <rect width="100%" height="100%" fill="white"/>
  <image href="data:image/png;base64,${blocksB64}" width="${cropWidth}" height="${cropHeight}"/>
  <text x="${totalW / 2}" y="${textY}" text-anchor="middle"
    font-family="Segoe UI, Arial, Helvetica, sans-serif" font-weight="600" font-size="17"
    fill="#0054A6" letter-spacing="0.2">FPT Telecom</text>
</svg>`;

await sharp(Buffer.from(svg)).png().toFile(out);

// Favicon từ khối F/P/T (không chữ)
const cropped = await sharp(blocks)
  .resize(512, 512, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } })
  .png()
  .toBuffer();

await sharp(cropped).resize(32, 32).png().toFile(join(root, "src/app/icon.png"));
await sharp(cropped).resize(180, 180).png().toFile(join(root, "src/app/apple-icon.png"));

console.log(`Wrote ${out} (${totalW}x${totalH}) + favicons`);
