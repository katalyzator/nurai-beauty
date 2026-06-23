import { SalonSearchShell } from "@/components/marketplace/SalonSearchShell";
import { getNearbySalons } from "@/lib/domain/salons";

export default async function TelegramMiniAppPage() {
  const salonResult = await getNearbySalons({})
    .then((salons) => ({ salons }))
    .catch(() => ({
      salons: [],
      errorMessage: "Данные салонов временно недоступны.",
    }));

  return <SalonSearchShell {...salonResult} />;
}
