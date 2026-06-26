import {
  API_ENDPOINTS,
  absoluteApiUrl,
  getApiBaseUrl,
  type ApiEndpointSpec,
} from "@/lib/api/api-catalog";

type OpenApiDocument = {
  openapi: string;
  info: {
    title: string;
    version: string;
    description: string;
    contact: { name: string; url: string };
  };
  servers: { url: string; description: string }[];
  tags: { name: string; description: string }[];
  paths: Record<string, Record<string, unknown>>;
  components: {
    schemas: Record<string, unknown>;
    securitySchemes: Record<string, unknown>;
    responses: Record<string, unknown>;
  };
};

const AUDIENCE_TAG: Record<ApiEndpointSpec["audience"], string> = {
  public: "Public",
  employee: "Employee Auth",
  hr: "CMS Auth",
  automation: "Automation",
};

function operationId(spec: ApiEndpointSpec): string {
  return spec.id;
}

function securityForAuth(auth: ApiEndpointSpec["auth"]) {
  switch (auth) {
    case "bearer-cron":
      return [{ CronBearer: [] }];
    case "bearer-media":
      return [{ MediaBearer: [] }];
    case "session-cms":
    case "session-employee":
      return [{ CookieAuth: [] }];
    default:
      return [];
  }
}

function buildPathItem(spec: ApiEndpointSpec) {
  const method = spec.method.toLowerCase();
  return {
    [method]: {
      operationId: operationId(spec),
      summary: spec.title,
      description: [spec.summary, spec.rateLimit ? `Rate limit: ${spec.rateLimit}` : null, ...(spec.notes ?? [])]
        .filter(Boolean)
        .join("\n\n"),
      tags: [AUDIENCE_TAG[spec.audience]],
      security: securityForAuth(spec.auth),
      requestBody:
        spec.requestContentType && spec.requestExample
          ? {
              required: true,
              content: {
                [spec.requestContentType]: {
                  schema: { type: "object" },
                  example: spec.requestExample,
                },
              },
            }
          : undefined,
      responses: {
        "200": {
          description: "Thành công",
          content: spec.responseExample
            ? {
                "application/json": {
                  example: spec.responseExample,
                },
              }
            : undefined,
        },
        "201": { description: "Đã tạo tài nguyên" },
        "400": { $ref: "#/components/responses/ValidationError" },
        "401": { $ref: "#/components/responses/Unauthorized" },
        "429": { $ref: "#/components/responses/RateLimited" },
        "500": { $ref: "#/components/responses/InternalError" },
      },
    },
  };
}

export function buildOpenApiDocument(): OpenApiDocument {
  const paths: Record<string, Record<string, unknown>> = {};

  for (const spec of API_ENDPOINTS) {
    if (spec.id === "openapi") continue;
    const existing = paths[spec.path] ?? {};
    paths[spec.path] = { ...existing, ...buildPathItem(spec) };
  }

  return {
    openapi: "3.1.0",
    info: {
      title: "Cổng HR FPT Telecom API",
      version: "1.0.0",
      description:
        "REST API cho tra cứu bảo hiểm, ticket HR, đăng nhập nhân viên/CMS và automation nội bộ. " +
        "Phản hồi JSON theo envelope `{ success, data }` hoặc `{ success: false, error }`.",
      contact: {
        name: "Cổng HR FPT Telecom",
        url: absoluteApiUrl("/developers"),
      },
    },
    servers: [
      {
        url: getApiBaseUrl(),
        description: "Production / UAT",
      },
    ],
    tags: [
      { name: "Public", description: "Tra cứu, calculator, ticket HR" },
      { name: "Employee Auth", description: "OTP login Cổng HR" },
      { name: "CMS Auth", description: "Đăng nhập quản trị" },
      { name: "Automation", description: "Cron & integration jobs" },
    ],
    paths,
    components: {
      securitySchemes: {
        CronBearer: {
          type: "http",
          scheme: "bearer",
          description: "CACHE_REVALIDATE_SECRET",
        },
        MediaBearer: {
          type: "http",
          scheme: "bearer",
          description: "MEDIA_INGEST_TOKEN (tùy chọn)",
        },
        CookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "employee_session | cms_session",
        },
      },
      schemas: {
        ApiSuccessEnvelope: {
          type: "object",
          required: ["success", "data"],
          properties: {
            success: { const: true },
            data: { type: "object" },
          },
        },
        ApiErrorEnvelope: {
          type: "object",
          required: ["success", "error"],
          properties: {
            success: { const: false },
            error: {
              type: "object",
              properties: {
                code: { type: "string" },
                message: { type: "string" },
                details: {},
              },
            },
          },
        },
      },
      responses: {
        ValidationError: {
          description: "Dữ liệu đầu vào không hợp lệ",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
            },
          },
        },
        Unauthorized: {
          description: "Chưa xác thực hoặc token không hợp lệ",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
            },
          },
        },
        RateLimited: {
          description: "Vượt giới hạn tần suất",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
            },
          },
        },
        InternalError: {
          description: "Lỗi máy chủ",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiErrorEnvelope" },
            },
          },
        },
      },
    },
  };
}
