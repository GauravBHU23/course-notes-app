# ExamPrep Store

Platform for selling access to exam-prep PDFs/notes (SSC, Railway, Bank, UGC NET, BPSC, TRE, etc.) with view-only watermarked PDF access, single-active-session login, OTP/password auth, and Cashfree payments.

Stack: Next.js (App Router) + TypeScript + Tailwind, Supabase (Postgres/Auth/Storage/Realtime), Cashfree payments.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy the env template and fill in real values:
   ```bash
   cp .env.local.example .env.local
   ```
   You'll need:
   - **Supabase**: project URL, anon key, service-role key (from your Supabase project settings).
   - **Cashfree**: App ID, Secret Key, Webhook Secret (from your Cashfree merchant dashboard). Set `CASHFREE_ENV`/`NEXT_PUBLIC_CASHFREE_ENV` to `sandbox` until you're ready to go live.
   - **Resend**: API key for transactional emails (OTP codes, invoices, welcome emails).
   - `OTP_SECRET` and `PDF_TOKEN_SECRET`: generate with `openssl rand -hex 32`. Keep these distinct from each other and from Supabase/Cashfree keys.
   - `SMS_PROVIDER` / `SMS_PROVIDER_API_KEY`: optional. Leave blank to keep mobile OTP login disabled with a "coming soon" message; email OTP and password login both work without this.

3. Apply the database schema to your Supabase project:
   ```bash
   npx supabase link --project-ref <your-project-ref>
   npx supabase db push
   ```
   This runs every file in `supabase/migrations/` in order (tables, RLS policies, views, storage buckets, realtime authorization). Optionally seed sample data for local testing: `npx supabase db reset` applies `supabase/seed.sql` too.

4. In the Supabase dashboard, configure the Cashfree webhook URL (`<your-domain>/api/payments/cashfree/webhook`) in your Cashfree merchant dashboard's webhook settings, matching the `CASHFREE_WEBHOOK_SECRET` in your env.

5. Run the dev server:
   ```bash
   npm run dev
   ```

## Architecture notes

- **Single active session**: enforced via `profiles.session_version` + `active_sessions`, checked on every request in `src/proxy.ts` (Next.js 16's renamed middleware convention) and pushed instantly to open tabs via Supabase Realtime Broadcast (`src/components/realtime/SessionGuard.tsx`). See `src/lib/auth/session.ts`.
- **PDF security**: PDFs live in a private Supabase Storage bucket, never exposed via a public/permanent URL. Viewing requires a short-lived, single-use, HMAC-signed token (`src/lib/pdf/signToken.ts`) bound to the current session, streamed as `application/octet-stream` and rendered client-side via PDF.js onto a `<canvas>` with a baked-in per-user watermark (`src/components/pdf-viewer/`). This deters redistribution but cannot block PrintScreen or a camera photographing the screen — no web page can.
- **Payments**: Cashfree order creation re-reads the canonical price server-side; the only thing that ever marks a purchase successful is a signature-verified webhook call (`src/app/api/payments/cashfree/webhook/route.ts`), never the client-side checkout redirect.
- **Admin vs. student auth**: separate cookies (`admin_session` / `app_session`) and separate login routes, sharing the same underlying session/lockout/OTP primitives.

## Mobile app (later phase)

A React Native + Expo app will reuse this same Supabase backend (same tables, RLS, Storage buckets, and PDF token scheme) for Android (and later iOS) distribution. Not part of this repository yet.
