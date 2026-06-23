import { SalonSearchShell } from "@/components/marketplace/SalonSearchShell";
import { getNearbySalons } from "@/lib/domain/salons";

export default async function TelegramMiniAppPage() {
  const salonResult = await getNearbySalons({})
    .then((salons) => ({ salons }))
    .catch(() => ({
      salons: [],
      errorMessage: "Salon data is temporarily unavailable.",
    }));

  return (
    <div className="min-h-screen bg-white">
      <SalonSearchShell {...salonResult} />
    </div>
  );
}
