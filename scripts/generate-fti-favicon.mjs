/**
 * Crop phần chữ FPT (bỏ dòng International Telecom) và xuất favicon.
 * Chạy: node scripts/generate-fti-favicon.mjs
 */
import sharp from "sharp";
import { join } from "node:path";

const root = process.cwd();
const src = join(root, "public/fti-logo.png");
const meta = await sharp(src).metadata();
const { width = 0, height = 0 } = meta;

// Phần trên ~58% là khối F/P/T màu; phần dưới là chữ International Telecom.
const cropHeight = Math.round(height * 0.58);
const cropWidth = Math.round(width * 0.92);
const left = Math.round((width - cropWidth) / 2);

const cropped = await sharp(src)
  .extract({ left, top: 0, width: cropWidth, height: cropHeight })
  .resize(512, 512, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } })
  .png()
  .toBuffer();

await sharp(cropped).resize(32, 32).png().toFile(join(root, "src/app/icon.png"));
await sharp(cropped).resize(180, 180).png().toFile(join(root, "src/app/apple-icon.png"));

console.log(`Generated favicons from ${width}x${height} logo (crop ${cropWidth}x${cropHeight})`);
