import { NextRequest, NextResponse } from 'next/server';
import { getTripWithActivities, updateTrip, deleteTrip } from '@/lib/db/actions';

// GET /api/trips/[id] - Get a specific trip with activities
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tripId = params.id;
    
    const result = await getTripWithActivities(tripId);
    
    if (!result.success) {
      const errorMessage = (result as any).error || 'Failed to fetch trip';
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: errorMessage === 'Trip not found' ? 404 : 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    console.error('Error fetching trip:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch trip' },
      { status: 500 }
    );
  }
}

// PUT /api/trips/[id] - Update a trip
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tripId = params.id;
    const body = await request.json();
    
    // Extract updateable fields
    const updateData = {
      name: body.name,
      destination: body.destination,
      startDate: body.startDate,
      endDate: body.endDate,
      daysCount: body.daysCount,
      travelers: body.travelers,
      status: body.status,
      image: body.image,
      overview: body.overview,
    };

    // Remove undefined fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key as keyof typeof updateData] === undefined) {
        delete updateData[key as keyof typeof updateData];
      }
    });

    const result = await updateTrip(tripId, updateData);
    
    if (!result.success) {
      const errorMessage = (result as any).error || 'Failed to update trip';
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: errorMessage === 'Trip not found' ? 404 : 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    console.error('Error updating trip:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update trip' },
      { status: 500 }
    );
  }
}

// DELETE /api/trips/[id] - Delete a trip
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tripId = params.id;
    
    const result = await deleteTrip(tripId);
    
    if (!result.success) {
      const errorMessage = (result as any).error || 'Failed to delete trip';
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: errorMessage === 'Trip not found' ? 404 : 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    console.error('Error deleting trip:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete trip' },
      { status: 500 }
    );
  }
} 