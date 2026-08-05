import Link from "next/link";
import {
  Truck,
  Package,
  Snowflake,
  Stack,
  SquaresFour,
  ClipboardText,
  Desktop,
} from "@phosphor-icons/react/dist/ssr";
import { IconPanel } from "./IconPanel";
import { Reveal } from "./Reveal";

const iconTiles = [
  { area: "c", label: "지게차", icon: Stack },
  { area: "d", label: "분류", icon: SquaresFour },
  { area: "e", label: "검수", icon: ClipboardText },
  { area: "f", label: "물류사무", icon: Desktop },
];

export function CategoryBento() {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            직종별로 공고를 찾아보세요
          </h2>
          <p className="mt-2 text-sm text-muted">
            원하는 업무 유형을 선택하면 관련 공고만 모아볼 수 있어요.
          </p>
        </Reveal>

        <div
          className="mt-8 grid gap-3 sm:gap-4"
          style={{
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gridTemplateAreas: '"a a b b" "a a c d" "g g e f"',
          }}
        >
          <Link
            href="/jobs?category=상하차"
            style={{ gridArea: "a" }}
            className="group relative block min-h-[200px] overflow-hidden rounded-2xl border border-border"
          >
            <IconPanel
              icon={Truck}
              iconSize={150}
              dark
              iconClassName="-right-8 -bottom-10 rotate-[-6deg] transition-transform duration-500 group-hover:scale-110"
              fill
            />
            <span className="absolute bottom-4 left-4 text-lg font-bold text-white">
              상하차
            </span>
          </Link>

          <Link
            href="/jobs?category=피킹/패킹"
            style={{ gridArea: "b" }}
            className="group relative block min-h-[92px] overflow-hidden rounded-2xl border border-border"
          >
            <IconPanel
              icon={Package}
              iconSize={110}
              iconClassName="-right-6 -bottom-8 rotate-[8deg] transition-transform duration-500 group-hover:scale-110"
              fill
            />
            <span className="absolute bottom-3 left-4 text-base font-bold text-foreground">
              피킹/패킹
            </span>
          </Link>

          <Link
            href="/jobs?category=냉동/냉장"
            style={{ gridArea: "g" }}
            className="group relative block min-h-[92px] overflow-hidden rounded-2xl border border-border"
          >
            <IconPanel
              icon={Snowflake}
              iconSize={110}
              dark
              iconClassName="-right-4 -bottom-8 rotate-[10deg] transition-transform duration-500 group-hover:scale-110"
              fill
            />
            <span className="absolute bottom-3 left-4 text-base font-bold text-white">
              냉동/냉장
            </span>
          </Link>

          {iconTiles.map((tile) => (
            <Link
              key={tile.label}
              href={`/jobs?category=${encodeURIComponent(tile.label)}`}
              style={{ gridArea: tile.area }}
              className="flex min-h-[92px] flex-col justify-between rounded-2xl border border-accent-soft-border bg-accent-soft p-4 transition-colors hover:bg-accent-soft/70"
            >
              <tile.icon size={22} weight="bold" className="text-accent-text" />
              <span className="text-sm font-bold text-foreground">
                {tile.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
