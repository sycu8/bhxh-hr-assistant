const STEPS = [
  { step: "1", title: "Nhập câu hỏi", body: "Gõ câu hỏi đời thường hoặc chọn gợi ý." },
  {
    step: "2",
    title: "Hệ thống tìm trong nguồn đã duyệt",
    body: "So khớp FAQ và tài liệu nội bộ đã được phê duyệt.",
  },
  { step: "3", title: "Trả lời ngắn kèm nguồn", body: "Có trích dẫn để bạn hoặc HR đối chiếu." },
  {
    step: "4",
    title: "Hỏi HR khi cần thêm",
    body: "Nếu case phụ thuộc hồ sơ, hệ thống sẽ hướng dẫn liên hệ HR/C&B.",
  },
] as const;

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6">
      <div className="mb-6 text-center sm:mb-8">
        <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          Cách thức hoạt động
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-pretty text-sm text-muted-foreground sm:text-base">
          Bốn bước đơn giản — không cần biết số điều luật vẫn tra cứu được.
        </p>
      </div>
      <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((s) => (
          <li
            key={s.step}
            className="relative rounded-2xl border border-border/80 bg-muted/25 p-5 text-left shadow-sm"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-600 text-sm font-bold text-white">
              {s.step}
            </span>
            <p className="mt-3 text-sm font-semibold text-foreground">{s.title}</p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">{s.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
