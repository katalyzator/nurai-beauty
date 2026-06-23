import type { ReactNode } from "react";
import { Scissors, UserRound } from "lucide-react";
import type { MerchantService, MerchantStaff } from "@/lib/domain/merchant";

export function MerchantCatalogPanel({
  services,
  staff,
}: {
  services: MerchantService[];
  staff: MerchantStaff[];
}) {
  return (
    <section className="grid gap-5 lg:grid-cols-2">
      <div className="rounded-[24px] border border-[var(--rose-line)] bg-white p-5 shadow-[var(--shadow-subtle)]">
        <PanelTitle
          count={services.length}
          icon={<Scissors aria-hidden className="h-4 w-4" />}
          title="Услуги"
        />
        <div className="mt-4 divide-y divide-[var(--line)]">
          {services.map((service) => (
            <div key={service.id} className="grid gap-2 py-4 first:pt-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-black text-[var(--ink)]">
                    {service.name}
                  </p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-[var(--rose-deep)]">
                    {service.category}
                  </p>
                </div>
                <span className="rounded-full bg-[var(--blush-soft)] px-3 py-1 text-xs font-black text-[var(--rose-deep)]">
                  {service.isActive ? "Активна" : "Скрыта"}
                </span>
              </div>
              <p className="text-sm font-bold text-[var(--muted)]">
                {service.durationMinutes} мин · {service.priceKgs} сом
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[24px] border border-[var(--rose-line)] bg-white p-5 shadow-[var(--shadow-subtle)]">
        <PanelTitle
          count={staff.length}
          icon={<UserRound aria-hidden className="h-4 w-4" />}
          title="Мастера"
        />
        <div className="mt-4 divide-y divide-[var(--line)]">
          {staff.map((member) => (
            <div key={member.id} className="grid gap-2 py-4 first:pt-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-black text-[var(--ink)]">
                    {member.fullName}
                  </p>
                  <p className="mt-1 text-sm font-bold text-[var(--muted)]">
                    {member.roleTitle}
                  </p>
                </div>
                <span className="rounded-full bg-[var(--brand-fog)] px-3 py-1 text-xs font-black text-[var(--brand-plum)]">
                  {member.isActive ? "В графике" : "Скрыт"}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {(member.specialties.length > 0
                  ? member.specialties
                  : ["Без специализации"]
                ).map((specialty) => (
                  <span
                    className="rounded-full border border-[var(--rose-line)] bg-white px-3 py-1 text-xs font-bold text-[var(--muted)]"
                    key={specialty}
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PanelTitle({
  count,
  icon,
  title,
}: {
  count: number;
  icon: ReactNode;
  title: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[var(--line)] pb-4">
      <div>
        <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--rose-deep)]">
          {icon}
          Каталог
        </p>
        <h2 className="mt-1 text-2xl font-black tracking-[-0.03em]">
          {title}
        </h2>
      </div>
      <span className="rounded-full bg-[var(--brand-fog)] px-3 py-1 text-sm font-extrabold text-[var(--brand-plum)]">
        {count}
      </span>
    </div>
  );
}
