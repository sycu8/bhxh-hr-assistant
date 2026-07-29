"use client";

import { useState } from "react";
import { importMicrosoftCsvAction } from "@/app/hr/employees/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function MicrosoftImportForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Import từ Microsoft 365</CardTitle>
        <CardDescription>
          Export danh sách Users (CSV) từ Microsoft 365 Admin hoặc Entra ID, rồi
          tải lên đây. Cần cột{" "}
          <strong>User principal name</strong> (email) và{" "}
          <strong>Display name</strong>.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="flex flex-col gap-3 sm:flex-row sm:items-end"
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);
            setMessage(null);
            setWarnings([]);
            try {
              const formData = new FormData(e.currentTarget);
              const result = await importMicrosoftCsvAction(formData);
              if (result.ok) {
                setMessage(result.message);
                setWarnings(result.warnings ?? []);
                e.currentTarget.reset();
              } else {
                setMessage(result.message);
              }
            } catch (err) {
              setMessage(
                err instanceof Error ? err.message : "Import thất bại.",
              );
            } finally {
              setLoading(false);
            }
          }}
        >
          <div className="flex-1 space-y-2">
            <label htmlFor="ms-csv" className="text-sm font-medium">
              File CSV
            </label>
            <input
              id="ms-csv"
              name="file"
              type="file"
              accept=".csv,text/csv"
              required
              className="block w-full text-sm"
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Đang import…" : "Import nhân viên"}
          </Button>
        </form>
        {message ? (
          <p className="mt-3 text-sm text-muted-foreground" role="status">
            {message}
          </p>
        ) : null}
        {warnings.length > 0 ? (
          <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-amber-700">
            {warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        ) : null}
      </CardContent>
    </Card>
  );
}
