import { Badge } from "./Badge";

const toneMap = {
  검토중: "neutral",
  면접예정: "accent",
  합격: "success",
  불합격: "danger",
} as const;

export function StatusBadge({ status }: { status: keyof typeof toneMap }) {
  return <Badge tone={toneMap[status]}>{status}</Badge>;
}
