# NurAI MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first production-shaped MVP for NurAI, a Kyrgyzstan beauty marketplace with web marketplace, Telegram Mini App route, OpenStreetMap discovery, Supabase-backed salon data, booking flow, and merchant cabinet.

**Architecture:** Use one Next.js App Router application with shared domain modules and role-based routes. Supabase provides Postgres, Auth, Storage, Row Level Security, SQL migrations, seed data, and PostGIS nearest-salon queries. Web marketplace and Telegram Mini App share data access, UI primitives, salon discovery, booking creation, and map components.

**Tech Stack:** Next.js App Router, TypeScript, Tailwind CSS, Supabase, `@supabase/ssr`, `@supabase/supabase-js`, Supabase SQL migrations, PostGIS, Leaflet/React Leaflet, Telegram Mini Apps WebApp SDK, Vitest, Playwright.

## Global Constraints

- Use Supabase as the backend platform: Postgres database, Auth, Storage, Row Level Security, and server-side queries from Next.js.
- Use Supabase PostGIS extension for nearest-salon queries.
- Commit SQL migrations in the repo for schema, policies, indexes, functions, and seed data.
- Seed data must live in SQL migrations or seed scripts, not in hardcoded frontend mock objects.
- Use one backend and shared UI/data modules for web marketplace and Telegram Mini App.
- Use `https://nurai.beauty` as the production domain.
- Use `https://nurai.beauty/telegram` as the Telegram Mini App URL.
- Use `https://nurai.beauty/api/telegram/webhook` as the Telegram bot webhook URL.
- Use OpenStreetMap-based maps with visible attribution.
- Do not depend on public `tile.openstreetmap.org` servers for production traffic; configure tile URL by environment variable.
- First version excludes native iOS/Android apps, full payment processing, inventory/accounting, payroll, multi-city expansion, AI recommendations, and deep POS integration.
- Pay-at-salon is the first payment mode.
- Merchant and client private data must be protected by RLS; salons must not read other salons' bookings or clients.

---

## File Structure

- `package.json` - scripts and dependencies.
- `.env.example` - required environment variables.
- `src/app/layout.tsx` - root app shell.
- `src/app/page.tsx` - public marketplace home.
- `src/app/salons/[slug]/page.tsx` - salon profile and booking entry.
- `src/app/merchant/page.tsx` - merchant dashboard.
- `src/app/telegram/page.tsx` - Telegram Mini App entry.
- `src/app/api/bookings/route.ts` - booking creation endpoint.
- `src/app/api/telegram/validate/route.ts` - Telegram launch data validation endpoint.
- `src/components/marketplace/*` - client-facing marketplace UI.
- `src/components/map/*` - map and nearest salon UI.
- `src/components/booking/*` - booking flow UI.
- `src/components/merchant/*` - merchant dashboard UI.
- `src/lib/supabase/browser.ts` - Supabase browser client.
- `src/lib/supabase/server.ts` - Supabase server client.
- `src/lib/supabase/admin.ts` - service role client for trusted server-only jobs.
- `src/lib/domain/types.ts` - shared domain types.
- `src/lib/domain/salons.ts` - salon queries.
- `src/lib/domain/bookings.ts` - booking mutations.
- `src/lib/domain/telegram.ts` - Telegram launch data validation helpers.
- `src/lib/geo/distance.ts` - fallback distance helpers.
- `supabase/migrations/0001_init.sql` - schema, extensions, RLS, functions.
- `supabase/seed.sql` - initial Bishkek salon seed data.
- `tests/domain/*.test.ts` - unit tests for domain logic.
- `tests/e2e/*.spec.ts` - Playwright smoke tests.

---

### Task 1: Scaffold Next.js App and Tooling

**Files:**
- Create: `package.json`
- Create: `.env.example`
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `src/app/globals.css`
- Create: `vitest.config.ts`
- Create: `playwright.config.ts`

**Interfaces:**
- Produces: runnable Next.js app using `bun dev`.
- Produces: test commands `bun test` and `bun test:e2e`.

- [ ] **Step 1: Create the app scaffold**

Run:

```bash
bunx create-next-app@latest . --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-bun
```

Expected: Next.js project files are created in the current directory.

- [ ] **Step 2: Install runtime and test dependencies**

Run:

```bash
bun add @supabase/supabase-js @supabase/ssr zod leaflet react-leaflet
bun add -d vitest @vitejs/plugin-react jsdom @playwright/test
```

Expected: dependencies are added to `package.json`.

- [ ] **Step 3: Add environment template**

Create `.env.example`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_MAP_TILE_URL=https://tile.openstreetmap.org/{z}/{x}/{y}.png
NEXT_PUBLIC_MAP_ATTRIBUTION=&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors
NEXT_PUBLIC_APP_URL=https://nurai.beauty
TELEGRAM_BOT_TOKEN=
TELEGRAM_BOT_USERNAME=
```

- [ ] **Step 4: Add test scripts**

Update `package.json` scripts:

```json
{
  "name": "nurai",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test"
  }
}
```

- [ ] **Step 5: Add Vitest config**

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
  },
});
```

- [ ] **Step 6: Verify scaffold**

