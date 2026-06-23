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
- Vercel deployment

## Setup

1. Copy `.env.example` to `.env.local`.
2. Fill Supabase and Telegram values.
3. Run Supabase migrations and seed data.
4. Start the app with `bun dev`.

## Environment

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY` or `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_MAP_TILE_URL`
- `NEXT_PUBLIC_MAP_ATTRIBUTION`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_BOT_USERNAME`

## Map Tiles

Development uses OpenStreetMap tiles by default. Production must set `NEXT_PUBLIC_MAP_TILE_URL` to a compliant tile provider or self-hosted tile service and keep attribution visible.

## Telegram Mini App

Set `TELEGRAM_BOT_TOKEN` and `TELEGRAM_BOT_USERNAME`. Configure the bot's Mini App URL to `https://nurai.beauty/telegram`.

## AI Assistant

Set `OPENROUTER_API_KEY` for real model responses. `OPENROUTER_MODEL` defaults to `anthropic/claude-sonnet-4.6`. `NURAI_ASSISTANT_MOCK=1` forces the local safe mock in development and is ignored in production.

For local UI checks, the assistant has a dev-only fallback: when `OPENROUTER_API_KEY` is empty, or when `NURAI_ASSISTANT_MOCK=1` is set, `/api/assistant` returns a safe mock booking response. Start locally with:

```bash
bun run dev:mock
```

Open `http://localhost:3001`, click the `AI запись` bubble in the bottom-right corner, and try:

```text
Запиши меня на маникюр сегодня в 11:00. Имя Тест, телефон +996 700 000 000
```

## Scripts

- `bun dev` - local dev server
- `bun run build` - production build
- `bun run test` - unit tests
- `bun run test:e2e` - Playwright smoke tests
