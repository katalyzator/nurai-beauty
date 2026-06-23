import { Suspense } from "react";
import type { SalonSummary } from "@/lib/domain/types";
import { LocationButton } from "@/components/map/LocationButton";
import { SalonMapPanel } from "@/components/map/SalonMapPanel";
import { SalonCard } from "@/components/marketplace/SalonCard";

export function SalonSearchShell({
  salons,
  errorMessage,
}: {
  salons: SalonSummary[];
  errorMessage?: string;
}) {
  return (
    <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_520px]">
      <section>
        <div className="mb-5">
          <p className="text-sm font-medium text-stone-600">Нурай</p>
          <h1 className="mt-1 text-3xl font-semibold text-stone-950">NurAI</h1>
          <p className="mt-2 max-w-xl text-sm text-stone-600">
            Find and book beauty salons in Bishkek without waiting for WhatsApp
            replies.
          </p>
          <div className="mt-4">
            <Suspense
              fallback={
                <div className="h-10 w-40 rounded-md border border-stone-200 bg-stone-100" />
              }
            >
              <LocationButton />
            </Suspense>
          </div>
        </div>
        {errorMessage ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {errorMessage}
          </div>
        ) : null}
        <div className="grid gap-3">
          {salons.length > 0 ? (
            salons.map((salon) => <SalonCard key={salon.id} salon={salon} />)
          ) : (
            <div className="rounded-lg border border-stone-200 bg-white px-4 py-8 text-center text-sm text-stone-600">
              Salons will appear here as soon as the database is ready.
            </div>
          )}
        </div>
      </section>
      <aside className="lg:sticky lg:top-4 lg:self-start">
        <SalonMapPanel salons={salons} />
      </aside>
    </main>
  );
}