Run:

```bash
bun test
bun run build
```

Expected: `bun test` exits with no tests found or passes empty test suite; `bun run build` completes.

---

### Task 2: Supabase Schema, RLS, PostGIS, and Seed Data

**Files:**
- Create: `supabase/migrations/0001_init.sql`
- Create: `supabase/seed.sql`

**Interfaces:**
- Produces tables: `profiles`, `salons`, `salon_staff`, `services`, `staff_services`, `bookings`, `reviews`, `notifications`.
- Produces RPC: `nearby_salons(lat double precision, lng double precision, radius_meters integer)`.
- Produces seed salons around Bishkek with real coordinates.

- [ ] **Step 1: Write migration with extensions and enums**

Create `supabase/migrations/0001_init.sql` starting with:

```sql
create extension if not exists postgis;
create extension if not exists pgcrypto;

create type public.user_role as enum ('client', 'merchant', 'staff', 'admin');
create type public.salon_status as enum ('draft', 'pending_review', 'active', 'suspended');
create type public.booking_status as enum ('new', 'confirmed', 'completed', 'cancelled', 'no_show');
create type public.booking_source as enum ('web', 'telegram', 'merchant_manual');
create type public.review_status as enum ('pending', 'published', 'hidden');
```

- [ ] **Step 2: Add core tables**

Continue `0001_init.sql`:

```sql
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null default 'client',
  full_name text,
  phone text,
  telegram_user_id bigint unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.salons (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete set null,
  name text not null,
  slug text not null unique,
  status public.salon_status not null default 'pending_review',
  city text not null default 'Bishkek',
  district text,
  address text not null,
  phone text,
  instagram_url text,
  description text,
  price_tier int not null default 2 check (price_tier between 1 and 4),
  rating numeric(2,1) not null default 0,
  review_count int not null default 0,
  location geography(point, 4326) not null,
  cover_image_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index salons_location_idx on public.salons using gist(location);
create index salons_status_city_idx on public.salons(status, city);

create table public.salon_staff (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid not null references public.salons(id) on delete cascade,
  full_name text not null,
  role_title text not null default 'Master',
  bio text,
  avatar_path text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid not null references public.salons(id) on delete cascade,
  category text not null,
  name text not null,
  description text,
  duration_minutes int not null check (duration_minutes between 10 and 600),
  price_kgs int not null check (price_kgs >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.staff_services (
  staff_id uuid not null references public.salon_staff(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete cascade,
  primary key (staff_id, service_id)
);
```

- [ ] **Step 3: Add booking, review, and notification tables**

Continue `0001_init.sql`:

```sql
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid not null references public.salons(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete restrict,
  staff_id uuid references public.salon_staff(id) on delete set null,
  client_profile_id uuid references public.profiles(id) on delete set null,
  client_name text not null,
  client_phone text not null,
  start_at timestamptz not null,
  end_at timestamptz not null,
  status public.booking_status not null default 'new',
  source public.booking_source not null default 'web',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint booking_time_order check (end_at > start_at)
);

create index bookings_salon_start_idx on public.bookings(salon_id, start_at);
create index bookings_staff_start_idx on public.bookings(staff_id, start_at);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references public.bookings(id) on delete cascade,
  salon_id uuid not null references public.salons(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  body text,
  status public.review_status not null default 'pending',
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.bookings(id) on delete cascade,
  recipient_phone text,
  telegram_user_id bigint,
  channel text not null check (channel in ('telegram', 'sms', 'email')),
  template text not null,
  payload jsonb not null default '{}'::jsonb,
  delivered_at timestamptz,
  created_at timestamptz not null default now()
);
```

- [ ] **Step 4: Add nearby salon RPC**

Continue `0001_init.sql`:

```sql
create or replace function public.nearby_salons(
  lat double precision,
  lng double precision,
  radius_meters integer default 10000
)
returns table (
  id uuid,
  name text,
  slug text,
  city text,
  district text,
  address text,
  rating numeric,
  review_count int,
  price_tier int,
  cover_image_path text,
  latitude double precision,
  longitude double precision,
  distance_meters double precision
)
language sql
stable
as $$
  select
    s.id,
    s.name,
    s.slug,
    s.city,
    s.district,
    s.address,
    s.rating,
    s.review_count,
    s.price_tier,
    s.cover_image_path,
    st_y(s.location::geometry) as latitude,
    st_x(s.location::geometry) as longitude,
    st_distance(s.location, st_setsrid(st_makepoint(lng, lat), 4326)::geography) as distance_meters
  from public.salons s
  where s.status = 'active'
    and st_dwithin(s.location, st_setsrid(st_makepoint(lng, lat), 4326)::geography, radius_meters)
  order by distance_meters asc;
$$;
```

- [ ] **Step 5: Add RLS policies**

Continue `0001_init.sql`:

