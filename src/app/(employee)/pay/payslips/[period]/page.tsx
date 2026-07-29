import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireEmployeeUser } from "@/lib/auth/employee-session";
import {
  auditPayslipView,
  getPayslipForUser,
} from "@/lib/services/payslip.service";

function formatMoney(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

const CATEGORY_LABELS: Record<string, string> = {
  gross: "Thu nhập",
  allowance: "Phụ cấp",
  insurance: "Bảo hiểm",
  tax: "Thuế",
  deduction: "Khấu trừ",
};

export default async function PayslipDetailPage({
  params,
}: {
  params: Promise<{ period: string }>;
}) {
  const user = await requireEmployeeUser();
  const { period } = await params;
  const payslip = await getPayslipForUser(user.id, period);
  if (!payslip) notFound();

  await auditPayslipView(user.id, payslip.id);

  const grouped = payslip.lines.reduce<Record<string, typeof payslip.lines>>(
    (acc, line) => {
      const key = line.category;
      if (!acc[key]) acc[key] = [];
      acc[key]!.push(line);
      return acc;
    },
    {},
  );

  return (
    <div className="space-y-6">
      <Link href="/pay/payslips" className="text-sm text-primary hover:underline">
        ← Danh sách phiếu lương
      </Link>
      <div>
        <h1 className="text-2xl font-semibold">Phiếu lương {period}</h1>
        <p className="text-sm text-muted-foreground">
          Lượt xem được ghi nhận trong audit log.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tổng gross</CardTitle>
          </CardHeader>
          <CardContent className="text-xl font-semibold">
            {formatMoney(payslip.grossAmount)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Thực lĩnh</CardTitle>
          </CardHeader>
          <CardContent className="text-xl font-semibold text-primary">
            {formatMoney(payslip.netAmount)}
          </CardContent>
        </Card>
      </div>

      {Object.entries(grouped).map(([category, lines]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="text-base">
              {CATEGORY_LABELS[category] ?? category}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {lines.map((line) => (
              <div
                key={line.id}
                className="flex justify-between text-sm"
              >
                <span>{line.label}</span>
                <span className="tabular-nums font-medium">
                  {formatMoney(line.amount)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
