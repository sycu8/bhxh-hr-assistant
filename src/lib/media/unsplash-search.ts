import { ApiError } from "@/lib/api/errors";

type UnsplashResult = {
  id: string;
  urls: { regular?: string; full?: string; raw?: string };
  description?: string | null;
  alt_description?: string | null;
};

type UnsplashSearchResponse = {
  results: UnsplashResult[];
};

export async function unsplashSearchPhotoUrls(
  accessKey: string,
  query: string,
  perPage: number,
): Promise<Array<{ downloadUrl: string; title: string; id: string }>> {
  const q = encodeURIComponent(query.trim());
  const res = await fetch(
    `https://api.unsplash.com/search/photos?query=${q}&per_page=${perPage}&orientation=landscape`,
    {
      headers: {
        Authorization: `Client-ID ${accessKey}`,
        "Accept-Version": "v1",
      },
    },
  );
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw ApiError.serviceUnavailable(
      `Unsplash API lỗi (${res.status}). ${t.slice(0, 120)}`,
    );
  }
  const data = (await res.json()) as UnsplashSearchResponse;
  return (data.results ?? []).map((r) => ({
    id: r.id,
    downloadUrl: r.urls.regular ?? r.urls.full ?? r.urls.raw ?? "",
    title: (r.description || r.alt_description || "Unsplash").slice(0, 200),
  }));
}