```sql
alter table public.profiles enable row level security;
alter table public.salons enable row level security;
alter table public.salon_staff enable row level security;
alter table public.services enable row level security;
alter table public.staff_services enable row level security;
alter table public.bookings enable row level security;
alter table public.reviews enable row level security;
alter table public.notifications enable row level security;

create policy "profiles read own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles update own" on public.profiles
  for update using (auth.uid() = id);

create policy "active salons public read" on public.salons
  for select using (status = 'active');

create policy "owners read own salons" on public.salons
  for select using (owner_id = auth.uid());

create policy "owners update own salons" on public.salons
  for update using (owner_id = auth.uid());

create policy "active salon staff public read" on public.salon_staff
  for select using (
    exists (
      select 1 from public.salons s
      where s.id = salon_staff.salon_id and s.status = 'active'
    )
  );

create policy "active services public read" on public.services
  for select using (
    is_active = true and exists (
      select 1 from public.salons s
      where s.id = services.salon_id and s.status = 'active'
    )
  );

create policy "owners manage own bookings" on public.bookings
  for all using (
    exists (
      select 1 from public.salons s
      where s.id = bookings.salon_id and s.owner_id = auth.uid()
    )
  );

create policy "public can create bookings" on public.bookings
  for insert with check (true);

create policy "published reviews public read" on public.reviews
  for select using (status = 'published');
```

- [ ] **Step 6: Add seed data**

Create `supabase/seed.sql`:

```sql
insert into public.salons (name, slug, status, city, district, address, phone, description, price_tier, rating, review_count, location)
values
  ('Ala-Too Beauty Studio', 'ala-too-beauty-studio', 'active', 'Bishkek', 'Center', 'Chuy Ave 132, Bishkek', '+996700000001', 'Hair, nails, brows near Ala-Too Square.', 3, 4.8, 24, st_setsrid(st_makepoint(74.6057, 42.8766), 4326)::geography),
  ('Erkindik Nails', 'erkindik-nails', 'active', 'Bishkek', 'Erkindik', 'Erkindik Blvd 45, Bishkek', '+996700000002', 'Nail studio with express manicure slots.', 2, 4.6, 18, st_setsrid(st_makepoint(74.6122, 42.8731), 4326)::geography),
  ('Asanbay Glow', 'asanbay-glow', 'active', 'Bishkek', 'Asanbay', 'Aaly Tokombaev St 21, Bishkek', '+996700000003', 'Cosmetology and waxing services.', 3, 4.7, 31, st_setsrid(st_makepoint(74.6362, 42.8273), 4326)::geography);

insert into public.salon_staff (salon_id, full_name, role_title)
select id, 'Aigerim', 'Senior master' from public.salons where slug = 'ala-too-beauty-studio'
union all
select id, 'Dana', 'Nail master' from public.salons where slug = 'erkindik-nails'
union all
select id, 'Meerim', 'Cosmetologist' from public.salons where slug = 'asanbay-glow';

insert into public.services (salon_id, category, name, duration_minutes, price_kgs)
select id, 'Hair', 'Women haircut', 60, 1200 from public.salons where slug = 'ala-too-beauty-studio'
union all
select id, 'Nails', 'Gel manicure', 90, 1500 from public.salons where slug = 'erkindik-nails'
union all
select id, 'Cosmetology', 'Face cleansing', 75, 2200 from public.salons where slug = 'asanbay-glow';

insert into public.staff_services (staff_id, service_id)
select st.id, sv.id
from public.salon_staff st
join public.services sv on sv.salon_id = st.salon_id;
```

- [ ] **Step 7: Verify SQL locally or in Supabase SQL editor**

Run with Supabase CLI if available:

```bash
supabase db reset
```

Expected: migration and seed complete with no SQL errors.

If Supabase CLI is not available, paste `0001_init.sql` and `seed.sql` into the Supabase SQL editor in order. Expected: tables, policies, and function are created.

---

### Task 3: Supabase Clients and Domain Types

**Files:**
- Create: `src/lib/supabase/browser.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/supabase/admin.ts`
- Create: `src/lib/domain/types.ts`
- Test: `tests/domain/types.test.ts`

**Interfaces:**
- Produces: `createBrowserClient()`
- Produces: `createServerClient()`
- Produces: `createAdminClient()`
- Produces types: `SalonSummary`, `SalonDetail`, `Service`, `StaffMember`, `BookingInput`, `Booking`

- [ ] **Step 1: Add domain type test**

Create `tests/domain/types.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import type { SalonSummary } from "@/lib/domain/types";

describe("domain types", () => {
  it("supports a salon summary with distance", () => {
    const salon: SalonSummary = {
      id: "00000000-0000-0000-0000-000000000001",
      name: "Ala-Too Beauty Studio",
      slug: "ala-too-beauty-studio",
      city: "Bishkek",
      district: "Center",
      address: "Chuy Ave 132, Bishkek",
      rating: 4.8,
      reviewCount: 24,
      priceTier: 3,
      coverImageUrl: null,
      latitude: 42.8766,
      longitude: 74.6057,
      distanceMeters: 1200,
    };

    expect(salon.distanceMeters).toBe(1200);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
bun test tests/domain/types.test.ts
```

Expected: FAIL because `@/lib/domain/types` does not exist.

- [ ] **Step 3: Add domain types**

Create `src/lib/domain/types.ts`:

