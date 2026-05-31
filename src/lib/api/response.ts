import { ZodError } from "zod";
import { ApiError } from "./errors";

export function withApiHandler(
  fn: (req: Request) => Promise<Response>,
): (req: Request) => Promise<Response> {
  return async (req: Request) => {
    try {
      return await fn(req);
    } catch (e) {
      if (e instanceof ZodError) return failFromZod(e);
      if (e instanceof ApiError) return failFromApiError(e);
      console.error(e);
      return failInternal();
    }
  };
}

export type ApiSuccessEnvelope<T> = {
  success: true;
  data: T;
};

export type ApiErrorBody = {
  code: string;
  message: string;
  details?: unknown;
};

export type ApiErrorEnvelope = {
  success: false;
  error: ApiErrorBody;
};

export function ok<T>(data: T, init?: ResponseInit): Response {
  const body: ApiSuccessEnvelope<T> = { success: true, data };
  return Response.json(body, { status: 200, ...init });
}

export function created<T>(data: T): Response {
  const body: ApiSuccessEnvelope<T> = { success: true, data };
  return Response.json(body, { status: 201 });
}

export function failFromZod(error: ZodError): Response {
  const body: ApiErrorEnvelope = {
    success: false,
    error: {
      code: "VALIDATION_ERROR",
      message: "Dữ liệu đầu vào không hợp lệ.",
      details: error.issues.map((i) => ({
        path: i.path.join("."),
        message: i.message,
      })),
    },
  };
  return Response.json(body, { status: 400 });
}

export function failFromApiError(error: ApiError): Response {
  const body: ApiErrorEnvelope = {
    success: false,
    error: {
      code: error.code,
      message: error.message,
      details: error.details,
    },
  };
  return Response.json(body, { status: error.status });
}

export function failInternal(message?: string): Response {
  const body: ApiErrorEnvelope = {
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: message ?? "Lỗi máy chủ nội bộ.",
    },
  };
  return Response.json(body, { status: 500 });
}

export async function parseJsonBody<T>(req: Request): Promise<T | null> {
  const text = await req.text();
  if (!text || text.trim() === "") return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    throw ApiError.badRequest("JSON không hợp lệ.");
  }
}
