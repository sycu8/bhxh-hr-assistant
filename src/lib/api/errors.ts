export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "CONFLICT"
  | "SERVICE_UNAVAILABLE"
  | "INTERNAL_ERROR";

export class ApiError extends Error {
  readonly status: number;
  readonly code: ApiErrorCode;
  readonly details?: unknown;

  constructor(
    status: number,
    code: ApiErrorCode,
    message: string,
    details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }

  static badRequest(message: string, details?: unknown) {
    return new ApiError(400, "VALIDATION_ERROR", message, details);
  }

  static notFound(message = "Không tìm thấy tài nguyên.") {
    return new ApiError(404, "NOT_FOUND", message);
  }

  static forbidden(message = "Không có quyền thực hiện thao tác này.") {
    return new ApiError(403, "FORBIDDEN", message);
  }

  static unauthorized(message = "Chưa xác thực.") {
    return new ApiError(401, "UNAUTHORIZED", message);
  }

  static serviceUnavailable(message: string) {
    return new ApiError(503, "SERVICE_UNAVAILABLE", message);
  }

  static internal(message = "Lỗi máy chủ nội bộ.") {
    return new ApiError(500, "INTERNAL_ERROR", message);
  }
}
