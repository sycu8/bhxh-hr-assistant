export function impactLevelVi(level: string) {
  const m: Record<string, string> = {
    LOW: "Thấp",
    MEDIUM: "Trung bình",
    HIGH: "Cao",
  };
  return m[level] ?? level;
}

export function affectedGroupVi(group: string) {
  const m: Record<string, string> = {
    EMPLOYEE: "Người lao động",
    HR: "Bộ phận HR",
    EMPLOYER: "Người sử dụng lao động",
    PROBATION: "Thử việc",
    OFFICIAL: "Văn bản chính thống",
    MANAGER: "Quản lý",
  };
  return m[group] ?? group;
}
