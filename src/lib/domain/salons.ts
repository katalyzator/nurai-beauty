import type { SalonDetail, SalonSummary } from "@/lib/domain/types";
import { createServerClient } from "@/lib/supabase/server";

type NearbySalonRow = {
  id: string;
  name: string;
  slug: string;
  city: string;
  district: string | null;
  address: string;
  rating: number;
  review_count: number;
  price_tier: number;
  cover_image_path: string | null;
  latitude: number;
  longitude: number;
  distance_meters: number | null;
};

export function mapNearbySalonRow(row: NearbySalonRow): SalonSummary {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    city: row.city,
    district: row.district,
    address: row.address,
    rating: Number(row.rating),
    reviewCount: row.review_count,
    priceTier: row.price_tier,
    coverImageUrl: row.cover_image_path,
    latitude: row.latitude,
    longitude: row.longitude,
    distanceMeters: row.distance_meters,
  };
}

export async function getNearbySalons(params: {
  lat?: number;
  lng?: number;
  radiusMeters?: number;
}): Promise<SalonSummary[]> {
  const supabase = await createServerClient();
  const lat = typeof params.lat === "number" ? params.lat : 42.8746;
  const lng = typeof params.lng === "number" ? params.lng : 74.6122;

  const { data, error } = await supabase.rpc("nearby_salons", {
    lat,
    lng,
    radius_meters: params.radiusMeters ?? 10000,
  });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapNearbySalonRow);
}

export async function getSalonBySlug(slug: string): Promise<SalonDetail | null> {
  const supabase = await createServerClient();

  const { data: salon, error } = await supabase
    .from("salons")
    .select(
      "id,name,slug,city,district,address,phone,instagram_url,description,rating,review_count,price_tier,cover_image_path",
    )
    .eq("slug", slug)
    .eq("status", "active")
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(error.message);
  }

  const [{ data: services }, { data: staff }] = await Promise.all([
    supabase
      .from("services")
      .select(
        "id,salon_id,category,name,description,duration_minutes,price_kgs",
      )
      .eq("salon_id", salon.id)
      .eq("is_active", true),
    supabase
      .from("salon_staff")
      .select(
        "id,salon_id,full_name,role_title,bio,avatar_path,specialties,rating,review_count",
      )
      .eq("salon_id", salon.id)
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("full_name", { ascending: true }),
  ]);

  return {
    id: salon.id,
    name: salon.name,
    slug: salon.slug,
    city: salon.city,
    district: salon.district,
    address: salon.address,
    phone: salon.phone,
    instagramUrl: salon.instagram_url,
    description: salon.description,
    rating: Number(salon.rating),
    reviewCount: salon.review_count,
    priceTier: salon.price_tier,
    coverImageUrl: salon.cover_image_path,
    latitude: 42.8766,
    longitude: 74.6057,
    distanceMeters: null,
    services: (services ?? []).map((service) => ({
      id: service.id,
      salonId: service.salon_id,
      category: service.category,
      name: service.name,
      description: service.description,
      durationMinutes: service.duration_minutes,
      priceKgs: service.price_kgs,
    })),
    staff: (staff ?? []).map((member) => ({
      id: member.id,
      salonId: member.salon_id,
      fullName: member.full_name,
      roleTitle: member.role_title,
      bio: member.bio,
      avatarUrl: member.avatar_path,
      specialties: member.specialties ?? [],
      rating: Number(member.rating),
      reviewCount: member.review_count,
    })),
  };
}
