export type EmploymentType = "당일알바" | "단기" | "계약직" | "정규직";
export type Shift = "주간" | "야간" | "새벽" | "오후";

export type JobCategory =
  | "상하차"
  | "피킹/패킹"
  | "지게차"
  | "분류"
  | "냉동/냉장"
  | "검수"
  | "물류사무";

export interface Job {
  id: string;
  title: string;
  company: string;
  companySeed: string;
  verified: boolean;
  district: string;
  address: string;
  category: JobCategory;
  employmentType: EmploymentType;
  shift: Shift;
  wage: number;
  wageUnit: "일급" | "시급" | "월급";
  workDate: string;
  workHours: string;
  headcount: number;
  applicants: number;
  urgent: boolean;
  tags: string[];
  description: string;
  requirements: string[];
  benefits: string[];
  postedAt: string;
}
