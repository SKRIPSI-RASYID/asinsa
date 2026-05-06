-- Create a table for public profiles
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  role text default 'user' check (role in ('user', 'admin')),

  constraint username_length check (char_length(username) >= 3)
);

-- Create categories table
create table categories (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create locations table
create table locations (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  address text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create assets table
create table assets (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  code text not null unique,
  category_id uuid references categories(id) on delete set null,
  location_id uuid references locations(id) on delete set null,
  purchase_year integer not null,
  purchase_price bigint not null,
  condition text not null check (condition in ('Baik', 'Rusak Ringan', 'Rusak Berat')),
  maintenance_cost bigint not null,
  expected_life integer not null,
  fuzzy_score float,
  fuzzy_status text,
  last_analyzed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_by uuid references auth.users(id) on delete set null
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;
alter table categories enable row level security;
alter table locations enable row level security;
alter table assets enable row level security;

-- Policies for Profiles
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can update own profiles." on profiles for update using (auth.uid() = id);

-- Policies for Categories (All authenticated users can read, only admins/authorized can write - keeping it simple for MVP)
create policy "Anyone can read categories" on categories for select using (true);
create policy "Authenticated users can manage categories" on categories for all using (auth.role() = 'authenticated');

-- Policies for Locations
create policy "Anyone can read locations" on locations for select using (true);
create policy "Authenticated users can manage locations" on locations for all using (auth.role() = 'authenticated');

-- Policies for Assets
create policy "Anyone can read assets" on assets for select using (true);
create policy "Authenticated users can manage assets" on assets for all using (auth.role() = 'authenticated');

-- Trigger for new user profile
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
