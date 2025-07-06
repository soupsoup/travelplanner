import { NextRequest, NextResponse } from 'next/server';
import { createActivity, getActivitiesByTrip } from '@/lib/db/actions';
import { NewActivity } from '@/lib/db/schema';

// POST /api/activities - Create a new activity
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Transform the data to match database schema
    const activityData: NewActivity = {
      tripId: body.tripId,
      title: body.title || '',
      description: body.description || '',
      location: body.location || '',
      time: body.time || '',
      cost: body.cost?.toString() || '0',
      day: body.day || 1,
      type: body.type || 'activity',
      priority: body.priority || 'medium',
      tips: body.tips || '',
      websiteUrl: body.websiteUrl || '',
      googleMapLink: body.googleMapLink || '',
      startLocation: body.startLocation || '',
      endLocation: body.endLocation || '',
      transportMode: body.transportMode || '',
      manualDistance: body.manualDistance?.toString() || null,
      manualTime: body.manualTime || null,
      photos: body.photos || [],
    };

    const result = await createActivity(activityData);
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: (result as any).error },
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