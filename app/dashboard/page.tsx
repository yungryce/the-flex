'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { NormalizedReview, Property, ReviewsResponse } from '@/types/review';

export default function DashboardPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [reviews, setReviews] = useState<NormalizedReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPropertiesAndReviews();
  }, []);

  async function fetchPropertiesAndReviews() {
    try {
      setLoading(true);
      
      const propsRes = await fetch('/api/properties/hostaway');
      const propsData = await propsRes.json();
      
      if (!propsData.success) {
        throw new Error(propsData.error || 'Failed to fetch properties');
      }
      
      const reviewsRes = await fetch('/api/reviews/hostaway');
      const reviewsData: ReviewsResponse = await reviewsRes.json();
      
      const storedApprovals = localStorage.getItem('reviewApprovals');
      const storedStatuses = localStorage.getItem('reviewStatuses');
      const approvalMap: Record<number, boolean> = storedApprovals ? JSON.parse(storedApprovals) : {};
      const statusMap: Record<number, string> = storedStatuses ? JSON.parse(storedStatuses) : {};
      
      const reviewsWithApprovals = reviewsData.data.map((review) => ({
        ...review,
        isApprovedForPublic: approvalMap[review.id] ?? review.isApprovedForPublic,
        status: (statusMap[review.id] as any) ?? review.status,
      }));
      
      setReviews(reviewsWithApprovals);
      
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
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <p className="text-gray-600">Loading properties...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Properties</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => fetchPropertiesAndReviews()}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Properties Dashboard</h1>
          <p className="text-gray-600">View per-property performance and manage reviews</p>
        </div>

        {properties.length > 0 && (
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-sm text-gray-600">Total Properties</p>
              <p className="text-3xl font-bold">{properties.length}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-sm text-gray-600">Total Reviews</p>
              <p className="text-3xl font-bold text-blue-600">
                {properties.reduce((sum, p) => sum + (p.reviewCount || 0), 0)}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-sm text-gray-600">Average Rating</p>
              <p className="text-3xl font-bold text-green-600">
                {properties.length > 0
                  ? (properties.reduce((sum, p) => sum + (p.avgRating || 0), 0) / properties.length).toFixed(1)
                  : '0.0'}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-sm text-gray-600">Pending Reviews</p>
              <p className="text-3xl font-bold text-yellow-600">
                {properties.reduce((sum, p) => sum + (p.pendingCount || 0), 0)}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-6">
          {properties.map((property) => (
            <Link
              key={property.id}
              href={`/properties/${property.id}`}
              className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow block"
            >
              <h3 className="text-lg font-semibold mb-2">{property.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{property.address}</p>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Rating</span>
                  <span className="font-semibold">⭐ {property.avgRating?.toFixed(1) || '0.0'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Reviews</span>
                  <span className="font-semibold">{property.reviewCount || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Pending</span>
                  <span className="font-semibold text-yellow-600">{property.pendingCount || 0}</span>
                </div>
              </div>
              <div className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-center">
                View Property & Reviews →
              </div>
            </Link>
          ))}
        </div>

        {properties.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">No properties found</p>
          </div>
        )}
      </div>
    </div>
  );
}
