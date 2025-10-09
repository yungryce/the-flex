# Phase 2: Property-Centric Dashboard + Google Integration

**Status:** READY TO IMPLEMENT  
**Time Estimate:** 6-7 hours  
**Approach:** Direct integration with real APIs (Hostaway + Google)

---

## Key Clarifications

### ✅ Use Real Hostaway API
- **API Key:** `f94377ebbbb479490bb3ec364649168dc443dda2e4830facaf5de2e74ccc9152`
- **Account ID:** `61148`
- **Action:** Replace mock approach with direct API calls
- **Fetch:** Real properties (listings) and their reviews

### ✅ Google APIs Available
- User has Google Cloud account created
- User will set up API keys following `GOOGLE_API_SETUP.md`
- Use free tier (test keys acceptable)
- Simple integration, no over-engineering

### ✅ Design Alignment
- Property page already matches Flex Living design ✅
- Dashboard needs property-centric redesign
- Keep it simple and functional

---

## Implementation Plan

### Part 1: Real Hostaway Integration (2 hours)

#### 1.1 Update Hostaway Client (30 mins)
**File:** `lib/hostaway/client.ts`

Add functions to fetch real property data:

```typescript
const HOSTAWAY_API_KEY = 'f94377ebbbb479490bb3ec364649168dc443dda2e4830facaf5de2e74ccc9152';
const HOSTAWAY_ACCOUNT_ID = '61148';
const BASE_URL = 'https://api.hostaway.com/v1';

// Fetch all properties/listings
export async function fetchHostawayListings() {
  const response = await fetch(`${BASE_URL}/listings`, {
    headers: {
      'Authorization': `Bearer ${HOSTAWAY_API_KEY}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) throw new Error('Failed to fetch listings');
  const data = await response.json();
  return data.result || [];
}

