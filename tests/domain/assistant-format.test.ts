import { describe, expect, it } from "vitest";
import {
  buildLocalAssistantResponse,
  formatAssistantMessage,
  type AssistantContext,
} from "@/lib/domain/assistant";

const context: AssistantContext = {
  currentDate: "2026-06-23",
  timezone: "Asia/Bishkek",
  isTelegramAuthenticated: false,
  ownBookings: [],
  salons: [
    {
      id: "11111111-1111-4111-8111-111111111111",
      name: "Erkindik Nails",
      slug: "erkindik-nails",
      address: "бульвар Эркиндик 45, Бишкек",
      rating: 4.8,
      reviewCount: 31,
      services: [
        {
          id: "22222222-2222-4222-8222-222222222222",
          name: "Маникюр с гель-лаком",
          category: "Ногти",
          durationMinutes: 90,
          priceKgs: 1500,
        },
      ],
      staff: [
        {
          id: "33333333-3333-4333-8333-333333333333",
          fullName: "Сезим",
          roleTitle: "Nail artist",
        },
      ],
    },
  ],
};

describe("assistant message formatting", () => {
  it("formats paragraphs, bold spans, bullets, and numbered steps", () => {
    const blocks = formatAssistantMessage(
      [
        "Отлично! **Erkindik Nails** подходит.",
        "",
        "• Маникюр с гель-лаком",
        "• Мастер: Сезим",
        "",
        "1. Выберите время",
        "2. Оставьте телефон",
      ].join("\n"),
    );

    expect(blocks).toEqual([
      {
        type: "paragraph",
        parts: [
          { text: "Отлично! ", strong: false },
          { text: "Erkindik Nails", strong: true },
          { text: " подходит.", strong: false },
        ],
      },
      {
        type: "list",
        ordered: false,
        items: [
          [{ text: "Маникюр с гель-лаком", strong: false }],
          [{ text: "Мастер: Сезим", strong: false }],
        ],
      },
      {
        type: "list",
        ordered: true,
        items: [
          [{ text: "Выберите время", strong: false }],
          [{ text: "Оставьте телефон", strong: false }],
        ],
      },
    ]);
  });

  it("returns a useful local mock answer with a booking draft", () => {
    const response = buildLocalAssistantResponse({
      context,
      message:
        "Запиши меня на маникюр сегодня в 11:00. Имя Тест, телефон +996 700 000 000",
    });

    expect(response.intent).toBe("book");
    expect(response.bookingDraft).toMatchObject({
      salonName: "Erkindik Nails",
      serviceName: "Маникюр с гель-лаком",
      staffName: "Сезим",
      date: "2026-06-23",
      time: "11:00",
    });
    expect(response.reply).toContain("Локальный режим");
  });
});
