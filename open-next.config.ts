import { defineCloudflareConfig } from "@opennextjs/cloudflare";

/**
 * OpenNext mặc định chạy `pnpm build` khi có `packageManager: pnpm` — trên Windows
 * subprocess đôi khi không thấy `pnpm` trong PATH. Dùng `npm run build` (cùng script trong package.json).
 */
export default {
  ...defineCloudflareConfig(),
  buildCommand: "npm run build",
};

