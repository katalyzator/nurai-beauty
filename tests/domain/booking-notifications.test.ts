import { describe, expect, it } from "vitest";
import { buildTelegramBookingConfirmationText } from "@/lib/domain/booking-notifications";

describe("booking notifications", () => {
  it("builds a warm Telegram confirmation message with booking details", () => {
    const text = buildTelegramBookingConfirmationText({
      salonAddress: "бульвар Эркиндик 45, Бишкек",
      salonName: "Erkindik Nails",
      serviceName: "Маникюр с гель-лаком",
      staffName: "Сезим",
      startAt: "2026-06-23T06:00:00.000Z",
    });

    expect(text).toContain("Запись создана");
    expect(text).toContain("Erkindik Nails");
    expect(text).toContain("Маникюр с гель-лаком");
    expect(text).toContain("Сезим");
    expect(text).toContain("23 июня");
    expect(text).toContain("12:00");
    expect(text).toContain("бульвар Эркиндик 45");
  });

  it("escapes merchant-controlled text for Telegram HTML", () => {
    const text = buildTelegramBookingConfirmationText({
      salonAddress: "ул. <Главная> & 1",
      salonName: "Beauty <script>",
      serviceName: "Уход & SPA",
      staffName: null,
      startAt: "2026-06-23T06:00:00.000Z",
    });

    expect(text).toContain("Beauty &lt;script&gt;");
    expect(text).toContain("Уход &amp; SPA");
    expect(text).toContain("ул. &lt;Главная&gt; &amp; 1");
    expect(text).toContain("<b>любой свободный мастер</b>");
  });
});
