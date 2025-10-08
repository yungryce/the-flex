/**
 * Hostaway Review Normalizer
 * Pure function to transform raw Hostaway reviews into normalized format
 */

import type { HostawayReview, NormalizedReview, CategoryRating } from '@/types/review';

/**
 * Normalize a single Hostaway review
 */
export function normalizeHostawayReview(raw: HostawayReview): NormalizedReview {
  return {
    id: raw.id,
    listingId: generateListingId(raw.reservationId),
    listingName: generateListingName(raw.reservationId),
    guestName: raw.guestName,
    publicReview: raw.publicReview,
    type: raw.type,
    status: raw.status,
    submittedAt: convertToISO(raw.submittedAt),
    averageRating: calculateAverageRating(raw),
    categoryRatings: normalizeCategoryRatings(raw.reviewCategory),
    isApprovedForPublic: false, // Default to false; will be managed by approval system
    source: 'hostaway',
    channel: raw.channel,
    reservationId: raw.reservationId,
    // Host-to-guest reviews reference the guest review from the same reservation
    replyToReviewId: raw.type === 'host-to-guest' ? findGuestReviewId(raw.reservationId) : undefined,
  };
}

/**
 * Normalize an array of Hostaway reviews
 */
export function normalizeHostawayReviews(reviews: HostawayReview[]): NormalizedReview[] {
  const normalized = reviews.map(normalizeHostawayReview);
  
  // Link host-to-guest reviews to their corresponding guest reviews
  normalized.forEach((review) => {
    if (review.type === 'host-to-guest' && review.reservationId) {
      const guestReview = normalized.find(
        (r) => r.reservationId === review.reservationId && r.type === 'guest-to-host'
      );
      if (guestReview) {
        review.replyToReviewId = guestReview.id;
      }
    }
  });
  
  return normalized;
}

/**
 * Calculate average rating from a review
 * Logic:
 * 1. If rating exists, use it
 * 2. Otherwise, compute mean of category ratings
 * 3. If no categories, return 0
 */
function calculateAverageRating(review: HostawayReview): number {
  // If rating is explicitly provided, use it
  if (review.rating !== null && review.rating !== undefined) {
    return roundToOneDecimal(review.rating);
  }

  // Calculate from category ratings
  if (review.reviewCategory && review.reviewCategory.length > 0) {
    const sum = review.reviewCategory.reduce((acc, cat) => acc + cat.categoryValue, 0);
    const average = sum / review.reviewCategory.length;
    return roundToOneDecimal(average);
  }

  // No rating data available
  return 0;
}

/**
 * Normalize category ratings
 */
function normalizeCategoryRatings(
  categories: HostawayReview['reviewCategory']
): CategoryRating[] {
  if (!categories || categories.length === 0) {
    return [];
  }

  return categories.map((cat) => ({
    category: cat.categoryName,
    rating: roundToOneDecimal(cat.categoryValue),
  }));
}

/**
 * Convert Hostaway date format to ISO 8601
 * Input: "YYYY-MM-DD HH:mm:ss" (assumed UTC)
 * Output: ISO 8601 string
 */
function convertToISO(dateString: string): string {
  // Replace space with 'T' and add 'Z' for UTC
  const isoString = dateString.replace(' ', 'T') + 'Z';
  return new Date(isoString).toISOString();
}

/**
 * Round number to one decimal place
 */
function roundToOneDecimal(num: number): number {
  return Math.round(num * 10) / 10;
}

/**
 * Generate a mock listing ID from reservation ID
 * In production, this would come from a mapping table
 */
function generateListingId(reservationId: number): string {
  // Mock logic: Create listing IDs based on reservation ranges
  // This simulates multiple properties
  const propertyIndex = Math.floor((reservationId % 100) / 10);
  return `PROP-${String(propertyIndex).padStart(3, '0')}`;
}

/**
 * Generate a mock listing name from reservation ID
 * In production, this would come from a mapping table
 */
function generateListingName(reservationId: number): string {
  const names = [
    'Downtown Loft A',
    'Riverside Studio B',
    'Garden View Apartment C',
    'Skyline Penthouse D',
    'Cozy Corner Suite E',
    'Urban Oasis F',
    'Historic District Flat G',
    'Waterfront Retreat H',
    'Modern City Pad I',
    'Parkside Haven J',
  ];

  const propertyIndex = Math.floor((reservationId % 100) / 10);
  return names[propertyIndex] || 'Unknown Property';
}

/**
 * Find guest review ID for a given reservation (for host replies)
 * This is a simplified mock - in production, would query by reservationId
 */
function findGuestReviewId(reservationId: number): number | undefined {
  // Mock mapping: guest review IDs are odd, host review IDs are even
  // In production, would look up in database by reservationId and type
  return undefined; // Will be resolved after all reviews are normalized
}
