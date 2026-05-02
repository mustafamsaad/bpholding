# BP Holding — Digital Ecosystem

Premium bilingual (Arabic / English, RTL / LTR) digital ecosystem for **Business Pioneers Holding (BP Holding)**: corporate website, admin dashboard, employee/HR portal, and (future) PEG-N + Business Pioneers community platform — built as a **single Next.js application**.

> Roadmap and full scope: see [`BP_HOLDING_EXECUTION_PLAN.md`](./BP_HOLDING_EXECUTION_PLAN.md).

---

## Architecture decision: one Next.js app, three surfaces

The platform serves three very different user types, but they all share the same brand, design system, content database, media library, and authentication layer. Splitting them across separate repositories/deployments would multiply infrastructure work (auth duplication, CMS duplication, media duplication) for no business benefit at this stage.

We therefore use **one Next.js app** with **App Router route groups** to keep each surface cleanly isolated:

```
src/app/
  [locale]/              ← bilingual segment (en | ar) with locale-aware <html lang/dir>
    (site)/              ← Public corporate website (visitors)
      page.tsx           ← Home
      about/, services/, portfolio/, careers/, rfq/, contractors/, ...
    (admin)/admin/       ← Admin Dashboard (role: admin)
      layout.tsx         ← Server-side role guard + admin shell
      page.tsx           ← Overview
      projects/, rfqs/, applications/, employees/, ...
    (employee)/employee/ ← Employee / HR portal (role: employee or admin)
      layout.tsx         ← Server-side role guard + portal shell
      page.tsx, profile/, leaves/, requests/
    login/               ← Shared login (employees + admins)
  api/
    imagekit/auth/       ← Authenticated ImageKit upload tokens
```

Each surface gets its own layout, navigation, and styling, but reuses the same Supabase schema, the same media library (ImageKit), the same i18n catalog, and the same design tokens.

### Why route groups instead of separate apps?
- One auth session works everywhere (no cross-domain cookies, no SSO glue).
- One CMS — admins manage content that the public site renders directly.
- One media uploader (ImageKit) used by both admins (CMS) and employees (HR docs).
- Single deployment pipeline, single environment variables file, single design system.
- Clean separation is enforced via **route groups + middleware + per-layout role guards**.

If, in the future, the admin dashboard or PEG-N becomes large enough to deserve its own deployment, the route-group structure makes it straightforward to extract: each `(group)` folder is already self-contained.

---

## User types & access rules

| User type | Surface | Account? | Auth |
|---|---|---|---|
| Public visitor / client | `(site)` | No account in MVP | — |
| Job applicant | `(site)/careers` form | No account | — |
| Contractor / supplier | `(site)/contractors` form | No account | — |
| Employee | `(employee)/employee` | Yes — created by HR | Supabase Auth, role `employee` |
| Admin | `(admin)/admin` | Yes — created manually | Supabase Auth, role `admin` |
| (Future) PEG-N member | `(site)/pegn` + member area | Yes (Phase 3) | Supabase Auth, role `member` |
| (Future) Community member | community area | Yes (Phase 3) | Supabase Auth, role `member` |

Roles are stored in `auth.users.app_metadata.role` so that `middleware.ts` can authorize requests **before** rendering — no protected page is ever shipped to an unauthenticated user.

Defense in depth:
1. `src/middleware.ts` — first gate. Combines `next-intl` locale handling, Supabase session refresh, and role checks for `/admin/*` and `/employee/*`.
2. The `(admin)` and `(employee)` layouts re-verify the user and role server-side before rendering any UI.
3. Supabase **Row-Level Security** policies (to be added in Phase 1 schema work) protect the data even if a request slipped through.

---

## Tech stack

- **Framework:** Next.js 16 (App Router, Turbopack, Server Components)
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS v4 (CSS-first config in `globals.css`)
- **i18n:** [`next-intl`](https://next-intl.dev) — `en` / `ar` with RTL/LTR
- **Fonts:** Inter (LTR primary) + Cairo (Arabic primary), loaded via `next/font/google`
- **Auth + DB:** Supabase (`@supabase/ssr`, `@supabase/supabase-js`)
- **Media uploads:** ImageKit (`@imagekit/nodejs`)
- **Forms:** `react-hook-form` + `zod` (`@hookform/resolvers`)
- **UI utilities:** `clsx`, `tailwind-merge`, `class-variance-authority`, `lucide-react`

---

## Project structure

```
bpholding/
├── messages/                 # next-intl JSON catalogs (en.json, ar.json)
├── public/                   # Static assets
├── src/
│   ├── app/                  # App Router (see "Architecture decision" above)
│   ├── components/
│   │   ├── layout/           # SiteHeader, SiteFooter, LocaleSwitcher
│   │   └── ui/               # Generic design-system primitives
│   ├── features/             # Feature-scoped components (auth, rfq, careers, …)
│   │   └── auth/LoginForm.tsx
│   ├── i18n/                 # next-intl routing, navigation, request config
│   ├── lib/
│   │   ├── auth/roles.ts     # Role model
│   │   ├── imagekit/server.ts
│   │   ├── supabase/         # client.ts (browser), server.ts (SSR), admin.ts (service role)
│   │   └── utils/cn.ts       # Tailwind class merger
│   └── middleware.ts         # i18n + auth + role guards
├── BP_HOLDING_EXECUTION_PLAN.md
├── next.config.ts
├── tsconfig.json
└── .env.example
```

---

## Getting started

```bash
# 1. Install
npm install

# 2. Configure environment
cp .env.example .env.local
# fill in Supabase + ImageKit credentials

# 3. Run dev server
npm run dev
# open http://localhost:3000  → redirects to /en

# 4. Quality checks
npm run lint
npm run typecheck
```

Useful URLs once running:
- Public site (English): `http://localhost:3000/en`
- Public site (Arabic, RTL): `http://localhost:3000/ar`
- Login: `http://localhost:3000/en/login`
- Admin dashboard: `http://localhost:3000/en/admin` *(requires role `admin`)*
- Employee portal: `http://localhost:3000/en/employee` *(requires role `employee`)*

---

## Next steps (Phase 1 implementation order)

1. Create the Supabase project, define the schema, and enable RLS (`profiles`, `projects`, `services`, `rfqs`, `job_applications`, `contractor_applications`, `inquiries`, `media`, …).
2. Seed `profiles.role` for the first admin user; sync it to `app_metadata.role` via a Supabase auth trigger.
3. Build the public pages from the execution plan (Home → About → Services → Portfolio → Careers → RFQ → Contractors → Contact → Legal).
4. Build the admin CMS (projects, services, careers, submissions inbox, certifications/legal docs).
5. Add the chatbot MVP shell.
6. Wire SEO (sitemap, robots, JSON-LD) and finalize design polish.

Phases 2–4 (Store/payments, full HR portal, PEG-N, community, AI) are detailed in `BP_HOLDING_EXECUTION_PLAN.md`.
