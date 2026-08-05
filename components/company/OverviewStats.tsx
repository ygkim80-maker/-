import { TrendUp } from "@phosphor-icons/react/dist/ssr";
import { jobs, applicants } from "@/lib/mock-data";

export function OverviewStats() {
  const items = [
    {
      label: "진행중 공고",
      value: jobs.length,
      unit: "건",
      delta: "+2 이번 주",
    },
    {
      label: "총 지원자",
      value: applicants.length,
      unit: "명",
      delta: "+2 오늘",
    },
    {
      label: "면접 예정",
      value: applicants.filter((a) => a.status === "면접예정").length,
      unit: "명",
      delta: null,
    },
    {
      label: "채용 확정",
      value: applicants.filter((a) => a.status === "합격").length,
      unit: "명",
      delta: "+1 이번 주",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-2xl border border-border bg-surface p-5"
        >
          <p className="text-xs text-muted">{item.label}</p>
          <p className="mt-2 text-2xl font-extrabold text-foreground">
            {item.value.toLocaleString("ko-KR")}
            <span className="ml-0.5 text-sm font-semibold text-muted">
              {item.unit}
            </span>
          </p>
          {item.delta && (
            <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-success">
              <TrendUp size={13} weight="bold" />
              {item.delta}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
