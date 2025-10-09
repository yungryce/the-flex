# Phase 2 Implementation Plan: Property-Centric Dashboard & Google Integration

**Date:** October 9, 2025  
**Deadline:** Complete within 4-6 hours  
**Status:** PLANNING - Awaiting Confirmation

---

## Overview

Transform the current review-centric dashboard into a **property-centric dashboard** that shows per-property performance, integrate basic Google Reviews, and add Google Maps to property pages.

---

## Requirements Analysis

### From ASSESSMENT.md

#### Dashboard Requirements (Section 2):
- ✅ ~~User-friendly interface~~ (Done)
- ⚠️ **See per-property performance** (PRIMARY FOCUS)
- ✅ ~~Filter/sort by rating, category, channel, time~~ (Partially done)
- ⚠️ **Spot trends or recurring issues** (Needs property grouping)
- ✅ ~~Select reviews for public display~~ (Done)

#### Google Reviews (Section 4):
- ⚠️ **Explore if Google Reviews can be integrated**
- ⚠️ **If feasible, implement basic integration**
- ⚠️ **Or document findings**

#### Property Page (Section 3):
- ✅ ~~Replicate Flex Living layout~~ (Done)
- ⚠️ **Add map for property location** (Missing)

---

## Proposed Changes

### 1. Dashboard Transformation (2-3 hours)

#### Current State:
```
Reviews Dashboard
├── Stats Cards (Total, Approved, Avg Rating, Pending)
├── Filters (Type, Status, Property, Min Rating, Sort)
└── Reviews List (flat view of all reviews)
```

#### Proposed State:
```
Properties Dashboard
├── Property Cards Grid (one card per property)
│   ├── Property Name & ID
│   ├── Total Reviews Count
│   ├── Average Rating (visual stars)
│   ├── Pending Reviews Count
│   └── [View Details] button
└── Property Detail Modal/Page
    ├── Property Overview
    ├── Reviews Breakdown (by source: Hostaway, Google)
    ├── Category Ratings Chart
    ├── Reviews List (filterable)
    └── Approval Actions
```

#### Implementation:
- **Route:** Keep `/dashboard` but transform layout
- **New Component:** Property card grid view
- **Drill-down:** Click property → show reviews for that property only
- **Filters:** Move to property detail view (not global)

---

### 2. Google Reviews Integration (1-2 hours)

#### Scope: MINIMAL VIABLE
We'll implement the **simplest possible** integration:

#### Approach A: Mock Google Reviews (30 mins) - RECOMMENDED
```typescript
// Add mock Google reviews to mock-reviews.json
// Label them with "source": "google" (simulate API response)
// No API costs, demonstrates multi-source capability
```

**Pros:**
- No API setup/costs
- Demonstrates multi-source UI
- Meets "explore feasibility" requirement
- Can be replaced with real API later

**Cons:**
- Not real Google reviews
- Requires disclaimer in docs

#### Approach B: Real Google Places API (2 hours)
```typescript
// Use provided API key to fetch reviews
// Cache results (24h) to minimize costs
// Only fetch for 1-2 sample properties
```

**Pros:**
- Real Google reviews
- Full API integration demo

**Cons:**
- API setup required
- Ongoing costs (~$5/month minimum)
- More complex error handling

#### Recommendation:
**Go with Approach A (Mock)** for deadline, document real API approach in GOOGLE_REVIEWS.md.

---

### 3. Google Maps Integration (1 hour)

#### Property Page Enhancement:
```tsx
{/* New Section: Location & Map */}
<div className="border-b pb-8">
  <h2 className="text-xl font-semibold mb-4">Location</h2>
  <div className="h-96 bg-gray-200 rounded-lg overflow-hidden">
    <GoogleMapEmbed 
      address="Hoxton, London"
      propertyId={propertyId}
    />
  </div>
  <p className="mt-4 text-sm text-gray-600">
    Located in Hoxton, one of the coolest areas in London
  </p>
</div>
```

#### Implementation Options:

**Option 1: Google Maps Embed API (Simple - 30 mins)**
```html
<iframe
  src="https://www.google.com/maps/embed/v1/place?key={API_KEY}&q=Hoxton,London"
  width="100%"
  height="400"
  frameBorder="0"
/>
```
- No JavaScript library needed
- Just an iframe with API key
- Free tier: 25,000 loads/month

**Option 2: Google Maps JavaScript API (Complex - 2 hours)**
```typescript
// Full map with markers, custom styling, interactions
// Requires @googlemaps/js-api-loader
```

#### Recommendation:
**Use Option 1 (Embed API)** - simpler, faster, meets requirements.

---

## Time Breakdown

