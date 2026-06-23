import { describe, expect, it } from "vitest";
import {
  canTransitionMerchantBookingStatus,
  merchantBookingStatusLabels,
  normalizeMerchantOnboardingInput,
} from "@/lib/domain/merchant";

describe("merchant domain", () => {
  it("normalizes merchant onboarding input into safe database values", () => {
    const result = normalizeMerchantOnboardingInput({
      address: "  пр. Чуй 120, Бишкек ",
      instagramUrl: " nurai.beauty ",
      latitude: 42.8746,
      longitude: 74.5698,
      masterName: "  Айсулуу ",
      phone: " +996 700 111 222 ",
      salonName: "  NurAI Beauty Studio! ",
      serviceDurationMinutes: 90,
      serviceName: "  Маникюр с гель-лаком ",
      servicePriceKgs: 1500,
    });

    expect(result).toEqual({
      address: "пр. Чуй 120, Бишкек",
      instagramUrl: "nurai.beauty",
      latitude: 42.8746,
      longitude: 74.5698,
      masterName: "Айсулуу",
      phone: "+996 700 111 222",
      salonName: "NurAI Beauty Studio!",
      serviceDurationMinutes: 90,
      serviceName: "Маникюр с гель-лаком",
      servicePriceKgs: 1500,
      slugBase: "nurai-beauty-studio",
    });
  });

  it("keeps merchant booking status transitions explicit", () => {
    expect(canTransitionMerchantBookingStatus("new", "confirmed")).toBe(true);
    expect(canTransitionMerchantBookingStatus("new", "cancelled")).toBe(true);
    expect(canTransitionMerchantBookingStatus("confirmed", "completed")).toBe(
      true,
    );
    expect(canTransitionMerchantBookingStatus("completed", "new")).toBe(false);
    expect(canTransitionMerchantBookingStatus("cancelled", "confirmed")).toBe(
      false,
    );
  });

  it("labels booking statuses for the merchant UI", () => {
    expect(merchantBookingStatusLabels).toMatchObject({
      cancelled: "Отменена",
      completed: "Завершена",
      confirmed: "Подтверждена",
      new: "Новая",
      no_show: "Не пришел",
    });
  });
});
