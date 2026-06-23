# Merchant Cabinet MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first working merchant cabinet slice for nurAI: Telegram-authenticated salon owner onboarding, real dashboard data, and booking status operations.

**Architecture:** Keep merchant authorization server-side through the signed Telegram session cookie and Supabase admin client. Add a Telegram-specific merchant membership table instead of forcing Telegram users into Supabase Auth profiles. The UI is a focused back office: onboarding when the user owns no salon, dashboard when they do.

**Tech Stack:** Next.js App Router, React server/client components, Supabase Postgres, `@supabase/supabase-js`, Zod, Tailwind CSS utilities, Vitest, Playwright.

## Global Constraints

- Telegram session is the merchant identity for this MVP.
- Never expose Supabase secret/service keys to client components.
- Merchant API routes must authorize by `telegram_user_id` from the signed cookie before reading or mutating salon data.
- New public tables need explicit `GRANT`, RLS enabled, and policies even if the MVP uses server-side admin routes.
- Keep UI in the current nurAI light rose/plum system, but make it denser and more operational than the consumer marketplace.

---

### Task 1: Merchant Domain Contracts

**Files:**
- Modify: `src/lib/domain/merchant.ts`
- Create: `tests/domain/merchant.test.ts`

**Interfaces:**
- Produces: `normalizeMerchantOnboardingInput(input)`, `canTransitionMerchantBookingStatus(from, to)`, `merchantBookingStatusLabels`.

- [ ] Write failing tests for onboarding normalization and allowed booking status transitions.
- [ ] Run `bun test tests/domain/merchant.test.ts` and verify failures reference missing exports.
- [ ] Implement the domain helpers with Zod validation and stable label maps.
- [ ] Run `bun test tests/domain/merchant.test.ts` and verify pass.

### Task 2: Telegram Merchant Membership Schema

**Files:**
- Create migration via `supabase migration new telegram_merchant_members`
- Apply same SQL to remote Supabase with MCP migration.

**Interfaces:**
- Produces: `public.merchant_telegram_members` with `salon_id`, `telegram_user_id`, `role`, `is_active`.
- Extends: `public.merchant_invitations.created_by_telegram_user_id`.

- [ ] Create migration with explicit grants, RLS, indexes, and policies.
- [ ] Apply migration to remote Supabase.
- [ ] Run Supabase advisors and review security/performance warnings.

### Task 3: Merchant Server Data and Mutations

**Files:**
- Modify: `src/lib/domain/merchant.ts`
- Create: `src/app/api/merchant/onboarding/route.ts`
- Create: `src/app/api/merchant/bookings/[bookingId]/route.ts`

**Interfaces:**
- Produces: `getMerchantDashboard()`, `createMerchantOnboarding(input, session)`, `updateMerchantBookingStatus({ bookingId, status, telegramUserId })`.

- [ ] Write failing tests for pure authorization/status behavior.
- [ ] Implement dashboard lookup through `merchant_telegram_members`.
- [ ] Implement onboarding route to create salon, owner membership, initial service, initial staff, staff service link, and default working hours.
- [ ] Implement booking status route with membership authorization.

### Task 4: Merchant UI

**Files:**
- Modify: `src/app/merchant/page.tsx`
- Modify: `src/components/merchant/MerchantBookingsTable.tsx`
- Modify: `src/components/merchant/MerchantSalonSummary.tsx`
- Create: `src/components/merchant/MerchantAuthGate.tsx`
- Create: `src/components/merchant/MerchantOnboardingForm.tsx`
- Create: `src/components/merchant/MerchantBookingActions.tsx`

**Interfaces:**
- Consumes: dashboard data and API routes from Task 3.
- Produces: an unauthenticated Telegram gate, onboarding form, and booking action buttons.

- [ ] Build auth gate for users without a Telegram session.
- [ ] Build onboarding form for authenticated users without salons.
- [ ] Build operational dashboard for users with salons.
- [ ] Wire booking action buttons to PATCH status and refresh the route.

### Task 5: Verification and Deploy

**Files:**
- Modify tests as needed only for intentional behavior.

- [ ] Run `bun run lint`.
- [ ] Run `bun run build`.
- [ ] Run `bun test`.
- [ ] Run `PLAYWRIGHT_PORT=3001 PLAYWRIGHT_BASE_URL=http://localhost:3001 bun run test:e2e`.
- [ ] Smoke-test production after deploy with a test Telegram session cookie or server-side data query.
