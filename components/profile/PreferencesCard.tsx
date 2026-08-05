import { Briefcase, MapPin, Certificate } from "@phosphor-icons/react/dist/ssr";
import { myProfile } from "@/lib/mock-data";

function PreferenceRow({
  icon: Icon,
  label,
  items,
}: {
  icon: typeof Briefcase;
  label: string;
  items: string[];
}) {
  return (
    <div className="flex items-start gap-3 py-4">
      <Icon size={18} className="mt-0.5 shrink-0 text-accent-text" />
      <div className="min-w-0">
        <p className="text-xs text-muted">{label}</p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {items.map((item) => (
            <span
              key={item}
              className="rounded-md bg-surface-2 px-2.5 py-1 text-sm font-medium text-foreground"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PreferencesCard() {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      <h2 className="text-base font-bold text-foreground">희망 근무 조건</h2>
      <div className="mt-1 divide-y divide-border">
        <PreferenceRow
          icon={Briefcase}
          label="희망 직종"
          items={myProfile.preferredCategories}
        />
        <PreferenceRow
          icon={MapPin}
          label="희망 지역"
          items={myProfile.preferredDistricts}
        />
        <PreferenceRow
          icon={Certificate}
          label="보유 자격증"
          items={myProfile.certifications}
        />
      </div>
    </div>
  );
}
