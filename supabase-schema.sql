-- Enable Row Level Security
alter table if exists public.trips enable row level security;

-- Create trips table
create table if not exists public.trips (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  destination text not null,
  start_date timestamp with time zone not null,
  end_date timestamp with time zone not null,
  days_count integer not null default 1,
  travelers integer not null default 1,
  budget jsonb not null default '{"total": 0, "currency": "USD"}',
  status text not null default 'planning' check (status in ('planning', 'confirmed', 'completed')),
  image text,
  activities_count integer not null default 0,
  completed_activities integer not null default 0,
  trip_details jsonb not null default '{}',
  activities jsonb not null default '[]',
  overview text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id) on delete cascade not null
);

-- Create indexes for better performance
create index if not exists trips_user_id_idx on public.trips (user_id);
create index if not exists trips_created_at_idx on public.trips (created_at desc);
create index if not exists trips_status_idx on public.trips (status);

-- Create updated_at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger if not exists trips_updated_at
  before update on public.trips
  for each row execute function public.handle_updated_at();

-- Row Level Security policies
create policy "Users can view their own trips"
  on public.trips for select
  using (auth.uid() = user_id);

create policy "Users can create their own trips"
  on public.trips for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own trips"
  on public.trips for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own trips"
  on public.trips for delete
  using (auth.uid() = user_id);

-- Optional: Create a function to get trip statistics
create or replace function public.get_user_trip_stats(user_uuid uuid)
returns json as $$
declare
  result json;
begin
  select json_build_object(
    'total_trips', count(*),
    'total_budget', sum((budget->>'total')::numeric),
    'countries_visited', count(distinct split_part(destination, ',', -1)),
    'avg_trip_length', avg(days_count),
    'status_breakdown', json_object_agg(status, status_count)
  ) into result
  from (
    select 
      status,
      count(*) as status_count,
      destination,
      days_count,
      budget
    from public.trips 
    where user_id = user_uuid
    group by status, destination, days_count, budget
  ) trip_data;
  
  return coalesce(result, '{"total_trips": 0}'::json);
end;
$$ language plpgsql security definer;

-- Grant necessary permissions
grant usage on schema public to anon, authenticated;
grant all on public.trips to authenticated;
grant execute on function public.get_user_trip_stats to authenticated; 