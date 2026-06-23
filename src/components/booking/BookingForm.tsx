"use client";

import { useState } from "react";
import type { SalonDetail } from "@/lib/domain/types";

export function BookingForm({
  salon,
  source = "web",
}: {
  salon: SalonDetail;
  source?: "web" | "telegram";
}) {
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  const firstService = salon.services[0];
  const firstStaff = salon.staff[0];

  async function submit(formData: FormData) {
    setStatus("saving");
    const response = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        salonId: salon.id,
        serviceId: String(formData.get("serviceId")),
        staffId: String(formData.get("staffId")),
        clientName: String(formData.get("clientName")),
        clientPhone: String(formData.get("clientPhone")),
        startAt: new Date(String(formData.get("startAt"))).toISOString(),
        source,
      }),
    });

    setStatus(response.ok ? "saved" : "error");
  }

  return (
    <form action={submit} className="grid gap-3 rounded-lg border bg-white p-4">
      <select
        name="serviceId"
        defaultValue={firstService?.id}
        className="rounded-md border px-3 py-2"
      >
        {salon.services.map((service) => (
          <option key={service.id} value={service.id}>
            {service.name} · {service.priceKgs} KGS
          </option>
        ))}
      </select>
      <select
        name="staffId"
        defaultValue={firstStaff?.id}
        className="rounded-md border px-3 py-2"
      >
        {salon.staff.map((member) => (
          <option key={member.id} value={member.id}>
            {member.fullName}
          </option>
        ))}
      </select>
      <input
        name="startAt"
        type="datetime-local"
        required
        className="rounded-md border px-3 py-2"
      />
      <input
        name="clientName"
        placeholder="Your name"
        required
        className="rounded-md border px-3 py-2"
      />
      <input
        name="clientPhone"
        placeholder="+996..."
        required
        className="rounded-md border px-3 py-2"
      />
      <button
        type="submit"
        className="rounded-md bg-stone-950 px-4 py-2 font-medium text-white"
      >
        {status === "saving" ? "Booking..." : "Book appointment"}
      </button>
      {status === "saved" && (
        <p className="text-sm text-emerald-700">
          Booking created. The salon will confirm it.
        </p>
      )}
      {status === "error" && (
        <p className="text-sm text-red-700">
          Could not create booking. Check the details and try again.
        </p>
      )}
    </form>
  );
}
