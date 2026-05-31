import Link from "next/link";
import { FOOTER_NAV } from "@/lib/navigation/site-nav";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-muted/30 py-8">
      <nav
        aria-label="Liên kết phụ"
        className="mx-auto flex max-w-2xl flex-wrap justify-center gap-x-4 gap-y-2 px-4 text-xs font-medium"
      >
        {FOOTER_NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <p className="mx-auto mt-4 max-w-2xl text-pretty px-4 text-center text-xs leading-relaxed text-muted-foreground">
        Nội dung hỗ trợ tra cứu nội bộ, không thay thế tư vấn pháp lý hay quyết định
        chính thức của HR/C&amp;B. Khi câu trả lời thiếu căn cứ hoặc phụ thuộc hồ sơ
        cá nhân, hãy chuyển sang bước Hỏi HR.
      </p>
      <p className="mx-auto mt-3 px-4 text-center text-xs text-muted-foreground">
        Created by{" "}
        <Link
          href="https://www.linkedin.com/in/sycule/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Lê Sỹ Cường
        </Link>
      </p>
    </footer>
  );
}
