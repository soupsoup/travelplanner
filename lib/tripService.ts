import { supabase } from './supabase'

export interface Trip {
  id: string
  name: string
  destination: string
  start_date: string
  end_date: string
  days_count: number
  travelers: number
  budget: {
    total: number
    currency: string
  }
  status: 'planning' | 'confirmed' | 'completed'
  image: string | null
  activities_count: number
  completed_activities: number
  trip_details: any
  activities: any[]
  overview: string | null
  created_at: string
  updated_at: string
  user_id: string
}

// Get all trips for the current user
export async function getUserTrips(): Promise<Trip[]> {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching trips:', error)
    throw error
  }

  return data || []
}

// Get a specific trip by ID
export async function getTripById(tripId: string): Promise<Trip | null> {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .eq('id', tripId)
    .eq('user_id', user.id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Trip not found
    }
    console.error('Error fetching trip:', error)
    throw error
  }

  return data
}

// Create a new trip
export async function createTrip(tripData: Omit<Trip, 'id' | 'created_at' | 'updated_at' | 'user_id'>): Promise<Trip> {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('trips')
    .insert([{
      ...tripData,
      user_id: user.id
    }])
    .select()
    .single()

  if (error) {
    console.error('Error creating trip:', error)
    throw error
  }

  return data
}

// Update an existing trip
export async function updateTrip(tripId: string, updates: Partial<Omit<Trip, 'id' | 'created_at' | 'user_id'>>): Promise<Trip> {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('trips')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', tripId)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    console.error('Error updating trip:', error)
    throw error
  }

  return data
}

// Delete a trip
export async function deleteTrip(tripId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('User not authenticated')
  }

  const { error } = await supabase
    .from('trips')
    .delete()
    .eq('id', tripId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error deleting trip:', error)
    throw error
  }
}

// Migrate localStorage trips to Supabase (one-time migration helper)
export async function migrateLocalStorageTrips(): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('User not authenticated')
  }

  // Check if there are any localStorage trips
  const localTrips = localStorage.getItem('savedTrips')
  if (!localTrips) return

  try {
    const trips = JSON.parse(localTrips)
    
    if (Array.isArray(trips) && trips.length > 0) {
      // Convert localStorage format to Supabase format
      const supabaseTrips = trips.map(trip => ({
        name: trip.name,
        destination: trip.destination,
        start_date: trip.startDate || trip.createdAt,
        end_date: trip.endDate || trip.createdAt,
        days_count: trip.daysCount || trip.days || 7,
        travelers: trip.travelers || trip.people || 1,
        budget: trip.budget || { total: 0, currency: 'USD' },
        status: trip.status || 'planning',
        image: trip.image,
        activities_count: trip.activitiesCount || 0,
        completed_activities: trip.completedActivities || 0,
        trip_details: trip.tripDetails || {},
        activities: trip.activities || [],
        overview: trip.overview,
        user_id: user.id
      }))

      // Insert all trips
      const { error } = await supabase
        .from('trips')
        .insert(supabaseTrips)

      if (error) {
        console.error('Error migrating trips:', error)
        throw error
      }

      // Clear localStorage after successful migration
      localStorage.removeItem('savedTrips')
      console.log(`Successfully migrated ${trips.length} trips to Supabase`)
    }
  } catch (error) {
    console.error('Error parsing localStorage trips:', error)
  }
} 