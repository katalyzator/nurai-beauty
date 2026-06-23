"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";
import { Ban, Check, LoaderCircle, X } from "lucide-react";
import type { Booking } from "@/lib/domain/types";

type MerchantBookingAction = {
  label: string;
  status: Booking["status"];
  tone: "primary" | "soft" | "danger";
  icon: ReactNode;
};

const actionsByStatus: Record<Booking["status"], MerchantBookingAction[]> = {
  cancelled: [],
  completed: [],
  confirmed: [
    {
      icon: <Check aria-hidden className="h-3.5 w-3.5" />,
      label: "Завершить",
      status: "completed",
      tone: "primary",
    },
    {
      icon: <Ban aria-hidden className="h-3.5 w-3.5" />,
      label: "Не пришел",
      status: "no_show",
      tone: "soft",
    },
    {
      icon: <X aria-hidden className="h-3.5 w-3.5" />,
      label: "Отменить",
      status: "cancelled",
      tone: "danger",
    },
  ],
  new: [
    {
      icon: <Check aria-hidden className="h-3.5 w-3.5" />,
      label: "Подтвердить",
      status: "confirmed",
      tone: "primary",
    },
    {
      icon: <X aria-hidden className="h-3.5 w-3.5" />,
      label: "Отменить",
      status: "cancelled",
      tone: "danger",
    },
  ],
  no_show: [],
};

export function MerchantBookingActions({
  bookingId,
  status,
}: {
  bookingId: string;
  status: Booking["status"];
}) {
  const router = useRouter();
  const [pendingStatus, setPendingStatus] = useState<Booking["status"] | null>(
    null,
  );
  const [errorMessage, setErrorMessage] = useState("");
  const actions = actionsByStatus[status];

  async function updateStatus(nextStatus: Booking["status"]) {
    setPendingStatus(nextStatus);
    setErrorMessage("");

    const response = await fetch(`/api/merchant/bookings/${bookingId}`, {
      body: JSON.stringify({ status: nextStatus }),
      headers: { "Content-Type": "application/json" },
      method: "PATCH",
    });

    if (response.ok) {
      router.refresh();
      setPendingStatus(null);
      return;
    }

    const payload = await response.json().catch(() => null);
    setErrorMessage(payload?.error ?? "Не удалось обновить запись");
    setPendingStatus(null);
  }

  if (actions.length === 0) {
    return (
      <span className="text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--soft)]">
        Закрыта
      </span>
    );
  }

  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap gap-2">
        {actions.map((action) => (
          <button
            className={`inline-flex min-h-9 items-center justify-center gap-1.5 rounded-full px-3 text-xs font-black ${
              action.tone === "primary"
                ? "bg-[var(--brand-plum)] text-white"
                : action.tone === "danger"
                  ? "border border-red-200 bg-red-50 text-red-700"
                  : "border border-[var(--rose-line)] bg-white text-[var(--rose-deep)]"
            }`}
            disabled={Boolean(pendingStatus)}
            key={action.status}
            onClick={() => void updateStatus(action.status)}
            type="button"
          >
            {pendingStatus === action.status ? (
              <LoaderCircle aria-hidden className="h-3.5 w-3.5 animate-spin" />
            ) : (
              action.icon
            )}
            {action.label}
          </button>
        ))}
      </div>
      {errorMessage ? (
        <p className="text-xs font-bold text-red-700">{errorMessage}</p>
      ) : null}
    </div>
  );
}
