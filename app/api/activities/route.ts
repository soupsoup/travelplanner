import { NextRequest, NextResponse } from 'next/server';
import { createActivity, getActivitiesByTrip } from '@/lib/db/actions';
import { NewActivity } from '@/lib/db/schema';

// POST /api/activities - Create a new activity
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tripId, title, description, location, time, cost, day, type, priority, tips, websiteUrl, googleMapLink, startLocation, endLocation, transportMode, manualDistance, manualTime, photos } = body;

    // Validate required fields
    if (!tripId || !title || !day) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const activityData: NewActivity = {
      tripId,
      title,
      description: description || '',
      location: location || '',
      time: time || '',
      cost: cost || 0,
      day,
      type: type || 'activity',
      priority: priority || 'medium',
      tips: tips || '',
      websiteUrl: websiteUrl || '',
      googleMapLink: googleMapLink || '',
      startLocation: startLocation || '',
      endLocation: endLocation || '',
      transportMode: transportMode || '',
      manualDistance: manualDistance || 0,
      manualTime: manualTime || 0,
      photos: photos || []
    };

    const result = await createActivity(activityData);

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
    console.error('Error creating activity:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create activity' },
      { status: 500 }
    );
  }
} 