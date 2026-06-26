import { HrPageHeader } from "@/components/hr/hr-page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getEmployeeProfileByUserId,
  toPublicProfile,
} from "@/lib/services/employee-profile.service";
import { requireEmployeeUser } from "@/lib/auth/employee-session";
import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Hồ sơ của tôi",
};

function formatDate(d: Date | null | undefined) {
  if (!d) return "—";
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" }).format(d);
}

export default async function MyProfilePage() {
  const user = await requireEmployeeUser();
  const profile = await getEmployeeProfileByUserId(user.id);

  if (!profile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Hồ sơ chưa đồng bộ</CardTitle>
          <CardDescription>
            Hồ sơ nhân viên chưa có trong hệ thống. Vui lòng liên hệ HR để đồng
            bộ từ HRIS.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const publicProfile = toPublicProfile(profile);

  return (
    <div className="space-y-6">
      <HrPageHeader
        title="Hồ sơ của tôi"
        description="Thông tin đồng bộ từ hệ thống nhân sự FPT Telecom."
      />

      <Card>
        <CardHeader>
          <CardTitle>{publicProfile.name}</CardTitle>
          <CardDescription>{publicProfile.email}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs text-muted-foreground">Mã nhân viên</p>
            <p className="font-medium">{publicProfile.employeeCode}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Chức danh</p>
            <p className="font-medium">{publicProfile.jobTitle ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Phòng ban</p>
            <p className="font-medium">{publicProfile.department ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Ngày vào làm</p>
            <p className="font-medium">{formatDate(publicProfile.hireDate)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Điện thoại</p>
            <p className="font-medium">{publicProfile.phone}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Quản lý trực tiếp</p>
            <p className="font-medium">
              {publicProfile.manager?.name ?? "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Trạng thái</p>
            <Badge variant="secondary">{publicProfile.status}</Badge>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/my-hr/tickets"
          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Ticket HR của tôi
        </Link>
        <Link
          href="/my-hr/policies"
          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Chính sách công ty
        </Link>
        <Link
          href="/my-hr/documents"
          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Yêu cầu giấy tờ
        </Link>
      </div>
    </div>
  );
}
