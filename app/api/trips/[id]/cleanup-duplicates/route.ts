import { NextRequest, NextResponse } from 'next/server';
import { getActivitiesByTrip, deleteActivity } from '@/lib/db/actions';

// POST /api/trips/[id]/cleanup-duplicates - Remove duplicate activities
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // Get all activities for this trip
    const result = await getActivitiesByTrip(id);
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    const activities = result.data;
    
    // Find duplicates based on title, day, and time
    const duplicates = [];
    const seen = new Map();
    
    for (const activity of activities) {
      const key = `${activity.title}-${activity.day}-${activity.time}`.toLowerCase();
      
      if (seen.has(key)) {
        // This is a duplicate
        duplicates.push(activity);
      } else {
        seen.set(key, activity);
      }
    }
    
    console.log(`Found ${duplicates.length} duplicate activities for trip ${id}`);
    
    // Delete the duplicates (keep the first occurrence)
    const deletedActivities = [];
    
    for (const duplicate of duplicates) {
      try {
        const deleteResult = await deleteActivity(duplicate.id);
        if (deleteResult.success) {
          deletedActivities.push(duplicate);
          console.log(`Deleted duplicate activity: ${duplicate.title} (ID: ${duplicate.id})`);
        } else {
          console.error(`Failed to delete duplicate activity ${duplicate.id}:`, deleteResult.error);
        }
      } catch (error) {
        console.error(`Error deleting duplicate activity ${duplicate.id}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${deletedActivities.length} duplicate activities`,
      deletedCount: deletedActivities.length,
      totalDuplicatesFound: duplicates.length
    });
  } catch (error) {
    console.error('Error cleaning up duplicates:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to cleanup duplicates' },
      { status: 500 }
    );
  }
} 