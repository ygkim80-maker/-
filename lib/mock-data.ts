import type { Job } from "./types";

export const jobs: Job[] = [
  {
    id: "j-2401",
    title: "새벽 상하차 인원 급구 (컨베이어벨트 작업)",
    company: "한빛로지스틱스 이천센터",
    companySeed: "hanbit-icheon",
    verified: true,
    district: "이천시",
    address: "경기 이천시 마장면 서이천물류단지로 42",
    category: "상하차",
    employmentType: "당일알바",
    shift: "새벽",
    wage: 138000,
    wageUnit: "일급",
    workDate: "2026-08-06",
    workHours: "04:00 ~ 09:30",
    headcount: 12,
    applicants: 7,
    urgent: true,
    tags: ["당일지급", "왕복셔틀", "초보가능"],
    description:
      "택배 서브터미널 새벽 상하차 작업입니다. 컨베이어벨트로 이동하는 박스를 트럭에 상차하는 단순 반복 작업이며, 처음 하시는 분도 현장 반장님이 안내해드립니다.",
    requirements: ["만 18세 이상", "무거운 박스(최대 20kg) 취급 가능자"],
    benefits: ["당일 현금/계좌 지급", "이천역 셔틀버스 운행", "작업복 무료 대여"],
    postedAt: "3시간 전",
  },
  {
    id: "j-2402",
    title: "쿠팡 물류센터 주간 피킹 사원 모집",
    company: "그린박스물류 김포1센터",
    companySeed: "greenbox-gimpo",
    verified: true,
    district: "김포시",
    address: "경기 김포시 대곶면 대곶북로 158",
    category: "피킹/패킹",
    employmentType: "단기",
    shift: "주간",
    wage: 11800,
    wageUnit: "시급",
    workDate: "2026-08-10",
    workHours: "09:00 ~ 18:00",
    headcount: 8,
    applicants: 21,
    urgent: false,
    tags: ["4대보험", "주5일", "냉난방완비"],
    description:
      "PDA로 상품 위치를 스캔하고 지정된 박스에 담는 피킹 작업입니다. 실내 작업이며 냉난방이 갖춰진 쾌적한 환경에서 근무하실 수 있습니다.",
    requirements: ["장기 근무 가능자 우대", "PDA 사용 미숙해도 교육 제공"],
    benefits: ["4대보험 가입", "중식 제공", "장기근속 수당"],
    postedAt: "어제",
  },
  {
    id: "j-2403",
    title: "냉동창고 지게차기사(카운터) 정규직 채용",
    company: "코어프레시물류 안성센터",
    companySeed: "corefresh-anseong",
    verified: true,
    district: "안성시",
    address: "경기 안성시 공도읍 승두산단로 77",
    category: "지게차",
    employmentType: "정규직",
    shift: "주간",
    wage: 2980000,
    wageUnit: "월급",
    workDate: "상시채용",
    workHours: "08:30 ~ 17:30 (교대 협의)",
    headcount: 2,
    applicants: 5,
    urgent: false,
    tags: ["지게차자격증필수", "경력우대", "명절상여"],
    description:
      "냉동/냉장 물류센터 내 카운터 지게차 운행 및 상하차 보조 업무입니다. 영하 18도 냉동존 근무가 포함되어 방한복이 지급됩니다.",
    requirements: ["지게차운전기능사 자격증 소지자", "카운터 지게차 운행 경력 1년 이상"],
    benefits: ["4대보험", "명절 상여금", "방한복/방한화 지급", "정기 건강검진"],
    postedAt: "2일 전",
  },
  {
    id: "j-2404",
    title: "택배 분류 알바 (오후 타임, 초단기 가능)",
    company: "온세상택배 부천허브",
    companySeed: "onsesang-bucheon",
    verified: false,
    district: "부천시",
    address: "경기 부천시 오정구 삼정동 292-1",
    category: "분류",
    employmentType: "당일알바",
    shift: "오후",
    wage: 96000,
    wageUnit: "일급",
    workDate: "2026-08-06",
    workHours: "13:00 ~ 18:00",
    headcount: 20,
    applicants: 34,
    urgent: true,
    tags: ["단시간", "일당지급", "주차가능"],
    description:
      "권역별로 나뉜 슈트에 송장을 확인하고 택배 상자를 분류하는 작업입니다. 5시간 근무로 짧게 일하고 싶은 분들께 적합합니다.",
    requirements: ["체력에 자신 있는 분", "장시간 서서 하는 작업 가능자"],
    benefits: ["당일 계좌 지급", "무료 주차", "음료 제공"],
    postedAt: "6시간 전",
  },
  {
    id: "j-2405",
    title: "식품 물류센터 검수 사원 (계약직 6개월)",
    company: "청담물류시스템 오산센터",
    companySeed: "cheongdam-osan",
    verified: true,
    district: "오산시",
    address: "경기 오산시 세교동 물류로 210",
    category: "검수",
    employmentType: "계약직",
    shift: "주간",
    wage: 12500,
    wageUnit: "시급",
    workDate: "2026-08-18",
    workHours: "08:00 ~ 17:00",
    headcount: 4,
    applicants: 9,
    urgent: false,
    tags: ["계약직", "정규직전환가능", "식품위생교육제공"],
    description:
      "입고되는 식품 원부자재의 수량과 유통기한을 확인하고 시스템에 등록하는 검수 업무입니다. 근무 태도에 따라 정규직 전환 기회가 있습니다.",
    requirements: ["엑셀 기본 사용 가능자", "식품 취급 경험자 우대"],
    benefits: ["4대보험", "정규직 전환 가능", "중식 및 간식 제공"],
    postedAt: "3일 전",
  },
  {
    id: "j-2406",
    title: "물류 사무보조 (재고관리 시스템 입력)",
    company: "파인로지스 성남사무소",
    companySeed: "pine-seongnam",
    verified: true,
    district: "성남시",
    address: "경기 성남시 중원구 성남대로 923",
    category: "물류사무",
    employmentType: "단기",
    shift: "주간",
    wage: 12000,
    wageUnit: "시급",
    workDate: "2026-08-12",
    workHours: "09:30 ~ 18:30",
    headcount: 1,
    applicants: 15,
    urgent: false,
    tags: ["사무직", "엑셀필수", "재택불가"],
    description:
      "WMS(창고관리시스템)에 입출고 데이터를 입력하고 재고 현황을 정리하는 사무보조 업무입니다. 물류센터 현장 방문 없이 사무실에서만 근무합니다.",
    requirements: ["엑셀 VLOOKUP 활용 가능자", "사무직 경험자 우대"],
    benefits: ["4대보험", "명절선물", "쾌적한 사무공간"],
    postedAt: "5일 전",
  },
  {
    id: "j-2407",
    title: "새벽 냉장 피킹 (당일 정산, 반팔 근무 가능)",
    company: "하나로직스 용인센터",
    companySeed: "hanaro-yongin",
    verified: true,
    district: "용인시",
    address: "경기 용인시 처인구 백암면 근삼로 55",
    category: "냉동/냉장",
    employmentType: "당일알바",
    shift: "새벽",
    wage: 128000,
    wageUnit: "일급",
    workDate: "2026-08-07",
    workHours: "05:00 ~ 10:30",
    headcount: 15,
    applicants: 3,
    urgent: true,
    tags: ["당일지급", "방한용품지급", "교통비지원"],
    description:
      "영상 5도 냉장존에서 신선식품을 피킹하는 작업입니다. 방한조끼가 지급되어 반팔 옷 위에 착용하면 충분히 따뜻하게 근무 가능합니다.",
    requirements: ["신선식품 취급 가능자", "새벽 출근 가능자"],
    benefits: ["당일 현금 지급", "방한조끼 지급", "교통비 5천원 별도 지원"],
    postedAt: "1시간 전",
  },
  {
    id: "j-2408",
    title: "의류 물류센터 포장 사원 모집 (여성 다수 근무중)",
    company: "브릿지로지스 광주센터",
    companySeed: "bridge-gwangju",
    verified: true,
    district: "광주시",
    address: "경기 광주시 초월읍 경기동로 1120",
    category: "피킹/패킹",
    employmentType: "단기",
    shift: "주간",
    wage: 11500,
    wageUnit: "시급",
    workDate: "2026-08-11",
    workHours: "09:00 ~ 17:00",
    headcount: 10,
    applicants: 18,
    urgent: false,
    tags: ["여성근무자다수", "가벼운품목", "냉난방완비"],
    description:
      "의류를 검수하여 사이즈/색상별로 포장하는 작업입니다. 무게가 가벼운 품목 위주라 체력 부담이 적은 편입니다.",
    requirements: ["섬세한 작업 선호자", "장기 근무 우대"],
    benefits: ["4대보험", "중식 제공", "생리휴가 보장"],
    postedAt: "4일 전",
  },
  {
    id: "j-2409",
    title: "야간 상차 단기 알바 (2주 프로젝트성)",
    company: "대한스마트물류 평택센터",
    companySeed: "daehan-pyeongtaek",
    verified: false,
    district: "평택시",
    address: "경기 평택시 포승읍 평택항로 302",
    category: "상하차",
    employmentType: "단기",
    shift: "야간",
    wage: 145000,
    wageUnit: "일급",
    workDate: "2026-08-09",
    workHours: "22:00 ~ 06:00",
    headcount: 25,
    applicants: 11,
    urgent: true,
    tags: ["야간수당포함", "2주단기", "숙소협의가능"],
    description:
      "성수기 물량 증가로 2주간 한시적으로 진행되는 야간 상차 프로젝트입니다. 타지역 근무자는 숙소 협의가 가능합니다.",
    requirements: ["야간 근무 가능자", "2주 이상 연속 근무 가능자 우대"],
    benefits: ["야간수당 포함 일급", "숙소 협의 가능", "주 1회 정산"],
    postedAt: "12시간 전",
  },
  {
    id: "j-2410",
    title: "이커머스 반품센터 검수/재입고 사원",
    company: "그린박스물류 안산센터",
    companySeed: "greenbox-ansan",
    verified: true,
    district: "안산시",
    address: "경기 안산시 단원구 목내로 88",
    category: "검수",
    employmentType: "단기",
    shift: "주간",
    wage: 12200,
    wageUnit: "시급",
    workDate: "2026-08-13",
    workHours: "08:30 ~ 17:30",
    headcount: 6,
    applicants: 4,
    urgent: false,
    tags: ["초보가능", "정시퇴근", "4대보험"],
    description:
      "반품된 상품의 상태를 확인하고 재입고 여부를 판단해 시스템에 등록하는 업무입니다. 정시 출퇴근이 잘 지켜지는 사업장입니다.",
    requirements: ["꼼꼼한 성격 우대", "초보자 교육 가능"],
    benefits: ["4대보험", "정시퇴근 보장", "명절선물"],
    postedAt: "1일 전",
  },
];