```ts
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
  startAt: string;
  endAt: string;
  status: "new" | "confirmed" | "completed" | "cancelled" | "no_show";
  source: "web" | "telegram" | "merchant_manual";
};
```

- [ ] **Step 4: Add Supabase clients**

Create `src/lib/supabase/browser.ts`:

```ts
import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr";

export function createBrowserClient() {
  return createSupabaseBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
```

Create `src/lib/supabase/server.ts`:

```ts
import { createServerClient as createSupabaseServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createServerClient() {
  const cookieStore = await cookies();

  return createSupabaseServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    },
  );
}
```

Create `src/lib/supabase/admin.ts`:

```ts
import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Missing Supabase admin environment variables");
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
```

- [ ] **Step 5: Verify types pass**

Run:

```bash
bun test tests/domain/types.test.ts
```

Expected: PASS.

---

### Task 4: Salon Queries and Nearby Discovery

**Files:**
- Create: `src/lib/domain/salons.ts`
- Create: `src/lib/geo/distance.ts`
- Test: `tests/domain/salons.test.ts`
- Test: `tests/domain/distance.test.ts`

**Interfaces:**
- Produces: `formatDistance(meters: number | null): string`
- Produces: `getNearbySalons(params: { lat?: number; lng?: number; radiusMeters?: number }): Promise<SalonSummary[]>`
- Produces: `getSalonBySlug(slug: string): Promise<SalonDetail | null>`

- [ ] **Step 1: Write distance tests**

Create `tests/domain/distance.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { formatDistance } from "@/lib/geo/distance";

describe("formatDistance", () => {
  it("formats meters below 1000", () => {
    expect(formatDistance(850)).toBe("850 m");
  });

  it("formats kilometers at one decimal place", () => {
    expect(formatDistance(1240)).toBe("1.2 km");
  });

  it("handles unknown distance", () => {
    expect(formatDistance(null)).toBe("Distance unavailable");
  });
});
```

- [ ] **Step 2: Add distance helper**

Create `src/lib/geo/distance.ts`:

```ts
export function formatDistance(meters: number | null): string {
  if (meters === null || Number.isNaN(meters)) {
    return "Distance unavailable";
  }

  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }

  return `${(meters / 1000).toFixed(1)} km`;
}
```

- [ ] **Step 3: Write salon query mapping test**

Create `tests/domain/salons.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { mapNearbySalonRow } from "@/lib/domain/salons";

describe("mapNearbySalonRow", () => {
  it("maps Supabase nearby salon rows into UI summaries", () => {
    const result = mapNearbySalonRow({
      id: "00000000-0000-0000-0000-000000000001",
      name: "Ala-Too Beauty Studio",
      slug: "ala-too-beauty-studio",
      city: "Bishkek",
      district: "Center",
      address: "Chuy Ave 132",
      rating: 4.8,
      review_count: 24,
      price_tier: 3,
      cover_image_path: null,
      latitude: 42.8766,
      longitude: 74.6057,
      distance_meters: 1234.5,
    });

    expect(result.reviewCount).toBe(24);
    expect(result.distanceMeters).toBe(1234.5);
  });
});
```

- [ ] **Step 4: Implement salon queries**

Create `src/lib/domain/salons.ts`:

```ts
import { createServerClient } from "@/lib/supabase/server";
import type { SalonDetail, SalonSummary } from "@/lib/domain/types";

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
    .select("id,name,slug,city,district,address,phone,instagram_url,description,rating,review_count,price_tier,cover_image_path")
    .eq("slug", slug)
    .eq("status", "active")
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(error.message);
  }

  const [{ data: services }, { data: staff }] = await Promise.all([
    supabase.from("services").select("id,salon_id,category,name,description,duration_minutes,price_kgs").eq("salon_id", salon.id).eq("is_active", true),
    supabase.from("salon_staff").select("id,salon_id,full_name,role_title,bio,avatar_path").eq("salon_id", salon.id).eq("is_active", true),
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
    distanceMeters: null,
    latitude: 42.8766,
    longitude: 74.6057,
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
    })),
  };
}
```

- [ ] **Step 5: Verify domain tests**

Run:

```bash
bun test tests/domain/distance.test.ts tests/domain/salons.test.ts
```

Expected: PASS.

---

### Task 5: Marketplace Home, List View, and Map View

**Files:**
- Modify: `src/app/page.tsx`
- Create: `src/components/marketplace/SalonCard.tsx`
- Create: `src/components/marketplace/SalonSearchShell.tsx`
- Create: `src/components/map/SalonMap.tsx`
- Create: `src/components/map/LocationButton.tsx`

**Interfaces:**
- Consumes: `getNearbySalons()`
- Consumes: `formatDistance()`
- Produces: public homepage with list and map views.

- [ ] **Step 1: Build salon card**

Create `src/components/marketplace/SalonCard.tsx`:

