# Tasks: Plataforma de Comercio Electrónico VAULT

**Input**: Design documents from `specs/001-vault-ecommerce/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/api.md`, `quickstart.md`

**Tests**: None requested. Scenarios verified via quickstart guide.

**Organization**: Tasks are grouped by setup/infrastructure, foundation, and user story to enable independent implementation and testing of each story.

***

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic dependencies

- [x] T001 Install dependencies (gsap, zustand, stripe, @stripe/stripe-js, @supabase/supabase-js, lucide-react, @prisma/client) and devDependencies (prisma) in package.json
- [x] T002 Initialize Prisma configuration in prisma/schema.prisma
- [x] T003 Initialize shadcn/ui configuration in components.json

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core database schema, route structure, and styling frameworks blocking all user stories

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Define database schema models (User, Product, Order, OrderItem) in prisma/schema.prisma
- [x] T005 [P] Create Prisma Client singleton instance in lib/prisma.ts
- [x] T006 [P] Configure global layout with Spanish SEO metadata in app/layout.tsx
- [x] T007 Scaffold component directory tree for Atomic Design in components/
- [x] T008 [P] Add shadcn/ui Skeleton component in components/atoms/skeleton.tsx
- [x] T009 [P] Create local environment variables template in .env.example

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Catálogo y Carrito de Compras (Priority: P1) 🎯 MVP

**Goal**: Permite al cliente navegar por los productos y gestionar el carrito Zustand de forma interactiva y persistente.

**Independent Test**: Acceder a `/` y verificar carga de productos, interacción del carrito, animaciones GSAP y guardado en localStorage.

- [x] T010 [P] [US1] Implement Zustand cart store with localStorage persistence in hooks/useCartStore.ts
- [x] T011 [P] [US1] Build product card component in components/molecules/product-card.tsx
- [x] T012 [US1] Build product grid organism using skeleton loads in components/organisms/product-grid.tsx
- [x] T013 [US1] Build client catalog route with Vercel Edge caching in app/(client)/page.tsx
- [x] T014 [US1] Build cart drawer UI connected to Zustand store in components/organisms/cart-drawer.tsx
- [x] T015 [US1] Implement GSAP catalog scroll-reveal animations in app/(client)/page.tsx

**Checkpoint**: User Story 1 fully functional and testable independently.

---

## Phase 4: User Story 2 - Pasarela de Pago y Finalización de Compra (Priority: P1)

**Goal**: Cierre de la compra del cliente mediante pasarela de pago Stripe e integración de webhooks.

**Independent Test**: Completar flujo de checkout, verificar redirección a Stripe, y simular webhook de compra PAID.

- [x] T016 [P] [US2] Implement API route for Stripe checkout sessions with rate-limiting in app/api/checkout/route.ts
- [x] T017 [US2] Connect cart drawer checkout action with AbortController 10s timeout in components/organisms/cart-drawer.tsx
- [x] T018 [P] [US2] Implement Stripe webhook route to confirm orders as PAID in app/api/webhooks/stripe/route.ts
- [x] T019 [US2] Create checkout success and cancel redirection pages in app/(client)/checkout/success/page.tsx

**Checkpoint**: User Story 1 and 2 work seamlessly.

---

## Phase 5: User Story 3 - Administración de Catálogo (Priority: P2)

**Goal**: Panel de administración protegido para operaciones CRUD de productos e imágenes.

**Independent Test**: Autenticarse como administrador, ingresar a `/admin/products` y realizar operaciones CRUD.

- [x] T020 [P] [US3] Configure Supabase client helper and initialize storage bucket config for product image uploads in lib/supabase.ts
- [x] T021 [US3] Implement Next.js edge middleware.ts to protect admin routes and apply rate-limiting to auth callback routes in middleware.ts
- [x] T022 [US3] Build admin login interface with Google Auth in app/(admin)/admin/login/page.tsx
- [x] T023 [US3] Build admin layout shell and dashboard nav in app/(admin)/admin/layout.tsx
- [x] T024 [P] [US3] Implement product CRUD actions and API endpoints in app/api/admin/products/route.ts
- [x] T025 [US3] Build admin forms and table views to manage products in app/(admin)/admin/products/page.tsx

**Checkpoint**: Admin panel operations fully protected and operational.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Performance audits, security compliance, and styling cleanup.

- [x] T026 Audit codebase to enforce strict emoji-ban rules in eslint.config.mjs
- [x] T027 Run Google Lighthouse audit to verify performance score > 90 in package.json
- [x] T028 Update local documentation and verify quickstart in README.md

