# NurAI Beauty Marketplace Kyrgyzstan MVP Design

Date: 2026-06-23
Mode: Startup
Project name: NurAI
Domain slug: nurai
Production domain: nurai.beauty
Chosen approach: B - marketplace-first with Telegram Mini App companion

## Product Thesis

NurAI is a beauty marketplace for Kyrgyzstan. The name reads as "Нурай" locally and carries the "AI" ending in Latin script without forcing an artificial tech word.

Beauty salons in Kyrgyzstan lose clients because booking still happens through WhatsApp, Instagram DMs, phone calls, and manual coordination. Clients do not want to wait for replies, compare salons manually, or guess whether a time slot is available.

The first product should be a consumer-facing marketplace where clients can discover nearby salons and book appointments, paired with a lightweight merchant cabinet that lets salons manage services, staff, schedules, and bookings.

The product should ship with two client surfaces from the same backend and design system:

- Web marketplace for search, SEO, maps, salon profile links, and mobile browser traffic.
- Telegram Mini App for low-friction booking inside Telegram, using the same marketplace data and booking flow.

## Starting Wedge

The marketplace starts in Bishkek and focuses on appointment-heavy beauty categories:

- Hair salons and barbershops
- Nail studios
- Brow/lash studios
- Cosmetology and waxing services

The first wedge is not "all beauty services in Kyrgyzstan." It is "find a good salon in Bishkek and book without waiting for WhatsApp replies."

## MVP Scope

### Client Marketplace

- Browse salons by category, location, rating, and price range.
- Browse salons on a map and see which salons are closest to the client.
- View salon profile with photos, address, working hours, services, masters, prices, and available slots.
- Book an appointment by choosing service, master, date, and time.
- Receive booking confirmation and reminders.
- Cancel or reschedule within salon-defined rules.
- Leave a review after the visit.

### Map and Nearby Discovery

- Show an interactive OpenStreetMap-based map with salon markers.
- Ask for browser or Telegram Mini App location permission to show nearby salons.
- Sort search results by distance when location is available.
- Support manual city/area selection when the client does not share location.
- Store salon latitude and longitude during merchant onboarding.
- Show distance labels, for example "1.2 km away", on salon cards.
- Let users switch between list view and map view.

For development, Leaflet or React Leaflet can render OpenStreetMap tiles. For production, do not depend on heavy traffic from the public `tile.openstreetmap.org` servers. Use a compliant tile provider or self-hosted tiles, keep OpenStreetMap attribution visible, and respect tile usage policies.

### Merchant Cabinet

- Salon onboarding and profile editing.
- Map pin editing for salon location.
- Service catalog with duration, price, category, and assigned masters.
- Staff management with master profiles and working schedules.
- Booking calendar with statuses: new, confirmed, completed, cancelled, no-show.
- Manual booking creation for clients who still contact the salon through WhatsApp or phone.
- Basic review moderation response from salon side.

### Admin Console

- Approve or reject salon listings.
- Manage categories and cities.
- Moderate reviews and reports.
- View basic marketplace metrics: salons, bookings, active clients, conversion, no-shows.

## Channels

The first client surfaces are mobile web and Telegram Mini App, both powered by the same backend.

The web marketplace is optimized for Instagram profile links, Google/Yandex/2GIS traffic, SEO, and direct sharing.

Telegram is both an acquisition channel and a booking surface:

- Telegram Mini App exposes the same search, map, salon profile, and booking flow inside Telegram.
- Telegram Mini App production URL should be `https://nurai.beauty/telegram`.
- Telegram bot webhook should be `https://nurai.beauty/api/telegram/webhook`.
- Telegram bot sends booking confirmations and reminders.
- Salons can place the booking link in Instagram bio, WhatsApp status, Telegram channels, and 2GIS/Yandex descriptions.

## Business Model

Start with B2B subscription because it avoids early resistance to per-booking commissions and gives salons predictable pricing.

Recommended pricing:

- Free trial: 30 days.
- Starter: 1,500 KGS/month for profile, booking, services, and one branch.
- Pro: 3,500-5,000 KGS/month for multiple masters, reminders, reviews, analytics, and promotion tools.
- Featured placement: optional paid boost once the marketplace has enough client demand.