| Task | Time Estimate | Priority |
|------|---------------|----------|
| Dashboard → Property-centric view | 2.5 hours | HIGH |
| Mock Google reviews integration | 0.5 hours | HIGH |
| Google Maps embed on property page | 0.5 hours | MEDIUM |
| Update documentation | 0.5 hours | HIGH |
| Testing & bug fixes | 1 hour | HIGH |
| **TOTAL** | **5 hours** | |

---

## Implementation Details

### A. Dashboard Transformation

#### Step 1: Group Reviews by Property
```typescript
// New utility function
function groupReviewsByProperty(reviews: NormalizedReview[]) {
  const grouped = new Map<string, {
    property: PropertySummary;
    reviews: NormalizedReview[];
  }>();
  
  reviews.forEach(review => {
    if (!grouped.has(review.listingId)) {
      grouped.set(review.listingId, {
        property: {
          id: review.listingId,
          name: review.listingName,
          totalReviews: 0,
          avgRating: 0,
          pendingCount: 0,
          sources: new Set(),
        },
        reviews: [],
      });
    }
    const group = grouped.get(review.listingId)!;
    group.reviews.push(review);
    group.property.sources.add(review.source);
  });
  
  // Calculate aggregates
  grouped.forEach(group => {
    const guestReviews = group.reviews.filter(r => r.type === 'guest-to-host');
    group.property.totalReviews = guestReviews.length;
    group.property.avgRating = guestReviews.reduce((sum, r) => sum + r.averageRating, 0) / guestReviews.length;
    group.property.pendingCount = guestReviews.filter(r => r.status === 'pending').length;
  });
  
  return Array.from(grouped.values());
}
```