***

## Dependencies & Execution Order

### Phase Dependencies
- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup completion. Blocks all User Stories.
- **User Story 1 (Phase 3)**: Depends on Foundational completion.
- **User Story 2 (Phase 4)**: Depends on User Story 1 catalog and cart implementation.
- **User Story 3 (Phase 5)**: Depends on Foundational middleware setup.
- **Polish (Phase 6)**: Runs after all stories are completed.

### Parallel Opportunities
- **Phase 2**: T005, T006, T008, T009 can be run in parallel.
- **Phase 3**: T010, T011 can be run in parallel.
- **Phase 4**: T016, T018 can be run in parallel.
- **Phase 5**: T020, T024 can be run in parallel.

***

## Implementation Strategy

### MVP First (User Story 1 Only)
1. Complete Setup and Foundational Phases.
2. Complete Phase 3 (User Story 1).
3. Validate catalog navigation and local cart storage.

### Incremental Delivery
1. Add User Story 2 (Stripe checkout) -> Test payments.
2. Add User Story 3 (Admin panel) -> Test CRUD.
3. Apply final Polish phase.

***

## Phase 7: Convergence

**Purpose**: Address design refinements, direct admin accessibility, and database seed adjustments.

- [x] T029 Redesign catalog UI/UX using HSL styling and custom typography pairings per plan: UI-UX Pro Max (partial)
- [x] T030 Add advanced GSAP animations and card-stagger timelines per plan: gsap-core (partial)
- [x] T031 Integrate discreet admin login entry point in client layout footer per US3/AC: Admin accessibility (missing)
- [x] T032 Remove default products seed data to start with empty catalog and manual admin entry per plan: data seeding (contradicts)

## Phase 8: Convergence

**Purpose**: Resolve product image loading issue and refine hero banner layout and animations.

- [x] T033 Configure remote pattern for Supabase Storage in next.config.ts to resolve 400 Bad Request error per FR-005 (partial)
- [x] T034 Restyle hero catalog banner to be full-width, borderless, and marginless, and implement brand-distinctive layouts and advanced GSAP parallax transition animations per A-005 (partial)
- [x] T035 Decouple hero slideshow scroll/navigation from catalog product filtering per user instruction (partial)
- [x] T036 Separate hero slideshow from catalog grid with a distinct full-width container featuring a detailed brand-specific mesh gradient background per user instruction (partial)

## Phase 9: Convergence

**Purpose**: Transition codebase styling to Modern Brutalist art direction, remove GSAP animations, and implement subtle Tailwind transitions.

- [x] T037 Remove all GSAP imports, ScrollTrigger plugins, and timeline logic across catalog-view.tsx, product-card.tsx, and toast-container.tsx per SC-001 / user request (contradicts)
- [x] T038 Redesign app/globals.css and components to establish a Modern Brutalist layout (thick high-contrast borders, solid shadows, variable typography sizing, stark grid patterns) replacing the luxury glowing dark mode per user request (contradicts)
- [x] T039 Implement subtle entrance animations using utility Tailwind CSS classes and transitions on navigation elements, page sections, catalog cards, and toasts per user request (missing)
- [x] T040 Replace the pinned, scroll-driven hero slideshow in components/templates/catalog-view.tsx with a responsive, non-pinned Modern Brutalist banner section per user request (partial)
- [x] T041 Uninstall the gsap library and clean up dependencies inside package.json per user request (unrequested)

## Phase 10: Convergence

**Purpose**: Refactor cart drawer, admin login, and admin dashboard to Brutalist Modern styling, add light/dark mode theme toggle, and refine responsiveness.

- [x] T042 Refactor the shopping cart aside-bar (CartDrawer component) to match the Brutalist Modern layout and support light/dark modes per user request (contradicts)
- [x] T043 Refactor the admin login interface (AdminLoginForm component) to match the Brutalist Modern layout and support light/dark modes per user request (contradicts)
- [x] T044 Refactor the admin dashboard layouts and forms (AdminLayout and AdminProductsPage components) to match the Brutalist Modern layout and support light/dark modes per user request (contradicts)
- [x] T045 Implement a functional light/dark mode theme toggle button in the main catalog navbar with persistence to localStorage per user request (missing)
- [x] T046 Refine responsiveness details (mobile-friendly spacing, card grid, and layout responsiveness) across all views per user request (partial)
