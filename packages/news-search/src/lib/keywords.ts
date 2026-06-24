export interface KeywordCategory {
  id: string;
  name: string;
  color: string;
  keywords: string[];
}

export const KEYWORD_CATEGORIES: KeywordCategory[] = [
  {
    id: "logistics",
    name: "물류/배송",
    color: "#3B82F6",
    keywords: [
      "카드배송", "택배", "CJ대한통운", "배송", "운송", "대면배송", "인편배송",
      "인편", "우체국", "물류", "라스트마일", "라스트커넥트", "드론배송",
      "자율주행", "무인배송함", "퀵커머스", "메디컬배송", "ESG물류", "탄소중립",
      "3PL", "4PL", "5PL", "풀필먼트", "WMS", "OMS", "WES", "콜드체인",
      "보안물류", "AMR", "크로스보더", "MFC", "마이크로풀필먼트", "스마트물류",
    ],
  },
  {
    id: "ecommerce",
    name: "이커머스/유통",
    color: "#10B981",
    keywords: [
      "이커머스", "C커머스", "쿠팡", "올리브영", "다이소", "무신사", "오아시스",
      "컬리", "네이버", "무인매장", "스마트락커", "거점",
    ],
  },
  {
    id: "finance",
    name: "금융/결제",
    color: "#F59E0B",
    keywords: [
      "신용카드", "플라스틱 카드", "모바일 카드", "디지털카드", "상품권", "티켓",
      "간편결제", "BNPL", "스테이블코인", "블록체인", "QR", "핀테크",
      "트래블월렛", "코나아이", "지역화폐", "외화 배송", "유트랜스퍼",
      "im뱅크", "환전", "해외송금",
    ],
  },
  {
    id: "healthcare",
    name: "헬스케어",
    color: "#EF4444",
    keywords: [
      "실버케어", "요양", "유전자검사키트", "헬스케어", "디포스트", "지오영",
      "의약품 배송", "디버",
    ],
  },
  {
    id: "tech",
    name: "기술/AI",
    color: "#8B5CF6",
    keywords: [
      "로봇", "생성형 AI", "GPT", "피지컬AI", "밴딩머신", "카카오모빌리티",
      "네이버클라우드",
    ],
  },
  {
    id: "companies",
    name: "기업",
    color: "#EC4899",
    keywords: [
      "로지스올", "니어솔루션", "케이엠파킹앤스페이스", "E9", "얼른딜리버리",
      "리버스 물류", "회수 물류",
    ],
  },
];
