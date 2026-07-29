import { buildOpenApiDocument } from "@/lib/api/openapi-document";

export const runtime = "nodejs";

export async function GET() {
  const doc = buildOpenApiDocument();
  return Response.json(doc, {
    headers: {
      "Cache-Control": "public, max-age=300",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
