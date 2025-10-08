/**
 * Core review data types for the Flex Living Reviews Dashboard
 * Normalized structure for reviews from multiple sources (Hostaway, Google)
 */

export interface NormalizedReview {
  id: number;
  listingId: string;
  listingName: string;
  guestName: string;
  publicReview: string;
  type: 'host-to-guest' | 'guest-to-host';
  status: 'published' | 'pending' | 'approved' | 'denied';
  submittedAt: string; // ISO 8601
  averageRating: number; // 0-10
  categoryRatings: CategoryRating[];
  isApprovedForPublic: boolean;
  source: 'hostaway' | 'google';
  channel?: string; // future multi-channel support
  reservationId?: number; // For linking host replies to guest reviews
  replyToReviewId?: number; // Host-to-guest reviews reference the guest review they're replying to
}

export interface CategoryRating {
  category: string;
  rating: number; // 0-10
}

export interface ReviewsResponse {
  meta: {
    total: number;
    limit: number;
    offset: number;
    generatedAt: string; // ISO timestamp
    appliedFilters: Record<string, unknown>;
  };
  data: NormalizedReview[];
}

/**
 * Raw review structure from Hostaway API
 */
export interface HostawayReview {
  id: number;
  reservationId: number;
  guestName: string;
  publicReview: string;
  privateReview: string | null;
  reply: string | null;
  rating: number | null;
  reviewCategory: HostawayReviewCategory[] | null;
  submittedAt: string; // "YYYY-MM-DD HH:mm:ss"
  replyTime: string | null;
  status: 'published' | 'pending';
  type: 'host-to-guest' | 'guest-to-host';
  channel?: string;
}

export interface HostawayReviewCategory {
  categoryName: string;
  categoryValue: number; // 0-10
}

/**
 * Query parameters for the reviews API endpoint
 */
export interface ReviewsQueryParams {
  listingId?: string;
  type?: 'host-to-guest' | 'guest-to-host';
  status?: 'published' | 'pending';
  minRating?: number;
  maxRating?: number;
  from?: string; // ISO date
  to?: string; // ISO date
  sort?: string; // format: "field:direction" e.g., "submittedAt:desc"
  limit?: number;
  offset?: number;
  includeUnapproved?: boolean; // future
  channel?: string; // future
}

/**
 * Error response structure
 */
export interface ApiErrorResponse {
  error: string;
  requestId?: string;
}
