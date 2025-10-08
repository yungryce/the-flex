# API Specification: Reviews

## 1. Hostaway Reviews Endpoint (MVP & Required)
GET /api/reviews/hostaway

Purpose: Return normalized review data (mocked + future live integration) grouped logically for dashboard + property pages.

### Query Parameters (Phase 1: only implement those marked ✅ now)
| Param | Type | Status | Description |
|-------|------|--------|-------------|
| listingId | string | ✅ | Filter reviews for a single property |
| type | host-to-guest|guest-to-host | ✅ | Filter by review direction |
| status | published|pending | ✅ | Filter by publication status |
| minRating | number (0-10) | ✅ | Minimum average/category-derived rating |
| maxRating | number (0-10) | ✅ | Maximum average/category-derived rating |
| from | ISO date | ✅ | Submitted at >= date |
| to | ISO date | ✅ | Submitted at <= date |
| sort | string | ✅ | Format: field[:direction]; allowed fields: submittedAt, averageRating. Default: submittedAt:desc |
| limit | number | ✅ | Pagination size (default 50, max 200) |
| offset | number | ✅ | Pagination offset (default 0) |
| includeUnapproved | boolean | 🔜 | When true, include reviews not yet manager-approved |
| channel | string | 🔜 | Future if multi-channel integration added |

### Response Shape
```ts
interface ReviewsResponse {
  meta: {
    total: number;      // total after filters
    limit: number;
    offset: number;
    generatedAt: string; // ISO timestamp
    appliedFilters: Record<string, unknown>;
  };
  data: NormalizedReview[];
}

interface NormalizedReview {
  id: number;
  listingId: string;          // Derived / placeholder until mapping added
  listingName: string;
  guestName: string;
  publicReview: string;
  type: 'host-to-guest' | 'guest-to-host';
  status: 'published' | 'pending';
  submittedAt: string;        // ISO 8601
  averageRating: number;      // 0-10 computed if null in source
  categoryRatings: { category: string; rating: number }[];
  isApprovedForPublic: boolean; // persisted or fallback false
  source: 'hostaway' | 'google';
  channel?: string;           // future
}
```

### Error Responses
| HTTP | When | Body Example |
|------|------|--------------|
| 400 | Invalid query param value | `{ "error": "Invalid minRating (must be 0-10)" }` |
| 500 | Unexpected failure | `{ "error": "Internal error", "requestId": "<uuid>" }` |

### Validation Rules
1. minRating/maxRating must be between 0 and 10 and min <= max.
2. from/to must parse via `new Date()` and from <= to.
3. sort pattern: `<field>` or `<field>:asc|desc`.

### Normalization Logic
1. If root `rating` is null, compute mean of category ratings (1 decimal).
2. Convert `submittedAt` ("YYYY-MM-DD HH:mm:ss") to ISO (UTC) using `Date` assuming input is UTC.
3. Missing `reviewCategory` => empty array, averageRating = rating || 0.
4. `isApprovedForPublic` sourced from persistence (future) or in-memory map (MVP: ephemeral store / local JSON / localStorage on client after selection API added).

### Pagination Strategy
Simple offset + limit. Future: return `nextOffset` when more available.

### Future Endpoints (Backlog)
| Endpoint | Purpose | Priority |
|----------|---------|----------|
| POST /api/reviews/approval | Persist manager approval toggles | High |
| GET /api/properties/:id/reviews | Public-approved reviews only | High |
| GET /api/reviews/metrics | Aggregated metrics (per property) | Medium |
| GET /api/reviews/google | Google reviews normalized | Exploratory |

---
Last Updated: <AUTO-FILL WHEN EDITING>
Owner: You
