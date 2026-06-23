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
      className="group inline-flex min-h-12 items-center gap-2 rounded-full text-[var(--ink)]"
      aria-label="nurAI"
    >
      <span
        className={`font-display font-bold leading-none tracking-normal text-[var(--brand-plum)] ${
          compact ? "text-[30px]" : "text-[40px]"
        }`}
      >
        nurAI
      </span>
    </Link>
  );
}
