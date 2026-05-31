import { getCloudflareContext } from "@opennextjs/cloudflare";

export function tryGetCloudflareEnv() {
  try {
    const { env } = getCloudflareContext();
    return env;
  } catch {
    return undefined;
  }
}
