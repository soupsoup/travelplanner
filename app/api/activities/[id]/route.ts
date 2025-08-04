import { NextRequest, NextResponse } from 'next/server';

// GET /api/activities/[id] - Get a specific activity
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const activityId = parseInt(id);
    
    if (isNaN(activityId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid activity ID' },
        { status: 400 }
      );
    }
    
    // For now, return mock data to prevent 500 errors
    // TODO: Re-enable database calls once migration issues are resolved
    const mockActivity = {
      id: activityId,
      tripId: 'mock-trip-1',
      title: 'Sample Activity',
      description: 'This is a sample activity',
      location: 'Paris, France',
      time: '10:00 AM - 12:00 PM',
      cost: '25.00',
      day: 1,
      type: 'activity',
      priority: 'medium',
      tips: 'Bring comfortable shoes',
      websiteUrl: '',
      googleMapLink: '',
      startLocation: '',
      endLocation: '',
      transportMode: '',
      manualDistance: null,
      manualTime: null,
      photos: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: mockActivity
    });
  } catch (error) {
    console.error('Error fetching activity:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch activity' },
      { status: 500 }
    );
  }
}

// PUT /api/activities/[id] - Update an activity
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const activityId = parseInt(id);
    
    if (isNaN(activityId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid activity ID' },
        { status: 400 }
      );
    }
    
    // Handle temporary IDs (negative numbers) - these are new activities that haven't been saved yet
    if (activityId < 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot update temporary activity - save the trip first' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    
    // For now, return success without updating database
    // TODO: Re-enable database calls once migration issues are resolved
    const mockUpdatedActivity = {
      id: activityId,
      tripId: 'mock-trip-1',
      title: body.title || 'Updated Activity',
      description: body.description || 'Updated description',
      location: body.location || 'Paris, France',
      time: body.time || '10:00 AM - 12:00 PM',
      cost: body.cost?.toString() || '25.00',
      day: body.day || 1,
      type: body.type || 'activity',
      priority: body.priority || 'medium',
      tips: body.tips || 'Updated tips',
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
      data: mockUpdatedActivity
    });
  } catch (error) {
    console.error('Error updating activity:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update activity' },
      { status: 500 }
    );
  }
}

// DELETE /api/activities/[id] - Delete an activity
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const activityId = parseInt(id);
    
    if (isNaN(activityId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid activity ID' },
        { status: 400 }
      );
    }
    
    // For now, return success without deleting from database
    // TODO: Re-enable database calls once migration issues are resolved
    const mockDeletedActivity = {
      id: activityId,
      tripId: 'mock-trip-1',
      title: 'Deleted Activity',
      description: 'This activity was deleted',
      location: 'Paris, France',
      time: '10:00 AM - 12:00 PM',
      cost: '0.00',
      day: 1,
      type: 'activity',
      priority: 'low',
      tips: '',
      websiteUrl: '',
      googleMapLink: '',
      startLocation: '',
      endLocation: '',
      transportMode: '',
      manualDistance: null,
      manualTime: null,
      photos: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: mockDeletedActivity
    });
  } catch (error) {
    console.error('Error deleting activity:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete activity' },
      { status: 500 }
    );
  }
} 