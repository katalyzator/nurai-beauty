import { describe, expect, it } from "vitest";
import {
  calculateEndAt,
  findFirstAvailableStaffId,
  getUnavailableBookingTimes,
  isBookingRangeOverlapping,
} from "@/lib/domain/bookings";

describe("calculateEndAt", () => {
  it("adds service duration to booking start", () => {
    expect(calculateEndAt("2026-06-23T10:00:00.000Z", 90)).toBe(
      "2026-06-23T11:30:00.000Z",
    );
  });

  it("detects overlapping booking ranges with end-exclusive boundaries", () => {
    expect(
      isBookingRangeOverlapping({
        existingStartAt: "2026-06-23T06:00:00.000Z",
        existingEndAt: "2026-06-23T07:30:00.000Z",
        nextStartAt: "2026-06-23T07:00:00.000Z",
        nextEndAt: "2026-06-23T08:00:00.000Z",
      }),
    ).toBe(true);
    expect(
      isBookingRangeOverlapping({
        existingStartAt: "2026-06-23T06:00:00.000Z",
        existingEndAt: "2026-06-23T07:30:00.000Z",
        nextStartAt: "2026-06-23T07:30:00.000Z",
        nextEndAt: "2026-06-23T08:30:00.000Z",
      }),
    ).toBe(false);
  });

  it("finds the first free staff member for a requested range", () => {
    expect(
      findFirstAvailableStaffId({
        candidateStaffIds: ["staff-a", "staff-b"],
        existingBookings: [
          {
            staffId: "staff-a",
            startAt: "2026-06-23T06:00:00.000Z",
            endAt: "2026-06-23T07:30:00.000Z",
          },
        ],
        nextStartAt: "2026-06-23T06:30:00.000Z",
        nextEndAt: "2026-06-23T08:00:00.000Z",
      }),
    ).toBe("staff-b");
  });

  it("marks a slot unavailable only when all candidate masters are busy", () => {
    const result = getUnavailableBookingTimes({
      candidateStaffIds: ["staff-a", "staff-b"],
      date: "2026-06-23",
      durationMinutes: 90,
      existingBookings: [
        {
          staffId: "staff-a",
          startAt: "2026-06-23T06:00:00.000Z",
          endAt: "2026-06-23T07:30:00.000Z",
        },
        {
          staffId: "staff-b",
          startAt: "2026-06-23T06:00:00.000Z",
          endAt: "2026-06-23T07:30:00.000Z",
        },
      ],
      times: ["12:00", "15:00"],
    });

    expect(result).toEqual(["12:00"]);
  });
});
