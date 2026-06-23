import { NextResponse } from "next/server";
import { getTelegramSession } from "@/lib/auth/telegram-session";
import { createMerchantOnboarding } from "@/lib/domain/merchant";

export async function POST(request: Request) {
  const session = await getTelegramSession();
  if (!session) {
    return NextResponse.json(
      { error: "Telegram authorization is required" },
      { status: 401 },
    );
  }

  try {
    const salon = await createMerchantOnboarding({
      input: await request.json(),
      session,
    });

    return NextResponse.json({ salon }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Merchant onboarding failed",
      },
      { status: 400 },
    );
  }
}
