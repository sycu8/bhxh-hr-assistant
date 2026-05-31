"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type IngestResult = {
  assets?: Array<{
    key: string;
    publicPath: string;
    bytes: number;
    contentType: string;
    title?: string;
  }>;
};

export function MediaIngestTool() {
  const [token, setToken] = useState("");
  const [mode, setMode] = useState<"search" | "generate" | "url">("search");
  const [query, setQuery] = useState("office teamwork vietnam");
  const [prompt, setPrompt] = useState(
    "Flat illustration of people discussing insurance, minimal blue palette, no text",
  );
  const [sourceUrl, setSourceUrl] = useState("");
  const [maxWidth, setMaxWidth] = useState("1280");
  const [limit, setLimit] = useState("2");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<IngestResult | null>(null);

  async function runIngest() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const body: Record<string, unknown> = {
        mode,
        maxWidth: Number(maxWidth) || 1280,
        limit: Number(limit) || 2,
      };
      if (mode === "search") body.query = query;
      if (mode === "generate") body.prompt = prompt;
      if (mode === "url") body.sourceUrl = sourceUrl || undefined;

      const res = await fetch("/api/media/ingest", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${token.trim()}`,
        },
        body: JSON.stringify(body),
      });
      const json = (await res.json()) as {
        success?: boolean;
        data?: IngestResult;
        error?: { message?: string };
      };
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message ?? `HTTP ${res.status}`);
      }
      setResult((json.data as IngestResult | undefined) ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lỗi không xác định");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle className="text-base">Ảnh trên R2 — tìm hoặc tạo</CardTitle>
        <CardDescription className="text-pretty leading-relaxed">
          Cần biến môi trường{" "}
          <code className="rounded bg-muted px-1 text-xs">MEDIA_INGEST_TOKEN</code>, bucket{" "}
          <code className="rounded bg-muted px-1 text-xs">MEDIA_BUCKET</code>, và{" "}
          <code className="rounded bg-muted px-1 text-xs">UNSPLASH_ACCESS_KEY</code> hoặc{" "}
          <code className="rounded bg-muted px-1 text-xs">OPENAI_API_KEY</code>.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="ingest-token" className="text-sm font-medium">
            Mã Bearer (token)
          </label>
          <Input
            id="ingest-token"
            type="password"
            autoComplete="off"
            placeholder="Dán MEDIA_INGEST_TOKEN"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="min-h-11 text-base sm:text-sm"
          />
        </div>
        <div className="space-y-2">
          <span className="text-sm font-medium">Chế độ</span>
          <select
            className="flex h-11 min-h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-base sm:h-10 sm:min-h-10 sm:text-sm"
            value={mode}
            onChange={(e) => setMode(e.target.value as typeof mode)}
          >
            <option value="search">Tìm ảnh (Unsplash)</option>
            <option value="generate">Sinh ảnh (DALL·E 3)</option>
            <option value="url">Tải từ URL</option>
          </select>
        </div>
        {mode === "search" ? (
          <div className="space-y-2">
            <label htmlFor="ingest-q" className="text-sm font-medium">
              Từ khóa tìm kiếm
            </label>
            <Input
              id="ingest-q"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="min-h-11 text-base sm:text-sm"
            />
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Số ảnh tối đa</span>
                <Input value={limit} onChange={(e) => setLimit(e.target.value)} className="min-h-11" />
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Chiều rộng tối đa (px)</span>
                <Input value={maxWidth} onChange={(e) => setMaxWidth(e.target.value)} className="min-h-11" />
              </div>
            </div>
          </div>
        ) : null}
        {mode === "generate" ? (
          <div className="space-y-2">
            <label htmlFor="ingest-prompt" className="text-sm font-medium">
              Mô tả ảnh (prompt)
            </label>
            <textarea
              id="ingest-prompt"
              className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm leading-relaxed"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>
        ) : null}
        {mode === "url" ? (
          <div className="space-y-2">
            <label htmlFor="ingest-url" className="text-sm font-medium">
              URL ảnh
            </label>
            <Input
              id="ingest-url"
              type="url"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              className="min-h-11 text-base sm:text-sm"
            />
          </div>
        ) : null}
        <Button
          type="button"
          className="w-full touch-manipulation sm:w-auto"
          disabled={loading}
          onClick={() => void runIngest()}
        >
          {loading ? "Đang xử lý…" : "Đẩy lên R2"}
        </Button>
        {error ? <p className="text-pretty text-sm text-destructive">{error}</p> : null}
        {result?.assets?.length ? (
          <div className="space-y-3 border-t border-border pt-4">
            <p className="text-sm font-medium">Đã lưu {result.assets.length} tệp</p>
            <ul className="space-y-4">
              {result.assets.map((a) => (
                <li key={a.key} className="text-sm">
                  <div className="break-all text-muted-foreground">{a.key}</div>
                  <div className="text-xs">
                    {a.bytes} byte · {a.contentType}
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={a.publicPath}
                    alt={a.title ?? "Ảnh đã nhập"}
                    className="mt-2 max-h-40 rounded-md border border-border"
                  />
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
