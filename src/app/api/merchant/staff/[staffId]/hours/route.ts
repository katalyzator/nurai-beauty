import { NextResponse } from "next/server";
import { getTelegramSession } from "@/lib/auth/telegram-session";
import { updateMerchantWorkingHours } from "@/lib/domain/merchant";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ staffId: string }> },
) {
  const session = await getTelegramSession();
  if (!session) {
    return NextResponse.json(
      { error: "Telegram authorization is required" },
      { status: 401 },
    );
  }

  try {
    const { staffId } = await params;
    const workingHour = await updateMerchantWorkingHours({
      input: await request.json(),
      staffId,
      telegramUserId: session.telegramUserId,
    });

    return NextResponse.json({ workingHour });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Working hours update failed" },
      { status: 400 },
    );
  }
}
