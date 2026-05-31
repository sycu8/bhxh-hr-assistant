import {
  BENEFITS_EMPLOYEE_TOOLS,
  EMPLOYEE_TOOLS_SECTION_TITLE,
  HR_CONTACT_EMPLOYEE_TOOLS,
  LOOKUP_EMPLOYEE_TOOLS,
  PAYROLL_EMPLOYEE_TOOLS,
} from "@/lib/navigation/employee-tools";
import { EmployeeToolsGrid } from "@/components/employee-tools/employee-tools-grid";

const ASK_HR_TOOL_GROUPS = [
  {
    id: "payroll",
    title: "Lương, thuế & miễn giảm",
    description: "Đối chiếu trước khi hỏi về phiếu lương hoặc mức đóng.",
    tools: PAYROLL_EMPLOYEE_TOOLS,
  },
  {
    id: "lookup-pre-hr",
    title: "Tra cứu & căn cứ",
    description: "Giúp câu hỏi gửi HR ngắn và có căn cứ hơn.",
    tools: [...LOOKUP_EMPLOYEE_TOOLS.slice(0, 3), ...HR_CONTACT_EMPLOYEE_TOOLS],
  },
  {
    id: "benefits",
    title: "Chế độ thường gặp",
    description: "Xem hướng dẫn theo chủ đề trước khi nhờ HR làm hồ sơ.",
    tools: BENEFITS_EMPLOYEE_TOOLS.slice(0, 2),
  },
];

export function AskHrToolsSection() {
  return (
    <section className="mt-10 space-y-4">
      <div className="max-w-2xl">
        <h2 className="text-lg font-semibold tracking-tight">{EMPLOYEE_TOOLS_SECTION_TITLE}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Dùng tra cứu và tính lương trước — khi vẫn cần xác nhận theo hồ sơ cá nhân, gửi form
          Hỏi HR bên dưới.
        </p>
      </div>
      <EmployeeToolsGrid groups={ASK_HR_TOOL_GROUPS} payrollAsCta />
    </section>
  );
}
