const partners = [
  { name: "한빛로지스틱스", initial: "한" },
  { name: "그린박스물류", initial: "그" },
  { name: "코어프레시물류", initial: "코" },
  { name: "하나로직스", initial: "하" },
  { name: "청담물류시스템", initial: "청" },
  { name: "파인로지스", initial: "파" },
];

export function LogoStrip() {
  return (
    <section className="border-y border-border bg-surface-2/50 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs font-medium text-muted">
          전국 512개 물류센터가 물류야 놀쟈!와 함께 인력을 채용하고 있어요
        </p>
        <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {partners.map((p) => (
            <li
              key={p.name}
              className="flex items-center gap-2 text-muted grayscale transition-all hover:grayscale-0 hover:text-foreground"
            >
              <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden>
                <rect width="26" height="26" rx="7" className="fill-current opacity-15" />
                <text
                  x="13"
                  y="17.5"
                  textAnchor="middle"
                  className="fill-current text-[12px] font-bold"
                >
                  {p.initial}
                </text>
              </svg>
              <span className="text-sm font-semibold">{p.name}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
