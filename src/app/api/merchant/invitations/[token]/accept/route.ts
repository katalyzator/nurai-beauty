import { NextResponse } from "next/server";
import { getTelegramSession } from "@/lib/auth/telegram-session";
import { acceptMerchantInvitation } from "@/lib/domain/merchant";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const session = await getTelegramSession();
  if (!session) {
    return NextResponse.json(
      { error: "Telegram authorization is required" },
      { status: 401 },
    );
  }

  try {
    const { token } = await params;
    const result = await acceptMerchantInvitation({ session, token });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invitation accept failed" },
      { status: 400 },
    );
  }
}
