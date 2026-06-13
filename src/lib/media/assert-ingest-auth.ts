import { ApiError } from "@/lib/api/errors";
import { hasPermission } from "@/lib/auth/permissions";
import { getSessionUser, type AuthUser } from "@/lib/auth/session";
import type { MediaWorkerEnv } from "@/lib/media/media-bucket";
import { verifyBearerToken } from "@/lib/security/timing-safe-equal";

export type MediaIngestAuthResult = {
  user: AuthUser | null;
  viaBearer: boolean;
};

/**
 * CMS session (media:write) hoặc Bearer MEDIA_INGEST_TOKEN (automation/CI).
 * UI admin dùng cookie session — không cần dán token.
 */
export async function assertMediaIngestAuthorized(
  req: Request,
  env: MediaWorkerEnv,
): Promise<MediaIngestAuthResult> {
  const user = await getSessionUser();
  if (user && hasPermission(user.role, "media:write")) {
    return { user, viaBearer: false };
  }

  const expected = env.MEDIA_INGEST_TOKEN?.trim();
  if (expected && verifyBearerToken(req.headers.get("authorization"), expected)) {
    return { user: null, viaBearer: true };
  }

  if (user) {
    throw ApiError.forbidden("Không có quyền media:write.");
  }

  throw ApiError.unauthorized(
    "Cần đăng nhập CMS (media:write) hoặc Bearer MEDIA_INGEST_TOKEN.",
  );
}
