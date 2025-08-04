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
    const { trip, activities = [], userEmail } = body;

    // Validate required fields
    if (!trip || !trip.id || !trip.name || !trip.destination) {
      return NextResponse.json(
        { success: false, error: 'Missing required trip fields' },
        { status: 400 }
      );
    }

    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: 'User email is required' },
        { status: 400 }
      );
    }

    // Check subscription status
    const { getUserByEmail, canCreateTrip, incrementFreeTripsUsed } = await import('@/lib/db/actions');
    
    const userResult = await getUserByEmail(userEmail);
    if (!userResult.success) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const user = userResult.data;
    const canCreateResult = await canCreateTrip(user.id);

    if (!canCreateResult.success) {
      return NextResponse.json(
        { success: false, error: canCreateResult.error },
        { status: 500 }
      );
    }

    if (!canCreateResult.canCreate) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Subscription required',
          reason: 'subscription_required',
          message: 'You have used your free trip. Please subscribe to create more itineraries.'
        },
        { status: 402 } // Payment Required
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

                 // Increment free trips used if user doesn't have subscription
             if (!user.hasActiveSubscription) {
               console.log('🔍 Incrementing free trips used for user:', user.id);
               const incrementResult = await incrementFreeTripsUsed(user.id);
               console.log('🔍 Increment result:', incrementResult);
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