```tsx
import Link from "next/link";
import type { SalonSummary } from "@/lib/domain/types";
import { formatDistance } from "@/lib/geo/distance";

export function SalonCard({ salon }: { salon: SalonSummary }) {
  return (
    <Link href={`/salons/${salon.slug}`} className="block rounded-lg border bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-zinc-950">{salon.name}</h2>
          <p className="mt-1 text-sm text-zinc-600">{salon.address}</p>
          <p className="mt-2 text-sm text-zinc-700">{formatDistance(salon.distanceMeters)}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-zinc-950">{salon.rating.toFixed(1)}</p>
          <p className="text-xs text-zinc-500">{salon.reviewCount} reviews</p>
        </div>
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: Build map component**

Create `src/components/map/SalonMap.tsx`:

```tsx
"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import type { SalonSummary } from "@/lib/domain/types";

export function SalonMap({ salons }: { salons: SalonSummary[] }) {
  const tileUrl = process.env.NEXT_PUBLIC_MAP_TILE_URL ?? "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
  const attribution =
    process.env.NEXT_PUBLIC_MAP_ATTRIBUTION ??
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  return (
    <MapContainer center={[42.8746, 74.6122]} zoom={13} className="h-[420px] w-full rounded-lg border">
      <TileLayer attribution={attribution} url={tileUrl} />
      {salons.map((salon) => (
        <Marker key={salon.id} position={[salon.latitude, salon.longitude]}>
          <Popup>
            <strong>{salon.name}</strong>
            <br />
            {salon.address}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
```

- [ ] **Step 3: Build search shell**

Create `src/components/marketplace/SalonSearchShell.tsx`:

```tsx
import dynamic from "next/dynamic";
import type { SalonSummary } from "@/lib/domain/types";
import { LocationButton } from "@/components/map/LocationButton";
import { SalonCard } from "@/components/marketplace/SalonCard";

const SalonMap = dynamic(() => import("@/components/map/SalonMap").then((mod) => mod.SalonMap), {
  ssr: false,
});

export function SalonSearchShell({ salons }: { salons: SalonSummary[] }) {
  return (
    <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_520px]">
      <section>
        <div className="mb-5">
          <h1 className="text-2xl font-semibold text-zinc-950">NurAI</h1>
          <p className="mt-2 text-sm text-zinc-600">Find and book salons in Bishkek without waiting for WhatsApp replies.</p>
          <div className="mt-4">
            <LocationButton />
          </div>
        </div>
        <div className="grid gap-3">
          {salons.map((salon) => (
            <SalonCard key={salon.id} salon={salon} />
          ))}
        </div>
      </section>
      <aside className="lg:sticky lg:top-4 lg:self-start">
        <SalonMap salons={salons} />
      </aside>
    </main>
  );
}
```

- [ ] **Step 4: Build location button**

Create `src/components/map/LocationButton.tsx`:

```tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function LocationButton() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"idle" | "loading" | "denied">("idle");

  function useMyLocation() {
    if (!navigator.geolocation) {
      setStatus("denied");
      return;
    }

    setStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const next = new URLSearchParams(searchParams.toString());
        next.set("lat", String(position.coords.latitude));
        next.set("lng", String(position.coords.longitude));
        router.push(`/?${next.toString()}`);
      },
      () => setStatus("denied"),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button type="button" onClick={useMyLocation} className="rounded-md border px-3 py-2 text-sm font-medium">
        {status === "loading" ? "Finding you..." : "Show nearest salons"}
      </button>
      {status === "denied" && <span className="text-sm text-zinc-500">Location unavailable. Showing central Bishkek.</span>}
    </div>
  );
}
```

- [ ] **Step 5: Wire homepage to Supabase**

Modify `src/app/page.tsx`:

```tsx
import { SalonSearchShell } from "@/components/marketplace/SalonSearchShell";
import { getNearbySalons } from "@/lib/domain/salons";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ lat?: string; lng?: string }>;
}) {
  const params = await searchParams;
  const lat = params.lat ? Number(params.lat) : undefined;
  const lng = params.lng ? Number(params.lng) : undefined;
  const salons = await getNearbySalons({
    lat: Number.isFinite(lat) ? lat : undefined,
    lng: Number.isFinite(lng) ? lng : undefined,
  });

  return <SalonSearchShell salons={salons} />;
}
```

- [ ] **Step 6: Verify page renders**

Run:

```bash
bun run build
```

Expected: build succeeds. If Supabase env vars are missing, create `.env.local` from `.env.example` with real Supabase values before retrying.

---

### Task 6: Salon Profile and Booking Flow

**Files:**
- Create: `src/app/salons/[slug]/page.tsx`
- Create: `src/components/booking/BookingForm.tsx`
- Create: `src/lib/domain/bookings.ts`
- Create: `src/app/api/bookings/route.ts`
- Test: `tests/domain/bookings.test.ts`

**Interfaces:**
- Consumes: `getSalonBySlug(slug)`
- Produces: `calculateEndAt(startAt: string, durationMinutes: number): string`
- Produces: `createBooking(input: BookingInput): Promise<Booking>`

- [ ] **Step 1: Test booking time calculation**

Create `tests/domain/bookings.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { calculateEndAt } from "@/lib/domain/bookings";

