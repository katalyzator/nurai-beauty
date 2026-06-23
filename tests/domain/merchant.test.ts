import { describe, expect, it } from "vitest";
import {
  buildMerchantInviteLink,
  canManageMerchantCatalog,
  canTransitionMerchantBookingStatus,
  merchantBookingStatusLabels,
  normalizeMerchantInvitationInput,
  normalizeMerchantOnboardingInput,
  normalizeMerchantServiceInput,
  normalizeMerchantStaffInput,
  normalizeMerchantWorkingHoursInput,
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

  it("normalizes a merchant service form payload", () => {
    expect(
      normalizeMerchantServiceInput({
        category: "",
        durationMinutes: " 75 ",
        name: "  Архитектура бровей ",
        priceKgs: "1200",
      }),
    ).toEqual({
      category: "Брови",
      durationMinutes: 75,
      isActive: true,
      name: "Архитектура бровей",
      priceKgs: 1200,
    });
  });

  it("normalizes staff specialties into a compact list", () => {
    expect(
      normalizeMerchantStaffInput({
        fullName: "  Дана Бакыт ",
        roleTitle: "",
        specialties: " Маникюр, педикюр\nманикюр ",
      }),
    ).toEqual({
      fullName: "Дана Бакыт",
      isActive: true,
      roleTitle: "Мастер",
      specialties: ["Маникюр", "педикюр"],
    });
  });

  it("normalizes merchant invitation inputs", () => {
    expect(
      normalizeMerchantInvitationInput({
        inviteeName: "  Айжан ",
        phone: " +996 555 000 111 ",
        role: "manager",
        telegramUsername: " @aijan_beauty ",
      }),
    ).toEqual({
      inviteeName: "Айжан",
      phone: "+996 555 000 111",
      role: "manager",
      telegramUsername: "aijan_beauty",
    });
  });

  it("allows merchant invitations without an optional display name", () => {
    expect(
      normalizeMerchantInvitationInput({
        inviteeName: " ",
        role: "staff",
        telegramUsername: " @staff_member ",
      }),
    ).toEqual({
      inviteeName: undefined,
      phone: undefined,
      role: "staff",
      telegramUsername: "staff_member",
    });
  });

  it("normalizes a weekly working-hour payload", () => {
    expect(
      normalizeMerchantWorkingHoursInput({
        endsAt: "19:30",
        isActive: "true",
        startsAt: "09:00",
        weekday: "2",
      }),
    ).toEqual({
      endsAt: "19:30",
      isActive: true,
      startsAt: "09:00",
      weekday: 2,
    });
  });

  it("keeps catalog management limited to owner and admin roles", () => {
    expect(canManageMerchantCatalog("owner")).toBe(true);
    expect(canManageMerchantCatalog("admin")).toBe(true);
    expect(canManageMerchantCatalog("manager")).toBe(false);
    expect(canManageMerchantCatalog("staff")).toBe(false);
  });

  it("builds stable merchant invite links without leaking tokens into config", () => {
    expect(buildMerchantInviteLink("abc123", "https://nurai.beauty/")).toBe(
      "https://nurai.beauty/merchant/invite/abc123",
    );
    expect(buildMerchantInviteLink("abc123", "")).toBe(
      "/merchant/invite/abc123",
    );
  });
});
