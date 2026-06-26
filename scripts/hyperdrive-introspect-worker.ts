import { Client } from "pg";
import { HR_PORTAL_SCHEMA_SQL } from "../src/lib/db/hr-portal-schema-sql";

const HRIS_SEED_SQL = `
INSERT INTO "Department" ("id", "code", "name", "createdAt", "updatedAt")
VALUES ('dept-hr', 'HR', 'Nhân sự', NOW(), NOW())
ON CONFLICT ("code") DO UPDATE SET "name" = EXCLUDED."name", "updatedAt" = NOW();

INSERT INTO "User" ("id", "name", "email", "role", "employeeGroup", "isActive", "createdAt", "updatedAt")
VALUES
  ('user-manager', 'Trần Thị B', 'manager@fpt.com', 'MANAGER', 'MANAGER', true, NOW(), NOW()),
  ('user-employee', 'Nguyễn Văn A', 'employee@fpt.com', 'EMPLOYEE', 'OFFICIAL', true, NOW(), NOW()),
  ('user-hr', 'Lê Văn C', 'hr@fpt.com', 'HR', 'OFFICIAL', true, NOW(), NOW()),
  ('user-cb', 'Phạm Thị D', 'cb@fpt.com', 'CB', 'OFFICIAL', true, NOW(), NOW())
ON CONFLICT ("email") DO UPDATE SET
  "name" = EXCLUDED."name",
  "role" = EXCLUDED."role",
  "employeeGroup" = EXCLUDED."employeeGroup",
  "isActive" = true,
  "updatedAt" = NOW();

UPDATE "User" SET "managerId" = 'user-manager' WHERE "email" = 'employee@fpt.com';

INSERT INTO "EmployeeProfile" ("id", "userId", "employeeCode", "departmentId", "jobTitle", "hireDate", "status", "phone", "hrisExternalId", "syncedAt", "createdAt", "updatedAt")
VALUES
  ('profile-manager', 'user-manager', 'FTEL-0002', 'dept-hr', 'Trưởng nhóm Nhân sự', '2019-08-01', 'ACTIVE', '0912345678', 'hris-002', NOW(), NOW(), NOW()),
  ('profile-employee', 'user-employee', 'FTEL-0001', 'dept-hr', 'Chuyên viên Nhân sự', '2022-03-15', 'ACTIVE', '0901234567', 'hris-001', NOW(), NOW(), NOW())
ON CONFLICT ("userId") DO UPDATE SET
  "employeeCode" = EXCLUDED."employeeCode",
  "departmentId" = EXCLUDED."departmentId",
  "jobTitle" = EXCLUDED."jobTitle",
  "syncedAt" = NOW(),
  "updatedAt" = NOW();

INSERT INTO "LeaveType" ("id", "code", "name", "paid", "requiresAttachment", "active")
VALUES ('leave-annual', 'ANNUAL', 'Nghỉ phép năm', true, false, true)
ON CONFLICT ("code") DO NOTHING;

INSERT INTO "CompanyPolicy" ("id", "slug", "title", "category", "body", "effectiveFrom", "status", "createdAt", "updatedAt")
VALUES
  ('policy-leave', 'nghi-phep-nam', 'Quy định nghỉ phép năm', 'Nghỉ phép', 'Nhân viên chính thức được hưởng 12 ngày nghỉ phép năm.', '2024-01-01', 'PUBLISHED', NOW(), NOW()),
  ('policy-insurance', 'bao-hiem-ftel', 'Chính sách bảo hiểm FPT Telecom', 'Bảo hiểm', 'FPT Telecom thực hiện đóng BHXH, BHYT, BHTN theo quy định pháp luật.', '2023-10-01', 'PUBLISHED', NOW(), NOW())
ON CONFLICT ("slug") DO UPDATE SET "status" = 'PUBLISHED', "updatedAt" = NOW();
`;

type Env = {
  HYPERDRIVE: { connectionString: string };
};

async function introspect(client: Client) {
  const tables = await client.query<{ table_name: string }>(
    `SELECT table_name FROM information_schema.tables
     WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
     ORDER BY table_name`,
  );
  const userCols = await client.query<{ column_name: string }>(
    `SELECT column_name FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = 'User'
     ORDER BY ordinal_position`,
  );
  const sessionCols = await client.query<{ column_name: string }>(
    `SELECT column_name FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = 'Session'
     ORDER BY ordinal_position`,
  );
  const enumValues = await client.query<{ enumlabel: string }>(
    `SELECT e.enumlabel
     FROM pg_type t
     JOIN pg_enum e ON t.oid = e.enumtypid
     JOIN pg_namespace n ON n.oid = t.typnamespace
     WHERE n.nspname = 'public' AND t.typname = 'UserRole'
     ORDER BY e.enumsortorder`,
  );
  const users = await client.query<{ email: string; role: string }>(
    `SELECT email, role::text FROM "User" ORDER BY email LIMIT 20`,
  );
  const departments = await client.query<{ code: string }>(
    `SELECT code FROM "Department" ORDER BY code`,
  );
  return {
    tables: tables.rows.map((r) => r.table_name),
    userColumns: userCols.rows.map((r) => r.column_name),
    sessionColumns: sessionCols.rows.map((r) => r.column_name),
    userRoles: enumValues.rows.map((r) => r.enumlabel),
    users: users.rows,
    departments: departments.rows,
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const client = new Client({ connectionString: env.HYPERDRIVE.connectionString });
    try {
      await client.connect();

      if (request.method === "POST") {
        const action = new URL(request.url).searchParams.get("action");
        if (action === "seed-user") {
          const result = await client.query(
            `INSERT INTO "User" ("id", "name", "email", "role", "employeeGroup", "isActive", "createdAt", "updatedAt")
             VALUES ('user-employee', 'Nguyen Van A', 'employee@fpt.com', 'EMPLOYEE', 'OFFICIAL', true, NOW(), NOW())
             ON CONFLICT ("email") DO UPDATE SET "name" = EXCLUDED."name", "updatedAt" = NOW()
             RETURNING email, role::text`,
          );
          return Response.json({ inserted: result.rows });
        }

        if (action === "seed") {
          try {
            await client.query(HRIS_SEED_SQL);
          } catch (seedError) {
            return Response.json(
              {
                error:
                  seedError instanceof Error
                    ? seedError.message
                    : String(seedError),
              },
              { status: 500 },
            );
          }
        } else {
          await client.query(HR_PORTAL_SCHEMA_SQL);
        }
        const after = await introspect(client);
        return Response.json({ applied: true, action: action ?? "schema", after });
      }

      return Response.json(await introspect(client));
    } catch (error) {
      return Response.json(
        { error: error instanceof Error ? error.message : String(error) },
        { status: 500 },
      );
    } finally {
      await client.end().catch(() => undefined);
    }
  },
};
