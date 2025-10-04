-- Create user profiles table with style preferences
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  bio text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.profiles enable row level security;

-- RLS Policies for profiles
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

create policy "profiles_delete_own"
  on public.profiles for delete
  using (auth.uid() = id);

-- Create style preferences table
create table if not exists public.style_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  style_type text not null, -- casual, formal, streetwear, minimalist, etc.
  color_preferences text[], -- array of preferred colors
  season_preferences text[], -- spring, summer, fall, winter
  budget_range text, -- low, medium, high
  body_type text,
  preferred_brands text[],
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.style_preferences enable row level security;

-- RLS Policies for style_preferences
create policy "style_preferences_select_own"
  on public.style_preferences for select
  using (auth.uid() = user_id);

create policy "style_preferences_insert_own"
  on public.style_preferences for insert
  with check (auth.uid() = user_id);

create policy "style_preferences_update_own"
  on public.style_preferences for update
  using (auth.uid() = user_id);

create policy "style_preferences_delete_own"
  on public.style_preferences for delete
  using (auth.uid() = user_id);
