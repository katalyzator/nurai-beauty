import type { MerchantBooking } from "@/lib/domain/merchant";

export function MerchantBookingsTable({
  bookings,
}: {
  bookings: MerchantBooking[];
}) {
  return (
    <section className="rounded-lg border bg-white">
      <div className="border-b p-4">
        <h2 className="font-semibold text-stone-950">Bookings</h2>
      </div>
      <div className="divide-y">
        {bookings.length === 0 && (
          <p className="p-4 text-sm text-stone-500">No bookings yet.</p>
        )}
        {bookings.map((booking) => (
          <div key={booking.id} className="grid gap-1 p-4 md:grid-cols-5">
            <span>{booking.salonName}</span>
            <span>{booking.clientName}</span>
            <span>{booking.clientPhone}</span>
            <span>{new Date(booking.startAt).toLocaleString()}</span>
            <span>{booking.status}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
