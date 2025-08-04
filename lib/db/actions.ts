import { db } from './index';
import { trips, activities, tripBudgets, tripDetails } from './schema';
import { eq, desc, and } from 'drizzle-orm';
import type { NewTrip, NewActivity, Trip, Activity } from './schema';

// Trip operations
export async function createTrip(tripData: NewTrip) {
  try {
    const result = await db.insert(trips).values(tripData).returning();
    return { success: true, data: result[0] };
  } catch (error) {
    console.error('Error creating trip:', error);
    return { success: false, error: 'Failed to create trip' };
  }
}

export async function getAllTrips() {
  try {
    const result = await db
      .select()
      .from(trips)
      .orderBy(desc(trips.createdAt));
    return { success: true, data: result };
  } catch (error) {
    console.error('Error fetching trips:', error);
    return { success: false, error: 'Failed to fetch trips' };
  }
}

export async function getTripById(tripId: string) {
  try {
    const result = await db
      .select()
      .from(trips)
      .where(eq(trips.id, tripId))
      .limit(1);
    
    if (result.length === 0) {
      return { success: false, error: 'Trip not found' };
    }
    
    return { success: true, data: result[0] };
  } catch (error) {
    console.error('Error fetching trip:', error);
    return { success: false, error: 'Failed to fetch trip' };
  }
}

export async function updateTrip(tripId: string, updateData: Partial<NewTrip>) {
  try {
    const result = await db
      .update(trips)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(trips.id, tripId))
      .returning();
    
    if (result.length === 0) {
      return { success: false, error: 'Trip not found' };
    }
    
    return { success: true, data: result[0] };
  } catch (error) {
    console.error('Error updating trip:', error);
    return { success: false, error: 'Failed to update trip' };
  }
}

export async function deleteTrip(tripId: string) {
  try {
    const result = await db
      .delete(trips)
      .where(eq(trips.id, tripId))
      .returning();
    
    if (result.length === 0) {
      return { success: false, error: 'Trip not found' };
    }
    
    return { success: true, data: result[0] };
  } catch (error) {
    console.error('Error deleting trip:', error);
    return { success: false, error: 'Failed to delete trip' };
  }
}

// Activity operations
export async function createActivity(activityData: NewActivity) {
  try {
    const result = await db.insert(activities).values(activityData).returning();
    return { success: true, data: result[0] };
  } catch (error) {
    console.error('Error creating activity:', error);
    return { success: false, error: 'Failed to create activity' };
  }
}

export async function getActivitiesByTrip(tripId: string) {
  try {
    const result = await db
      .select()
      .from(activities)
      .where(eq(activities.tripId, tripId))
      .orderBy(activities.day, activities.time);
    
    return { success: true, data: result };
  } catch (error) {
    console.error('Error fetching activities:', error);
    return { success: false, error: 'Failed to fetch activities' };
  }
}

export async function getActivityById(activityId: number) {
  try {
    const result = await db
      .select()
      .from(activities)
      .where(eq(activities.id, activityId))
      .limit(1);
    
    if (result.length === 0) {
      return { success: false, error: 'Activity not found' };
    }
    
    return { success: true, data: result[0] };
  } catch (error) {
    console.error('Error fetching activity:', error);
    return { success: false, error: 'Failed to fetch activity' };
  }
}

export async function updateActivity(activityId: number, updateData: Partial<NewActivity>) {
  try {
    // Check if activity exists first
    const existingActivity = await db
      .select()
      .from(activities)
      .where(eq(activities.id, activityId))
      .limit(1);
    
    if (existingActivity.length === 0) {
      return { success: false, error: 'Activity not found' };
    }
    
    const result = await db
      .update(activities)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(activities.id, activityId))
      .returning();
    
    return { success: true, data: result[0] };
  } catch (error) {
    console.error('Error updating activity:', error);
    return { success: false, error: 'Failed to update activity' };
  }
}

export async function deleteActivity(activityId: number) {
  try {
    const result = await db
      .delete(activities)
      .where(eq(activities.id, activityId))
      .returning();
    
    if (result.length === 0) {
      return { success: false, error: 'Activity not found' };
    }
    
    return { success: true, data: result[0] };
  } catch (error) {
    console.error('Error deleting activity:', error);
    return { success: false, error: 'Failed to delete activity' };
  }
}

// Bulk operations
export async function createTripWithActivities(
  tripData: NewTrip,
  activitiesData: NewActivity[]
) {
  try {
    // Create trip first
    const tripResult = await db.insert(trips).values(tripData).returning();
    const trip = tripResult[0];
    
    // Create activities with tripId
    const activitiesWithTripId = activitiesData.map(activity => ({
      ...activity,
      tripId: trip.id
    }));
    
    const activitiesResult = await db
      .insert(activities)
      .values(activitiesWithTripId)
      .returning();
    
    return { 
      success: true, 
      data: { 
        trip, 
        activities: activitiesResult 
      } 
    };
  } catch (error) {
    console.error('Error creating trip with activities:', error);
    return { success: false, error: 'Failed to create trip with activities' };
  }
}

export async function getTripWithActivities(tripId: string) {
  try {
    const tripResult = await getTripById(tripId);
    if (!tripResult.success) {
      return tripResult;
    }
    
    const activitiesResult = await getActivitiesByTrip(tripId);
    if (!activitiesResult.success) {
      return activitiesResult;
    }
    
    return {
      success: true,
      data: {
        trip: tripResult.data,
        activities: activitiesResult.data
      }
    };
  } catch (error) {
    console.error('Error fetching trip with activities:', error);
    return { success: false, error: 'Failed to fetch trip with activities' };
  }
} 