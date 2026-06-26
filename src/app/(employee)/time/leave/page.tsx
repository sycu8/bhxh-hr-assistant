import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireEmployeeUser } from "@/lib/auth/employee-session";
import {
  listLeaveBalancesForUser,
  listLeaveRequestsForUser,
} from "@/lib/services/leave.service";
import { submitLeaveRequestAction } from "@/app/(employee)/actions";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Nghỉ phép" };

export default async function LeavePage() {
  const user = await requireEmployeeUser();
  const [balances, requests] = await Promise.all([
    listLeaveBalancesForUser(user.id),
    listLeaveRequestsForUser(user.id),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Nghỉ phép</h1>
        <p className="text-sm text-muted-foreground">
          Xem số dư và đăng ký nghỉ — quản lý trực tiếp phê duyệt.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {balances.map((b) => (
          <Card key={b.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{b.leaveType.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold tabular-nums">
                {b.remaining}
                <span className="text-sm font-normal text-muted-foreground">
                  {" "}
                  / {b.entitled} ngày
                </span>
              </p>
              <p className="text-xs text-muted-foreground">
                Đã dùng {b.used} ngày · Năm {b.year}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Đăng ký nghỉ phép</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            action={submitLeaveRequestAction}
            className="grid gap-4 sm:max-w-md"
          >
            <input type="hidden" name="leaveTypeCode" value="ANNUAL" />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="startDate" className="text-sm font-medium">
                  Từ ngày
                </label>
                <input
                  id="startDate"
                  name="startDate"
                  type="date"
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="endDate" className="text-sm font-medium">
                  Đến ngày
                </label>
                <input
                  id="endDate"
                  name="endDate"
                  type="date"
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="reason" className="text-sm font-medium">
                Lý do
              </label>
              <textarea
                id="reason"
                name="reason"
                rows={2}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <Button type="submit">Gửi đăng ký</Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Lịch sử đăng ký</h2>
        {requests.length === 0 ? (
          <p className="text-sm text-muted-foreground">Chưa có đăng ký nào.</p>
        ) : (
          requests.map((req) => (
            <Card key={req.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-2 py-4 text-sm">
                <div>
                  <p className="font-medium">{req.leaveType.name}</p>
                  <p className="text-muted-foreground">
                    {new Intl.DateTimeFormat("vi-VN").format(req.startDate)} →{" "}
                    {new Intl.DateTimeFormat("vi-VN").format(req.endDate)} (
                    {req.totalDays} ngày)
                  </p>
                </div>
                <Badge variant="outline">{req.status}</Badge>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
