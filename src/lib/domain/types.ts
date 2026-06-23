export type SalonSummary = {
  id: string;
  name: string;
  slug: string;
  city: string;
  district: string | null;
  address: string;
  rating: number;
  reviewCount: number;
  priceTier: number;
  coverImageUrl: string | null;
  latitude: number;
  longitude: number;
  distanceMeters: number | null;
  serviceTags: string[];
};

export type Service = {
  id: string;
  salonId: string;
  category: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  priceKgs: number;
};

export type StaffMember = {
  id: string;
  salonId: string;
  fullName: string;
  roleTitle: string;
  bio: string | null;
  avatarUrl: string | null;
  specialties: string[];
  rating: number;
  reviewCount: number;
};

export type SalonDetail = SalonSummary & {
  description: string | null;
  phone: string | null;
  instagramUrl: string | null;
  services: Service[];
  staff: StaffMember[];
};

export type BookingInput = {
  salonId: string;
  serviceId: string;
  staffId: string | null;
  clientName: string;
  clientPhone: string;
  telegramUserId?: number | null;
  startAt: string;
  source: "web" | "telegram" | "merchant_manual";
  notes?: string;
};

export type Booking = {
  id: string;
  salonId: string;
  serviceId: string;
  staffId: string | null;
  clientName: string;
  clientPhone: string;
  telegramUserId: number | null;
  startAt: string;
  endAt: string;
  status: "new" | "confirmed" | "completed" | "cancelled" | "no_show";
  source: "web" | "telegram" | "merchant_manual";
};
