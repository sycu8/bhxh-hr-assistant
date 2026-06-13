import {
  Baby,
  BookHeart,
  Briefcase,
  FileText,
  HeartPulse,
  Landmark,
  Shield,
  UserX,
  Users,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

export type TopicItem = {
  slug: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

export const TOPICS: TopicItem[] = [
  {
    slug: "bhxh",
    title: "BHXH bắt buộc",
    description: "Đối tượng, mức đóng, quyền lợi và thủ tục liên quan.",
    icon: Landmark,
  },
  {
    slug: "bhyt",
    title: "BHYT",
    description: "Thẻ BHYT, phạm vi chi trả và tuyến điều trị.",
    icon: HeartPulse,
  },
  {
    slug: "bhtn",
    title: "BHTN",
    description: "Điều kiện hưởng trợ cấp thất nghiệp và thời hạn.",
    icon: Briefcase,
  },
  {
    slug: "thai-san",
    title: "Thai sản",
    description:
      "Nghỉ 7 tháng (nữ), chính sách FPT, trợ cấp BHXH và hồ sơ với HR.",
    icon: Baby,
  },
  {
    slug: "om-dau",
    title: "Ốm đau",
    description: "Nghỉ ốm, chứng nhận và quyền lợi BHXH.",
    icon: Shield,
  },
  {
    slug: "nghi-viec",
    title: "Nghỉ việc",
    description: "Chấm dứt HĐLĐ, quyền lợi và thời điểm chốt BH.",
    icon: UserX,
  },
  {
    slug: "huu-tri",
    title: "Hưu trí",
    description: "Điều kiện nghỉ hưu và lựa chọn nhận lương hưu.",
    icon: Users,
  },
  {
    slug: "tai-nan",
    title: "Tai nạn lao động",
    description: "Bảo hiểm TNLĐ, BNN và trách nhiệm của DN.",
    icon: FileText,
  },
  {
    slug: "tu-tang",
    title: "Tử tang & trợ cấp tử tuất",
    description: "Mai táng phí, trợ cấp một lần và quyền lợi cho thân nhân.",
    icon: BookHeart,
  },
  {
    slug: "nguoi-phu-thuoc",
    title: "Người phụ thuộc",
    description: "Đăng ký giảm trừ gia cảnh, giấy tờ và quyền lợi liên quan.",
    icon: UsersRound,
  },
];
