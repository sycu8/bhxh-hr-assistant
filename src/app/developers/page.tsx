import Link from "next/link";
import { ApiEndpointCard } from "@/components/developers/api-endpoint-card";
import { CopyableCode } from "@/components/developers/copyable-code";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  API_AUTH_GUIDE,
  API_ENDPOINTS,
  API_RESPONSE_ENVELOPE,
  absoluteApiUrl,
  getApiBaseUrl,
  groupEndpointsByAudience,
} from "@/lib/api/api-catalog";

export const metadata = {
  title: "API & tích hợp",
  description:
    "Tài liệu REST API cho tra cứu bảo hiểm, ticket HR, đăng nhập nhân viên và automation nội bộ.",
};

const SECTIONS: {
  key: keyof ReturnType<typeof groupEndpointsByAudience>;
  title: string;
  description: string;
}[] = [
  {
    key: "public",
    title: "API công khai",
    description:
      "Tra cứu, calculator và ticket HR. Một số endpoint yêu cầu Cloudflare Turnstile.",
  },
  {
    key: "employee",
    title: "Đăng nhập nhân viên",
    description: "OTP qua email công ty; session cookie cho Cổng HR.",
  },
  {
    key: "hr",
    title: "CMS / quản trị",
    description: "Đăng nhập HR/Admin cho thao tác quản trị có session.",
  },
  {
    key: "automation",
    title: "Automation & cron",
    description:
      "Job nội bộ (HRIS sync, crawl, cache). Chỉ gọi từ Worker cron hoặc CI có secret.",
  },
];

export default function DevelopersPage() {
  const grouped = groupEndpointsByAudience();
  const baseUrl = getApiBaseUrl();
  const openApiUrl = absoluteApiUrl("/api/openapi.json");

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="max-w-3xl">
        <p className="text-sm font-medium text-muted-foreground">Nhà phát triển</p>
        <h1 className="mt-1 text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          API &amp; tích hợp
        </h1>
        <p className="mt-2 max-w-prose text-pretty text-sm leading-relaxed text-muted-foreground">
          Tài liệu cho công cụ nội bộ, chatbot, HRIS và automation kết nối Cổng HR FPT
          Telecom. Mọi phản hồi JSON dùng envelope chuẩn; import OpenAPI vào Postman hoặc
          Insomnia để thử nhanh.
        </p>
      </header>

      <Alert className="mt-6 border-sky-100 bg-sky-50/60">
        <AlertTitle>Base URL</AlertTitle>
        <AlertDescription className="space-y-3 text-sm leading-relaxed">
          <p>
            Môi trường hiện tại:{" "}
            <code className="rounded bg-background/80 px-1.5 py-0.5 font-mono text-xs">
              {baseUrl}
            </code>
          </p>
          <p>
            OpenAPI 3.1:{" "}
            <Link
              href="/api/openapi.json"
              className="font-medium text-foreground underline-offset-4 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {openApiUrl}
            </Link>
          </p>
        </AlertDescription>
      </Alert>

      <section className="mt-8" aria-labelledby="auth-heading">
        <h2 id="auth-heading" className="text-lg font-semibold text-foreground">
          Xác thực
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Chọn cơ chế phù hợp với loại tích hợp. Không gửi secret qua query string.
        </p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {Object.entries(API_AUTH_GUIDE).map(([kind, guide]) => (
            <li
              key={kind}
              className="rounded-lg border border-border bg-muted/20 p-4 text-sm"
            >
              <p className="font-medium text-foreground">{guide.label}</p>
              <p className="mt-1 leading-relaxed text-muted-foreground">
                {guide.description}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10" aria-labelledby="envelope-heading">
        <h2 id="envelope-heading" className="text-lg font-semibold text-foreground">
          Định dạng phản hồi
        </h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-medium text-foreground">Thành công</p>
            <CopyableCode code={JSON.stringify(API_RESPONSE_ENVELOPE.success, null, 2)} />
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-foreground">Lỗi</p>
            <CopyableCode code={JSON.stringify(API_RESPONSE_ENVELOPE.error, null, 2)} />
          </div>
        </div>
      </section>

      {SECTIONS.map((section) => {
        const endpoints = grouped[section.key].filter((ep) => ep.id !== "openapi");
        if (endpoints.length === 0) return null;

        return (
          <section key={section.key} className="mt-12" aria-labelledby={`${section.key}-heading`}>
            <h2
              id={`${section.key}-heading`}
              className="text-lg font-semibold text-foreground"
            >
              {section.title}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{section.description}</p>
            <nav className="mt-3 flex flex-wrap gap-2" aria-label={`Mục lục ${section.title}`}>
              {endpoints.map((ep) => (
                <a
                  key={ep.id}
                  href={`#${ep.id}`}
                  className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  {ep.method} {ep.path}
                </a>
              ))}
            </nav>
            <div className="mt-5 grid gap-5">
              {endpoints.map((ep) => (
                <ApiEndpointCard key={ep.id} spec={ep} />
              ))}
            </div>
          </section>
        );
      })}

      <section className="mt-12 rounded-xl border border-border bg-muted/20 p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-foreground">Gợi ý tích hợp</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
          <li>
            <strong className="font-medium text-foreground">Calculator / payroll tool:</strong>{" "}
            dùng <code className="text-xs">POST /api/calculators/salary-tax</code> — không cần
            Turnstile.
          </li>
          <li>
            <strong className="font-medium text-foreground">Chatbot nội bộ:</strong>{" "}
            <code className="text-xs">POST /api/search</code> với Turnstile invisible hoặc
            server-side token từ domain được phép.
          </li>
          <li>
            <strong className="font-medium text-foreground">HRIS / cron:</strong> Bearer{" "}
            <code className="text-xs">CACHE_REVALIDATE_SECRET</code> cho{" "}
            <code className="text-xs">/api/cron/*</code> và revalidate cache.
          </li>
          <li>
            Tổng cộng {API_ENDPOINTS.length} endpoint được liệt kê — cập nhật từ{" "}
            <code className="text-xs">src/lib/api/api-catalog.ts</code>.
          </li>
        </ul>
      </section>
    </div>
  );
}
