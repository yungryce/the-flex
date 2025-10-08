/**
 * GET /api/reviews/hostaway
 * Returns normalized Hostaway reviews
 * Note: Filtering/sorting done client-side for simplicity with small dataset
 */

import { NextResponse } from 'next/server';
import type { HostawayReview, ReviewsResponse } from '@/types/review';
import { normalizeHostawayReviews } from '@/lib/hostaway/normalizer';
import mockReviews from '@/data/mock-reviews.json';

export async function GET() {
  try {
    // Load and normalize reviews
    const rawReviews = mockReviews as HostawayReview[];
    const normalized = normalizeHostawayReviews(rawReviews);

    // Build response
    const response: ReviewsResponse = {
      meta: {
        total: normalized.length,
        limit: normalized.length,
        offset: 0,
        generatedAt: new Date().toISOString(),
        appliedFilters: {},
      },
      data: normalized,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in /api/reviews/hostaway:', error);
    return NextResponse.json(
      {
        error: 'Internal error',
        requestId: crypto.randomUUID(),
      },
      { status: 500 }
    );
  }
}
