import { Lock } from "lucide-react";

export function PrivacyNotice() {
  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6">
      <div className="flex gap-4 rounded-2xl border border-slate-200 bg-slate-50/95 p-5 shadow-sm sm:p-6">
        <Lock className="mt-0.5 h-6 w-6 shrink-0 text-slate-700" aria-hidden />
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-slate-900 sm:text-lg">Quyền riêng tư</h2>
          <p className="mt-2 text-pretty text-sm leading-relaxed text-slate-700">
            Không nên nhập thông tin quá nhạy cảm như mã số BHXH, CCCD, hồ sơ bệnh án chi tiết hoặc dữ liệu
            lương cá nhân nếu không cần thiết. Các câu hỏi dùng để cải thiện hỏi đáp nên được xử lý ẩn danh
            theo quy định nội bộ.
          </p>
        </div>
      </div>
    </section>
  );
}
