import type { HrisEmployeeRecord } from "@/lib/integrations/hris/types";

/** Cột thường gặp khi export Users từ Microsoft 365 / Entra ID (CSV). */
const COLUMN_ALIASES: Record<string, string[]> = {
  email: [
    "user principal name",
    "userprincipalname",
    "upn",
    "email",
    "mail",
    "primary smtp address",
    "user email",
  ],
  name: [
    "display name",
    "displayname",
    "name",
    "full name",
    "họ và tên",
  ],
  firstName: ["first name", "firstname", "given name", "givenname"],
  lastName: ["last name", "lastname", "surname", "family name"],
  department: ["department", "phòng ban", "dept"],
  jobTitle: ["job title", "jobtitle", "title", "chức danh"],
  manager: ["manager", "manager upn", "manager email", "quản lý"],
  employeeId: [
    "employee id",
    "employeeid",
    "employee number",
    "mã nhân viên",
    "staff id",
  ],
  phone: [
    "mobile phone",
    "mobilephone",
    "phone",
    "business phones",
    "điện thoại",
  ],
  objectId: ["object id", "objectid", "id", "azure ad object id"],
  accountEnabled: [
    "account enabled",
    "accountenabled",
    "enabled",
    "trạng thái tài khoản",
  ],
};

function normalizeHeader(header: string): string {
  return header
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function slugify(value: string, maxLen = 48): string {
  const slug = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return (slug || "unknown").slice(0, maxLen);
}

function parseCsvRows(content: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const ch = content[i]!;
    const next = content[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        field += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        field += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n" || (ch === "\r" && next === "\n")) {
      row.push(field);
      field = "";
      if (row.some((cell) => cell.trim() !== "")) {
        rows.push(row);
      }
      row = [];
      if (ch === "\r") i++;
    } else if (ch !== "\r") {
      field += ch;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    if (row.some((cell) => cell.trim() !== "")) {
      rows.push(row);
    }
  }

  return rows;
}

function resolveColumnIndex(
  headers: string[],
  aliases: string[],
): number | null {
  const normalized = headers.map(normalizeHeader);
  for (const alias of aliases) {
    const idx = normalized.indexOf(alias);
    if (idx >= 0) return idx;
  }
  return null;
}

function buildColumnMap(headers: string[]) {
  const map: Partial<Record<keyof typeof COLUMN_ALIASES, number | null>> = {};
  for (const key of Object.keys(COLUMN_ALIASES) as Array<
    keyof typeof COLUMN_ALIASES
  >) {
    map[key] = resolveColumnIndex(headers, COLUMN_ALIASES[key]!);
  }
  return map;
}

function cell(row: string[], index: number | null | undefined): string {
  if (index == null || index < 0) return "";
  return row[index]?.trim() ?? "";
}

function parseEmail(raw: string): string | null {
  const value = raw.trim().toLowerCase();
  if (!value.includes("@")) return null;
  return value;
}

function parseManagerEmail(raw: string): string | undefined {
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  if (trimmed.includes("@")) {
    return parseEmail(trimmed) ?? undefined;
  }
  return undefined;
}

function isAccountEnabled(raw: string): boolean {
  const v = raw.trim().toLowerCase();
  if (!v) return true;
  if (["false", "no", "0", "disabled", "inactive", "vô hiệu"].includes(v)) {
    return false;
  }
  return true;
}

function deriveEmployeeCode(
  employeeId: string,
  email: string,
  objectId: string,
  index: number,
): string {
  if (employeeId) return employeeId.replace(/\s+/g, "").slice(0, 32);
  const local = email.split("@")[0] ?? "";
  if (local) return `MS-${slugify(local, 24).toUpperCase()}`;
  if (objectId) return `MS-${objectId.slice(0, 8).toUpperCase()}`;
  return `MS-ROW-${String(index + 1).padStart(4, "0")}`;
}

export type ParseMicrosoftExportResult = {
  employees: HrisEmployeeRecord[];
  skipped: number;
  warnings: string[];
};

/**
 * Parse CSV export từ Microsoft 365 Admin / Entra ID → danh sách nhân viên.
 * Bỏ qua dòng không có email hoặc tài khoản bị vô hiệu (nếu có cột Account enabled).
 */
export function parseMicrosoftUserExportCsv(
  csvContent: string,
): ParseMicrosoftExportResult {
  const rows = parseCsvRows(csvContent);
  if (rows.length < 2) {
    return {
      employees: [],
      skipped: 0,
      warnings: ["File CSV trống hoặc chỉ có header."],
    };
  }

  const [headerRow, ...dataRows] = rows;
  const columns = buildColumnMap(headerRow!);
  const warnings: string[] = [];
  const employees: HrisEmployeeRecord[] = [];
  let skipped = 0;

  if (columns.email == null) {
    return {
      employees: [],
      skipped: dataRows.length,
      warnings: [
        "Không tìm thấy cột email (User principal name / Mail). Kiểm tra lại file export.",
      ],
    };
  }

  const emailToEmployeeCode = new Map<string, string>();

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i]!;
    const email = parseEmail(cell(row, columns.email));
    if (!email) {
      skipped++;
      continue;
    }

    if (columns.accountEnabled != null && !isAccountEnabled(cell(row, columns.accountEnabled))) {
      skipped++;
      continue;
    }

    let name = cell(row, columns.name);
    if (!name) {
      const first = cell(row, columns.firstName);
      const last = cell(row, columns.lastName);
      name = [first, last].filter(Boolean).join(" ").trim();
    }
    if (!name) {
      name = email.split("@")[0] ?? email;
    }

    const departmentName = cell(row, columns.department) || "Chưa phân loại";
    const departmentCode = slugify(departmentName).toUpperCase();
    const employeeCode = deriveEmployeeCode(
      cell(row, columns.employeeId),
      email,
      cell(row, columns.objectId),
      i,
    );
    const managerEmail = parseManagerEmail(cell(row, columns.manager));
    const objectId = cell(row, columns.objectId);

    emailToEmployeeCode.set(email, employeeCode);

    employees.push({
      externalId: objectId ? `azure:${objectId}` : `azure-upn:${email}`,
      email,
      name,
      employeeCode,
      departmentCode,
      departmentName,
      jobTitle: cell(row, columns.jobTitle) || "Nhân viên",
      managerEmail,
      phone: cell(row, columns.phone) || undefined,
      role: "EMPLOYEE",
    });
  }

  for (const emp of employees) {
    if (!emp.managerEmail) continue;
    const managerCode = emailToEmployeeCode.get(emp.managerEmail.toLowerCase());
    if (managerCode) {
      emp.managerEmployeeCode = managerCode;
    } else {
      warnings.push(
        `Không map được quản lý cho ${emp.email}: ${emp.managerEmail} không có trong file.`,
      );
    }
  }

  const managerCodes = new Set(
    employees
      .map((e) => e.managerEmployeeCode)
      .filter((code): code is string => Boolean(code)),
  );
  for (const emp of employees) {
    if (managerCodes.has(emp.employeeCode)) {
      emp.role = "MANAGER";
    }
  }

  return { employees, skipped, warnings };
}
