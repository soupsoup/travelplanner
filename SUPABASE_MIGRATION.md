# 🚀 Supabase Migration Guide

## ✅ Prerequisites Completed
- [x] Supabase packages installed
- [x] Supabase client configuration created
- [x] Trip service functions created  
- [x] SQL schema prepared

## 🔧 Step-by-Step Migration

### 1. **Set Up Supabase Project**

1. Go to [supabase.com](https://supabase.com) and create account
2. Create new project
3. Copy project URL and anon key from Settings > API

### 2. **Environment Variables**

Create/update your `.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Keep existing for now
ANTHROPIC_API_KEY=your_anthropic_api_key
```

### 3. **Create Database Schema**

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy and run the SQL from `supabase-schema.sql`
4. This creates:
   - `trips` table with proper structure
   - Row Level Security (RLS) policies
   - Indexes for performance
   - Triggers for auto-updating timestamps

### 4. **Replace Authentication**

#### Option A: Quick Migration (Recommended)
Keep NextAuth for now, add Supabase later:

```typescript
// In components where you need user ID
const getCurrentUserId = () => {
  // Temporary: use a default user ID or session
  return 'user_' + (typeof window !== 'undefined' ? 
    localStorage.getItem('userId') || 'default' : 'default')
}
```

#### Option B: Full Supabase Auth Migration
Replace NextAuth with Supabase Auth:

```typescript
// app/login/page.tsx
import { supabase } from '@/lib/supabase'

const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (error) throw error
  return data
}

const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
  })
  if (error) throw error
  return data
}
```

### 5. **Update Components to Use Supabase**

#### Dashboard Component Update

```typescript
// app/dashboard/page.tsx
import { getUserTrips } from '@/lib/tripService'

const Dashboard = () => {
  const [savedTrips, setSavedTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTrips()
  }, [])

  const loadTrips = async () => {
    try {
      const trips = await getUserTrips()
      setSavedTrips(trips)
    } catch (error) {
      console.error('Error loading trips:', error)
      // Fallback to localStorage for now
      loadSavedTrips()
    } finally {
      setLoading(false)
    }
  }

  // ... rest of component
}
```

#### Itinerary Page Update

```typescript
// app/itinerary/[id]/page.tsx
import { getTripById, updateTrip } from '@/lib/tripService'

const ItineraryDetailPage = () => {
  // ... existing state

  useEffect(() => {
    if (!mounted || !tripId) return
    
    loadTrip()
  }, [mounted, tripId])

  const loadTrip = async () => {
    try {
      const trip = await getTripById(tripId)
      if (trip) {
        setTrip(trip)
        setActivities(trip.activities || [])
        setTripOverview(trip.overview || '')
        setTotalDays(trip.days_count)
        setTripName(trip.name)
        setTripImage(trip.image || '')
      } else {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error loading trip:', error)
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const saveTrip = async () => {
    if (!trip) return
    
    try {
      await updateTrip(trip.id, {
        activities,
        overview: tripOverview,
        days_count: totalDays,
        activities_count: activities.length,
        budget: {
          ...trip.budget,
          total: activities.reduce((sum, activity) => sum + activity.cost, 0)
        }
      })
      alert('Trip updated successfully!')
    } catch (error) {
      console.error('Error saving trip:', error)
      alert('Failed to save trip changes.')
    }
  }

  // ... rest of component
}
```

### 6. **Data Migration Strategy**

#### Automatic Migration
Add this to your dashboard or app initialization:

```typescript
// app/dashboard/page.tsx or app/layout.tsx
import { migrateLocalStorageTrips } from '@/lib/tripService'

useEffect(() => {
  // Run migration on first load
  const runMigration = async () => {
    try {
      await migrateLocalStorageTrips()
    } catch (error) {
      console.error('Migration error:', error)
    }
  }

  runMigration()
}, [])
```

### 7. **Enable Real-time Features (Optional)**

```typescript
// lib/tripService.ts - Add real-time subscriptions
export function subscribeToTrips(userId: string, callback: (trips: Trip[]) => void) {
  return supabase
    .channel('trips')
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'trips',
        filter: `user_id=eq.${userId}`
      }, 
      () => {
        // Reload trips when changes occur
        getUserTrips().then(callback)
      }
    )
    .subscribe()
}
```

### 8. **File Storage Setup (Optional)**

For trip images and documents:

```typescript
// lib/uploadService.ts
import { supabase } from './supabase'

export async function uploadTripImage(file: File, tripId: string): Promise<string> {
  const fileExt = file.name.split('.').pop()
  const fileName = `${tripId}-${Date.now()}.${fileExt}`
  
  const { data, error } = await supabase.storage
    .from('trip-images')
    .upload(fileName, file)

  if (error) throw error

  const { data: { publicUrl } } = supabase.storage
    .from('trip-images')
    .getPublicUrl(fileName)

  return publicUrl
}
```

### 9. **Testing the Migration**

1. **Test trip creation**: Create a new trip through AI builder
2. **Test trip loading**: Verify trips load from Supabase
3. **Test trip editing**: Update activities, overview, etc.
4. **Test migration**: Clear localStorage, add some trips, then run migration
5. **Test authentication**: Ensure user data is properly isolated

### 10. **Cleanup After Migration**

Once everything works:

1. Remove Prisma dependencies:
   ```bash
   npm uninstall prisma @prisma/client @auth/prisma-adapter
   ```

2. Remove unnecessary files:
   ```bash
   rm -rf prisma/
   rm lib/prisma.ts
   rm lib/auth.ts
   ```

3. Update package.json scripts:
   ```json
   {
     "scripts": {
       "dev": "next dev",
       "build": "next build",
       "start": "next start",
       "lint": "next lint"
     }
   }
   ```

## 🎯 Benefits After Migration

- ✅ **Real-time collaboration** on trip planning
- ✅ **Built-in authentication** with social logins
- ✅ **File storage** for trip images and documents
- ✅ **Better performance** with optimized queries
- ✅ **Automatic backups** and scaling
- ✅ **Row-level security** for data protection
- ✅ **GraphQL API** (optional, via PostgREST)
- ✅ **Real-time dashboard** for monitoring

## 🚨 Migration Checklist

- [ ] Supabase project created
- [ ] Environment variables added
- [ ] SQL schema executed
- [ ] Components updated to use tripService
- [ ] Data migration tested
- [ ] Authentication working
- [ ] All trip operations functional
- [ ] localStorage cleanup completed
- [ ] Old dependencies removed

## 🆘 Troubleshooting

**RLS Policies**: If you get permission errors, check RLS policies in Supabase dashboard

**Migration Issues**: Check browser console for localStorage data format issues

**Auth Problems**: Verify environment variables and Supabase project settings

**Performance**: Add more indexes if queries are slow:
```sql
create index trips_destination_idx on public.trips (destination);
create index trips_status_user_idx on public.trips (status, user_id);
```

Ready to start the migration? The foundation is all set up! 🚀 