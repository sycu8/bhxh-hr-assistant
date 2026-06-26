import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { requireEmployeeUser } from "@/lib/auth/employee-session";
import {
  DOCUMENT_TYPE_LABELS,
  listDocumentRequestsForUser,
} from "@/lib/services/document-request.service";
import { submitDocumentRequestAction } from "@/app/(employee)/actions";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Yêu cầu giấy tờ" };

export default async function DocumentRequestsPage() {
  const user = await requireEmployeeUser();
  const requests = await listDocumentRequestsForUser(user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Yêu cầu giấy tờ</h1>
        <p className="text-sm text-muted-foreground">
          Xác nhận công tác, thu nhập hoặc bảo hiểm — HR/C&amp;B xử lý theo quy
          trình.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tạo yêu cầu mới</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={submitDocumentRequestAction} className="grid gap-4 sm:max-w-md">
            <div className="space-y-2">
              <label htmlFor="type" className="text-sm font-medium">
                Loại giấy tờ
              </label>
              <select
                id="type"
                name="type"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                required
              >
                {Object.entries(DOCUMENT_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="purpose" className="text-sm font-medium">
                Mục đích sử dụng
              </label>
              <textarea
                id="purpose"
                name="purpose"
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Ví dụ: Làm thủ tục vay ngân hàng"
              />
            </div>
            <Button type="submit">Gửi yêu cầu</Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Yêu cầu đã gửi</h2>
        {requests.length === 0 ? (
          <p className="text-sm text-muted-foreground">Chưa có yêu cầu nào.</p>
        ) : (
          requests.map((req) => (
            <Card key={req.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-2 py-4">
                <div>
                  <p className="font-medium">
                    {DOCUMENT_TYPE_LABELS[req.type]}
                  </p>
                  {req.purpose ? (
                    <p className="text-sm text-muted-foreground">{req.purpose}</p>
                  ) : null}
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
