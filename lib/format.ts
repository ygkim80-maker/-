export function formatWage(wage: number, unit: "일급" | "시급" | "월급") {
  return `${wage.toLocaleString("ko-KR")}원 ${unit}`;
}