export const dailyJobs = jobs.filter((job) => job.employmentType === "당일알바");

export function getJobById(id: string) {
  return jobs.find((job) => job.id === id);
}

export const stats = {
  activeJobs: 2847,
  todayNewJobs: 163,
  registeredWorkers: 41200,
  partnerCenters: 512,
};

export const districts = [
  "전체",
  "이천시",
  "김포시",
  "안성시",
  "부천시",
  "오산시",
  "성남시",
  "용인시",
  "광주시",
  "평택시",
  "안산시",
];

export const categories: Array<Job["category"] | "전체"> = [
  "전체",
  "상하차",
  "피킹/패킹",
  "지게차",
  "분류",
  "냉동/냉장",
  "검수",
  "물류사무",
];

export interface Applicant {
  id: string;
  name: string;
  age: number;
  jobTitle: string;
  jobId: string;
  appliedAt: string;
  status: "검토중" | "합격" | "불합격" | "면접예정";
  phone: string;
  experience: string;
}

export const applicants: Applicant[] = [
  { id: "a-01", name: "김도윤", age: 34, jobTitle: "새벽 상하차 인원 급구", jobId: "j-2401", appliedAt: "10분 전", status: "검토중", phone: "010-24**-99**", experience: "상하차 경력 8개월" },
  { id: "a-02", name: "이서준", age: 41, jobTitle: "새벽 상하차 인원 급구", jobId: "j-2401", appliedAt: "32분 전", status: "합격", phone: "010-77**-31**", experience: "택배 상하차 3년" },
  { id: "a-03", name: "박하은", age: 27, jobTitle: "쿠팡 물류센터 주간 피킹 사원 모집", jobId: "j-2402", appliedAt: "1시간 전", status: "면접예정", phone: "010-56**-84**", experience: "물류센터 경험 없음" },
  { id: "a-04", name: "최민재", age: 52, jobTitle: "냉동창고 지게차기사(카운터) 정규직 채용", jobId: "j-2403", appliedAt: "3시간 전", status: "검토중", phone: "010-91**-22**", experience: "지게차 경력 11년" },
  { id: "a-05", name: "정유나", age: 23, jobTitle: "택배 분류 알바 (오후 타임, 초단기 가능)", jobId: "j-2404", appliedAt: "5시간 전", status: "불합격", phone: "010-38**-67**", experience: "단기알바 다수" },
  { id: "a-06", name: "한지호", age: 45, jobTitle: "야간 상차 단기 알바 (2주 프로젝트성)", jobId: "j-2409", appliedAt: "어제", status: "합격", phone: "010-64**-15**", experience: "야간 상하차 2년" },
];

export const myProfile = {
  name: "김도윤",
  age: 34,
  verified: true,
  bio: "상하차 경력 8개월, 성실하게 일합니다.",
  phone: "010-2417-9931",
  preferredCategories: ["상하차", "피킹/패킹"] as Job["category"][],
  preferredDistricts: ["이천시", "김포시", "부천시"],
  certifications: ["지게차운전기능사(취득예정)"],
};

export interface MyApplication {
  jobId: string;
  appliedAt: string;
  status: "검토중" | "합격" | "불합격" | "면접예정";
}

export const myApplications: MyApplication[] = [
  { jobId: "j-2401", appliedAt: "3시간 전", status: "검토중" },
  { jobId: "j-2404", appliedAt: "2일 전", status: "합격" },
  { jobId: "j-2409", appliedAt: "4일 전", status: "면접예정" },
  { jobId: "j-2403", appliedAt: "1주 전", status: "불합격" },
];

export const mySavedJobIds = ["j-2402", "j-2407", "j-2408"];
