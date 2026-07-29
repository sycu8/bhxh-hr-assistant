import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireEmployeeUser } from "@/lib/auth/employee-session";
import { listPayslipsForUser } from "@/lib/services/payslip.service";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Phiếu lương" };

function formatMoney(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function PayslipsPage() {
  const user = await requireEmployeeUser();
  let payslips: Awaited<ReturnType<typeof listPayslipsForUser>> = [];
  let loadError: string | null = null;
  try {
    payslips = await listPayslipsForUser(user.id);
  } catch {
    loadError =
      "Không tải được phiếu lương. HRIS hoặc cơ sở dữ liệu có thể chưa được cập nhật — vui lòng thử lại sau hoặc liên hệ HR.";
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Phiếu lương</h1>
        <p className="text-sm text-muted-foreground">
          Dữ liệu đồng bộ từ hệ thống lương — chỉ bạn mới xem được.
        </p>
      </div>

      {loadError ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            {loadError}
          </CardContent>
        </Card>
      ) : payslips.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Chưa có phiếu lương. HRIS sẽ đồng bộ định kỳ.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {payslips.map((p) => (
            <Link key={p.id} href={`/pay/payslips/${p.period}`}>
              <Card className="transition-colors hover:bg-muted/30">
                <CardHeader>
                  <CardTitle className="text-base">
                    Kỳ lương {p.period}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  <p>Gross: {formatMoney(p.grossAmount)}</p>
                  <p className="font-semibold text-primary">
                    Net: {formatMoney(p.netAmount)}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
