import Link from "next/link";
import type { SalonSummary } from "@/lib/domain/types";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { TelegramAuthButton } from "@/components/auth/TelegramAuthButton";
import { NurAiAssistant } from "@/components/assistant/NurAiAssistant";
import { SalonExplorer } from "@/components/marketplace/SalonExplorer";

export function SalonSearchShell({
  salons,
  errorMessage,
}: {
  salons: SalonSummary[];
  errorMessage?: string;
}) {
  return (
    <main className="beauty-shell min-h-screen px-3 pb-8 pt-4 text-[var(--ink)] sm:px-5 lg:px-8">
      <div className="mx-auto max-w-[1320px]">
        <header className="flex min-h-16 items-center justify-between gap-4 border-b border-[var(--line)]">
          <BrandLogo />

          <nav className="hidden items-center gap-1 text-sm font-bold text-[var(--muted)] md:flex">
            <a
              className="rounded-full px-4 py-2 text-[var(--ink)] hover:bg-white"
              href="#salons"
            >
              Салоны
            </a>
            <a className="rounded-full px-4 py-2 hover:bg-white hover:text-[var(--ink)]" href="#map">
              Карта
            </a>
            <a
              className="rounded-full px-4 py-2 hover:bg-white hover:text-[var(--ink)]"
              href="#assistant"
            >
              AI запись
            </a>
            <Link
              className="rounded-full px-4 py-2 hover:bg-white hover:text-[var(--ink)]"
              href="/merchant"
            >
              Для салонов
            </Link>
          </nav>

          <TelegramAuthButton
            botUsername={process.env.TELEGRAM_BOT_USERNAME}
            compact
          />
        </header>

        <SalonExplorer errorMessage={errorMessage} salons={salons} />
      </div>
      <div id="assistant">
        <NurAiAssistant floating />
      </div>
    </main>
  );
}
