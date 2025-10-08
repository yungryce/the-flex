'use client';

import { useEffect, useState } from 'react';
import type { NormalizedReview, ReviewsResponse } from '@/types/review';

export default function DashboardPage() {
  const [reviews, setReviews] = useState<NormalizedReview[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<NormalizedReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterMinRating, setFilterMinRating] = useState<string>('');
  const [filterProperty, setFilterProperty] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('submittedAt-desc');

  // Fetch reviews on mount
  useEffect(() => {
    fetchReviews();
  }, []);

  // Apply filters whenever reviews or filter state changes
  useEffect(() => {
    applyFilters();
  }, [reviews, filterType, filterStatus, filterMinRating, filterProperty, sortBy]);

  async function fetchReviews() {
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
      
      setReviews(reviewsWithApprovals);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  function applyFilters() {
    let filtered = [...reviews];

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter((r) => r.type === filterType);
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter((r) => r.status === filterStatus);
    }

    // Filter by property
    if (filterProperty !== 'all') {
      filtered = filtered.filter((r) => r.listingId === filterProperty);
    }

    // Filter by minimum rating
    if (filterMinRating) {
      const minRating = parseFloat(filterMinRating);
      filtered = filtered.filter((r) => r.averageRating >= minRating);
    }

    // Sort
    const [field, direction] = sortBy.split('-');
    filtered.sort((a, b) => {
      let aVal: number;
      let bVal: number;

      if (field === 'submittedAt') {
        aVal = new Date(a.submittedAt).getTime();
        bVal = new Date(b.submittedAt).getTime();
      } else {
        aVal = a.averageRating;
        bVal = b.averageRating;
      }

      return direction === 'asc' ? aVal - bVal : bVal - aVal;
    });

    setFilteredReviews(filtered);
  }

  function toggleApproval(id: number) {
    setReviews((prev) => {
      const updatedReviews = prev.map((r) =>
        r.id === id ? { ...r, isApprovedForPublic: !r.isApprovedForPublic } : r
      );
      
      // Persist approval states to localStorage
      const approvalMap: Record<number, boolean> = {};
      const statusMap: Record<number, string> = {};
      updatedReviews.forEach((review) => {
        approvalMap[review.id] = review.isApprovedForPublic;
        statusMap[review.id] = review.status;
      });
      localStorage.setItem('reviewApprovals', JSON.stringify(approvalMap));
      localStorage.setItem('reviewStatuses', JSON.stringify(statusMap));
      
      return updatedReviews;
    });
  }

  function changeReviewStatus(id: number, newStatus: 'approved' | 'denied' | 'published' | 'pending') {
    setReviews((prev) => {
      const updatedReviews = prev.map((r) =>
        r.id === id ? { ...r, status: newStatus } : r
      );
      
      // Persist to localStorage
      const approvalMap: Record<number, boolean> = {};
      const statusMap: Record<number, string> = {};
      updatedReviews.forEach((review) => {
        approvalMap[review.id] = review.isApprovedForPublic;
        statusMap[review.id] = review.status;
      });
      localStorage.setItem('reviewApprovals', JSON.stringify(approvalMap));
      localStorage.setItem('reviewStatuses', JSON.stringify(statusMap));
      
      return updatedReviews;
    });
  }

  // Calculate stats
  const stats = {
    total: reviews.length,
    approved: reviews.filter((r) => r.isApprovedForPublic).length,
    avgRating:
      reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.averageRating, 0) / reviews.length).toFixed(1)
        : '0',
    pending: reviews.filter((r) => r.status === 'pending').length,
  };

  // Get unique property IDs for filter dropdown
  const uniqueProperties = Array.from(new Set(reviews.map((r) => r.listingId))).sort();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-gray-600">Loading reviews...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-red-600">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reviews Dashboard</h1>
          <p className="text-gray-600">Manage and approve guest reviews for public display</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-600">Total Reviews</p>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-600">Approved</p>
            <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-600">Average Rating</p>
            <p className="text-3xl font-bold text-blue-600">{stats.avgRating}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-600">Pending</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All</option>
                <option value="guest-to-host">Guest to Host</option>
                <option value="host-to-guest">Host to Guest</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All</option>
                <option value="published">Published</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Property</label>
              <select
                value={filterProperty}
                onChange={(e) => setFilterProperty(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Properties</option>
                {uniqueProperties.map((propId) => (
                  <option key={propId} value={propId}>
                    {propId}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Min Rating</label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={filterMinRating}
                onChange={(e) => setFilterMinRating(e.target.value)}
                placeholder="0-10"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="submittedAt-desc">Newest First</option>
                <option value="submittedAt-asc">Oldest First</option>
                <option value="averageRating-desc">Highest Rating</option>
                <option value="averageRating-asc">Lowest Rating</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Reviews ({filteredReviews.length})
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {filteredReviews.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                No reviews match the current filters
              </div>
            ) : (
              filteredReviews.map((review) => (
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
                          {review.type === 'guest-to-host' ? 'Guest Review' : 'Host Reply'}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${
                            review.status === 'published'
                              ? 'bg-green-100 text-green-800'
                              : review.status === 'approved'
                              ? 'bg-blue-100 text-blue-800'
                              : review.status === 'denied'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {review.status}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">{review.listingName}</span>
                        <span className="text-gray-400"> ({review.listingId})</span>
                      </p>
                      <p className="text-gray-800 mb-3">{review.publicReview}</p>

                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="font-medium">
                          ⭐ {review.averageRating.toFixed(1)}
                        </span>
                        <span>{new Date(review.submittedAt).toLocaleDateString()}</span>
                        {review.categoryRatings.length > 0 && (
                          <span className="text-xs">
                            {review.categoryRatings
                              .map((c) => `${c.category}: ${c.rating}`)
                              .join(' • ')}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 min-w-[200px]">
                      {/* Pending reviews: Show Approve/Deny buttons */}
                      {review.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => changeReviewStatus(review.id, 'approved')}
                            className="flex-1 px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => changeReviewStatus(review.id, 'denied')}
                            className="flex-1 px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                          >
                            Deny
                          </button>
                        </div>
                      )}

                      {/* Approved/Published reviews: Show public display toggle */}
                      {(review.status === 'approved' || review.status === 'published') && (
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={review.isApprovedForPublic}
                            onChange={() => toggleApproval(review.id)}
                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm font-medium text-gray-700">
                            Display Publicly
                          </span>
                        </label>
                      )}

                      {/* Denied reviews: Show option to undo */}
                      {review.status === 'denied' && (
                        <button
                          onClick={() => changeReviewStatus(review.id, 'pending')}
                          className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors"
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
