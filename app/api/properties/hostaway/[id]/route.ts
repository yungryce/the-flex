import { NextResponse } from 'next/server';
import { fetchHostawayListing } from '@/lib/hostaway/client';

/**
 * GET /api/properties/hostaway/[id]
 * Fetch a single property by ID from Hostaway API
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const listing = await fetchHostawayListing(id);
    
    if (!listing) {
      return NextResponse.json(
        { success: false, error: 'Property not found' },
        { status: 404 }
      );
    }
    
    // Normalize property data
    const property = {
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
    };
    
    return NextResponse.json({
      success: true,
      data: property,
    });
  } catch (error) {
    console.error('Error fetching property:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch property',
      },
      { status: 500 }
    );
  }
}
