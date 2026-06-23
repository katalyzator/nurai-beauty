import { SalonSearchShell } from "@/components/marketplace/SalonSearchShell";
import { getNearbySalons } from "@/lib/domain/salons";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ lat?: string; lng?: string }>;
}) {
  const params = await searchParams;
  const lat = params.lat ? Number(params.lat) : undefined;
  const lng = params.lng ? Number(params.lng) : undefined;
  const salonResult = await getNearbySalons({
    lat: Number.isFinite(lat) ? lat : undefined,
    lng: Number.isFinite(lng) ? lng : undefined,
  })
    .then((salons) => ({ salons }))
    .catch(() => ({
      salons: [],
      errorMessage: "Данные салонов временно недоступны.",
    }));

  return <SalonSearchShell {...salonResult} />;
}
