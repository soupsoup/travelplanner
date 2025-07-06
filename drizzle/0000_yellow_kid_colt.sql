CREATE TABLE "activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"trip_id" text,
	"title" text NOT NULL,
	"description" text,
	"location" text,
	"time" text,
	"cost" numeric(10, 2) DEFAULT '0',
	"day" integer NOT NULL,
	"type" text DEFAULT 'activity' NOT NULL,
	"priority" text DEFAULT 'medium',
	"tips" text,
	"website_url" text,
	"google_map_link" text,
	"start_location" text,
	"end_location" text,
	"transport_mode" text,
	"manual_distance" numeric(10, 2),
	"manual_time" integer,
	"photos" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "trip_budgets" (
	"id" serial PRIMARY KEY NOT NULL,
	"trip_id" text,
	"total" numeric(10, 2) NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"spent" numeric(10, 2) DEFAULT '0',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "trip_details" (
	"id" serial PRIMARY KEY NOT NULL,
	"trip_id" text,
	"narrative" text,
	"budget" text,
	"interests" jsonb,
	"travel_style" text,
	"group_type" text,
	"activity_level" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "trips" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"destination" text NOT NULL,
	"start_date" text NOT NULL,
	"end_date" text NOT NULL,
	"days_count" integer NOT NULL,
	"travelers" integer DEFAULT 1 NOT NULL,
	"status" text DEFAULT 'planning' NOT NULL,
	"image" text,
	"overview" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_budgets" ADD CONSTRAINT "trip_budgets_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_details" ADD CONSTRAINT "trip_details_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;