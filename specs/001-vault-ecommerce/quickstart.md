# Quickstart & Validation Guide: VAULT E-commerce

This guide outlines the local development setup, environment configurations, and verification scenarios to prove that the core e-commerce platform and its resilience/caching layers are operational.

## 1. Prerequisites & Environment Variables

Copy the template below to `.env` in the root of the project:

```bash
# PostgreSQL Connection Strings (Supabase)
# Pooler connection (transaction mode) - Port 6543
DATABASE_URL="postgres://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
# Direct connection (session mode) - Port 5432 (migrations only)
DIRECT_DATABASE_URL="postgres://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

# Stripe Configurations
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Supabase Auth & Storage Configurations
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOi..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOi..."
```

***

## 2. Local Setup Commands

Initialize dependencies, database schemas, and developer workspace:

```bash
# 1. Install all dependencies via pnpm
pnpm install

# 2. Push database schema migrations
pnpm prisma db push

# 3. Initialize shadcn components
pnpm dlx shadcn@latest init
pnpm dlx shadcn@latest add skeleton

# 4. Run Next.js local development server
pnpm dev
```

***

## 3. End-to-End Verification Scenarios

### Scenario A: Client Catalog Caching Verification
*   **Action**: Access the home catalog (`/`) and inspect query times.
*   **Verification**:
    -   Initial visit: Performs database fetch, populating cache.
    -   Subsequent visits: Load catalog in < 100ms directly from Vercel Edge cache without executing Prisma database calls.
    -   Verify that UI renders a beautiful `Skeleton` loading state while fetching catalog content asynchronously.

### Scenario B: Payment Idempotency & Checkout Session Creation
*   **Action**: Add 2 items to the Zustand cart, click checkout, and intercept the request payload.
*   **Verification**:
    -   Confirm that the `POST /api/checkout` request includes an auth token and cart items.
    -   Stripe SDK receives request containing a generated `idempotencyKey` corresponding to the created Order UUID.
    -   Simulated double-click results in Stripe returning the identical session reference instead of charging twice.

### Scenario C: Webhook Verification via Stripe CLI
*   **Action**: Simulate a successful payment completion webhook.
*   **Verification**:
    -   Trigger the webhook via Stripe CLI:
        ```bash
        stripe trigger checkout.session.completed
        ```
    -   Observe `/api/webhooks/stripe` response times (should return `200 OK` in < 2 seconds).
    -   Verify that order status in Postgres changes to `PAID` and product stock is decremented.