Do not start with client fees. Do not start with high commission. Commission can be tested later for promoted bookings or prepaid services.

## Marketplace Cold Start Plan

1. Manually onboard 20-30 salons in Bishkek.
2. Create high-quality profiles for them: photos, services, prices, masters, location, working hours.
3. Give each salon a booking link they can use immediately in Instagram and WhatsApp.
4. Drive early client traffic through salon-owned audiences first, not paid ads.
5. Track whether salons receive bookings they would otherwise have missed.

The marketplace should earn supply first. Consumer demand without reliable salon slots will create a bad first experience.

## Core Data Model

- User: client, salon owner, staff, admin.
- Salon: profile, city, address, geo location, contacts, photos, status.
- Branch: optional entity for multi-location salons.
- Location: latitude, longitude, city, district, address, map pin verification status.
- Service: name, category, duration, price, description, salon.
- StaffMember: name, role, services, schedule, salon.
- TimeSlot: generated from staff schedule and existing bookings.
- Booking: client, salon, service, staff, start time, status, source.
- Review: booking, rating, text, photos, moderation status.
- Notification: recipient, channel, template, delivery status.

## MVP Architecture

Use one web application with three role-based areas:

- Public marketplace for clients.
- Merchant cabinet for salons.
- Admin console for platform operations.

Recommended stack for fast MVP:

- Next.js app with responsive mobile-first UI.
- Shared client UI rendered as web marketplace and Telegram Mini App routes.
- Supabase as the backend platform: Postgres database, Auth, Storage, Row Level Security, and server-side queries from Next.js.
- Supabase PostGIS extension for nearest-salon queries.
- SQL migrations committed in the repo for schema, policies, indexes, functions, and seed data.
- Authentication through Supabase Auth for merchants/admins and Telegram identity mapping for Telegram Mini App users.
- Telegram bot integration for reminders.
- Telegram Mini App SDK integration for in-Telegram launch context and user identity.
- Leaflet or React Leaflet for map UI.
- Supabase Storage for salon photos and service images.

Supabase integration should follow the current official SSR approach for Next.js: separate browser and server clients, cookie-based sessions, and server-side data access where possible.

## Key Risks

- Salons may say they want online booking but avoid keeping schedules updated.
- Clients will abandon if availability is inaccurate.
- Reviews can become a trust problem without moderation.
- Marketplace SEO and discovery take time; first bookings must come from salon-owned links.
- Payments may be overkill for the first version; pay-at-salon is simpler.
- Public OpenStreetMap tile servers are not a production CDN. The product must use a compliant tile provider or self-hosted tiles before meaningful traffic.
- Location permission may be denied; the product must still work with manual area selection.
- Supabase Row Level Security must be designed early. Client-facing queries should never expose private merchant, client phone, or booking data across salons.

## First Version Exclusions

- Native iOS/Android apps.
- Full payment processing.
- Complex loyalty program.
- Inventory/accounting.
- Payroll.
- Multi-city expansion.
- AI recommendations.
- Deep POS integration.

## Success Metrics

- 20 salons onboarded with complete profiles.
- 10 salons place booking links in their Instagram/WhatsApp/Telegram surfaces.
- 100 client bookings created through the system.
- 50 percent of booking attempts come from map/list discovery rather than only direct salon profile links.
- At least 30 percent of bookings happen outside salon working hours.
- At least 5 salons continue after the trial or agree to paid pilot.

## Open Questions

- Which city launches first: Bishkek only, or Bishkek plus Osh?
- Should salons confirm bookings manually at first, or should slots be instantly confirmed?
- Should clients need an account before booking, or only after entering phone number?
- Should reviews require a completed booking to reduce fake reviews?
- Which local payment provider should be integrated first when payments become necessary?
- Which production map tile provider should be used if traffic grows beyond development usage?

## Recommended Next Build Step

Build the marketplace MVP with Supabase-backed salon seed data, map discovery, booking flow, Telegram Mini App route, and merchant cabinet before integrating payments. Seed data should live in SQL migrations or seed scripts, not in hardcoded frontend mock objects. The first demo should let a client find the nearest salon on the map, select a service and master, book a slot, receive a Telegram reminder path, and let the merchant see that booking in the cabinet.
