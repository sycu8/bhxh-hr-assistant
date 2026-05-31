import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MediaIngestTool } from "@/components/admin/media-ingest-tool";
import { getAdminDashboardData } from "@/lib/db/admin-queries";
import { FileWarning, HelpCircle, Library, MessageSquareText } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Quản trị",
  description: "Tổng quan tài liệu và câu hỏi cần HR/C&B xử lý.",
};

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(d);
}

export default async function AdminDashboardPage() {
  const { metrics, pendingDocuments, hrReviewQuestions } =
    await getAdminDashboardData();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Bảng điều khiển
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Theo dõi kho kiến thức và các câu hỏi cần HR/C&amp;B rà soát.
        </p>
      </div>

      <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              FAQ đã duyệt
            </CardTitle>
            <Library className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tabular-nums">
              {metrics.approvedFaqs}
            </p>
            <p className="text-xs text-muted-foreground">
              Trong kho tra cứu (FAQ đã duyệt)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tài liệu chờ duyệt
            </CardTitle>
            <FileWarning className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tabular-nums">
              {metrics.pendingDocuments}
            </p>
            <p className="text-xs text-muted-foreground">Chờ phê duyệt tài liệu</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cần HR (7 ngày)
            </CardTitle>
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tabular-nums">
              {metrics.hrReviewQuestions7d}
            </p>
            <p className="text-xs text-muted-foreground">
              Đánh dấu cần HR rà soát (needsHrReview)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Lượt hỏi (30 ngày)
            </CardTitle>
            <MessageSquareText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tabular-nums">
              {metrics.totalQuestionLogs30d}
            </p>
            <p className="text-xs text-muted-foreground">Nhật ký câu hỏi (30 ngày)</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle className="text-base">Câu hỏi cần HR/C&amp;B</CardTitle>
            <CardDescription>
              Các truy vấn được đánh dấu cần rà soát (độ tin cậy thấp/trung bình
              hoặc ngữ cảnh nhạy cảm).
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0 sm:px-6">
            {hrReviewQuestions.length === 0 ? (
              <p className="px-6 pb-6 text-sm text-muted-foreground">
                Không có bản ghi. Dữ liệu sẽ hiện sau khi nhân viên dùng tra cứu.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%]">Câu hỏi</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Tóm tắt trả lời
                    </TableHead>
                    <TableHead className="text-right">Thời điểm</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {hrReviewQuestions.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="align-top font-medium">
                        {row.question}
                      </TableCell>
                      <TableCell className="hidden max-w-xs align-top text-muted-foreground sm:table-cell">
                        <span className="line-clamp-2 text-xs">
                          {row.answer ?? "—"}
                        </span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-right text-xs text-muted-foreground">
                        {formatDate(row.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardHeader>
            <CardTitle className="text-base">Tài liệu chờ duyệt</CardTitle>
            <CardDescription>
              Chỉ tài liệu trạng thái &quot;Chờ duyệt&quot; mới hiển thị ở đây.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0 sm:px-6">
            {pendingDocuments.length === 0 ? (
              <p className="px-6 pb-6 text-sm text-muted-foreground">
                Không có tài liệu chờ duyệt.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tiêu đề</TableHead>
                    <TableHead className="hidden md:table-cell">Tệp</TableHead>
                    <TableHead className="text-right">Cập nhật</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingDocuments.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col gap-1">
                          <span>{doc.title}</span>
                          <Badge variant="outline" className="w-fit md:hidden">
                            Chờ duyệt
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="hidden max-w-[180px] truncate text-muted-foreground md:table-cell">
                        {doc.fileName ?? "—"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-right text-xs text-muted-foreground">
                        {formatDate(doc.updatedAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 w-full lg:col-span-2 lg:mt-0">
          <MediaIngestTool />
        </div>
      </div>
    </div>
  );
}
