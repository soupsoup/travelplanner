import { NextRequest, NextResponse } from 'next/server';

// POST /api/activities - Create a new activity
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // For now, return success without saving to database
    // TODO: Re-enable database calls once migration issues are resolved
    const mockActivity = {
      id: Math.floor(Math.random() * 10000),
      tripId: body.tripId,
      title: body.title || 'New Activity',
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: mockActivity
    });
  } catch (error) {
    console.error('Error creating activity:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create activity' },
      { status: 500 }
    );
  }
} 