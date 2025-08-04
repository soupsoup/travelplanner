import { NextRequest, NextResponse } from 'next/server';
import { getActivityById, updateActivity, deleteActivity } from '@/lib/db/actions';

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
    
    const result = await getActivityById(activityId);
    
    if (!result.success) {
      const errorMessage = (result as any).error || 'Failed to fetch activity';
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: errorMessage === 'Activity not found' ? 404 : 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data
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
    
    // Extract updateable fields
    const updateData = {
      title: body.title,
      description: body.description,
      location: body.location,
      time: body.time,
      cost: body.cost?.toString(),
      day: body.day,
      type: body.type,
      priority: body.priority,
      tips: body.tips,
      websiteUrl: body.websiteUrl,
      googleMapLink: body.googleMapLink,
      startLocation: body.startLocation,
      endLocation: body.endLocation,
      transportMode: body.transportMode,
      manualDistance: body.manualDistance?.toString(),
      manualTime: body.manualTime,
      photos: body.photos,
    };

    // Remove undefined fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key as keyof typeof updateData] === undefined) {
        delete updateData[key as keyof typeof updateData];
      }
    });

    const result = await updateActivity(activityId, updateData);
    
    if (!result.success) {
      const errorMessage = (result as any).error || 'Failed to update activity';
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: errorMessage === 'Activity not found' ? 404 : 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data
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
    
    const result = await deleteActivity(activityId);
    
    if (!result.success) {
      const errorMessage = (result as any).error || 'Failed to delete activity';
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: errorMessage === 'Activity not found' ? 404 : 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    console.error('Error deleting activity:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete activity' },
      { status: 500 }
    );
  }
} 