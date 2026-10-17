# Drovna

Drovna is a mobile-first delivery marketplace for Ilorin, Kwara State. It uses Next.js App Router, TypeScript, Tailwind CSS v4, Supabase Auth and PostgreSQL, Zod validation, and Paystack for NGN payments.

## Requirements

- Node.js 20.9 or newer (Node 20 LTS recommended)
- npm
- A Supabase project for authentication and database-backed features
- Paystack test or live credentials for online payments

## Run locally

```powershell
npm ci
Copy-Item .env.example .env.local
npm run dev
```

On macOS/Linux, use `cp .env.example .env.local` instead of `Copy-Item`. Open <http://localhost:3000>.

### Test email links on a phone

`localhost` always points to the device opening the link. For phone testing, connect the phone and computer to the same Wi-Fi, start the dev server on the network interface (for example, `npm run dev -- --hostname 0.0.0.0 --port 3001`), then open the app on the phone using the computer's LAN IP, such as `http://192.168.1.20:3001`. Add that origin and `http://192.168.1.20:3001/auth/callback` to Supabase Auth's allowed redirect URLs. The callback uses the LAN host and port used in the browser. Replace the example IP with the computer's current LAN IP; allow the port through the computer firewall if prompted. For remote testing, use an HTTPS tunnel and allow its callback URL in Supabase. Production callbacks must use HTTPS.

Set the values in `.env.local` before using authenticated features:

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Yes outside local development | Canonical site origin used for Supabase email callbacks and Paystack returns. Use the deployed HTTPS origin, with no path. |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL, for example `https://<project-ref>.supabase.co`. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase public anon/publishable key. This key is intended for browser use and relies on database RLS for authorization. |
| `SUPABASE_SERVICE_ROLE_KEY` | Payments and server-side payment updates | Server-only Supabase service-role key. Never prefix it with `NEXT_PUBLIC_` or expose it to a browser. |
| `PAYSTACK_SECRET_KEY` | Payments | Server-only Paystack test/live secret. Never expose it to a browser. |

`.env.local` is ignored by Git. Do not commit real credentials. The service-role and Paystack keys must be configured as server environment variables on the deployment provider.

## Configure Supabase

1. Set the Supabase URL and public key in your local environment.
2. Apply the migrations in order with the Supabase CLI, or run each SQL file in the SQL editor:

   ```powershell
   npx supabase init
   npx supabase login
   npx supabase link --project-ref <project-ref>
   npx supabase db push
   ```

   The migrations create the profile trigger, roles, marketplace tables, RLS policies, and guarded database functions. Review them before applying to an existing database. The hardening migration adds a composite payment-owner constraint; existing payment rows must match their delivery owner.
3. In Supabase Auth, enable the Email provider and disable **Confirm email** under Authentication → Providers → Email. This lets Supabase return a session at signup and implicitly confirms email addresses. Existing unconfirmed accounts may need an administrator to confirm them in Supabase Auth before they can sign in; Drovana never changes confirmation status itself. Under **URL Configuration**, set Site URL to the deployed HTTPS origin and allow the deployed `/auth/callback` URL. For local testing, allow `http://localhost:3000/**` and the port actually used by Next (often `http://localhost:3001/**`). To test from a phone, open the app via the computer's LAN IP and allow that exact origin and its `/auth/callback` URL too. The callback handles password reset links at `/reset-password`.
4. For real customer email delivery, configure custom SMTP under **Authentication → Emails → SMTP Settings**, verify the sender domain and SPF/DKIM records with your email provider, and use a branded sender address. Supabase's built-in email service is for development and has a very low send limit. Disable click/link tracking in the SMTP provider so it does not rewrite authentication URLs. Keep the **Confirm signup** and **Reset Password** templates' Supabase-generated `{{ .ConfirmationURL }}` links; do not hard-code a `{{ .SiteURL }}` callback because it can point to the wrong host. Check Auth logs and the SMTP provider's delivery logs when an email is missing. See Supabase's current [SMTP setup](https://supabase.com/docs/guides/auth/auth-smtp), [redirect URL](https://supabase.com/docs/guides/auth/redirect-urls), and [email troubleshooting](https://supabase.com/docs/guides/troubleshooting/not-receiving-auth-emails-from-the-supabase-project-OFSNzw) guides.
5. Create and verify the first account. In the Supabase SQL editor, bootstrap the first administrator by replacing the email below:

   ```sql
   update public.profiles p
   set role = 'admin'
   from auth.users u
   where p.id = u.id and u.email = 'admin@example.com';
   ```

   Keep administrator provisioning limited to trusted database access. Rider and business accounts request access through the application forms and require admin review.

## Configure Paystack

Set `PAYSTACK_SECRET_KEY` and `SUPABASE_SERVICE_ROLE_KEY` on the server. Configure the Paystack webhook URL as `https://<your-domain>/api/payments/webhook`. Use test credentials and the Paystack test dashboard before enabling live keys. The application verifies webhook signatures and checks amount, currency, and transaction reference before recording payment success.

## Deploy

Deploy as a Node.js Next.js application (for example, on Vercel). Configure all environment variables for the correct deployment environment before enabling auth or payments. Set `NEXT_PUBLIC_SITE_URL` to the canonical HTTPS origin, then add that origin and `/auth/callback` to Supabase Auth's allowed URLs. Configure the Paystack webhook and confirm it reaches the deployed endpoint. Apply pending Supabase migrations before routing production traffic.

Before launch, also configure email delivery/templates, database backups and monitoring, abuse/rate limiting, and an operational process for failed payments and customer support. Verify auth email links, payment success/failure, webhook retries, and role-protected dashboards against the actual Supabase and Paystack environments; those provider integrations cannot be verified from a local build alone.

## Implemented functionality

- Email/password sign-up with an immediate session, sign-in, password reset, and sign-out.
- Strong signup/reset passwords: at least 8 characters, one uppercase letter, one number, and one punctuation or symbol character.
- Customer delivery requests, fee estimates by category, saved addresses, and owner-scoped tracking/status history.
- Paystack initialization, callback verification, signed webhook handling, and duplicate-payment protections.
- Rider and business applications, administrator review, rider availability, atomic job acceptance, and sequential delivery status updates.
- Customer, rider, business, and admin dashboards with role-based access and PostgreSQL RLS.

## Known limits

- Delivery pricing is a flat Ilorin launch rate by category; it does not calculate distance, geocode addresses, or apply oversized-item surcharges.
- Service and merchant cards are illustrative. Merchant catalogs, cart checkout, and business product management are not implemented.
- Tracking shows delivery status changes; it does not include live GPS, maps, or push/SMS notifications.
- Refunds and rider payout reconciliation are not implemented. Do not treat a paid delivery as cancellable or advertise payouts as available.
- Customer cancellation controls, privacy/terms pages, and a support contact page are not implemented; add these before public launch.
- No automated test suite is currently defined. Supabase migrations and live Supabase/Paystack integrations have not been applied or exercised in this workspace.

## Checks

```bash
npm audit --audit-level=high
npm run typecheck
npm run lint
npm run build
```
