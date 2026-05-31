import { AlertTriangle } from "lucide-react";

export function SafetyNotice() {
  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6">
      <div className="flex gap-4 rounded-2xl border border-amber-200/90 bg-amber-50/90 p-5 shadow-sm sm:p-6">
        <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0 text-amber-700" aria-hidden />
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-amber-950 sm:text-lg">Lưu ý khi tra cứu bảo hiểm</h2>
          <p className="mt-2 text-pretty text-sm leading-relaxed text-amber-950/90">
            Thông tin trên hệ thống được tổng hợp từ các tài liệu và nguồn đã được duyệt. Với các trường hợp
            phụ thuộc vào hồ sơ cá nhân như mức lương đóng bảo hiểm, thời gian tham gia, ngày nghỉ việc, nghỉ
            không lương, thai sản hoặc hồ sơ bệnh án, bạn nên liên hệ HR/C&B để được xác nhận chính xác.
          </p>
        </div>
      </div>
    </section>
  );
}
