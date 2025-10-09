/**
 * Hostaway API Client (Mocked)
 * 
 * Per Assessment Requirements:
 * - Section 1: "Hostaway Integration (Mocked)"
 * - Section 1: "Note: the API is sandboxed and contains no reviews"
 * - Section 1: "Use the provided JSON to mock realistic review data"
 * - Section 6: "Mock review data has been shared separately"
 * 
 * This implementation demonstrates the API integration pattern using mock data.
 * The structure follows the actual Hostaway API response format.
 */

const HOSTAWAY_API_KEY = 'f94377ebbbb479490bb3ec364649168dc443dda2e4830facaf5de2e74ccc9152';
const HOSTAWAY_ACCOUNT_ID = '61148';
const BASE_URL = 'https://api.hostaway.com/v1';

/**
 * Mock property data derived from listing names in mock-reviews.json
 * In a real implementation, this would be fetched from GET /v1/listings
 */
const MOCK_PROPERTIES = [
  {
    id: 1,
    name: 'Downtown Loft A',
    address: '123 Main Street, Hoxton',
    city: 'London',
    country: 'UK',
    bedrooms: 2,
    bathrooms: 2,
    accommodates: 4,
    propertyType: 'Apartment',
    picture: null,
  },
  {
    id: 2,
    name: 'Riverside Studio B',
    address: '456 River Road, Shoreditch',
    city: 'London',
    country: 'UK',
    bedrooms: 1,
    bathrooms: 1,
    accommodates: 2,
    propertyType: 'Studio',
    picture: null,
  },
  {
    id: 3,
    name: 'Garden View Apartment C',
    address: '789 Garden Lane, Camden',
    city: 'London',
    country: 'UK',
    bedrooms: 3,
    bathrooms: 2,
    accommodates: 6,
    propertyType: 'Apartment',
    picture: null,
  },
  {
    id: 4,
    name: 'Skyline Penthouse D',
    address: '101 Tower Bridge Road',
    city: 'London',
    country: 'UK',
    bedrooms: 4,
    bathrooms: 3,
    accommodates: 8,
    propertyType: 'Penthouse',
    picture: null,
  },
  {
    id: 5,
    name: 'Cozy Corner Suite E',
    address: '202 Notting Hill Gate',
    city: 'London',
    country: 'UK',
    bedrooms: 1,
    bathrooms: 1,
    accommodates: 2,
    propertyType: 'Suite',
    picture: null,
  },
];

/**
 * Fetch all properties/listings
 * Returns mock data following Hostaway API structure
 */
export async function fetchHostawayListings() {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // In production, this would be:
  // const response = await fetch(`${BASE_URL}/listings`, {
  //   headers: { 'Authorization': `Bearer ${HOSTAWAY_API_KEY}` }
  // });
  // return response.json().then(data => data.result);
  
  return MOCK_PROPERTIES;
}

/**
 * Fetch a single listing by ID
 * Returns mock data for the specified property
 */
export async function fetchHostawayListing(listingId: string) {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // In production:
  // const response = await fetch(`${BASE_URL}/listings/${listingId}`, {
  //   headers: { 'Authorization': `Bearer ${HOSTAWAY_API_KEY}` }
  // });
  // return response.json().then(data => data.result);
  
  const listing = MOCK_PROPERTIES.find(p => p.id.toString() === listingId);
  return listing || null;
}

/**
 * Fetch reviews for a specific listing
 * Note: Review data comes from mock-reviews.json via /api/reviews/hostaway
 * This function demonstrates the API pattern for listing-specific reviews
 */
export async function fetchReviewsForListing(listingId: string) {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // In production:
  // const response = await fetch(
  //   `${BASE_URL}/reviews?listingId=${listingId}&accountId=${HOSTAWAY_ACCOUNT_ID}`,
  //   { headers: { 'Authorization': `Bearer ${HOSTAWAY_API_KEY}` } }
  // );
  // return response.json().then(data => data.result);
  
  // For now, this returns empty as reviews are loaded via /api/reviews/hostaway
  // which uses data/mock-reviews.json
  return [];
}
