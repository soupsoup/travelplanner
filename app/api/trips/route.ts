import { NextRequest, NextResponse } from 'next/server';
import { createTrip, getAllTrips, createTripWithActivities } from '@/lib/db/actions';
import { NewTrip, NewActivity } from '@/lib/db/schema';

// GET /api/trips - Get all trips
export async function GET() {
  try {
    const result = await getAllTrips();
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    console.error('Error fetching trips:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch trips' },
      { status: 500 }
    );
  }
}

// POST /api/trips - Create a new trip
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { trip, activities = [] } = body;

    // Validate required fields
    if (!trip || !trip.id || !trip.name || !trip.destination) {
      return NextResponse.json(
        { success: false, error: 'Missing required trip fields' },
        { status: 400 }
      );
    }

    // Create trip with activities if provided
    let result;
    if (activities.length > 0) {
      result = await createTripWithActivities(trip, activities);
    } else {
      result = await createTrip(trip);
    }

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    console.error('Error creating trip:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create trip' },
      { status: 500 }
    );
  }
} 