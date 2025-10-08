## Context Primer for AI Assistants

### Project Goal
Build a Flex Living Reviews Dashboard: normalize Hostaway (mock) reviews, provide manager dashboard (filters, approvals), and public property page showing approved reviews.

### Core Endpoint (must exist & be solid)
`GET /api/reviews/hostaway` — returns normalized reviews with filtering & pagination.

### Data Model (NormalizedReview)
```
id, listingId, listingName, guestName, publicReview, type, status, submittedAt (ISO), averageRating (0-10), categoryRatings[], isApprovedForPublic, source
```

### Active Workstream
Implement types -> normalizer -> API route. No DB yet (ephemeral approvals later).

### Coding Conventions
- TypeScript strict.
- Functional, pure data transforms in `lib/hostaway`.
- No client exposure of API key.

### Priorities Order
1. Endpoint functional.
2. Dashboard basic list.
3. Filters & approvals.
4. Public page.
5. Docs polish / Google research.

### Non-Goals (for 2-day scope)
- Full auth system
- Complex charting library integration (keep minimal)
- Production-grade persistence

### Quick Commands
Dev: `npm run dev`
Lint (future): add ESLint later if time.

### Ask Pattern
When unsure, request: "Need to see types/review.ts and normalizer".

---
Keep this concise; update if direction shifts.