// Fetch reviews for specific listing (if needed)
export async function fetchReviewsForListing(listingId: string) {
  const response = await fetch(
    `${BASE_URL}/reviews?listingId=${listingId}&accountId=${HOSTAWAY_ACCOUNT_ID}`,
    {
      headers: {
        'Authorization': `Bearer ${HOSTAWAY_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );
  
  if (!response.ok) throw new Error('Failed to fetch listing reviews');
  const data = await response.json();
  return data.result || [];
}
```

#### 1.2 Create Properties API Route (20 mins)
**File:** `app/api/properties/hostaway/route.ts` (NEW)

```typescript
import { NextResponse } from 'next/server';
import { fetchHostawayListings } from '@/lib/hostaway/client';

export async function GET() {
  try {
    const listings = await fetchHostawayListings();
    
    // Normalize to simple format
    const properties = listings.map((listing: any) => ({
      id: listing.id.toString(),
      name: listing.name,
      address: listing.address,
      city: listing.city,
      country: listing.country,
      imageUrl: listing.picture || null,
    }));
    
    return NextResponse.json({
      success: true,
      data: properties,
    });
  } catch (error) {
    console.error('Properties fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch properties' },
      { status: 500 }
    );
  }
}
```

#### 1.3 Create Single Property API Route (20 mins)
**File:** `app/api/properties/hostaway/[id]/route.ts` (NEW)

```typescript
import { NextResponse } from 'next/server';
import { fetchHostawayListings } from '@/lib/hostaway/client';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const listings = await fetchHostawayListings();
    const property = listings.find((l: any) => l.id.toString() === params.id);
    
    if (!property) {
      return NextResponse.json(
        { success: false, error: 'Property not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: {
        id: property.id.toString(),
        name: property.name,
        address: property.address,
        city: property.city,
        country: property.country,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        accommodates: property.accommodates,
        propertyType: property.propertyType,
        imageUrl: property.picture,
      },
    });
  } catch (error) {
    console.error('Property fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch property' },
      { status: 500 }
    );
  }
}
```

#### 1.4 Test Real API Integration (30 mins)
- Start dev server
- Test: `http://localhost:3000/api/properties/hostaway`
- Verify real properties returned
- Test: `http://localhost:3000/api/properties/hostaway/[REAL_ID]`
- Verify single property details

---

### Part 2: Dashboard Transformation (2.5 hours)

#### 2.1 Add TypeScript Interfaces (10 mins)
**File:** `types/review.ts` (UPDATE)

Add at bottom:

```typescript
export interface Property {
  id: string;
  name: string;
  address: string;
  city?: string;
  country?: string;
  imageUrl?: string | null;
  reviewCount?: number;
  avgRating?: number;
  pendingCount?: number;
}

export interface PropertyGroup {
  property: Property;
  reviews: NormalizedReview[];
}
```

#### 2.2 Transform Dashboard to Property-Centric (2 hours)
**File:** `app/dashboard/page.tsx` (MAJOR UPDATE)

Replace entire content with property-centric view:

```typescript
'use client';

import { useEffect, useState } from 'react';
import type { NormalizedReview, ReviewsResponse, Property, PropertyGroup } from '@/types/review';

export default function DashboardPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [reviews, setReviews] = useState<NormalizedReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);

  useEffect(() => {
    fetchPropertiesAndReviews();
  }, []);

  async function fetchPropertiesAndReviews() {
    try {
      setLoading(true);
      
      // Fetch properties from real Hostaway API
      const propsRes = await fetch('/api/properties/hostaway');
      const propsData = await propsRes.json();
      
      // Fetch reviews
      const reviewsRes = await fetch('/api/reviews/hostaway');
      const reviewsData: ReviewsResponse = await reviewsRes.json();
      
      // Load approval states from localStorage
      const storedApprovals = localStorage.getItem('reviewApprovals');
      const storedStatuses = localStorage.getItem('reviewStatuses');
      const approvalMap: Record<number, boolean> = storedApprovals ? JSON.parse(storedApprovals) : {};
      const statusMap: Record<number, string> = storedStatuses ? JSON.parse(storedStatuses) : {};
      
      // Apply stored states
      const reviewsWithApprovals = reviewsData.data.map((review) => ({
        ...review,
        isApprovedForPublic: approvalMap[review.id] ?? review.isApprovedForPublic,
        status: (statusMap[review.id] as any) ?? review.status,
      }));
      
      setReviews(reviewsWithApprovals);
      
      // Calculate stats per property
      const propertiesWithStats = propsData.data.map((prop: Property) => {
        const propReviews = reviewsWithApprovals.filter((r) => r.listingId === prop.id);
        const guestReviews = propReviews.filter((r) => r.type === 'guest-to-host');
        
        return {
          ...prop,
          reviewCount: guestReviews.length,
          avgRating: guestReviews.length > 0
            ? guestReviews.reduce((sum, r) => sum + r.averageRating, 0) / guestReviews.length
            : 0,
          pendingCount: guestReviews.filter((r) => r.status === 'pending').length,
        };
      });
      
      setProperties(propertiesWithStats);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }

  function persistReviewsToStorage(reviews: NormalizedReview[]) {
    const approvalMap: Record<number, boolean> = {};
    const statusMap: Record<number, string> = {};
    reviews.forEach((review) => {
      approvalMap[review.id] = review.isApprovedForPublic;
      statusMap[review.id] = review.status;
    });
    localStorage.setItem('reviewApprovals', JSON.stringify(approvalMap));
    localStorage.setItem('reviewStatuses', JSON.stringify(statusMap));
  }

  function toggleApproval(id: number) {
    setReviews((prev) => {
      const updatedReviews = prev.map((r) =>
        r.id === id ? { ...r, isApprovedForPublic: !r.isApprovedForPublic } : r
      );
      persistReviewsToStorage(updatedReviews);
      return updatedReviews;
    });
  }

  function changeReviewStatus(id: number, newStatus: 'approved' | 'denied' | 'published' | 'pending') {
    setReviews((prev) => {
      const updatedReviews = prev.map((r) =>
        r.id === id ? { ...r, status: newStatus } : r
      );
      persistReviewsToStorage(updatedReviews);
      return updatedReviews;
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <p className="text-gray-600">Loading properties...</p>
      </div>
    );
  }

  // If a property is selected, show its reviews
  if (selectedPropertyId) {
    const property = properties.find((p) => p.id === selectedPropertyId);
    const propertyReviews = reviews.filter((r) => r.listingId === selectedPropertyId);
    
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Back button */}
          <button
            onClick={() => setSelectedPropertyId(null)}
            className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            ← Back to Properties
          </button>

          {/* Property header */}
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{property?.name}</h1>
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <span>⭐ {property?.avgRating?.toFixed(1) || '0'}</span>
              <span>📊 {property?.reviewCount || 0} reviews</span>
              <span>⏳ {property?.pendingCount || 0} pending</span>
            </div>
          </div>

          {/* Reviews list - reuse existing review list code */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Reviews ({propertyReviews.length})
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {propertyReviews.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500">
                  No reviews for this property yet
                </div>
              ) : (
                propertyReviews.map((review) => (
                  <div key={review.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{review.guestName}</h3>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded ${
                              review.type === 'guest-to-host'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-purple-100 text-purple-800'
                            }`}
                          >
                            {review.type === 'guest-to-host' ? 'Guest Review' : 'Host Review'}
                          </span>
                          {review.type === 'host-to-guest' && (
                            <span className="px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-700">
                              Internal Only
                            </span>
                          )}
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded ${
                              review.status === 'published'
                                ? 'bg-green-100 text-green-800'
                                : review.status === 'denied'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {review.status}
                          </span>
                          <span className="px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-600">
                            {review.source === 'google' ? '🔵 Google' : '🏠 Hostaway'}
                          </span>
                        </div>

                        <p className="text-gray-800 mb-3">{review.publicReview}</p>

                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="font-medium">⭐ {review.averageRating.toFixed(1)}</span>
                          <span>{new Date(review.submittedAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 min-w-[200px]">
                        {/* Approval buttons */}
                        {review.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => changeReviewStatus(review.id, 'published')}
                              className="flex-1 px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => changeReviewStatus(review.id, 'denied')}
                              className="flex-1 px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                            >
                              Deny
                            </button>
                          </div>
                        )}

                        {review.type === 'guest-to-host' && (review.status === 'approved' || review.status === 'published') && (
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={review.isApprovedForPublic}
                              onChange={() => toggleApproval(review.id)}
                              className="w-5 h-5 text-blue-600 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm font-medium text-gray-700">
                              Display on Property Page
                            </span>
                          </label>
                        )}

                        {review.status === 'published' && (
                          <button
                            onClick={() => changeReviewStatus(review.id, 'pending')}
                            className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50"
                          >
                            Revoke
                          </button>
                        )}

                        {review.status === 'denied' && (
                          <button
                            onClick={() => changeReviewStatus(review.id, 'pending')}
                            className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50"
                          >
                            Undo Denial
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Property cards grid view
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Properties Dashboard</h1>
          <p className="text-gray-600">View per-property performance and manage reviews</p>
        </div>

        {/* Property cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <div
              key={property.id}
              className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedPropertyId(property.id)}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{property.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{property.address}</p>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Average Rating</span>
                  <span className="font-semibold text-gray-900">
                    ⭐ {property.avgRating?.toFixed(1) || '0'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Reviews</span>
                  <span className="font-semibold text-gray-900">{property.reviewCount || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Pending</span>
                  <span className="font-semibold text-yellow-600">{property.pendingCount || 0}</span>
                </div>
              </div>

              <button className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                View Reviews →
              </button>
            </div>
          ))}
        </div>

        {properties.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-500">No properties found</p>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

### Part 3: Update Property Page with Real Data (1 hour)

#### 3.1 Fetch Real Property Details (30 mins)
**File:** `app/properties/[id]/page.tsx` (UPDATE)

Replace hardcoded property details with real API data:

```typescript
// Add new state at top
const [property, setProperty] = useState<any>(null);

// Update useEffect
useEffect(() => {
  params.then(async (p) => {
    setPropertyId(p.id);
    
    // Fetch property details
    const propRes = await fetch(`/api/properties/hostaway/${p.id}`);
    if (propRes.ok) {
      const propData = await propRes.json();
      setProperty(propData.data);
    }
    
    fetchApprovedReviews(p.id);
  });
}, [params]);

// Update JSX to use real property data
<h1 className="text-3xl font-bold mb-3">
  {property?.name || 'Loading...'} - The Flex London
</h1>
<p className="text-base mb-2">
  {property?.propertyType || 'Apartment'} · 
  {property?.accommodates || 5} guests · 
  {property?.bedrooms || 2} bedrooms · 
  {property?.bathrooms || 2} bathrooms
</p>
```

#### 3.2 Add Google Maps Integration (30 mins)
**File:** `app/properties/[id]/page.tsx` (UPDATE)

Add map section after Amenities section, before Reviews:

```typescript
{/* Location & Map */}
<div className="border-b pb-8" style={{ borderColor: 'rgb(220, 220, 220)' }}>
  <h2 className="text-xl font-semibold mb-4">Location</h2>
  
  {property?.address && (
    <>
      <div className="mb-4 rounded-lg overflow-hidden" style={{ height: '400px' }}>
        <iframe
          width="100%"
          height="400"
          style={{ border: 0 }}
          loading="lazy"
          src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(property.address + ', ' + property.city)}`}
          allowFullScreen
        />
      </div>
      
      <div className="flex items-start gap-3">
        <span className="text-xl">📍</span>
        <div>
          <p className="font-medium">{property.address}</p>
          <p className="text-sm text-gray-600 mt-1">
            {property.city}, {property.country}
          </p>
        </div>
      </div>
    </>
  )}
</div>
```

---

### Part 4: Google Reviews Integration (1 hour)

#### 4.1 Add Mock Google Reviews (30 mins)
**File:** `data/mock-reviews.json` (UPDATE)

Add 3-4 Google-sourced reviews:

```json
{
  "id": 2001,
  "reservationId": 6001,
  "guestName": "Jane Smith",
  "publicReview": "Found this on Google! Amazing location in Hoxton, super clean and modern. The host was very responsive. Highly recommend for anyone visiting London!",
  "privateReview": null,
  "reply": null,
  "rating": 9.5,
  "reviewCategory": [
    {
      "categoryName": "overall",
      "categoryValue": 9.5
    }
  ],
  "submittedAt": "2024-12-10 16:20:00",
  "replyTime": null,
  "status": "published",
  "type": "guest-to-host",
  "channel": "google"
}
```

#### 4.2 Update Normalizer for Google Source (10 mins)
**File:** `lib/hostaway/normalizer.ts` (UPDATE)

Update source detection:

```typescript
source: raw.channel === 'google' ? 'google' : 'hostaway',
```

#### 4.3 Optional: Real Google Places API Integration (20 mins)
**File:** `lib/google/places.ts` (NEW - if implementing real API)

Create configuration for Place IDs:

```typescript
/**
 * Google Place IDs mapping
 * Find IDs at: https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder
 */
export const PROPERTY_PLACE_IDS: Record<string, string> = {
  // Add real property IDs from Hostaway and their Google Place IDs
  // '12345': 'ChIJdd4hrwug2EcRmSrV3Vo6llI',
};

export async function fetchGoogleReviews(placeId: string) {
  // Implementation if time permits
  // Call Google Places API
  // Normalize response to NormalizedReview format
}
```

---

### Part 5: Environment & Testing (30 mins)

#### 5.1 Environment Variables (5 mins)
**File:** `.env.local` (CREATE/UPDATE)

```bash
# Hostaway API (already in use)
HOSTAWAY_API_KEY=f94377ebbbb479490bb3ec364649168dc443dda2e4830facaf5de2e74ccc9152
HOSTAWAY_ACCOUNT_ID=61148

# Google APIs (user will add their keys)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-api-key-here
GOOGLE_PLACES_API_KEY=your-google-api-key-here
```

#### 5.2 Testing Checklist (25 mins)
- [ ] Dashboard shows real properties from Hostaway API
- [ ] Click property → shows its reviews
- [ ] Approval workflow still works
- [ ] Property page shows real property data
- [ ] Google Maps displays correctly
- [ ] Google reviews (mock) appear with source badge
- [ ] No TypeScript errors
- [ ] No console errors

---

## Files Summary

### NEW FILES:
1. `app/api/properties/hostaway/route.ts` - Properties list endpoint
2. `app/api/properties/hostaway/[id]/route.ts` - Single property endpoint
3. `.env.local` - Environment variables
4. `lib/google/places.ts` - Google Places config (optional)

### MODIFIED FILES:
1. `lib/hostaway/client.ts` - Add listings fetch functions
2. `lib/hostaway/normalizer.ts` - Handle Google source
3. `app/dashboard/page.tsx` - Complete redesign (property-centric)
4. `app/properties/[id]/page.tsx` - Use real property data + maps
5. `data/mock-reviews.json` - Add Google reviews
6. `types/review.ts` - Add Property interface

---

## Success Criteria

✅ Dashboard displays real properties from Hostaway API  
✅ Per-property performance visible (avg rating, review count, pending count)  
✅ Click property to drill down into reviews  
✅ Approval workflow functional  
✅ Property page uses real Hostaway data  
✅ Google Maps embedded on property page  
✅ Google reviews integrated (mock or real)  
✅ Source badges distinguish Hostaway vs Google reviews  
✅ Zero TypeScript errors  
✅ Documentation updated

---

## Next Actions

1. **User:** Follow `GOOGLE_API_SETUP.md` to get Google API keys (~15 mins)
2. **Dev:** Implement Part 1 (Real Hostaway Integration)
3. **Dev:** Implement Part 2 (Dashboard Transformation)
4. **Dev:** Implement Part 3 (Property Page Updates)
5. **Dev:** Implement Part 4 (Google Reviews)
6. **Dev:** Test end-to-end workflow
7. **Dev:** Update documentation

**Ready to start implementation!** 🚀
