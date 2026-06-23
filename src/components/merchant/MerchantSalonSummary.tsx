import Link from "next/link";
import { ArrowUpRight, MapPin, Scissors, ShieldCheck, UsersRound } from "lucide-react";
import type { MerchantSalon } from "@/lib/domain/merchant";

export function MerchantSalonSummary({ salons }: { salons: MerchantSalon[] }) {
  return (
    <section className="grid gap-4 md:grid-cols-2">
      {salons.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-[var(--rose-line)] bg-white px-6 py-10 text-center shadow-[var(--shadow-subtle)]">
          <p className="font-display text-2xl font-black tracking-[-0.05em]">
            Салон пока не подключен
          </p>
          <p className="mx-auto mt-3 max-w-md text-sm font-bold text-[var(--muted)]">
            После onboarding здесь появятся профиль, услуги и команда.
          </p>
        </div>
      ) : (
        salons.map((salon) => (
          <article
            key={salon.id}
            className="rounded-[24px] border border-[var(--rose-line)] bg-white p-5 shadow-[var(--shadow-subtle)] transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-[var(--petal)] hover:shadow-[var(--shadow-card)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--rose-deep)]">
                  <ShieldCheck aria-hidden className="h-3.5 w-3.5" />
                  {salon.role} · {salon.status}
                </p>
                <h2 className="mt-2 text-xl font-black tracking-[-0.03em] text-[var(--ink)]">
                  {salon.name}
                </h2>
                <p className="mt-2 flex items-center gap-2 text-sm font-bold text-[var(--muted)]">
                  <MapPin aria-hidden className="h-4 w-4 text-[var(--rose)]" />
                  {salon.address}
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs font-black text-[var(--rose-deep)]">
                  <span className="inline-flex items-center gap-1 rounded-full bg-[var(--blush-soft)] px-3 py-1">
                    <Scissors aria-hidden className="h-3.5 w-3.5" />
                    {salon.serviceCount} услуг
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[var(--brand-fog)] px-3 py-1 text-[var(--brand-plum)]">
                    <UsersRound aria-hidden className="h-3.5 w-3.5" />
                    {salon.staffCount} мастеров
                  </span>
                </div>
              </div>
              <Link
                href={`/salons/${salon.slug}`}
                className="inline-flex min-h-10 items-center justify-center gap-1 rounded-full bg-[var(--brand-fog)] px-3 text-xs font-black uppercase tracking-[0.12em] text-[var(--brand-plum)]"
              >
                Live
                <ArrowUpRight aria-hidden className="h-3.5 w-3.5" />
              </Link>
            </div>
          </article>
        ))
      )}
    </section>
  );
}
