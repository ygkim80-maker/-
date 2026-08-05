import type { Icon } from "@phosphor-icons/react";

export function IconPanel({
  icon: IconComp,
  className = "",
  iconClassName = "",
  iconSize = 140,
  dark = false,
  fill = false,
}: {
  icon: Icon;
  className?: string;
  iconClassName?: string;
  iconSize?: number;
  dark?: boolean;
  fill?: boolean;
}) {
  return (
    <div
      className={`${fill ? "absolute inset-0" : "relative"} overflow-hidden ${
        dark
          ? "bg-gradient-to-br from-foreground to-[#3a2a1f]"
          : "bg-gradient-to-br from-surface-2 to-accent-soft"
      } ${className}`}
    >
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "radial-gradient(currentColor 1px, transparent 1px)",
          backgroundSize: "18px 18px",
          color: dark ? "#fff" : "var(--accent)",
        }}
      />
      <IconComp
        size={iconSize}
        weight="duotone"
        className={`absolute text-accent-text/30 ${
          dark ? "text-white/15" : ""
        } ${iconClassName}`}
      />
    </div>
  );
}
