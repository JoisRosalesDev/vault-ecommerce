# Research Notes: VAULT E-commerce Concurrency & Resiliency

## 1. Dependency Analysis & Installation

### Dependency Audit
Based on the Project Constitution and Specification, the following packages must be added to the project:
*   **Production Dependencies**:
    *   `gsap`: Core GSAP library for custom animations.
    *   `zustand`: State management for local cart state.
    *   `stripe`: Node.js SDK for server-side payment processing.
    *   `@stripe/stripe-js`: Client-side Stripe SDK helper.
    *   `@supabase/supabase-js`: Supabase JavaScript client for Auth and Storage.
    *   `lucide-react`: SVG icons (exclusive provider).
    *   `@prisma/client`: Client for interacting with the database.
*   **Development Dependencies**:
    *   `prisma`: Prisma CLI for schema management and migrations.
    *   `lucide-react` (can also be production).
    *   `@types/react` and `@types/node` (already present, verify version alignment).

### Installation Command
All dependencies will be installed exclusively using `pnpm`:
```bash
# Install production dependencies
pnpm add gsap zustand stripe @stripe/stripe-js @supabase/supabase-js lucide-react @prisma/client

# Install development dependencies
pnpm add -D prisma
```

### shadcn/ui Initialization
To initialize shadcn/ui in a Next.js project with Tailwind CSS v4:
1.  Run the CLI initializer:
    ```bash
    pnpm dlx shadcn@latest init
    ```
2.  Follow the configuration choices (TypeScript = Yes, Style = Default, Color = Neutral).
3.  Install the Skeleton component:
    ```bash
    pnpm dlx shadcn@latest add skeleton
    ```

***

## 2. Database Connection Pooling (Supabase Supavisor)

### Supavisor URL Configuration
When deploying to Vercel, serverless functions can scale up rapidly, potentially exhausting PostgreSQL's maximum connection limits.
-   **Direct URL (Session Mode - Port 5432)**: Used for Prisma migrations and schema push.
    -   Format: `postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres`
-   **Pooler URL (Transaction Mode - Port 6543)**: Used for runtime database queries and mutations.
    -   Format: `postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true`

### Prisma Client Configuration
In `schema.prisma`:
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")       // Pooler URL (Transaction mode)
  directUrl = env("DIRECT_DATABASE_URL") // Direct URL (Session mode)
}
```

***

## 3. Caching Strategy: Vercel Edge Cache & Next.js ISR

To protect the database from 10k concurrent users querying the product catalog, we must enforce Edge-level caching:
1.  **Incremental Static Regeneration (ISR)**: The product catalog page will render statically and revalidate asynchronously in the background.
    ```typescript
    // app/(client)/products/page.tsx
    export const revalidate = 3600; // Revalidate every hour
    ```
2.  **Route Caching**: Fetch requests inside React Server Components will use the cache:
    ```typescript
    const res = await fetch('https://api.vault.com/products', {
      next: { revalidate: 3600 }
    });
    ```
3.  **On-Demand Revalidation**: When an administrator updates a product via the CRUD panel, we trigger on-demand revalidation:
    ```typescript
    import { revalidatePath } from 'next/cache';
    revalidatePath('/(client)/products');
    ```

***

## 4. Rate Limiting in Next.js API Routes

To prevent DDoS and api exhaustion, rate-limiting is implemented on `/api/checkout` and `/api/auth` endpoints.
-   **Implementation**: In-memory token-bucket limiter using standard Node.js cache utilities, or edge-optimized rate limiting using Upstash Redis.
-   **Fallback**: If rate limits are exceeded, return `HTTP 429 Too Many Requests` with a JSON payload containing an error message in Spanish.

***

## 5. Stripe Resiliency & Payment Idempotency

### Idempotency Key
To ensure clients are never charged twice under heavy traffic or double clicks, Stripe API calls for charge creation must include an idempotency key.
-   **Generation**: Unique uuid per checkout session (e.g., `checkout_sess_[orderId]`).
-   **API Invocation**:
    ```typescript
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart`,
      metadata: { orderId }
    }, {
      idempotencyKey: `idempotency_checkout_${orderId}`
    });
    ```

### Webhook Idempotency & Speed Optimization
-   **Response Speed**: The webhook route `/api/webhooks/stripe` must respond to Stripe with a `200 OK` status immediately after parsing and verifying the signature, or within a maximum of 2 seconds. Long-running database updates can be handled asynchronously or optimized.
-   **State Check**: The order status in the database must be verified before performing state updates:
    ```typescript
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (order && order.status === 'PAID') {
      return new Response(JSON.stringify({ received: true }), { status: 200 });
    }
    // Perform update
    await prisma.order.update({ ... });
    ```
