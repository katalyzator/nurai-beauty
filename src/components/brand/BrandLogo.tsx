import Image from "next/image";
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
      className="group inline-flex min-h-12 items-center gap-3 rounded-full pr-2 text-[var(--ink)]"
      aria-label="NurAI"
    >
      <span className="brand-mark relative grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full border border-[var(--petal-line)] bg-[var(--brand-fog)] shadow-[var(--shadow-subtle)]">
        <Image
          src="/brand/nurai-logo.png"
          alt=""
          fill
          priority
          sizes="48px"
          className="scale-[1.24] object-cover object-center"
        />
      </span>
      {!compact ? (
        <span className="hidden leading-none sm:block">
          <span className="block font-display text-[34px] font-bold tracking-normal text-[var(--brand-plum)]">
            NurAI
          </span>
          <span className="-mt-0.5 block text-[10px] font-black uppercase tracking-[0.22em] text-[var(--muted)]">
            beauty
          </span>
        </span>
      ) : null}
    </Link>
  );
}
