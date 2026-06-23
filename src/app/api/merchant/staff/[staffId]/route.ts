import { NextResponse } from "next/server";
import { z } from "zod";
import { getTelegramSession } from "@/lib/auth/telegram-session";
import { toggleMerchantStaff } from "@/lib/domain/merchant";

const staffPatchSchema = z.object({
  isActive: z.boolean(),
});

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

  const input = staffPatchSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!input.success) {
    return NextResponse.json(
      { error: "Staff update request is invalid" },
      { status: 400 },
    );
  }

  try {
    const { staffId } = await params;
    const staffMember = await toggleMerchantStaff({
      isActive: input.data.isActive,
      staffId,
      telegramUserId: session.telegramUserId,
    });

    return NextResponse.json({ staffMember });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Staff update failed" },
      { status: 400 },
    );
  }
}