describe("calculateEndAt", () => {
  it("adds service duration to booking start", () => {
    expect(calculateEndAt("2026-06-23T10:00:00.000Z", 90)).toBe("2026-06-23T11:30:00.000Z");
  });
});
```

- [ ] **Step 2: Implement booking domain**

Create `src/lib/domain/bookings.ts`:

```ts
import { z } from "zod";
import type { Booking, BookingInput } from "@/lib/domain/types";
import { createServerClient } from "@/lib/supabase/server";

export const bookingInputSchema = z.object({
  salonId: z.string().uuid(),
  serviceId: z.string().uuid(),
  staffId: z.string().uuid().nullable(),
  clientName: z.string().min(2).max(120),
  clientPhone: z.string().min(7).max(32),
  startAt: z.string().datetime(),
  source: z.enum(["web", "telegram", "merchant_manual"]),
  notes: z.string().max(500).optional(),
});

export function calculateEndAt(startAt: string, durationMinutes: number): string {
  return new Date(new Date(startAt).getTime() + durationMinutes * 60_000).toISOString();
}

export async function createBooking(input: BookingInput): Promise<Booking> {
  const parsed = bookingInputSchema.parse(input);
  const supabase = await createServerClient();

  const { data: service, error: serviceError } = await supabase
    .from("services")
    .select("duration_minutes")
    .eq("id", parsed.serviceId)
    .single();

  if (serviceError) throw new Error(serviceError.message);

  const endAt = calculateEndAt(parsed.startAt, service.duration_minutes);
  const { data, error } = await supabase
    .from("bookings")
    .insert({
      salon_id: parsed.salonId,
      service_id: parsed.serviceId,
      staff_id: parsed.staffId,
      client_name: parsed.clientName,
      client_phone: parsed.clientPhone,
      start_at: parsed.startAt,
      end_at: endAt,
      source: parsed.source,
      notes: parsed.notes ?? null,
    })
    .select("id,salon_id,service_id,staff_id,client_name,client_phone,start_at,end_at,status,source")
    .single();

  if (error) throw new Error(error.message);

  return {
    id: data.id,
    salonId: data.salon_id,
    serviceId: data.service_id,
    staffId: data.staff_id,
    clientName: data.client_name,
    clientPhone: data.client_phone,
    startAt: data.start_at,
    endAt: data.end_at,
    status: data.status,
    source: data.source,
  };
}
```

- [ ] **Step 3: Add booking API**

Create `src/app/api/bookings/route.ts`:

```ts
import { NextResponse } from "next/server";
import { createBooking } from "@/lib/domain/bookings";

export async function POST(request: Request) {
  try {
    const input = await request.json();
    const booking = await createBooking(input);
    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Booking failed" },
      { status: 400 },
    );
  }
}
```

- [ ] **Step 4: Add booking form**

Create `src/components/booking/BookingForm.tsx`:

```tsx
"use client";

import { useState } from "react";
import type { SalonDetail } from "@/lib/domain/types";

export function BookingForm({ salon, source = "web" }: { salon: SalonDetail; source?: "web" | "telegram" }) {
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
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
        startAt: String(formData.get("startAt")),
        source,
      }),
    });

    setStatus(response.ok ? "saved" : "error");
  }

  return (
    <form action={submit} className="grid gap-3 rounded-lg border bg-white p-4">
      <select name="serviceId" defaultValue={firstService?.id} className="rounded-md border px-3 py-2">
        {salon.services.map((service) => (
          <option key={service.id} value={service.id}>
            {service.name} · {service.priceKgs} KGS
          </option>
        ))}
      </select>
      <select name="staffId" defaultValue={firstStaff?.id} className="rounded-md border px-3 py-2">
        {salon.staff.map((member) => (
          <option key={member.id} value={member.id}>
            {member.fullName}
          </option>
        ))}
      </select>
      <input name="startAt" type="datetime-local" required className="rounded-md border px-3 py-2" />
      <input name="clientName" placeholder="Your name" required className="rounded-md border px-3 py-2" />
      <input name="clientPhone" placeholder="+996..." required className="rounded-md border px-3 py-2" />
      <button type="submit" className="rounded-md bg-zinc-950 px-4 py-2 font-medium text-white">
        {status === "saving" ? "Booking..." : "Book appointment"}
      </button>
      {status === "saved" && <p className="text-sm text-emerald-700">Booking created. The salon will confirm it.</p>}
      {status === "error" && <p className="text-sm text-red-700">Could not create booking. Check the details and try again.</p>}
    </form>
  );
}
```

- [ ] **Step 5: Add salon profile page**

Create `src/app/salons/[slug]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { BookingForm } from "@/components/booking/BookingForm";
import { getSalonBySlug } from "@/lib/domain/salons";

