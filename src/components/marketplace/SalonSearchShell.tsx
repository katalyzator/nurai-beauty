import Link from "next/link";
import type { SalonSummary } from "@/lib/domain/types";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { TelegramAuthButton } from "@/components/auth/TelegramAuthButton";
import { NurAiAssistant } from "@/components/assistant/NurAiAssistant";
import { SalonExplorer } from "@/components/marketplace/SalonExplorer";

const navItems = [
  { href: "#search", label: "Поиск" },
  { href: "#map", label: "Карта" },
  { href: "#salons", label: "Каталог" },
  { href: "#assistant", label: "AI запись" },
  { href: "/merchant", label: "Для салонов", type: "link" },
] as const;

export function SalonSearchShell({
  salons,
  errorMessage,
}: {
  salons: SalonSummary[];
  errorMessage?: string;
}) {
  return (
    <main className="beauty-shell min-h-screen px-3 pb-10 pt-3 text-[var(--ink)] sm:px-5 lg:px-8">
      <div className="mx-auto max-w-[1320px]">
        <header className="reveal-in sticky top-3 z-40 mt-1 flex min-h-16 items-center justify-between gap-4 rounded-full glass glass-edge px-3 py-2 sm:px-5">
          <BrandLogo />

          <HeaderNav className="hidden md:flex" />

          <TelegramAuthButton
            botUsername={process.env.TELEGRAM_BOT_USERNAME}
            compact
          />
        </header>

        <HeaderNav
          className="mt-3 flex overflow-x-auto pb-1 md:hidden soft-scroll"
          compact
        />

        <SalonExplorer errorMessage={errorMessage} salons={salons} />
      </div>
      <div id="assistant">
        <NurAiAssistant floating />
      </div>
    </main>
  );
}

function HeaderNav({
  className,
  compact = false,
}: {
  className: string;
  compact?: boolean;
}) {
  return (
    <nav
      aria-label="Основная навигация"
      className={`${className} items-center gap-1 text-sm font-bold text-[var(--muted)]`}
    >
      {navItems.map((item, index) => {
        const className = `shrink-0 rounded-full px-4 py-2 transition ${
          index === 0
            ? "glass-strong text-[var(--brand-plum)] shadow-[var(--shadow-subtle)]"
            : "hover:bg-white/70 hover:text-[var(--ink)]"
        }`;

        if ("type" in item && item.type === "link") {
          return (
            <Link className={className} href={item.href} key={item.href}>
              {compact && item.label === "Для салонов" ? "Салонам" : item.label}
            </Link>
          );
        }

        return (
          <a className={className} href={item.href} key={item.href}>
            {item.label}
          </a>
        );
      })}
    </nav>
  );
}
