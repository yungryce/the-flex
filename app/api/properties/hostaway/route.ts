import { NextResponse } from 'next/server';
import { fetchHostawayListings } from '@/lib/hostaway/client';

/**
 * GET /api/properties/hostaway
 * Fetch all properties from Hostaway API
 */
export async function GET() {
  try {
    const listings = await fetchHostawayListings();
    
    // Normalize to simple property format
    const properties = listings.map((listing: any) => ({
      id: listing.id.toString(),
      name: listing.name || 'Unnamed Property',
      address: listing.address || '',
      city: listing.city || '',
      country: listing.country || '',
      imageUrl: listing.picture || null,
      bedrooms: listing.bedrooms || 0,
      bathrooms: listing.bathrooms || 0,
      accommodates: listing.accommodates || 0,
      propertyType: listing.propertyType || 'Apartment',
    }));
    
    return NextResponse.json({
      success: true,
      data: properties,
      count: properties.length,
    });
  } catch (error) {
    console.error('Error fetching properties:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch properties',
      },
      { status: 500 }
    );
  }
}
