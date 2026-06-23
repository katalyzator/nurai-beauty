import { notFound } from "next/navigation";
import Link from "next/link";
import { BookingForm } from "@/components/booking/BookingForm";
import { getSalonBySlug } from "@/lib/domain/salons";

export default async function SalonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const salon = await getSalonBySlug(slug);
  if (!salon) notFound();

  return (
    <main className="mx-auto grid max-w-5xl gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <section>
        <Link href="/" className="text-sm text-stone-600">
          Back to NurAI
        </Link>
        <h1 className="mt-4 text-3xl font-semibold text-stone-950">
          {salon.name}
        </h1>
        <p className="mt-2 text-stone-600">{salon.address}</p>
        <p className="mt-4 text-stone-700">{salon.description}</p>
        <div className="mt-6 grid gap-3">
          {salon.services.map((service) => (
            <div key={service.id} className="rounded-lg border bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-medium text-stone-950">
                    {service.name}
                  </h2>
                  <p className="mt-1 text-sm text-stone-600">
                    {service.durationMinutes} min
                  </p>
                </div>
                <p className="font-semibold text-stone-950">
                  {service.priceKgs} KGS
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
      <aside>
        <BookingForm salon={salon} />
      </aside>
    </main>
  );
}