#### Step 2: Property Card Component
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {propertyGroups.map(({ property, reviews }) => (
    <div key={property.id} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
      <h3 className="text-lg font-bold mb-2">{property.name}</h3>
      <p className="text-sm text-gray-600 mb-4">{property.id}</p>
      
      {/* Rating */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl font-bold">{property.avgRating.toFixed(1)}</span>
        <StarRating rating={property.avgRating} />
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="text-center p-2 bg-gray-50 rounded">
          <p className="text-xs text-gray-600">Total</p>
          <p className="text-lg font-semibold">{property.totalReviews}</p>
        </div>
        <div className="text-center p-2 bg-yellow-50 rounded">
          <p className="text-xs text-gray-600">Pending</p>
          <p className="text-lg font-semibold">{property.pendingCount}</p>
        </div>
      </div>
      
      {/* Sources */}
      <div className="flex gap-2 mb-4">
        {Array.from(property.sources).map(source => (
          <span key={source} className="text-xs px-2 py-1 bg-blue-100 rounded">
            {source}
          </span>
        ))}
      </div>
      
      <button 
        onClick={() => setSelectedProperty(property.id)}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        View Reviews
      </button>
    </div>
  ))}
</div>
```

#### Step 3: Property Detail View (Modal or Route)
```tsx
{selectedProperty && (
  <PropertyReviewsModal
    propertyId={selectedProperty}
    reviews={getPropertyReviews(selectedProperty)}
    onClose={() => setSelectedProperty(null)}
  />
)}
```

---

### B. Mock Google Reviews

#### Add to mock-reviews.json:
```json
[
  {
    "id": 2001,
    "reservationId": 6001,
    "guestName": "Jane Smith",
    "publicReview": "Found this gem on Google! Amazing location and super clean. Highly recommend!",
    "privateReview": null,
    "reply": null,
    "rating": 9.0,
    "reviewCategory": [],
    "submittedAt": "2024-12-10 16:20:00",
    "replyTime": null,
    "status": "published",
    "type": "guest-to-host",
    "channel": "google"  // ← Mark as Google source
  }
  // Add 3-4 more Google reviews
]
```

#### Update Normalizer:
```typescript
source: raw.channel === 'google' ? 'google' : 'hostaway',
```

#### Dashboard Display:
```tsx
<span className={`badge ${review.source === 'google' ? 'bg-blue-500' : 'bg-green-500'}`}>
  {review.source === 'google' ? '🔵 Google' : '🏠 Hostaway'}
</span>
```

---

### C. Google Maps Integration

#### Add to Property Page (after Amenities, before Reviews):
```tsx
{/* Location & Map */}
<div className="border-b pb-8" style={{ borderColor: 'rgb(220, 220, 220)' }}>
  <h2 className="text-xl font-semibold mb-4">Location</h2>
  
  {/* Map */}
  <div className="mb-4 rounded-lg overflow-hidden" style={{ height: '400px' }}>
    <iframe
      width="100%"
      height="100%"
      frameBorder="0"
      style={{ border: 0 }}
      src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=Hoxton,London,UK&zoom=15`}
      allowFullScreen
    />
  </div>
  
  {/* Address Info */}
  <div className="flex items-start gap-3">
    <span className="text-xl">📍</span>
    <div>
      <p className="font-medium">Hoxton, London</p>
      <p className="text-sm text-gray-600 mt-1">
        Located in one of London's coolest neighborhoods, close to great cafes, shops, and bars. 
        Easy access to transport links.
      </p>
    </div>
  </div>
</div>
```

#### Environment Variable (.env.local):
```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=f94377ebbbb479490bb3ec364649168dc443dda2e4830facaf5de2e74ccc9152
```

---

## Clarifications Needed

### 1. Dashboard Layout Decision
**Question:** Should the property-centric view be:
- **Option A:** Replace current dashboard (single page, property cards)
- **Option B:** Add new route `/dashboard/properties` (keep both views)
- **Option C:** Add tab switcher on dashboard (Reviews | Properties)

**Recommendation:** Option A (replace) - meets requirement better.

---

### 2. Google Reviews Approach
**Question:** Which Google integration approach?
- **Option A:** Mock Google reviews (fast, no API costs, demo-ready)
- **Option B:** Real Google Places API (2-3 sample properties only)

**Recommendation:** Option A (mock) due to time constraints.

---

### 3. Property Detail View
**Question:** How to show property details?
- **Option A:** Modal popup (keeps user on dashboard)
- **Option B:** New route `/dashboard/properties/[id]`
- **Option C:** Expandable accordion on same page

**Recommendation:** Option A (modal) - faster to implement.

---

### 4. Google Maps API Key
**Question:** The provided API key - should we:
- **Option A:** Use as Google Maps API key (needs enabling Maps Embed API)
- **Option B:** Assume it's for Places API only, create new key for Maps

**Note:** The key format looks like a Hostaway API key, not Google. Need clarification.

---

### 5. Scope of "Per-Property Performance"
**Question:** What metrics to show per property?
- **Minimum:** Avg rating, total reviews, pending count
- **Medium:** + Category breakdown, rating trends
- **Maximum:** + Charts, sentiment analysis, comparison to other properties

**Recommendation:** Minimum for 5-hour deadline.

---

## Files to Modify

### Existing Files:
1. `/app/dashboard/page.tsx` - Complete transformation
2. `/app/properties/[id]/page.tsx` - Add maps section
3. `/data/mock-reviews.json` - Add Google review samples
4. `/lib/hostaway/normalizer.ts` - Handle Google source
5. `/.env.local` - Add Google Maps API key

### Documentation Updates:
1. `.github/GOOGLE_REVIEWS.md` - Add implementation section
2. `.github/ARCHITECTURE.md` - Update dashboard architecture
3. `.github/IMPLEMENTATION_REVIEW.md` - Add Phase 2 notes
4. `.github/NEXT_STEPS.md` - Update with completed items

### No New Files:
All changes fit into existing structure.

---

## Testing Plan

### Dashboard:
- [ ] Properties grouped correctly
- [ ] Avg ratings calculated per property
- [ ] Pending counts accurate
- [ ] Click property → shows correct reviews
- [ ] Both Hostaway and Google reviews appear
- [ ] Source badges display correctly

### Property Page:
- [ ] Map loads correctly
- [ ] Shows correct location
- [ ] Responsive on mobile
- [ ] No console errors

### Integration:
- [ ] Google reviews (mock) normalized correctly
- [ ] Source filter works in dashboard
- [ ] Mixed source reviews sorted properly

---

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Google API key invalid/wrong service | HIGH | Use mock approach (Option A) |
| Dashboard refactor breaks existing features | MEDIUM | Test approval workflow thoroughly |
| Time overrun | HIGH | Prioritize: Dashboard > Mock Google > Maps |
| Maps don't load | LOW | Add fallback static image |

---

## Success Criteria

### Must Have (Deadline):
- ✅ Dashboard shows property cards with per-property stats
- ✅ Click property to see its reviews
- ✅ Google reviews appear (mock or real)
- ✅ Maps display on property page
- ✅ Existing approval workflow still works
- ✅ Documentation updated

### Nice to Have (If time):
- Category ratings chart per property
- Export property report
- Comparison between properties
- Real Google Places API integration

---

## Decision Required

Please confirm:

1. **Dashboard approach:** Replace current view with property-centric (Option A)?
2. **Google reviews:** Use mock approach (Option A) or attempt real API (Option B)?
3. **Property details:** Show in modal (Option A)?
4. **API Key:** Is the provided key for Google services or just Hostaway?
5. **Scope:** Minimum viable (5 hours) or aim for medium (8 hours)?

Once confirmed, I can proceed with implementation.

---

## Next Steps After Confirmation

1. Update mock-reviews.json (5 mins)
2. Transform dashboard to property cards (2 hours)
3. Add property detail modal (1 hour)
4. Add Google Maps to property page (30 mins)
5. Update documentation (30 mins)
6. Testing & fixes (1 hour)

**Total:** ~5 hours

Ready to proceed upon your confirmation! 🚀

