import { CalendarDays, KeyRound, UserPlus, UsersRound } from "lucide-react";

const flows = [
  {
    icon: KeyRound,
    title: "Админ салона",
    body: "Первый владелец создается как owner. Он управляет профилем салона, услугами, мастерами и доступами команды.",
  },
  {
    icon: UserPlus,
    title: "Приглашения",
    body: "Owner или admin отправляет инвайт сотруднику: роль, имя, телефон или Telegram username. После принятия сотрудник попадает в команду салона.",
  },
  {
    icon: CalendarDays,
    title: "Графики мастеров",
    body: "Для каждого мастера хранится рабочая неделя. Следующий шаг: показывать только свободные слоты по графику и текущим booking.",
  },
  {
    icon: UsersRound,
    title: "Назначение записи",
    body: "Если клиент выбрал мастера, запись закрепляется за ним. Если выбрал любого мастера, салон назначает свободного специалиста.",
  },
];

export function MerchantOperationsPanel() {
  return (
    <section className="rounded-[24px] border border-[var(--rose-line)] bg-white p-5 shadow-[var(--shadow-subtle)] sm:p-6">
      <div className="flex flex-col gap-3 border-b border-[var(--line)] pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--rose-deep)]">
            Операционная модель
          </p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-[-0.02em]">
            Как регистрируем салоны и команду
          </h2>
        </div>
        <p className="max-w-md text-sm font-semibold leading-6 text-[var(--muted)]">
          Это уже заложено в Supabase: роли, приглашения сотрудников и графики
          мастеров. UI дальше будет превращаться в полноценный back office.
        </p>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {flows.map((flow) => {
          const Icon = flow.icon;

          return (
            <article
              key={flow.title}
              className="rounded-[20px] border border-[var(--rose-line)] bg-[var(--porcelain)] p-4"
            >
              <div className="grid h-11 w-11 place-items-center rounded-[14px] bg-[var(--brand-plum)] text-white">
                <Icon aria-hidden className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-black text-[var(--ink)]">
                {flow.title}
              </h3>
              <p className="mt-2 text-sm font-semibold leading-6 text-[var(--muted)]">
                {flow.body}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
