import Link from "next/link";
import { FOOTER_NAV } from "@/lib/navigation/site-nav";

const footerLinkClass =
  "inline-flex min-h-11 items-center rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground underline-offset-4 touch-manipulation hover:bg-muted/60 hover:text-foreground hover:underline";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-muted/30 py-8">
      <nav
        aria-label="Liên kết phụ"
        className="mx-auto flex max-w-2xl flex-wrap justify-center gap-x-1 gap-y-1 px-4"
      >
        {FOOTER_NAV.map((item) => (
          <Link key={item.href} href={item.href} className={footerLinkClass}>
            {item.label}
          </Link>
        ))}
      </nav>
      <p className="mx-auto mt-4 max-w-2xl text-pretty px-4 text-center text-sm leading-relaxed text-muted-foreground">
        Nội dung hỗ trợ tra cứu nội bộ, không thay thế tư vấn pháp lý hay quyết định
        chính thức của HR/C&amp;B. Khi câu trả lời thiếu căn cứ hoặc phụ thuộc hồ sơ
        cá nhân, hãy chuyển sang bước Hỏi HR.
      </p>
      <p className="mx-auto mt-3 px-4 text-center text-sm text-muted-foreground">
        Created by{" "}
        <Link
          href="https://www.linkedin.com/in/sycule/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center rounded-lg px-2 font-medium text-foreground underline-offset-4 touch-manipulation hover:underline"
        >
          Lê Sỹ Cường
        </Link>
      </p>
    </footer>
  );
}
