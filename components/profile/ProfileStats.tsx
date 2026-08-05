import { myApplications, mySavedJobIds } from "@/lib/mock-data";

export function ProfileStats() {
  const items = [
    { label: "총 지원", value: myApplications.length },
    {
      label: "합격",
      value: myApplications.filter((a) => a.status === "합격").length,
    },
    {
      label: "면접예정",
      value: myApplications.filter((a) => a.status === "면접예정").length,
    },
    { label: "저장한 공고", value: mySavedJobIds.length },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-2xl border border-border bg-surface p-5"
        >
          <p className="text-2xl font-extrabold text-foreground">
            {item.value}
            <span className="ml-0.5 text-sm font-semibold text-muted">건</span>
          </p>
          <p className="mt-1 text-xs text-muted">{item.label}</p>
        </div>
      ))}
    </div>
  );
}
