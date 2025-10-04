-- Create ratings table for outfit recommendations
create table if not exists public.outfit_ratings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  outfit_id uuid references public.outfits(id) on delete cascade,
  rating integer check (rating >= 1 and rating <= 5),
  feedback text,
  created_at timestamp with time zone default now(),
  unique(user_id, outfit_id)
);

-- Enable RLS
alter table public.outfit_ratings enable row level security;

-- RLS Policies for outfit_ratings
create policy "outfit_ratings_select_own"
  on public.outfit_ratings for select
  using (auth.uid() = user_id);

create policy "outfit_ratings_insert_own"
  on public.outfit_ratings for insert
  with check (auth.uid() = user_id);

create policy "outfit_ratings_update_own"
  on public.outfit_ratings for update
  using (auth.uid() = user_id);

create policy "outfit_ratings_delete_own"
  on public.outfit_ratings for delete
  using (auth.uid() = user_id);
