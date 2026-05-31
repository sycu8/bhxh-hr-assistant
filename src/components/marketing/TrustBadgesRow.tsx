import { BookMarked, HeartHandshake, Scale, ShieldCheck } from "lucide-react";

const ITEMS = [
  {
    icon: BookMarked,
    title: "Có nguồn tham chiếu",
    body: "Mỗi câu trả lời kèm trích dẫn từ kho đã duyệt.",
  },
  {
    icon: ShieldCheck,
    title: "Chỉ dùng nội dung đã duyệt",
    body: "Không tự suy diễn khi thiếu căn cứ trong hệ thống.",
  },
  {
    icon: HeartHandshake,
    title: "Dễ hiểu cho nhân viên",
    body: "Ưu tiên câu ngắn, giải thích như HR đang hỗ trợ.",
  },
  {
    icon: Scale,
    title: "Cảnh báo khi cần hỏi HR",
    body: "Case nhạy cảm hoặc độ tin cậy thấp sẽ được nhắc rõ.",
  },
] as const;

export function TrustBadgesRow() {
  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="flex gap-3 rounded-2xl border border-border/80 bg-card/80 p-4 shadow-sm backdrop-blur-sm"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-900">
                <Icon className="h-5 w-5" aria-hidden />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">{item.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.body}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
