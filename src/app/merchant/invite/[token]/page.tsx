import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { MerchantAuthGate } from "@/components/merchant/MerchantAuthGate";
import { MerchantInviteAccept } from "@/components/merchant/MerchantInviteAccept";
import { getTelegramSession } from "@/lib/auth/telegram-session";

export default async function MerchantInvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const [{ token }, session] = await Promise.all([params, getTelegramSession()]);

  return (
    <main className="beauty-shell min-h-screen px-3 py-4 sm:px-5 lg:px-8">
      <div className="mx-auto max-w-[1100px]">
        <header className="sticky top-3 z-40 flex min-h-16 items-center justify-between gap-4 rounded-full glass glass-edge px-3 py-2">
          <Link
            href="/"
            className="btn-glass inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-extrabold hover:-translate-y-0.5"
          >
            <ArrowLeft aria-hidden className="h-4 w-4" />
            nurAI
          </Link>
          <div className="hidden sm:block">
            <BrandLogo compact />
          </div>
        </header>

        {session ? (
          <MerchantInviteAccept token={token} />
        ) : (
          <MerchantAuthGate botUsername={process.env.TELEGRAM_BOT_USERNAME} />
        )}
      </div>
    </main>
  );
}
