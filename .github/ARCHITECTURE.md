# Architecture Overview

## High-Level Flow
Hostaway (mock JSON) -> Normalizer -> In-memory / (future DB) -> API Response -> Dashboard UI & Public Review Section.

## Layers
1. Data Source Layer
   - `data/mock-reviews.json` (seed for sandbox absence)
   - Future: live Hostaway API fetch with API key (avoid bundling key client-side)
2. Normalization Layer
   - `lib/hostaway/normalizer.ts`: raw -> `NormalizedReview`
3. API Layer
   - `app/api/reviews/hostaway/route.ts`
4. State/Persistence Layer
   - MVP: transient map for approvals (object keyed by reviewId)
   - Stretch: lightweight SQLite (better) via Prisma / Turso / libsql
5. UI Layer
   - Dashboard (`app/dashboard/page.tsx` + components)
   - Public property page (`app/properties/[id]/page.tsx`)

## Data Contracts
Defined in `types/review.ts` (to be created) + `API_SPEC.md`.

## Key Decisions (See `DECISIONS.md`)
- No backend framework beyond Next.js API routes.
- Keep initial persistence skip to accelerate delivery.

## Error Handling
- Central validate+normalize function returns `{ data, errors[] }` for potential partial salvage (future).
- For now: throw 400 on validation issues pre-fetch; 500 on unexpected.

## Performance Considerations
- Expected dataset small (tens to low hundreds) => simple array ops fine.
- Add memoization or pre-computed aggregates only if >5ms server response degrades.

## Security
- API key never sent to client. Use server route only.
- Strip any PII beyond guest first name initial if required later (possible enhancement).

## Extensibility Hooks
- Add provider abstraction: `ProviderReview { source, raw }` -> unified adapter.
- Introduce `lib/providers/` if Google integration proceeds.

---
Last Updated: initial draft.
