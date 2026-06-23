import { MerchantBookingsTable } from "@/components/merchant/MerchantBookingsTable";
import { MerchantSalonSummary } from "@/components/merchant/MerchantSalonSummary";
import { getMerchantDashboard } from "@/lib/domain/merchant";

export default async function MerchantPage() {
  const dashboard = await getMerchantDashboard();

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="text-2xl font-semibold text-stone-950">
        Merchant cabinet
      </h1>
      <div className="mt-6 grid gap-6">
        <MerchantSalonSummary salons={dashboard.salons} />
        <MerchantBookingsTable bookings={dashboard.bookings} />
      </div>
    </main>
  );
}
