import { createServerClient } from "@/lib/supabase/server";

export type MerchantSalon = {
  id: string;
  name: string;
  status: string;
  address: string;
};

export type MerchantBooking = {
  id: string;
  salonName: string;
  clientName: string;
  clientPhone: string;
  startAt: string;
  status: string;
};

type BookingRow = {
  id: string;
  client_name: string;
  client_phone: string;
  start_at: string;
  status: string;
  salons: { name: string } | { name: string }[] | null;
};

export async function getMerchantDashboard(): Promise<{
  salons: MerchantSalon[];
  bookings: MerchantBooking[];
}> {
  const supabase = await createServerClient();
  const { data: userResult } = await supabase.auth.getUser();

  if (!userResult.user) {
    return { salons: [], bookings: [] };
  }

  const { data: salons, error: salonsError } = await supabase
    .from("salons")
    .select("id,name,status,address")
    .eq("owner_id", userResult.user.id);

  if (salonsError) throw new Error(salonsError.message);

  const salonIds = (salons ?? []).map((salon) => salon.id);
  if (salonIds.length === 0) {
    return { salons: [], bookings: [] };
  }

  const { data: bookings, error: bookingsError } = await supabase
    .from("bookings")
    .select("id,client_name,client_phone,start_at,status,salons(name)")
    .in("salon_id", salonIds)
    .order("start_at", { ascending: true });

  if (bookingsError) throw new Error(bookingsError.message);

  return {
    salons: (salons ?? []).map((salon) => ({
      id: salon.id,
      name: salon.name,
      status: salon.status,
      address: salon.address,
    })),
    bookings: ((bookings ?? []) as BookingRow[]).map((booking) => {
      const salon = Array.isArray(booking.salons)
        ? booking.salons[0]
        : booking.salons;

      return {
        id: booking.id,
        salonName: salon?.name ?? "Salon",
        clientName: booking.client_name,
        clientPhone: booking.client_phone,
        startAt: booking.start_at,
        status: booking.status,
      };
    }),
  };
}
