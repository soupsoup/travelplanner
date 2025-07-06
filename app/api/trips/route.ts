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

    // Transform the data to match database schema
    const tripData: NewTrip = {
      id: trip.id,
      name: trip.name,
      destination: trip.destination,
      startDate: trip.startDate || new Date().toISOString().split('T')[0],
      endDate: trip.endDate || new Date().toISOString().split('T')[0],
      daysCount: trip.daysCount || trip.days || 7,
      travelers: trip.travelers || 1,
      status: trip.status || 'planning',
      image: trip.image,
      overview: trip.overview,
    };

    let result;
    
    if (activities && activities.length > 0) {
      // Transform activities to match database schema
      const activitiesData: NewActivity[] = activities.map((activity: any) => ({
        title: activity.title || '',
        description: activity.description || '',
        location: activity.location || '',
        time: activity.time || '',
        cost: activity.cost?.toString() || '0',
        day: activity.day || 1,
        type: activity.type || 'activity',
        priority: activity.priority || 'medium',
        tips: activity.tips || '',
        websiteUrl: activity.websiteUrl || '',
        googleMapLink: activity.googleMapLink || '',
        startLocation: activity.startLocation || '',
        endLocation: activity.endLocation || '',
        transportMode: activity.transportMode || '',
        manualDistance: activity.manualDistance?.toString() || null,
        manualTime: activity.manualTime || null,
        photos: activity.photos || [],
      }));

      result = await createTripWithActivities(tripData, activitiesData);
    } else {
      result = await createTrip(tripData);
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