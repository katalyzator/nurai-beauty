import type { SalonDetail, SalonSummary } from "@/lib/domain/types";
import { formatBishkekAddress } from "@/lib/domain/address";
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
  service_tags: string[] | null;
  latitude: number;
  longitude: number;
  distance_meters: number | null;
};

type SalonDetailRow = {
  id: string;
  name: string;
  slug: string;
  city: string;
  district: string | null;
  address: string;
  phone: string | null;
  instagram_url: string | null;
  description: string | null;
  rating: number;
  review_count: number;
  price_tier: number;
  cover_image_path: string | null;
  services: Array<{
    id: string;
    salon_id: string;
    category: string;
    name: string;
    description: string | null;
    duration_minutes: number;
    price_kgs: number;
    is_active?: boolean | null;
  }> | null;
  salon_staff: Array<{
    id: string;
    salon_id: string;
    full_name: string;
    role_title: string;
    bio: string | null;
    avatar_path: string | null;
    specialties: string[] | null;
    rating: number;
    review_count: number;
    is_active?: boolean | null;
  }> | null;
};

export function mapNearbySalonRow(row: NearbySalonRow): SalonSummary {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    city: row.city,
    district: row.district,
    address: formatBishkekAddress(row.address),
    rating: Number(row.rating),
    reviewCount: row.review_count,
    priceTier: row.price_tier,
    coverImageUrl: row.cover_image_path,
    serviceTags: row.service_tags ?? [],
    latitude: row.latitude,
    longitude: row.longitude,
    distanceMeters: row.distance_meters,
  };
}

export function mapSalonDetailRow(row: SalonDetailRow): SalonDetail {
  const activeServices = (row.services ?? []).filter(
    (service) => service.is_active ?? true,
  );
  const activeStaff = (row.salon_staff ?? []).filter(
    (member) => member.is_active ?? true,
  );

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    city: row.city,
    district: row.district,
    address: formatBishkekAddress(row.address),
    phone: row.phone,
    instagramUrl: row.instagram_url,
    description: row.description,
    rating: Number(row.rating),
    reviewCount: row.review_count,
    priceTier: row.price_tier,
    coverImageUrl: row.cover_image_path,
    latitude: 42.8766,
    longitude: 74.6057,
    distanceMeters: null,
    serviceTags: [
      ...new Set(
        activeServices.flatMap((service) => [service.category, service.name]),
      ),
    ],
    services: activeServices.map((service) => ({
      id: service.id,
      salonId: service.salon_id,
      category: service.category,
      name: service.name,
      description: service.description,
      durationMinutes: service.duration_minutes,
      priceKgs: service.price_kgs,
    })),
    staff: activeStaff.map((member) => ({
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
    radius_meters: params.radiusMeters ?? 18000,
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
      "id,name,slug,city,district,address,phone,instagram_url,description,rating,review_count,price_tier,cover_image_path,services(id,salon_id,category,name,description,duration_minutes,price_kgs,is_active),salon_staff(id,salon_id,full_name,role_title,bio,avatar_path,specialties,rating,review_count,is_active,sort_order)",
    )
    .eq("slug", slug)
    .eq("status", "active")
    .eq("services.is_active", true)
    .eq("salon_staff.is_active", true)
    .order("sort_order", { referencedTable: "salon_staff", ascending: true })
    .order("full_name", { referencedTable: "salon_staff", ascending: true })
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(error.message);
  }

  return mapSalonDetailRow(salon);
}
