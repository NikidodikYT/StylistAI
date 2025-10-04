-- Create outfits table
create table if not exists public.outfits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  name text not null,
  description text,
  occasion text, -- casual, work, party, date, etc.
  season text,
  is_favorite boolean default false,
  ai_generated boolean default false,
  image_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create outfit_items junction table (many-to-many relationship)
create table if not exists public.outfit_items (
  id uuid primary key default gen_random_uuid(),
  outfit_id uuid references public.outfits(id) on delete cascade,
  wardrobe_item_id uuid references public.wardrobe_items(id) on delete cascade,
  created_at timestamp with time zone default now(),
  unique(outfit_id, wardrobe_item_id)
);

-- Enable RLS
alter table public.outfits enable row level security;
alter table public.outfit_items enable row level security;

-- RLS Policies for outfits
create policy "outfits_select_own"
  on public.outfits for select
  using (auth.uid() = user_id);

create policy "outfits_insert_own"
  on public.outfits for insert
  with check (auth.uid() = user_id);

create policy "outfits_update_own"
  on public.outfits for update
  using (auth.uid() = user_id);

create policy "outfits_delete_own"
  on public.outfits for delete
  using (auth.uid() = user_id);

-- RLS Policies for outfit_items (check through outfit ownership)
create policy "outfit_items_select_own"
  on public.outfit_items for select
  using (
    exists (
      select 1 from public.outfits
      where outfits.id = outfit_items.outfit_id
      and outfits.user_id = auth.uid()
    )
  );

create policy "outfit_items_insert_own"
  on public.outfit_items for insert
  with check (
    exists (
      select 1 from public.outfits
      where outfits.id = outfit_items.outfit_id
      and outfits.user_id = auth.uid()
    )
  );

create policy "outfit_items_delete_own"
  on public.outfit_items for delete
  using (
    exists (
      select 1 from public.outfits
      where outfits.id = outfit_items.outfit_id
      and outfits.user_id = auth.uid()
    )
  );
