export type EmployeeJourneyStopId = "question" | "answer" | "evidence" | "hr";

export type EmployeeJourneyState = "complete" | "current" | "upcoming";

export type EmployeeJourneyStop = {
  id: EmployeeJourneyStopId;
  number: number;
  title: string;
  shortTitle: string;
  description: string;
  href: string;
};

export type EmployeeJourneyStopWithState = EmployeeJourneyStop & {
  state: EmployeeJourneyState;
};

export const EMPLOYEE_JOURNEY_STOPS: EmployeeJourneyStop[] = [
  {
    id: "question",
    number: 1,
    title: "Đặt câu hỏi",
    shortTitle: "Hỏi",
    description: "Nhập tình huống bằng ngôn ngữ tự nhiên.",
    href: "/",
  },
  {
    id: "answer",
    number: 2,
    title: "Đọc câu trả lời",
    shortTitle: "Trả lời",
    description: "Xem câu trả lời ngắn, giải thích và mức tin cậy.",
    href: "/search",
  },
  {
    id: "evidence",
    number: 3,
    title: "Kiểm tra nguồn",
    shortTitle: "Nguồn",
    description: "Đối chiếu FAQ, văn bản, điều khoản và ngày hiệu lực.",
    href: "/nguon-phap-luat",
  },
  {
    id: "hr",
    number: 4,
    title: "Hỏi HR/C&B",
    shortTitle: "Hỏi HR",
    description: "Chuyển tiếp khi thiếu căn cứ hoặc có yếu tố cá nhân.",
    href: "/ask-hr",
  },
];

export function getEmployeeJourneyStops(
  current: EmployeeJourneyStopId | string,
): EmployeeJourneyStopWithState[] {
  const currentIndex = EMPLOYEE_JOURNEY_STOPS.findIndex(
    (stop) => stop.id === current,
  );
  const safeIndex = currentIndex >= 0 ? currentIndex : 0;

  return EMPLOYEE_JOURNEY_STOPS.map((stop, index) => ({
    ...stop,
    state:
      index < safeIndex
        ? "complete"
        : index === safeIndex
          ? "current"
          : "upcoming",
  }));
}
