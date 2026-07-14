<!--
SYNC IMPACT REPORT
- Version change: none -> 1.0.0
- List of modified principles:
  * [PRINCIPLE_1_NAME] -> Principle I: Edge-Enforced Authentication & Role-Based Access Control (RBAC)
  * [PRINCIPLE_2_NAME] -> Principle II: Scale-First Database Architecture & Integrity
  * [PRINCIPLE_3_NAME] -> Principle III: Secure Payments & Server-Side Execution
  * [PRINCIPLE_4_NAME] -> Principle IV: Component Architecture & Styling Conventions
  * [PRINCIPLE_5_NAME] -> Principle V: SEO & Web Vitals Optimization
- Added sections:
  * Section 2: Core Technology Stack & State Management
  * Section 3: Development Workflow & Compliance Standards
- Removed sections: None
- Templates requiring updates:
  * ✅ .specify/templates/plan-template.md (Updated "Constitution Check" section)
  * ✅ .specify/templates/tasks-template.md (Updated to reference strict constraints like emoji bans and atomic design)
- Follow-up TODOs: None (all placeholders successfully populated)
-->

# VAULT E-commerce Constitution

## Core Principles

### Principle I: Edge-Enforced Authentication & Role-Based Access Control (RBAC)
Security and Role-Based Access Control (RBAC) MUST be enforced at the edge using Next.js
middleware.ts to validate the Supabase session JWT. The system uses Supabase Auth with the Google
Provider exclusively.
*   **Client Role**: Has read-only access to the landing page and catalog, and is able to mutate
    local cart state.
*   **Admin Role**: Has full CRUD access via a protected `/admin` dashboard to manage products
    (Create, Edit, Delete, Publish).
*   **Rationale**: Middleware JWT validation at the edge guarantees that unauthorized requests are
    blocked before invoking downstream Next.js page components or API handlers, minimizing latency
    and potential vulnerability surfaces.

### Principle II: Scale-First Database Architecture & Integrity
The Prisma schema must be highly scalable and explicitly map user roles to ensure data integrity
between Users, Products, and Orders.
*   **Data Constraints**: Hard relations and constraints must be explicitly mapped in the schema
    file. Schema design must prevent orphaned orders and enforce product state invariants.
*   **Rationale**: Robust database schemas prevent data corruption and race conditions, serving as the
    reliable ground truth for e-commerce transactions.

### Principle III: Secure Payments & Server-Side Execution
Stripe API calls MUST be strictly server-side (using Next.js Route Handlers or Server Actions).
*   **Timeout & Resilience**: All external API calls MUST implement strict timeouts and error
    handling (e.g., using `AbortController` or robust try/catch blocks).
*   **Rationale**: Protecting API keys and isolating Stripe SDK execution on Vercel's server environment
    prevents credentials leaking and client-side tampering. Using timeouts avoids dangling requests and
    unnecessary billing consumption.

### Principle IV: Component Architecture & Styling Conventions
Developers MUST strictly follow the Atomic Design methodology (atoms, molecules, organisms, templates)
and implement a Mobile-First responsive approach using Tailwind CSS.
*   **Asset & Icon Integrity**: YOU MUST NEVER USE EMOJIS in the codebase, UI, or comments. Use the
    `lucide-react` library exclusively for all iconography.
*   **Rationale**: Standardizing UI components as atomic structures guarantees modularity and testability.
    Enforcing an emoji-free codebase and a single icon provider maintains professional visual cohesion
    and brand alignment.

### Principle V: SEO & Web Vitals Optimization
The project must be fully optimized for search engine visibility using the Next.js Metadata API.
*   **Semantic HTML**: All layouts and pages must leverage semantic HTML5 tags (e.g., `<header>`,
    `<main>`, `<footer>`, `<section>`) instead of nested division blocks.
*   **Rationale**: Next.js Metadata API integrates well with search crawlers. Using semantic HTML is
    non-negotiable for WCAG 2.2 accessibility compliance and SEO ranking performance.

## Section 2: Core Technology Stack & State Management
The project utilizes the following designated stack:
*   **Core Framework**: Next.js (App Router), TypeScript, Tailwind CSS, Prisma ORM, Supabase.
*   **Payments & Deployment**: Stripe Node SDK, deploying directly to Vercel.
*   **Client State**: Zustand is strictly reserved for managing the cart (add, remove, edit
    quantities) with `localStorage` persistence. No other global client-side state is permitted.

## Section 3: Development Workflow & Compliance Standards
*   **Linting & Style Checks**: The build pipeline must run compilation checks to verify ESLint,
    TypeScript, and the absence of emojis in code files.
*   **PR Compliance Gates**: Pull requests cannot be merged if they violate Atomic Design layouts
    or place Stripe SDK execution in client-side code.

## Governance
This Constitution is the primary technical authority for the VAULT E-commerce project.
*   **Amendment Procedure**: Any modifications or principle changes must be ratified, incrementing the
    constitution version (MAJOR for removals/redefinitions, MINOR for additions/expansions, PATCH for
    clarifications).
*   **Version History & Tracking**: Updates must document changes in the Sync Impact Report at the top
    of the file.
*   **Guidance Files**: Use the project `README.md` for runtime development guidance.

**Version**: 1.0.0 | **Ratified**: 2026-07-13 | **Last Amended**: 2026-07-13
