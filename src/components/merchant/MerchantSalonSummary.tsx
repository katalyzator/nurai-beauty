import type { MerchantSalon } from "@/lib/domain/merchant";

export function MerchantSalonSummary({ salons }: { salons: MerchantSalon[] }) {
  return (
    <section className="grid gap-3 md:grid-cols-2">
      {salons.map((salon) => (
        <article key={salon.id} className="rounded-lg border bg-white p-4">
          <h2 className="font-semibold text-stone-950">{salon.name}</h2>
          <p className="mt-1 text-sm text-stone-600">{salon.address}</p>
          <p className="mt-2 text-xs uppercase tracking-wide text-stone-500">
            {salon.status}
          </p>
        </article>
      ))}
    </section>
  );
}
