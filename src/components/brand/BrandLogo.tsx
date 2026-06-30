import Link from "next/link";

export function BrandLogo({
  compact = false,
  href = "/",
}: {
  compact?: boolean;
  href?: string;
}) {
  return (
    <Link
      href={href}
      className="group inline-flex min-h-12 items-center gap-2.5 rounded-full text-[var(--ink)]"
      aria-label="nurAI"
    >
      <span
        aria-hidden
        className="relative grid h-9 w-9 place-items-center rounded-[13px] text-white shadow-[var(--shadow-cta)] transition-transform duration-300 group-hover:-rotate-6"
        style={{ background: "var(--grad-cta)" }}
      >
        <span className="font-display text-[19px] font-bold leading-none">n</span>
        <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-[var(--mint)] ring-2 ring-white" />
      </span>
      <span
        className={`font-display font-bold leading-none tracking-tight ${
          compact ? "text-[26px]" : "text-[32px]"
        }`}
      >
        nur<span className="text-gradient">AI</span>
      </span>
    </Link>
  );
}
