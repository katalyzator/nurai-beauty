import { Inbox, Phone } from "lucide-react";
import {
  merchantBookingStatusLabels,
  type MerchantBooking,
} from "@/lib/domain/merchant";
import { MerchantBookingActions } from "@/components/merchant/MerchantBookingActions";

export function MerchantBookingsTable({
  bookings,
}: {
  bookings: MerchantBooking[];
}) {
  return (
    <section className="overflow-hidden rounded-[24px] border border-[var(--rose-line)] bg-white shadow-[var(--shadow-subtle)]">
      <div className="flex items-center justify-between border-b border-[var(--line)] p-5">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--rose-deep)]">
            Заявки
          </p>
          <h2 className="mt-1 text-2xl font-black tracking-[-0.04em]">
            Заявки клиентов
          </h2>
        </div>
        <span className="rounded-full bg-[var(--brand-fog)] px-3 py-1 text-sm font-extrabold text-[var(--brand-plum)]">
          {bookings.length}
        </span>
      </div>
      <div className="divide-y divide-[var(--line)]">
        {bookings.length === 0 && (
          <div className="grid place-items-center px-6 py-14 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-[var(--brand-fog)] text-[var(--brand-plum)]">
              <Inbox aria-hidden className="h-6 w-6" />
            </div>
            <p className="mt-4 text-lg font-black text-[var(--ink)]">
              Новых заявок пока нет
            </p>
            <p className="mt-2 max-w-md text-sm font-bold leading-6 text-[var(--muted)]">
              Когда клиент запишется через маркетплейс или Telegram Mini App,
              заявка появится здесь.
            </p>
          </div>
        )}
        {bookings.map((booking) => (
          <div
            key={booking.id}
            className="grid gap-3 p-5 text-sm font-bold text-[var(--muted)] xl:grid-cols-[1fr_1fr_1fr_1fr_0.7fr_1.2fr]"
          >
            <div>
              <span className="block text-[var(--ink)]">{booking.salonName}</span>
              <span className="mt-1 block text-xs">{booking.serviceName}</span>
            </div>
            <div>
              <span className="block text-[var(--ink)]">{booking.clientName}</span>
              <span className="mt-1 flex items-center gap-2">
                <Phone aria-hidden className="h-4 w-4 text-[var(--rose)]" />
                {booking.clientPhone}
              </span>
            </div>
            <span>{booking.staffName ?? "Любой свободный мастер"}</span>
            <span>
              {new Date(booking.startAt).toLocaleString("ru-RU", {
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                month: "short",
                timeZone: "Asia/Bishkek",
              })}
            </span>
            <span className="h-fit rounded-full bg-[var(--blush-soft)] px-3 py-1 text-center text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--rose-deep)]">
              {merchantBookingStatusLabels[booking.status]}
            </span>
            <MerchantBookingActions
              bookingId={booking.id}
              status={booking.status}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
