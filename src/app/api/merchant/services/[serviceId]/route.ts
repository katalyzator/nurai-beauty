import { NextResponse } from "next/server";
import { z } from "zod";
import { getTelegramSession } from "@/lib/auth/telegram-session";
import { toggleMerchantService } from "@/lib/domain/merchant";

const servicePatchSchema = z.object({
  isActive: z.boolean(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ serviceId: string }> },
) {
  const session = await getTelegramSession();
  if (!session) {
    return NextResponse.json(
      { error: "Telegram authorization is required" },
      { status: 401 },
    );
  }

  const input = servicePatchSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!input.success) {
    return NextResponse.json(
      { error: "Service update request is invalid" },
      { status: 400 },
    );
  }

  try {
    const { serviceId } = await params;
    const service = await toggleMerchantService({
      isActive: input.data.isActive,
      serviceId,
      telegramUserId: session.telegramUserId,
    });

    return NextResponse.json({ service });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Service update failed" },
      { status: 400 },
    );
  }
}
