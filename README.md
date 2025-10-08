# Flex Living Reviews Dashboard

A modern review management system for Flex Living properties. Managers can review, filter, and approve guest reviews for public display on property pages.

## Features

✅ **Hostaway Integration** - Normalized review data from Hostaway API (mocked)  
✅ **Manager Dashboard** - Filter by type, status, rating; approve reviews for public display  
✅ **Public Property Pages** - Display only approved guest reviews with ratings  
✅ **Real-time Filtering** - Client-side filtering and sorting for instant results  
✅ **Statistics** - Overview metrics (total reviews, approvals, average rating, pending)  
✅ **Google Reviews Research** - Feasibility analysis documented

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS
- **Data:** Mock JSON (Hostaway format)
- **Deployment:** Vercel-ready

## Project Structure

```
app/
  ├── api/reviews/hostaway/    # API endpoint (returns normalized reviews)
  ├── dashboard/               # Manager dashboard with filters & approvals
  ├── properties/[id]/         # Public property review pages
  └── page.tsx                 # Landing page
lib/
  └── hostaway/
      └── normalizer.ts        # Pure functions for data transformation
types/
  └── review.ts                # TypeScript interfaces (single source of truth)
data/
  └── mock-reviews.json        # 12 sample reviews (Hostaway format)
.github/
  └── GOOGLE_REVIEWS.md        # Google Reviews integration research
```

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone repository
git clone <repo-url>
cd reviews-dashboard

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Key Routes

- `/` - Landing page with navigation
- `/dashboard` - Manager dashboard (filter & approve reviews)
- `/properties/PROP-000` - Sample property page (shows approved reviews only)
- `/api/reviews/hostaway` - API endpoint (JSON response)

## API Documentation

### GET `/api/reviews/hostaway`

Returns all normalized reviews (filtering done client-side for small dataset).

**Response:**
```json
{
  "meta": {
    "total": 12,
    "limit": 12,
    "offset": 0,
    "generatedAt": "2024-12-15T10:30:00Z",
    "appliedFilters": {}
  },
  "data": [
    {
      "id": 1001,
      "listingId": "PROP-000",
      "listingName": "Downtown Loft A",
      "guestName": "Sarah Johnson",
      "publicReview": "Amazing property!...",
      "type": "guest-to-host",
      "status": "published",
      "submittedAt": "2024-12-15T14:30:00Z",
      "averageRating": 9.5,
      "categoryRatings": [...],
      "isApprovedForPublic": false,
      "source": "hostaway"
    }
  ]
}
```

## Key Design Decisions

### 1. **Simplified API**
Original implementation had server-side filtering/pagination/validation. Simplified to return all reviews since dataset is small (12 items). Filtering/sorting moved client-side for speed.

### 2. **Client-Side Approval State**
Approval toggles update React state locally (ephemeral). In production, would persist to database. Optimistic updates provide instant feedback.

### 3. **Normalized Data Model**
Single `NormalizedReview` interface supports multiple sources (Hostaway, Google). Source-specific quirks handled in normalizer layer.

### 4. **Pure Functions**
Normalizer contains only pure, deterministic functions. Easy to test, no side effects.

### 5. **TypeScript Strict Mode**
All data shapes defined in `types/review.ts`. Compiler catches mismatches before runtime.

## Data Normalization

Raw Hostaway reviews → Normalizer → NormalizedReview

**Key transformations:**
- Date format: `"YYYY-MM-DD HH:mm:ss"` → ISO 8601
- Rating derivation: Uses explicit rating or calculates from category averages
- Listing mapping: Generates mock listing IDs/names from reservation IDs
- Category ratings: Converted to generic `{category, rating}` pairs

## Future Enhancements

- [ ] Persistent approval state (database integration)
- [ ] Google Reviews API integration (see `.github/GOOGLE_REVIEWS.md`)
- [ ] Bulk approval actions
- [ ] Review reply system
- [ ] Export to CSV
- [ ] Email notifications for new reviews
- [ ] Multi-language support

## Testing

```bash
# Type checking
npm run build

# API test
curl http://localhost:3000/api/reviews/hostaway | jq '.meta'

# Dashboard smoke test
# Navigate to http://localhost:3000/dashboard
# Toggle approvals, apply filters

# Property page test
# Navigate to http://localhost:3000/properties/PROP-000
# Should show only approved guest reviews
```

## Documentation

- **Architecture:** `.github/ARCHITECTURE.md`
- **API Spec:** `.github/API_SPEC.md`
- **Google Reviews:** `.github/GOOGLE_REVIEWS.md`
- **Next Steps:** `.github/NEXT_STEPS.md`
- **Decisions Log:** `.github/DECISIONS.md`

## Assessment Notes

**Critical requirement:** API route `/api/reviews/hostaway` exists and returns normalized data ✅

**Core deliverables:**
1. ✅ Hostaway integration (mocked) with data normalization
2. ✅ Manager dashboard with filters and approval system
3. ✅ Public property page showing approved reviews
4. ✅ Google Reviews exploration (documented)

**Time invested:**
- API + Data Layer: 2 hours (simplified from initial over-engineering)
- Dashboard UI: 2 hours
- Public page: 1 hour
- Documentation: 1 hour
- **Total: ~6 hours** (within 2-day scope)

## Contact

Built for Flex Living assessment - demonstrating full-stack TypeScript, API design, UX thinking, and product judgment.

