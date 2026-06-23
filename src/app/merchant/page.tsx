import Link from "next/link";
import { ArrowLeft, CalendarDays, Store } from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { MerchantAuthGate } from "@/components/merchant/MerchantAuthGate";
import { MerchantBookingsTable } from "@/components/merchant/MerchantBookingsTable";
import { MerchantInvitationPanel } from "@/components/merchant/MerchantInvitationPanel";
import { MerchantOnboardingForm } from "@/components/merchant/MerchantOnboardingForm";
import { MerchantSalonSummary } from "@/components/merchant/MerchantSalonSummary";
import { MerchantServiceManager } from "@/components/merchant/MerchantServiceManager";
import { MerchantStaffManager } from "@/components/merchant/MerchantStaffManager";
import { getMerchantDashboard } from "@/lib/domain/merchant";

export default async function MerchantPage() {
  const dashboard = await getMerchantDashboard();

  return (
    <main className="beauty-shell min-h-screen px-3 py-4 sm:px-5 lg:px-8">
      <div className="mx-auto max-w-[1400px]">
        <header className="flex min-h-16 items-center justify-between gap-4 border-b border-[var(--rose-line)]">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--rose-line)] bg-white px-4 text-sm font-extrabold text-[var(--ink)] shadow-[var(--shadow-subtle)] hover:-translate-y-0.5"
          >
            <ArrowLeft aria-hidden className="h-4 w-4" />
            Маркетплейс
          </Link>
          <div className="hidden sm:block">
            <BrandLogo compact />
          </div>
          <span className="rounded-full bg-[var(--brand-fog)] px-4 py-2 text-sm font-extrabold text-[var(--brand-plum)]">
            Кабинет салона
          </span>
        </header>

        {!dashboard.authenticated ? (
          <MerchantAuthGate botUsername={process.env.TELEGRAM_BOT_USERNAME} />
        ) : dashboard.salons.length === 0 ? (
          <MerchantOnboardingForm />
        ) : (
          <>
            <section className="mt-6 rounded-[28px] border border-[var(--rose-line)] bg-white p-6 shadow-[var(--shadow-card)] sm:p-8">
              <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--rose-deep)]">
                <Store aria-hidden className="h-4 w-4" />
                Кабинет партнера
              </p>
              <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
                <div>
                  <h1 className="font-display text-5xl font-semibold leading-none sm:text-6xl">
                    Управление салоном
                  </h1>
                  <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)]">
                    {dashboard.session?.firstName}, здесь заявки, услуги,
                    мастера, графики и доступы команды. Всё привязано к
                    Telegram-ролям салона.
                  </p>
                </div>
                <div className="rounded-[20px] border border-[var(--rose-line)] bg-[var(--porcelain)] p-4">
                  <p className="flex items-center gap-2 text-sm font-bold text-[var(--muted)]">
                    <CalendarDays aria-hidden className="h-4 w-4" />
                    В работе
                  </p>
                  <p className="mt-2 font-display text-5xl font-bold leading-none">
                    {dashboard.bookings.length}
                  </p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-[var(--soft)]">
                    заявок клиентов
                  </p>
                </div>
              </div>
            </section>

            <div className="mt-6 grid gap-5">
              <MerchantSalonSummary salons={dashboard.salons} />
              <MerchantServiceManager
                salons={dashboard.salons}
                services={dashboard.services}
              />
              <MerchantStaffManager
                salons={dashboard.salons}
                staff={dashboard.staff}
                workingHours={dashboard.workingHours}
              />
              <MerchantInvitationPanel
                invitations={dashboard.invitations}
                salons={dashboard.salons}
              />
              <MerchantBookingsTable bookings={dashboard.bookings} />
            </div>
          </>
        )}
      </div>
    </main>
  );
}
