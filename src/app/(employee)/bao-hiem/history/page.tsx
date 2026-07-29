import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireEmployeeUser } from "@/lib/auth/employee-session";
import { listInsuranceHistoryForUser } from "@/lib/services/insurance-history.service";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Lịch sử tham gia bảo hiểm" };

export default async function InsuranceHistoryPage() {
  const user = await requireEmployeeUser();
  const periods = await listInsuranceHistoryForUser(user.id);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/bao-hiem" className="text-sm text-primary hover:underline">
          ← Khu vực Bảo hiểm
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">
          Lịch sử tham gia BHXH/BHYT/BHTN
        </h1>
        <p className="text-sm text-muted-foreground">
          Dữ liệu đồng bộ từ HRIS — tham khảo cùng kho kiến thức pháp luật.
        </p>
      </div>

      {periods.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Chưa có dữ liệu tham gia. Vui lòng liên hệ HR/C&amp;B.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {periods.map((p) => (
            <Card key={p.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{p.insuranceType}</CardTitle>
                <CardDescription>{p.employerName ?? "FPT Telecom"}</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Từ{" "}
                {new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" }).format(
                  p.startDate,
                )}
                {p.endDate
                  ? ` đến ${new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" }).format(p.endDate)}`
                  : " — hiện tại"}
                {p.salaryBase
                  ? ` · Mức đóng: ${new Intl.NumberFormat("vi-VN").format(p.salaryBase)} đ`
                  : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
