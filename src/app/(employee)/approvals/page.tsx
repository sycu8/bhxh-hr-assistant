import { ApprovalDecision } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireEmployeePermission } from "@/lib/auth/employee-session";
import { listPendingApprovalsForUser } from "@/lib/services/approval.service";
import { decideApprovalAction } from "@/app/(employee)/actions";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Phê duyệt" };

export default async function ApprovalsPage() {
  const user = await requireEmployeePermission("approval:read:team");
  const pending = await listPendingApprovalsForUser(user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Hộp thư phê duyệt</h1>
        <p className="text-sm text-muted-foreground">
          Các yêu cầu nghỉ phép và giấy tờ chờ bạn xử lý.
        </p>
      </div>

      {pending.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Không có yêu cầu chờ phê duyệt.
          </CardContent>
        </Card>
      ) : (
        pending.map((item) => (
          <Card key={item.stepId}>
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="text-base">
                  {item.templateCode === "leave_request"
                    ? "Đăng ký nghỉ phép"
                    : "Yêu cầu giấy tờ"}
                </CardTitle>
                <Badge variant="outline">Chờ duyệt</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Người gửi: {item.requester.name} ({item.requester.email})
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {item.leaveRequest ? (
                <div className="text-sm">
                  <p>
                    <strong>{item.leaveRequest.leaveType.name}</strong>:{" "}
                    {new Intl.DateTimeFormat("vi-VN").format(
                      item.leaveRequest.startDate,
                    )}{" "}
                    →{" "}
                    {new Intl.DateTimeFormat("vi-VN").format(
                      item.leaveRequest.endDate,
                    )}{" "}
                    ({item.leaveRequest.totalDays} ngày)
                  </p>
                  {item.leaveRequest.reason ? (
                    <p className="text-muted-foreground">
                      {item.leaveRequest.reason}
                    </p>
                  ) : null}
                </div>
              ) : null}
              {item.documentRequest ? (
                <p className="text-sm">
                  Loại: {item.documentRequest.type} —{" "}
                  {item.documentRequest.purpose ?? "Không ghi mục đích"}
                </p>
              ) : null}
              <div className="flex flex-wrap gap-2">
                <form action={decideApprovalAction}>
                  <input type="hidden" name="stepId" value={item.stepId} />
                  <input
                    type="hidden"
                    name="decision"
                    value={ApprovalDecision.APPROVED}
                  />
                  <Button type="submit" size="sm">
                    Duyệt
                  </Button>
                </form>
                <form action={decideApprovalAction} className="flex gap-2">
                  <input type="hidden" name="stepId" value={item.stepId} />
                  <input
                    type="hidden"
                    name="decision"
                    value={ApprovalDecision.REJECTED}
                  />
                  <input
                    name="comment"
                    placeholder="Lý do từ chối (tuỳ chọn)"
                    className="h-9 rounded-md border px-2 text-sm"
                  />
                  <Button type="submit" size="sm" variant="outline">
                    Từ chối
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
