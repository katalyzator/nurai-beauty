import { NextResponse } from "next/server";
import { z } from "zod";
import { getTelegramSession } from "@/lib/auth/telegram-session";
import {
  assistantBoundaryReply,
  buildAssistantSystemPrompt,
  classifyAssistantMessage,
  DEFAULT_OPENROUTER_MODEL,
  getAssistantResponseJsonSchema,
  validateAssistantOutput,
} from "@/lib/domain/assistant";
import { getAssistantContext } from "@/lib/domain/assistant-data";

export const runtime = "nodejs";

const assistantRequestSchema = z.object({
  message: z.string().trim().min(1).max(800),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(1200),
      }),
    )
    .max(8)
    .optional(),
});

type OpenRouterResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

export async function POST(request: Request) {
  const input = assistantRequestSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) {
    return NextResponse.json(
      { error: "Assistant request is invalid" },
      { status: 400 },
    );
  }

  const scope = classifyAssistantMessage(input.data.message);
  if (!scope.allowed) {
    return NextResponse.json({
      intent: "boundary",
      reply: assistantBoundaryReply(),
      bookingDraft: null,
      suggestions: ["Подобрать салон", "Показать ближайшее время"],
    });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        intent: "boundary",
        reply:
          "AI-помощник временно не подключен. Можно выбрать салон и записаться через форму на странице салона.",
        bookingDraft: null,
        suggestions: ["Показать салоны", "Открыть карту"],
      },
      { status: 503 },
    );
  }

  try {
    const telegramSession = await getTelegramSession();
    const context = await getAssistantContext({
      telegramUserId: telegramSession?.telegramUserId ?? null,
    });
    const model = process.env.OPENROUTER_MODEL ?? DEFAULT_OPENROUTER_MODEL;
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "https://nurai.beauty",
        "X-OpenRouter-Title": "nurAI",
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        max_tokens: 800,
        messages: [
          { role: "system", content: buildAssistantSystemPrompt(context) },
          ...sanitizeHistory(input.data.history ?? []),
          { role: "user", content: input.data.message },
        ],
        response_format: {
          type: "json_schema",
          json_schema: getAssistantResponseJsonSchema(),
        },
      }),
    });

    if (!response.ok) {
      const details = await response.text().catch(() => "");
      throw new Error(
        `OpenRouter request failed: ${response.status} ${details.slice(0, 180)}`,
      );
    }

    const payload = (await response.json()) as OpenRouterResponse;
    const content = payload.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("OpenRouter returned an empty assistant message");
    }

    return NextResponse.json(validateAssistantOutput(content, context));
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        intent: "boundary",
        reply:
          "AI-помощник сейчас не ответил. Запись через список салонов и форму работает, попробуйте еще раз через минуту.",
        bookingDraft: null,
        suggestions: ["Показать салоны", "Выбрать ближайшее время"],
      },
      { status: 502 },
    );
  }
}

function sanitizeHistory(
  history: Array<{ role: "user" | "assistant"; content: string }>,
) {
  return history.slice(-6).map((message) => ({
    role: message.role,
    content: message.content.slice(0, 1000),
  }));
}