export default async function SalonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const salon = await getSalonBySlug(slug);
  if (!salon) notFound();

  return (
    <main className="mx-auto grid max-w-5xl gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <section>
        <h1 className="text-3xl font-semibold text-zinc-950">{salon.name}</h1>
        <p className="mt-2 text-zinc-600">{salon.address}</p>
        <p className="mt-4 text-zinc-700">{salon.description}</p>
      </section>
      <aside>
        <BookingForm salon={salon} />
      </aside>
    </main>
  );
}
```

- [ ] **Step 6: Verify booking tests and build**

Run:

```bash
bun test tests/domain/bookings.test.ts
bun run build
```

Expected: tests pass and build succeeds.

---

### Task 7: Merchant Cabinet

**Files:**
- Create: `src/app/merchant/page.tsx`
- Create: `src/components/merchant/MerchantBookingsTable.tsx`
- Create: `src/components/merchant/MerchantSalonSummary.tsx`
- Create: `src/lib/domain/merchant.ts`

**Interfaces:**
- Produces: `getMerchantDashboard(): Promise<{ salons: MerchantSalon[]; bookings: MerchantBooking[] }>`
- Consumes: Supabase Auth session.

- [ ] **Step 1: Add merchant domain query**

Create `src/lib/domain/merchant.ts`:

```ts
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
    bookings: (bookings ?? []).map((booking) => ({
      id: booking.id,
      salonName: booking.salons?.name ?? "Salon",
      clientName: booking.client_name,
      clientPhone: booking.client_phone,
      startAt: booking.start_at,
      status: booking.status,
    })),
  };
}
```

- [ ] **Step 2: Add merchant UI components**

Create `src/components/merchant/MerchantSalonSummary.tsx`:

```tsx
import type { MerchantSalon } from "@/lib/domain/merchant";

export function MerchantSalonSummary({ salons }: { salons: MerchantSalon[] }) {
  return (
    <section className="grid gap-3 md:grid-cols-2">
      {salons.map((salon) => (
        <article key={salon.id} className="rounded-lg border bg-white p-4">
          <h2 className="font-semibold text-zinc-950">{salon.name}</h2>
          <p className="mt-1 text-sm text-zinc-600">{salon.address}</p>
          <p className="mt-2 text-xs uppercase tracking-wide text-zinc-500">{salon.status}</p>
        </article>
      ))}
    </section>
  );
}
```

Create `src/components/merchant/MerchantBookingsTable.tsx`:

```tsx
import type { MerchantBooking } from "@/lib/domain/merchant";

export function MerchantBookingsTable({ bookings }: { bookings: MerchantBooking[] }) {
  return (
    <section className="rounded-lg border bg-white">
      <div className="border-b p-4">
        <h2 className="font-semibold text-zinc-950">Bookings</h2>
      </div>
      <div className="divide-y">
        {bookings.map((booking) => (
          <div key={booking.id} className="grid gap-1 p-4 md:grid-cols-5">
            <span>{booking.salonName}</span>
            <span>{booking.clientName}</span>
            <span>{booking.clientPhone}</span>
            <span>{new Date(booking.startAt).toLocaleString()}</span>
            <span>{booking.status}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Add merchant page**

Create `src/app/merchant/page.tsx`:

```tsx
import { MerchantBookingsTable } from "@/components/merchant/MerchantBookingsTable";
import { MerchantSalonSummary } from "@/components/merchant/MerchantSalonSummary";
import { getMerchantDashboard } from "@/lib/domain/merchant";

export default async function MerchantPage() {
  const dashboard = await getMerchantDashboard();

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="text-2xl font-semibold text-zinc-950">Merchant cabinet</h1>
      <div className="mt-6 grid gap-6">
        <MerchantSalonSummary salons={dashboard.salons} />
        <MerchantBookingsTable bookings={dashboard.bookings} />
      </div>
    </main>
  );
}
```

- [ ] **Step 4: Verify build**

Run:

```bash
bun run build
```

Expected: build succeeds.

---

### Task 8: Telegram Mini App Route and Launch Validation

**Files:**
- Create: `src/app/telegram/page.tsx`
- Create: `src/lib/domain/telegram.ts`
- Create: `src/app/api/telegram/validate/route.ts`
- Test: `tests/domain/telegram.test.ts`

**Interfaces:**
- Produces: `parseTelegramInitData(initData: string): URLSearchParams`
- Produces: `validateTelegramInitData(initData: string, botToken: string): boolean`
- Produces: `/telegram` route that renders marketplace flow with source `telegram`.

- [ ] **Step 1: Write Telegram parser test**

Create `tests/domain/telegram.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { parseTelegramInitData } from "@/lib/domain/telegram";

describe("parseTelegramInitData", () => {
  it("parses query-string launch data", () => {
    const params = parseTelegramInitData("query_id=abc&user=%7B%22id%22%3A123%7D&hash=test");
    expect(params.get("query_id")).toBe("abc");
    expect(params.get("hash")).toBe("test");
  });
});
```

- [ ] **Step 2: Implement Telegram helpers**

Create `src/lib/domain/telegram.ts`:

```ts
import crypto from "node:crypto";

export function parseTelegramInitData(initData: string): URLSearchParams {
  return new URLSearchParams(initData);
}

export function validateTelegramInitData(initData: string, botToken: string): boolean {
  const params = parseTelegramInitData(initData);
  const hash = params.get("hash");
  if (!hash) return false;

  params.delete("hash");
  const dataCheckString = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  const secretKey = crypto.createHmac("sha256", "WebAppData").update(botToken).digest();
  const calculatedHash = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex");

  return crypto.timingSafeEqual(Buffer.from(calculatedHash, "hex"), Buffer.from(hash, "hex"));
}
```

- [ ] **Step 3: Add validation endpoint**

Create `src/app/api/telegram/validate/route.ts`:

```ts
import { NextResponse } from "next/server";
import { validateTelegramInitData } from "@/lib/domain/telegram";

export async function POST(request: Request) {
  const { initData } = await request.json();
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!botToken || typeof initData !== "string") {
    return NextResponse.json({ valid: false }, { status: 400 });
  }

  return NextResponse.json({
    valid: validateTelegramInitData(initData, botToken),
  });
}
```

- [ ] **Step 4: Add Telegram page**

Create `src/app/telegram/page.tsx`:

```tsx
import { SalonSearchShell } from "@/components/marketplace/SalonSearchShell";
import { getNearbySalons } from "@/lib/domain/salons";

export default async function TelegramMiniAppPage() {
  const salons = await getNearbySalons({});

  return (
    <div className="min-h-screen bg-white">
      <SalonSearchShell salons={salons} />
    </div>
  );
}
```

- [ ] **Step 5: Verify Telegram tests and build**

Run:

```bash
bun test tests/domain/telegram.test.ts
bun run build
```

Expected: tests pass and build succeeds.

---

### Task 9: End-to-End Smoke Tests

**Files:**
- Create: `tests/e2e/marketplace.spec.ts`
- Create: `tests/e2e/booking.spec.ts`
- Modify: `playwright.config.ts`

**Interfaces:**
- Consumes: running Next.js app.
- Produces: smoke tests for marketplace, salon profile, booking UI, and merchant page.

- [ ] **Step 1: Configure Playwright**

Create or update `playwright.config.ts`:

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  webServer: {
    command: "bun dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120_000,
  },
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile",
      use: { ...devices["Pixel 7"] },
    },
  ],
});
```

- [ ] **Step 2: Add marketplace smoke test**

Create `tests/e2e/marketplace.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test("marketplace home renders salon discovery", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /beauty salons near you/i })).toBeVisible();
});
```

- [ ] **Step 3: Add booking smoke test**

Create `tests/e2e/booking.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test("salon profile exposes booking form", async ({ page }) => {
  await page.goto("/salons/ala-too-beauty-studio");
  await expect(page.getByRole("button", { name: /book appointment/i })).toBeVisible();
});
```

- [ ] **Step 4: Run E2E tests**

Run:

```bash
bunx playwright install chromium
bun test:e2e
```

Expected: marketplace and booking smoke tests pass on desktop and mobile.

---

### Task 10: README and Setup Handoff

**Files:**
- Create: `README.md`
- Modify: `.env.example`

**Interfaces:**
- Produces: setup instructions for Supabase project, env vars, migrations, seed data, dev server, and Telegram bot setup.

- [ ] **Step 1: Create README**

Create `README.md`:

```md
# NurAI

