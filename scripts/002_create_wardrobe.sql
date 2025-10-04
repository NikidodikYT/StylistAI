-- Create wardrobe items table
create table if not exists public.wardrobe_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  name text not null,
  category text not null, -- tops, bottoms, shoes, accessories, outerwear
  subcategory text, -- t-shirt, jeans, sneakers, etc.
  color text not null,
  brand text,
  season text[], -- spring, summer, fall, winter
  image_url text,
  purchase_date date,
  price numeric(10, 2),
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.wardrobe_items enable row level security;

-- RLS Policies for wardrobe_items
create policy "wardrobe_items_select_own"
  on public.wardrobe_items for select
  using (auth.uid() = user_id);

create policy "wardrobe_items_insert_own"
  on public.wardrobe_items for insert
  with check (auth.uid() = user_id);

create policy "wardrobe_items_update_own"
  on public.wardrobe_items for update
  using (auth.uid() = user_id);

create policy "wardrobe_items_delete_own"
  on public.wardrobe_items for delete
  using (auth.uid() = user_id);
