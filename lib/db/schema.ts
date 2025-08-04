import { 
  pgTable, 
  text, 
  integer, 
  timestamp, 
  boolean, 
  decimal, 
  jsonb,
  serial 
} from 'drizzle-orm/pg-core';

// Trips table
export const trips = pgTable('trips', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  destination: text('destination').notNull(),
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  daysCount: integer('days_count').notNull(),
  travelers: integer('travelers').notNull().default(1),
  status: text('status').notNull().default('planning'),
  image: text('image'),
  overview: text('overview'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Activities table
export const activities = pgTable('activities', {
  id: serial('id').primaryKey(),
  tripId: text('trip_id').references(() => trips.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  location: text('location'),
  time: text('time'),
  cost: decimal('cost', { precision: 10, scale: 2 }).default('0'),
  day: integer('day').notNull(),
  type: text('type').notNull().default('activity'),
  priority: text('priority').default('medium'),
  tips: text('tips'),
  websiteUrl: text('website_url'),
  googleMapLink: text('google_map_link'),
  
  // Transport specific fields
  startLocation: text('start_location'),
  endLocation: text('end_location'),
  transportMode: text('transport_mode'),
  manualDistance: decimal('manual_distance', { precision: 10, scale: 2 }),
  manualTime: integer('manual_time'),
  
  // Photos stored as JSON array
  photos: jsonb('photos').$type<Array<{
    url: string;
    name: string;
    size: number;
  }>>(),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Trip budget table
export const tripBudgets = pgTable('trip_budgets', {
  id: serial('id').primaryKey(),
  tripId: text('trip_id').references(() => trips.id, { onDelete: 'cascade' }),
  total: decimal('total', { precision: 10, scale: 2 }).notNull(),
  currency: text('currency').notNull().default('USD'),
  spent: decimal('spent', { precision: 10, scale: 2 }).default('0'),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Trip details table (for AI builder data)
export const tripDetails = pgTable('trip_details', {
  id: serial('id').primaryKey(),
  tripId: text('trip_id').references(() => trips.id, { onDelete: 'cascade' }),
  narrative: text('narrative'),
  budget: text('budget'),
  interests: jsonb('interests').$type<string[]>(),
  travelStyle: text('travel_style'),
  groupType: text('group_type'),
  activityLevel: text('activity_level'),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Subscription table
export const subscriptions = pgTable('subscriptions', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  status: text('status').notNull().default('active'),
  plan: text('plan').notNull(), // 'monthly' or 'annual'
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  stripeSubscriptionId: text('stripe_subscription_id'),
  stripeCustomerId: text('stripe_customer_id'),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// User table for subscription management
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  hasActiveSubscription: boolean('has_active_subscription').default(false),
  freeTripsUsed: integer('free_trips_used').default(0),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Export types for TypeScript
export type Trip = typeof trips.$inferSelect;
export type NewTrip = typeof trips.$inferInsert;
export type Activity = typeof activities.$inferSelect;
export type NewActivity = typeof activities.$inferInsert;
export type TripBudget = typeof tripBudgets.$inferSelect;
export type NewTripBudget = typeof tripBudgets.$inferInsert;
export type TripDetail = typeof tripDetails.$inferSelect;
export type NewTripDetail = typeof tripDetails.$inferInsert;
export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert; 