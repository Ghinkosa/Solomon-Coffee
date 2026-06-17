# Sheba Cup Coffee — Codebase Index

> **Stack:** Next.js 16 · React 19 · TypeScript · Tailwind 4 · Sanity CMS · Clerk · Stripe · Firebase · Zustand  
> **Live:** [shebascoffee.com](https://shebascoffee.com) · **Locales:** `en`, `es`, `ar`

Use this file to navigate the project quickly. Path alias `@/` maps to the repo root.

---

## Quick start

| Task | Where |
|------|--------|
| Run locally | `npm install` → `npm run dev` → http://localhost:3000/en |
| Env vars | `.env` (see `SETUP.md`) |
| Add a page | `app/[lang]/(client)/.../page.tsx` |
| Add an API route | `app/api/<name>/route.ts` |
| Translations | `dictionaries/en.json` (+ `es.json`, `ar.json`) via `getDictionary()` |
| CMS schemas | `sanity/schemaTypes/` |
| CMS queries | `sanity/queries/` |
| Cart state | `store.ts` (Zustand + persist) |
| Auth / route guard | `proxy.ts` (locale + Clerk) |

---

## Top-level layout

```
app/           Next.js App Router (pages, layouts, API)
components/    UI (~189 files): storefront, admin, employee, cart, checkout, ui/
lib/           Shared utilities (Stripe, email, SEO, analytics, dictionary)
sanity/        CMS client, queries, schema types, helpers
actions/       Server Actions (orders, users, reviews, employees)
hooks/         Custom React hooks
constants/     Nav links, roast types, FAQ, footer links
config/        Runtime config (contact.ts)
dictionaries/  i18n JSON files
contexts/      React providers (UserDataContext)
types/         Shared TS types
public/        Static assets
store.ts       Cart / wishlist Zustand store
proxy.ts       Middleware: locale redirect + Clerk protection
i18n-config.ts Locales: en, es, ar
```

---

## App Router (`app/`)

All storefront URLs are prefixed with `[lang]` → `/en/shop`, `/es/cart`, etc.

### Layout groups

| Group | Path | Purpose |
|-------|------|---------|
| `(client)` | `app/[lang]/(client)/` | Storefront: Header + Footer |
| `(client)/(public)` | `.../(public)/` | Marketing: about, mission, our-coffee, contact, wholesalers |
| `(client)/(user)` | `.../(user)/` | Auth shopping: cart, checkout, wishlist, profile, orders |
| `(auth)` | `app/[lang]/(auth)/` | Clerk sign-in / sign-up |
| `(admin)/admin` | `app/[lang]/(admin)/admin/` | Admin dashboard |
| `(employee)/employee` | `app/[lang]/(employee)/employee/` | Fulfillment portal |
| Studio | `app/studio/[[...tool]]/` | Embedded Sanity Studio |

### Key routes

| URL | File |
|-----|------|
| `/` (home) | `app/[lang]/(client)/page.tsx` |
| `/shop` | `app/[lang]/(client)/shop/page.tsx` |
| `/product/[slug]` | `app/[lang]/(client)/product/[slug]/page.tsx` |
| `/category/[slug]` | `app/[lang]/(client)/category/[slug]/page.tsx` |
| `/our-coffee` | `app/[lang]/(client)/(public)/our-coffee/page.tsx` |
| `/mission` | `app/[lang]/(client)/(public)/mission/page.tsx` |
| `/deal` | `app/[lang]/(client)/deal/page.tsx` (Our Roasting Process) |
| `/checkout` | `app/[lang]/(client)/(user)/checkout/page.tsx` |
| `/admin` | `app/[lang]/(admin)/admin/page.tsx` |

---

## Components (`components/`)

| Folder | Purpose |
|--------|---------|
| `ui/` | shadcn/ui primitives (button, dialog, sheet, etc.) |
| `layout/` | HeaderMenu, Sidebar, FooterTop |
| `shopPage/` | Shop catalog, category/brand filters, wholesale section |
| `product/` | Product cards, detail panel, expanded details |
| `cart/` | Cart UI, address sidebars |
| `checkout/` | Checkout flow |
| `admin/` | Admin dashboard modules |
| `employee/` | Warehouse, packing, delivery views |
| `common/` | Logo, SearchBar, SocialMedia |

**Notable root files:** `Header.tsx`, `Footer.tsx`, `ProductGrid.tsx`, `ShopFeatures.tsx`, `BannerCarousel.tsx`, `HomeCategories.tsx`, `LanguageSwitcher.tsx`, `WeightGrindSelector.tsx`

---

## Lib & hooks

### `lib/`

| File | Role |
|------|------|
| `dictionary.ts` | Server i18n loader |
| `seo.ts` | Metadata, JSON-LD |
| `stripe.ts` | Stripe client |
| `firebase.ts` | Firebase / analytics |
| `emailService.ts` | Order & notification emails |
| `sanity-text.ts` | Portable Text → plain string |
| `adminUtils.ts` | Admin email allowlist |
| `cache.ts` | Next.js cache tags / revalidation |

### `hooks/`

| File | Role |
|------|------|
| `useProductDetailsPanel.ts` | Expandable product panel (home + shop) |
| `useOrderPlacement.ts` | Cart → order placement |
| `use-mobile.ts` | Mobile breakpoint (768px) |
| `index.ts` | `useOutsideClick` |

---

## Sanity CMS (`sanity/`)

| Path | Role |
|------|------|
| `schemaTypes/` | Document schemas (product, category, order, banner, blog, wholesaleInquiry, …) |
| `queries/index.ts` | Cached fetchers: products, banners, blogs, brands |
| `queries/query.ts` | GROQ query strings |
| `helpers/index.ts` | Write helpers (orders, contact, wholesale inquiries) |
| `lib/client.ts` | Read/write Sanity client |
| `lib/image.ts` | `urlFor()` image builder |

**Key document types:** `product`, `category`, `order`, `banner`, `brand`, `blog`, `wholesaleInquiry`, `review`, `subscription`, `packaging`

---

## Constants & config

| File | Contents |
|------|----------|
| `constants/index.ts` | `headerPrimaryNav`, `headerBlogNav`, `headerContactNav`, roast types, quick links |
| `config/contact.ts` | Company info, emails, social links (env-overridable) |

**Primary nav:** Home · Shop · Our Coffee · Our Roasting Process  
**Wholesale:** `/shop#wholesale` (not top nav)

---

## API routes (`app/api/`)

Grouped by domain (~71 handlers):

| Domain | Examples |
|--------|----------|
| Orders | `/api/orders`, `/api/orders/[orderId]/pay`, `/api/orders/refund` |
| Checkout | `/api/checkout/stripe`, `/api/webhook` (Stripe) |
| User | `/api/user/profile`, `/api/user/orders`, `/api/user/notifications` |
| Admin | `/api/admin/orders`, `/api/admin/users`, `/api/admin/analytics` |
| Other | `/api/contact`, `/api/wholesalers`, `/api/newsletter/subscribe` |

---

## Environment variables

See `SETUP.md` for full setup. Critical vars:

| Group | Variables |
|-------|-----------|
| Sanity | `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `SANITY_API_TOKEN` |
| Clerk | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` |
| Stripe | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` |
| App | `NEXT_PUBLIC_BASE_URL`, `NEXT_PUBLIC_ADMIN_EMAIL` |

---

## Deployment

| File | Target |
|------|--------|
| `vercel.json` | Vercel (primary) — no-cache headers on admin API |
| `netlify.toml` | Netlify alternative |

**Scripts:** `npm run dev` · `npm run build` · `npm start` · `npm run lint` · `npm run typegen`

---

## Conventions

- **Minimize scope** — match existing patterns in surrounding files
- **i18n** — only `en`, `es`, `ar`; add keys to `dictionaries/en.json` first
- **Images** — remote hosts in `next.config.ts`: `cdn.sanity.io`, `images.unsplash.com`
- **Auth** — Clerk; admin allowlist via `NEXT_PUBLIC_ADMIN_EMAIL`
- **Do not commit** `.env` or secrets
