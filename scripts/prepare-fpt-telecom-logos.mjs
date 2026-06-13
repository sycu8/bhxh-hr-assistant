/**
 * Chuẩn hóa logo FPT Telecom (ngang/dọc): trim nền đen, PNG trong suốt, favicon.
 * Chạy: node scripts/prepare-fpt-telecom-logos.mjs
 */
import sharp from "sharp";
import { join } from "node:path";

const root = process.cwd();

async function blackToTransparent(input, output) {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  for (let i = 0; i < data.length; i += channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (r < 28 && g < 28 && b < 28) {
      data[i + 3] = 0;
    }
  }

  const tmp = `${output}.tmp.png`;
  await sharp(data, { raw: { width, height, channels } })
    .png()
    .trim({ threshold: 10 })
    .toFile(tmp);

  await sharp(tmp).toFile(output);
  const meta = await sharp(output).metadata();
  return meta;
}

const horizontalSrc = join(root, "public/fpt-telecom-logo-horizontal-src.png");
const verticalSrc = join(root, "public/fpt-telecom-logo-vertical-src.png");
const horizontalOut = join(root, "public/fpt-telecom-logo-horizontal.png");
const verticalOut = join(root, "public/fpt-telecom-logo-vertical.png");

const h = await blackToTransparent(horizontalSrc, horizontalOut);
const v = await blackToTransparent(verticalSrc, verticalOut);

// Favicon từ khối F/P/T (crop trên logo dọc)
const vMeta = await sharp(verticalOut).metadata();
const cropH = Math.round((vMeta.height ?? 0) * 0.62);
const cropW = Math.round((vMeta.width ?? 0) * 0.88);
const left = Math.round(((vMeta.width ?? 0) - cropW) / 2);

const iconSource = await sharp(verticalOut)
  .extract({ left, top: 0, width: cropW, height: cropH })
  .resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer();

await sharp(iconSource).resize(32, 32).png().toFile(join(root, "src/app/icon.png"));
await sharp(iconSource).resize(180, 180).png().toFile(join(root, "src/app/apple-icon.png"));

console.log(`Horizontal: ${h.width}x${h.height}`);
console.log(`Vertical: ${v.width}x${v.height}`);
console.log("Favicons updated from vertical logo mark");