NurAI is a marketplace MVP for beauty salons in Kyrgyzstan: web marketplace, Telegram Mini App route, OpenStreetMap discovery, Supabase database, booking flow, and merchant cabinet.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Postgres, Auth, Storage, RLS
- Supabase PostGIS for nearest salons
- Leaflet / OpenStreetMap
- Telegram Mini App route

## Setup

1. Create a Supabase project.
2. Copy `.env.example` to `.env.local`.
3. Fill `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and either `SUPABASE_SECRET_KEY` or `SUPABASE_SERVICE_ROLE_KEY`.
4. Run `supabase/migrations/0001_init.sql` in the Supabase SQL editor.
5. Run `supabase/seed.sql` in the Supabase SQL editor.
6. Start the app with `bun dev`.

## Map Tiles

Development uses OpenStreetMap tiles by default. Production must set `NEXT_PUBLIC_MAP_TILE_URL` to a compliant tile provider or self-hosted tile service and keep attribution visible.

## Telegram Mini App

Set `TELEGRAM_BOT_TOKEN` and `TELEGRAM_BOT_USERNAME`. Configure the bot's Mini App URL to `https://nurai.beauty/telegram`.

## Scripts

- `bun dev` - local dev server
- `bun run build` - production build
- `bun test` - unit tests
- `bun test:e2e` - Playwright smoke tests
```

- [ ] **Step 2: Verify documentation mentions required env vars**

Run:

```bash
rg "NEXT_PUBLIC_SUPABASE_URL|NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY|SUPABASE_SECRET_KEY|SUPABASE_SERVICE_ROLE_KEY|TELEGRAM_BOT_TOKEN|NEXT_PUBLIC_MAP_TILE_URL" README.md .env.example
```

Expected: each required env var appears in README or `.env.example`.

---

## Self-Review Checklist

- Spec coverage: web marketplace, Telegram Mini App, map discovery, nearby salon sorting, Supabase backend, PostGIS, booking flow, merchant cabinet, RLS, seed data, and pay-at-salon are covered.
- Known gap: online payments are intentionally excluded from first version.
- Known gap: production tile provider is configurable but not selected in this plan.
- Placeholder scan: no unfinished implementation markers or undefined placeholders should remain.
- Type consistency: `SalonSummary`, `SalonDetail`, `BookingInput`, and `Booking` are defined before they are consumed.
