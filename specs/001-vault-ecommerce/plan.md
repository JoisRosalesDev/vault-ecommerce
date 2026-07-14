# Implementation Plan: Plataforma de Comercio Electrónico VAULT

**Branch**: `001-vault-ecommerce` | **Date**: 2026-07-13 | **Spec**: [spec.md](file:///C:/Users/rosal/Dev/vault-ecommerce/specs/001-vault-ecommerce/spec.md)

**Input**: Feature specification from `specs/001-vault-ecommerce/spec.md`

## Summary
The VAULT project is a premium e-commerce platform developed in Spanish using Next.js (App Router), TypeScript, and Tailwind CSS. The implementation establishes a highly resilient architecture protecting the PostgreSQL database against high traffic (10k concurrent users rule) using connection pooling (Supavisor), edge caching (ISR), and API route rate limiting. The front-end leverages Atomic Design layout guidelines, GSAP for smooth scroll/state animations, and `lucide-react` icons. Payments are secured server-side via Stripe, incorporating idempotency keys and idempotent webhook processing.

## Technical Context

**Language/Version**: TypeScript / Node.js 20+

**Primary Dependencies**: Next.js 16, React 19, Zustand (cart), GSAP (animations), Stripe SDK, Supabase JS, lucide-react (exclusive iconography). Managed exclusively via `pnpm`.

**Storage**: Supabase PostgreSQL + Prisma ORM (direct migrations via port 5432, pooler transaction access via Supavisor port 6543). Product images stored in Supabase Storage.

**Testing**: E2E validation scenarios, Stripe CLI webhooks simulation, and Google Lighthouse audit suite.

**Target Platform**: Vercel (Edge network optimizations)

**Project Type**: Web application (Next.js App Router)

**Performance Goals**: Google Lighthouse Performance score > 90, CLS = 0, edge redirects < 200 ms.

**Constraints**: Spanish interface/metadata, strict types (no `any`), no comments/emojis in code files, strict Atomic Design component structure.

**Scale/Scope**: MVP client catalog, Zustand cart persistent storage, Stripe checkout, admin CRUD dashboard for products with image upload.

## Constitution Check

*GATE: Passed*

- [x] **Edge-Enforced RBAC**: Protected `/admin` routes validated at the edge using Next.js `middleware.ts`.
- [x] **No Emojis**: Codebase, UI, and comments are checked and contain zero emojis.
- [x] **Iconography**: `lucide-react` is set as the sole icon provider library.
- [x] **Atomic Design**: Components directory maps cleanly to atoms, molecules, organisms, and templates.
- [x] **Server-Side Payments**: Stripe SDK initialized and called strictly in Server Actions/Route Handlers with `AbortController` timeouts.
- [x] **State Management**: Zustand store reserved exclusively for local cart state with `localStorage` persistence.
- [x] **SEO & Semantic HTML**: Structured with Next.js Metadata API and HTML5 semantic markup.

## Project Structure

### Documentation (this feature)

```text
specs/001-vault-ecommerce/
├── plan.md              # This file
├── research.md          # Dependency audit, pooling, caching, rate limiting analysis
├── data-model.md        # Prisma schema mapping (User, Product, Order, OrderItem)
├── quickstart.md        # Scenario verification guide, env variables
└── contracts/
    └── api.md           # API contracts (Checkout, Webhook, Product CRUD)
```

### Source Code (repository root)

```text
app/
├── (client)/            # Public client-facing route group
│   ├── page.tsx         # Landing and Product Catalog
│   ├── products/
│   │   └── page.tsx
│   └── cart/
│       └── page.tsx
├── (admin)/             # Protected admin route group
│   ├── admin/
│   │   ├── layout.tsx   # Admin dashboard header and nav shell
│   │   └── products/    # Product CRUD forms and views
├── api/                 # Server-side Route Handlers
│   ├── checkout/
│   │   └── route.ts     # Checkout session initiator with rate limits & idempotency
│   └── webhooks/
│       └── stripe/
│           └── route.ts # Idempotent webhook listener
├── layout.tsx           # Global root layout
├── middleware.ts        # Edge JWT authorization check for /admin
└── globals.css          # Tailwind CSS global styles

components/              # UI components structured via Atomic Design
├── atoms/               # Smallest elements: buttons, inputs, Skeletons
├── molecules/           # Component groups: cart items, product cards
├── organisms/           # High-level layouts: product grid, navigation bar
└── templates/           # Context-free page shells

hooks/                   # Custom React hooks (e.g., useCart Zustand store)
prisma/
└── schema.prisma        # Prisma ORM models mapping
```

**Structure Decision**: Web application layout utilizing Next.js App Router Route Groups `(client)` and `(admin)` with Atomic Design component folders.

## Complexity Tracking

*No violations to track. All constitution constraints are met.*
