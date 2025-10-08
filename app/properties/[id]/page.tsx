'use client';

import { useEffect, useState } from 'react';
import type { NormalizedReview, ReviewsResponse } from '@/types/review';
import Link from 'next/link';

interface PropertyPageProps {
  params: Promise<{ id: string }>;
}

export default function PropertyPage({ params }: PropertyPageProps) {
  const [propertyId, setPropertyId] = useState<string>('');
  const [reviews, setReviews] = useState<NormalizedReview[]>([]);
  const [hostReplies, setHostReplies] = useState<NormalizedReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedReviews, setExpandedReviews] = useState<Set<number>>(new Set());
  const [showAllReviews, setShowAllReviews] = useState(false);

  useEffect(() => {
    params.then((p) => {
      setPropertyId(p.id);
      fetchApprovedReviews(p.id);
    });
  }, [params]);

  async function fetchApprovedReviews(id: string) {
    try {
      setLoading(true);
      const response = await fetch('/api/reviews/hostaway');
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }
      const data: ReviewsResponse = await response.json();
      
      // Load approval states and statuses from localStorage
      const storedApprovals = localStorage.getItem('reviewApprovals');
      const storedStatuses = localStorage.getItem('reviewStatuses');
      const approvalMap: Record<number, boolean> = storedApprovals 
        ? JSON.parse(storedApprovals) 
        : {};
      const statusMap: Record<number, string> = storedStatuses
        ? JSON.parse(storedStatuses)
        : {};
      
      // Apply stored approval states to fetched reviews
      const reviewsWithApprovals = data.data.map((review) => ({
        ...review,
        isApprovedForPublic: approvalMap[review.id] ?? review.isApprovedForPublic,
        status: (statusMap[review.id] as any) ?? review.status,
      }));
      
      // Filter for this property:
      // 1. Guest reviews: published OR approved, AND approved for public
      // 2. Host replies: Link to guest reviews later
      const propertyReviews = reviewsWithApprovals.filter(
        (r) =>
          r.listingId === id &&
          r.isApprovedForPublic &&
          r.type === 'guest-to-host' &&
          (r.status === 'published' || r.status === 'approved')
      );
      
      // Get host replies for these guest reviews
      const guestReviewIds = new Set(propertyReviews.map((r) => r.id));
      const replies = reviewsWithApprovals.filter(
        (r) =>
          r.type === 'host-to-guest' &&
          r.replyToReviewId &&
          guestReviewIds.has(r.replyToReviewId) &&
          r.isApprovedForPublic &&
          (r.status === 'published' || r.status === 'approved')
      );
      
      setReviews(propertyReviews);
      setHostReplies(replies);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  }

  const toggleReviewExpand = (id: number) => {
    setExpandedReviews((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.averageRating, 0) / reviews.length).toFixed(1)
      : '0';

  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 5);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'rgb(248, 248, 248)', color: 'rgb(5, 51, 49)', fontFamily: '"Noto Sans", sans-serif' }}>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold" style={{ color: 'rgb(22, 79, 76)' }}>Flex Living</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link href="/" className="hover:underline" style={{ color: 'rgb(22, 79, 76)' }}>Flex Living</Link>
            <Link href="/dashboard" className="hover:underline" style={{ color: 'rgb(22, 79, 76)' }}>All listings</Link>
            <Link href="/" className="hover:underline" style={{ color: 'rgb(22, 79, 76)' }}>About Us</Link>
            <Link href="/" className="hover:underline" style={{ color: 'rgb(22, 79, 76)' }}>Contact us</Link>
          </nav>
        </div>
      </header>

      {/* Image Gallery Section */}
      <div className="relative">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="grid md:grid-cols-2 gap-2 h-96">
            {/* Main Image */}
            <div className="relative bg-gray-300 rounded-l-lg overflow-hidden">
              <div className="absolute top-4 left-4 z-10">
                <span className="inline-block bg-red-600 text-white text-sm px-3 py-1 rounded-full">
                  All Listings
                </span>
              </div>
              <div className="absolute top-4 right-4 z-10">
                <span className="inline-block text-white text-sm px-3 py-1 rounded-full" style={{ backgroundColor: 'rgb(22, 79, 76)' }}>
                  ⭐ {avgRating}
                </span>
              </div>
              <div className="w-full h-full flex items-center justify-center text-gray-600">
                Property Image
              </div>
            </div>

            {/* Grid of 4 smaller images */}
            <div className="hidden md:grid grid-cols-2 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="relative bg-gray-300 rounded-lg overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center text-gray-600 text-sm">
                    Image {i + 1}
                  </div>
                  {i === 4 && (
                    <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white text-sm px-3 py-1 rounded-full">
                      + 40 photos
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Property Title & Details */}
            <div className="border-b pb-6" style={{ borderColor: 'rgb(220, 220, 220)' }}>
              <h1 className="text-3xl font-bold mb-3">
                {reviews[0]?.listingName || 'Spacious Apartment'} - The Flex London
              </h1>
              <p className="text-base mb-2">
                Apartment · 5 guests · 2 bedrooms · 2 bathrooms
              </p>
              <div className="flex items-center gap-2 text-sm">
                <span className="flex items-center gap-1">
                  <span>⭐</span>
                  <span className="font-semibold">{avgRating}</span>
                </span>
                <span>·</span>
                <Link href="#reviews" className="underline">
                  {reviews.length} reviews
                </Link>
              </div>
            </div>

            {/* About Section */}
            <div className="border-b pb-8" style={{ borderColor: 'rgb(220, 220, 220)' }}>
              <p className="leading-relaxed mb-4">
                This apartment is located in Hoxton, one of the coolest areas in London. It's a spacious unit with high-quality amenities to make your stay comfortable. The location is ideal—close to great cafes, shops, and bars, with easy access to transport. I've made sure everything is ready for you to enjoy your time in this lively neighborhood.
              </p>
              <details className="group">
                <summary className="cursor-pointer underline list-none">Show more</summary>
                <div className="mt-4 space-y-4">
                  <h3 className="font-semibold text-lg">About this property</h3>
                  <p className="leading-relaxed">
                    This apartment has 2 bedrooms, each with a king bed, and 2 bathrooms. The kitchen is fully equipped with top-quality appliances. All duvets and pillows are hypoallergenic, and the bed linen is 100% cotton for a comfortable stay. The spacious living room has an additional air mattress for 1 extra guest. The apartment can accommodate up to 5 people in total.
                  </p>
                  <p className="leading-relaxed">
                    This apartment is located in Hoxton, one of London's most trendy neighborhoods. It's a lively area known for its art, street food, and creative vibe. There are plenty of cafes, galleries, and independent shops nearby, making it perfect for exploring. The location is also well-connected with public transport, so getting around the city is easy.
                  </p>
                </div>
              </details>
            </div>

            {/* Amenities */}
            <div className="border-b pb-8" style={{ borderColor: 'rgb(220, 220, 220)' }}>
              <h2 className="text-xl font-semibold mb-4">Amenities</h2>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                {['Free WiFi', 'Kitchen', 'Washing Machine', 'Heating', 'TV', 'Elevator'].map((amenity) => (
                  <div key={amenity} className="flex items-center gap-3">
                    <span className="text-xl">✓</span>
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
              <button className="mt-4 underline text-sm">Show all 48 amenities</button>
            </div>

            {/* Reviews Section */}
            <div className="border-b pb-8" style={{ borderColor: 'rgb(220, 220, 220)' }} id="reviews">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <span>Reviews</span>
                <span className="flex items-center gap-1">
                  <span>⭐</span>
                  <span>{avgRating}</span>
                  <span className="text-gray-600">({reviews.length})</span>
                </span>
              </h2>

              {loading ? (
                <p className="text-gray-600">Loading reviews...</p>
              ) : reviews.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <p className="text-gray-600">No approved reviews yet for this property.</p>
                </div>
              ) : (
                <>
                  <div className="space-y-6">
                    {displayedReviews.map((review) => {
                      const isExpanded = expandedReviews.has(review.id);
                      const shouldTruncate = review.publicReview.length > 200;
                      const displayText = isExpanded || !shouldTruncate
                        ? review.publicReview
                        : review.publicReview.slice(0, 200) + '...';
                      
                      // Find host reply for this guest review
                      const hostReply = hostReplies.find((r) => r.replyToReviewId === review.id);

                      return (
                        <div key={review.id} className="pb-6 border-b last:border-0" style={{ borderColor: 'rgb(220, 220, 220)' }}>
                          {/* Guest Review */}
                          <div className="flex items-center gap-2 mb-2 text-sm">
                            {/* Star Rating */}
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                  key={star}
                                  className="text-lg"
                                  style={{ color: star <= review.averageRating / 2 ? 'rgb(5, 51, 49)' : 'rgb(220, 220, 220)' }}
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                            <span className="text-gray-500">·</span>
                            <span className="font-medium">{review.guestName}</span>
                            <span className="text-gray-500">·</span>
                            <span className="text-gray-500">
                              {new Date(review.submittedAt).toLocaleDateString('en-US', {
                                month: 'long',
                                year: 'numeric',
                              })}
                            </span>
                          </div>

                          {/* Review Text */}
                          <p className="leading-relaxed mb-2">
                            {displayText}
                          </p>

                          {/* Show More/Hide Toggle */}
                          {shouldTruncate && (
                            <button
                              onClick={() => toggleReviewExpand(review.id)}
                              className="underline text-sm mb-3"
                            >
                              {isExpanded ? 'Hide' : 'Show more'}
                            </button>
                          )}

                          {/* Host Reply (Threaded/Indented) */}
                          {hostReply && (
                            <div className="mt-4 ml-8 pl-4 border-l-2" style={{ borderColor: 'rgb(220, 220, 220)' }}>
                              <div className="flex items-center gap-2 mb-2 text-sm">
                                <span className="font-semibold" style={{ color: 'rgb(22, 79, 76)' }}>
                                  Host Response
                                </span>
                                <span className="text-gray-500">·</span>
                                <span className="text-gray-500">
                                  {new Date(hostReply.submittedAt).toLocaleDateString('en-US', {
                                    month: 'long',
                                    year: 'numeric',
                                  })}
                                </span>
                              </div>
                              <p className="text-gray-700 leading-relaxed text-sm">
                                {hostReply.publicReview}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Show All Reviews Button */}
                  {reviews.length > 5 && !showAllReviews && (
                    <button
                      onClick={() => setShowAllReviews(true)}
                      className="mt-6 px-6 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                      style={{ borderColor: 'rgb(220, 220, 220)' }}
                    >
                      Show all {reviews.length} reviews
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Good to Know */}
            <div className="border-b pb-8" style={{ borderColor: 'rgb(220, 220, 220)' }}>
              <h2 className="text-xl font-semibold mb-4">Good to know</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">House Rules</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>Check-in: 3 pm</div>
                    <div>Pets: not allowed</div>
                    <div>Check-out: 10 am</div>
                    <div>Smoking inside: not allowed</div>
                  </div>
                </div>
                <details className="group">
                  <summary className="cursor-pointer underline list-none text-sm">Show more</summary>
                  <div className="mt-4 space-y-2 text-sm">
                    <p>Children: allowed</p>
                    <p>Infants: allowed</p>
                    <p>Parties and events: not allowed</p>
                    <p className="font-semibold mt-3">Additional rules:</p>
                    <p>Quiet Hours 11pm-8am</p>
                  </div>
                </details>
              </div>
            </div>
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24">
              <div className="bg-white rounded-xl p-8 border" style={{ borderColor: 'rgb(220, 220, 220)' }}>
                <p className="text-sm mb-4 text-gray-600">
                  Select dates and number of guests to see the total price per night
                </p>

                <div className="space-y-3 mb-6">
                  <button className="w-full flex items-center gap-3 px-4 py-3 border rounded-lg text-left hover:border-gray-400 transition-colors" style={{ borderColor: 'rgb(220, 220, 220)' }}>
                    <span className="text-xl">📅</span>
                    <span className="text-sm">Select dates</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-3 border rounded-lg text-left hover:border-gray-400 transition-colors" style={{ borderColor: 'rgb(220, 220, 220)' }}>
                    <span className="text-xl">👥</span>
                    <span className="text-sm">1 guest</span>
                  </button>
                </div>

                <div className="flex gap-3">
                  <button className="flex-1 py-3 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity" style={{ backgroundColor: 'rgb(22, 79, 76)' }}>
                    Book now
                  </button>
                  <button className="flex-1 py-3 border rounded-lg font-semibold hover:bg-gray-50 transition-colors" style={{ borderColor: 'rgb(220, 220, 220)', color: 'rgb(22, 79, 76)' }}>
                    Send Inquiry
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-12" style={{ borderColor: 'rgb(220, 220, 220)' }}>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
            <div className="flex items-center gap-6">
              <span className="font-bold text-lg" style={{ color: 'rgb(22, 79, 76)' }}>Flex Living</span>
              <Link href="/" className="hover:underline">Privacy Policy</Link>
              <Link href="/" className="hover:underline">Terms and conditions</Link>
            </div>
            <div className="flex items-center gap-6">
              <a href="tel:+447723745646" className="flex items-center gap-2 hover:underline">
                <span>📞</span>
                <span>+447723745646</span>
              </a>
              <a href="mailto:info@theflexliving.com" className="flex items-center gap-2 hover:underline">
                <span>✉️</span>
                <span>info@theflexliving.com</span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
