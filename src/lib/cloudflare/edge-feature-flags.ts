import { tryGetCloudflareEnv } from "@/lib/cloudflare/worker-env";

export type EdgeFeatureFlags = {
  /** Nội dung hiển thị trên banner vàng toàn site; rỗng = ẩn. */
  maintenanceBannerVi: string;
  /** Khi true: POST /api/search trả thông báo giảm tải, không gọi DB/AI. */
  searchDegraded: boolean;
};

const DEFAULT_FLAGS: EdgeFeatureFlags = {
  maintenanceBannerVi: "",
  searchDegraded: false,
};

export async function getEdgeFeatureFlags(): Promise<EdgeFeatureFlags> {
  const env = tryGetCloudflareEnv();
  const d1 = env?.APP_CONFIG_D1 as
    | {
        prepare(q: string): {
          all<T>(): Promise<{ results: T[] }>;
        };
      }
    | undefined;

  if (!d1) {
    return { ...DEFAULT_FLAGS };
  }

  try {
    const r = await d1
      .prepare(
        "select key, value from app_config where key in ('maintenance_banner_vi', 'search_degraded')",
      )
      .all<{ key: string; value: string }>();
    const rows = r.results ?? [];
    const map = new Map(rows.map((row) => [row.key, row.value]));
    return {
      maintenanceBannerVi: (map.get("maintenance_banner_vi") ?? "").trim(),
      searchDegraded: map.get("search_degraded") === "1",
    };
  } catch {
    return { ...DEFAULT_FLAGS };
  }
}
