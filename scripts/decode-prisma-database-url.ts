import "dotenv/config";

function decodeApiKey(url: string): { databaseUrl?: string } | null {
  try {
    const parsed = new URL(url);
    const apiKey = parsed.searchParams.get("api_key");
    if (!apiKey) return null;
    const payload = apiKey.split(".")[0];
    if (!payload) return null;
    const padded = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padLen = (4 - (padded.length % 4)) % 4;
    const json = Buffer.from(padded + "=".repeat(padLen), "base64").toString(
      "utf8",
    );
    return JSON.parse(json) as { databaseUrl?: string };
  } catch {
    return null;
  }
}

const url = process.env.DATABASE_URL ?? "";
const decoded = decodeApiKey(url);
if (!decoded?.databaseUrl) {
  console.log("No embedded databaseUrl in DATABASE_URL api_key");
  process.exit(1);
}

const target = new URL(decoded.databaseUrl.replace(/^postgres:/, "http:"));
console.log(
  JSON.stringify({
    host: target.hostname,
    port: target.port,
    database: target.pathname.replace(/^\//, ""),
    isLocal: target.hostname === "localhost" || target.hostname === "127.0.0.1",
  }),
);
