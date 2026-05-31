import type { Metadata } from "next";
import {
  EMPLOYEE_TOOL_GROUPS,
  EMPLOYEE_TOOLS_SECTION_TITLE,
} from "@/lib/navigation/employee-tools";
import { EmployeeToolsGrid } from "@/components/employee-tools/employee-tools-grid";

export const metadata: Metadata = {
  title: EMPLOYEE_TOOLS_SECTION_TITLE,
  description:
    "Tính lương, tra cứu FAQ, quyền lợi BHXH và hỏi HR — các công cụ nhân viên hay dùng.",
};

export default function CalculatorsHubPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <header className="mb-8 max-w-2xl">
        <h1 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
          {EMPLOYEE_TOOLS_SECTION_TITLE}
        </h1>
        <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
          Gom các tiện ích HR mà nhân viên thường dùng: tính lương, tra cứu căn cứ, xem chế độ
          và gửi câu hỏi khi cần xác nhận riêng. Kết quả tính toán mang tính minh họa.
        </p>
      </header>
      <EmployeeToolsGrid groups={EMPLOYEE_TOOL_GROUPS} />
    </div>
  );
}
