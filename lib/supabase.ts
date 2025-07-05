import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types (you'll generate these from your Supabase dashboard)
export type Database = {
  public: {
    Tables: {
      trips: {
        Row: {
          id: string
          name: string
          destination: string
          start_date: string
          end_date: string
          days_count: number
          travelers: number
          budget: any
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
        Insert: {
          id?: string
          name: string
          destination: string
          start_date: string
          end_date: string
          days_count: number
          travelers: number
          budget: any
          status?: 'planning' | 'confirmed' | 'completed'
          image?: string | null
          activities_count: number
          completed_activities?: number
          trip_details: any
          activities: any[]
          overview?: string | null
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          name?: string
          destination?: string
          start_date?: string
          end_date?: string
          days_count?: number
          travelers?: number
          budget?: any
          status?: 'planning' | 'confirmed' | 'completed'
          image?: string | null
          activities_count?: number
          completed_activities?: number
          trip_details?: any
          activities?: any[]
          overview?: string | null
          created_at?: string
          updated_at?: string
          user_id?: string
        }
      }
    }
  }
} 