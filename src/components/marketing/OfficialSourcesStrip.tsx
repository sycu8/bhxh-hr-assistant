import Link from "next/link";
import { ExternalLink } from "lucide-react";

const SOURCES = [
  { label: "Bảo hiểm xã hội Việt Nam", href: "https://baohiemxahoi.gov.vn/" },
  { label: "Bộ Lao động - Thương binh và Xã hội", href: "https://molisa.gov.vn/" },
  { label: "Cơ sở dữ liệu văn bản pháp luật", href: "https://vbpl.vn/" },
  { label: "LuatVietnam.vn", href: "https://luatvietnam.vn/" },
  { label: "Tài liệu đã được HR/Admin duyệt trong hệ thống này", href: "/faq" },
] as const;

export function OfficialSourcesStrip() {
  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6">
      <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm sm:p-6">
        <h2 className="text-base font-semibold text-foreground sm:text-lg">Nguồn tham khảo chính thống</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Liên kết ngoài chỉ mang tính tham khảo; khi áp dụng cần đối chiếu văn bản gốc.
        </p>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {SOURCES.map((s) => (
            <li key={s.href}>
              <Link
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-sky-800 underline-offset-4 hover:underline"
              >
                <ExternalLink className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
                {s.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
