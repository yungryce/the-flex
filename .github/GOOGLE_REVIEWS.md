# Google Reviews Integration Research

## Executive Summary
Google Reviews integration is **technically feasible** but requires additional setup and ongoing costs. Recommended as a Phase 2 feature after core dashboard is validated.

## Integration Options

### Option 1: Google Places API (Recommended)
**What it does:** Fetch reviews for a specific business location using Google's Places API.

**Requirements:**
- Google Cloud Platform account
- Places API enabled
- API key with Places API access
- Each property needs a unique Google Place ID

**Endpoint:**
```
GET https://maps.googleapis.com/maps/api/place/details/json?place_id={PLACE_ID}&fields=reviews&key={API_KEY}
```

**Response Structure:**
```json
{
  "result": {
    "reviews": [
      {
        "author_name": "John Doe",
        "rating": 5,
        "text": "Great place to stay!",
        "time": 1639392000,
        "relative_time_description": "2 months ago"
      }
    ]
  }
}
```

**Pros:**
- Official Google API
- Rich review data (5-star scale, photos, profile links)
- Reliable and well-documented

**Cons:**
- Costs: $17 per 1,000 requests (Place Details API)
- Rate limits: 100 requests per second
- Limited to 5 most recent reviews per request
- Requires each property to have a verified Google Business Profile

### Option 2: Google Business Profile API
**What it does:** Direct access to business profile data (more control).

**Requirements:**
- OAuth 2.0 authentication
- Business profile ownership verification
- More complex setup

**Pros:**
- More control over business data
- Can post replies to reviews
- Access to insights and analytics

**Cons:**
- Significantly more complex setup
- Requires property manager to verify ownership
- OAuth flow needed for each property

### Option 3: Third-Party Aggregators
**Examples:** Birdeye, Podium, ReviewTrackers

**Pros:**
- Unified API for multiple review platforms
- No direct Google API costs
- Often include sentiment analysis

**Cons:**
- Additional subscription costs ($300-1000/month)
- Another vendor dependency

## Implementation Plan (If Proceeding)

### Phase 1: Setup (2-3 hours)
1. Create Google Cloud Platform project
2. Enable Places API
3. Generate API key with domain restrictions
4. Store API key securely (environment variables)

### Phase 2: Data Layer (3-4 hours)
1. Create `lib/google/client.ts` for API calls
2. Create `lib/google/normalizer.ts` to convert Google reviews to `NormalizedReview`
3. Add Place ID mapping for each property
4. Implement caching (reviews change infrequently)

### Phase 3: Integration (2 hours)
1. Add `source: 'google'` filter to dashboard
2. Merge Hostaway + Google reviews in API route
3. Display source badge on reviews

### Phase 4: Cost Optimization (1 hour)
1. Cache reviews for 24 hours (reduce API calls)
2. Implement lazy loading (fetch only when viewing specific property)
3. Add monitoring for API usage

## Normalizer Example

```typescript
function normalizeGoogleReview(raw: GoogleReview, placeId: string): NormalizedReview {
  return {
    id: generateHashId(raw.author_name + raw.time), // Google doesn't provide stable IDs
    listingId: placeId,
    listingName: getListingNameFromPlaceId(placeId),
    guestName: raw.author_name,
    publicReview: raw.text,
    type: 'guest-to-host', // Google reviews are always guest perspective
    status: 'published', // Google reviews are always published
    submittedAt: new Date(raw.time * 1000).toISOString(),
    averageRating: raw.rating * 2, // Convert 1-5 to 0-10 scale
    categoryRatings: [], // Google doesn't provide category breakdowns
    isApprovedForPublic: false, // Still requires manual approval
    source: 'google',
  };
}
```

## Cost Estimate

**Assumptions:**
- 10 properties
- 1 API call per property per day (cached 24h)
- 300 API calls/month

**Monthly Cost:** ~$5.10 USD (300 calls / 1000 × $17)

**Annual Cost:** ~$61 USD

## Recommendations

1. **Short-term:** Document feasibility (this document) but don't implement for 2-day delivery.

2. **Phase 2 (if greenlit):**
   - Start with 1-2 pilot properties
   - Validate Place ID mapping process
   - Monitor API costs in production
   - Gather manager feedback on multi-source value

3. **Alternative:** Manually import Google reviews as CSV, normalize offline, add to mock data. No API costs, same dashboard experience.

## Key Challenges

1. **Place ID Discovery:** Each property needs its Google Place ID. No bulk lookup API—must be done manually or via search.

2. **Review Volume:** Google limits to 5 most recent reviews. Not suitable for properties with 50+ reviews.

3. **Rating Scale:** Google uses 1-5, Hostaway uses 0-10. Need clear UI indicators when mixing.

4. **Update Frequency:** Google reviews are public immediately. Approval workflow doesn't prevent them showing on Google Maps.

## Conclusion

Google Reviews integration is **feasible and low-cost** but adds complexity. Prioritize after core Hostaway workflow is validated with real users.

**Decision:** Document only for 2-day assessment. Implement in Phase 2 if product gains traction.
