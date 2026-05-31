import { SalaryTaxTool } from "@/components/calculators/salary-tax-tool";
import { parseCalculatorMode } from "@/lib/calculators/salary-tax-modes";

export const metadata = {
  title: "Tính lương",
  description:
    "Tính lương gộp sang thực nhận, thực nhận sang gộp và bảng chi tiết bảo hiểm, thuế TNCN cho nhân viên.",
};

type Props = {
  searchParams?: Promise<{ mode?: string }>;
};

export default async function SalaryTaxToolsPage({ searchParams }: Props) {
  const params = await searchParams;
  const initialMode = parseCalculatorMode(params?.mode);

  return <SalaryTaxTool initialMode={initialMode} />;
}
