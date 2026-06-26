import { Badge } from "@/components/ui/badge";
import { CopyableCode } from "@/components/developers/copyable-code";
import {
  API_AUTH_GUIDE,
  absoluteApiUrl,
  type ApiEndpointSpec,
} from "@/lib/api/api-catalog";

const AUDIENCE_LABEL: Record<ApiEndpointSpec["audience"], string> = {
  public: "Công khai",
  employee: "Nhân viên",
  hr: "CMS / HR",
  automation: "Automation",
};

function methodBadgeClass(method: ApiEndpointSpec["method"]): string {
  switch (method) {
    case "GET":
      return "border-emerald-200 bg-emerald-50 text-emerald-800";
    case "DELETE":
      return "border-rose-200 bg-rose-50 text-rose-800";
    default:
      return "border-sky-200 bg-sky-50 text-sky-800";
  }
}

function buildCurlExample(spec: ApiEndpointSpec): string | null {
  if (spec.method === "GET") {
    return `curl -sS "${absoluteApiUrl(spec.path)}"`;
  }
  if (!spec.requestExample) return null;

  const headers = ['-H "Content-Type: application/json"'];
  if (spec.auth === "bearer-cron") {
    headers.push('-H "Authorization: Bearer $CACHE_REVALIDATE_SECRET"');
  }
  if (spec.auth === "bearer-media") {
    headers.push('-H "Authorization: Bearer $MEDIA_INGEST_TOKEN"');
  }

  const body = JSON.stringify(spec.requestExample, null, 2);
  return [
    `curl -sS -X ${spec.method} "${absoluteApiUrl(spec.path)}" \\`,
    ...headers.map((h) => `  ${h} \\`),
    `  -d '${body.replace(/'/g, "'\\''")}'`,
  ].join("\n");
}

export function ApiEndpointCard({ spec }: { spec: ApiEndpointSpec }) {
  const curl = buildCurlExample(spec);
  const authGuide = API_AUTH_GUIDE[spec.auth];

  return (
    <article
      id={spec.id}
      className="scroll-mt-24 rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6"
    >
      <div className="flex flex-wrap items-start gap-2">
        <span
          className={`inline-flex rounded-md border px-2 py-0.5 font-mono text-xs font-semibold ${methodBadgeClass(spec.method)}`}
        >
          {spec.method}
        </span>
        <code className="break-all font-mono text-sm text-foreground">{spec.path}</code>
        <Badge variant="secondary" className="ml-auto">
          {AUDIENCE_LABEL[spec.audience]}
        </Badge>
      </div>

      <h3 className="mt-3 text-base font-semibold text-foreground">{spec.title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{spec.summary}</p>

      <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="font-medium text-foreground">Xác thực</dt>
          <dd className="text-muted-foreground">{authGuide.label}</dd>
        </div>
        {spec.rateLimit ? (
          <div>
            <dt className="font-medium text-foreground">Giới hạn</dt>
            <dd className="text-muted-foreground">{spec.rateLimit}</dd>
          </div>
        ) : null}
      </dl>

      {spec.notes?.length ? (
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          {spec.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      ) : null}

      {spec.requestExample ? (
        <div className="mt-4">
          <p className="mb-2 text-sm font-medium text-foreground">Ví dụ request</p>
          <CopyableCode code={JSON.stringify(spec.requestExample, null, 2)} />
        </div>
      ) : null}

      {spec.responseExample ? (
        <div className="mt-4">
          <p className="mb-2 text-sm font-medium text-foreground">Ví dụ response</p>
          <CopyableCode code={JSON.stringify(spec.responseExample, null, 2)} />
        </div>
      ) : null}

      {curl ? (
        <div className="mt-4">
          <p className="mb-2 text-sm font-medium text-foreground">cURL</p>
          <CopyableCode code={curl} />
        </div>
      ) : null}
    </article>
  );
}
