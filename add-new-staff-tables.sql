-- Add New Staff Tables to Clinica Provider Schedule Database
-- This script adds Front Staff, Billing, and Behavioral Health staff tables
-- Run this script in your Supabase SQL editor

-- Create front_staff table
create table if not exists public.front_staff (
    id uuid default uuid_generate_v4() primary key,
    name text not null check (length(name) >= 1),
    color text not null check (length(color) >= 1),
    is_active boolean not null default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    user_id uuid references auth.users(id) on delete cascade not null
);

-- Create billing table
create table if not exists public.billing (
    id uuid default uuid_generate_v4() primary key,
    name text not null check (length(name) >= 1),
    color text not null check (length(color) >= 1),
    is_active boolean not null default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    user_id uuid references auth.users(id) on delete cascade not null
);

-- Create behavioral_health table
create table if not exists public.behavioral_health (
    id uuid default uuid_generate_v4() primary key,
    name text not null check (length(name) >= 1),
    color text not null check (length(color) >= 1),
    is_active boolean not null default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    user_id uuid references auth.users(id) on delete cascade not null
);

-- Add new columns to shifts table for the new staff types
alter table public.shifts 
add column if not exists front_staff_ids uuid[],
add column if not exists billing_ids uuid[],
add column if not exists behavioral_health_ids uuid[];

-- Create indexes for better performance
create index if not exists idx_front_staff_user_id on public.front_staff(user_id);
create index if not exists idx_front_staff_is_active on public.front_staff(is_active);
create index if not exists idx_front_staff_created_at on public.front_staff(created_at);

create index if not exists idx_billing_user_id on public.billing(user_id);
create index if not exists idx_billing_is_active on public.billing(is_active);
create index if not exists idx_billing_created_at on public.billing(created_at);

create index if not exists idx_behavioral_health_user_id on public.behavioral_health(user_id);
create index if not exists idx_behavioral_health_is_active on public.behavioral_health(is_active);
create index if not exists idx_behavioral_health_created_at on public.behavioral_health(created_at);

-- Add indexes for the new array columns in shifts
create index if not exists idx_shifts_front_staff_ids on public.shifts using gin(front_staff_ids);
create index if not exists idx_shifts_billing_ids on public.shifts using gin(billing_ids);
create index if not exists idx_shifts_behavioral_health_ids on public.shifts using gin(behavioral_health_ids);

-- Add updated_at trigger function if it doesn't exist
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at columns
create trigger if not exists update_front_staff_updated_at
    before update on public.front_staff
    for each row execute function public.update_updated_at_column();

create trigger if not exists update_billing_updated_at
    before update on public.billing
    for each row execute function public.update_updated_at_column();

create trigger if not exists update_behavioral_health_updated_at
    before update on public.behavioral_health
    for each row execute function public.update_updated_at_column();

-- Enable Row Level Security (RLS)
alter table public.front_staff enable row level security;
alter table public.billing enable row level security;
alter table public.behavioral_health enable row level security;

-- Create RLS policies for front_staff
create policy "Allow authenticated users to view front_staff" on public.front_staff
    for select using (auth.role() = 'authenticated');

create policy "Allow authenticated users to insert front_staff" on public.front_staff
    for insert with check (auth.role() = 'authenticated' and auth.uid() = user_id);

create policy "Allow users to update their own front_staff" on public.front_staff
    for update using (auth.uid() = user_id);

create policy "Allow users to delete their own front_staff" on public.front_staff
    for delete using (auth.uid() = user_id);

-- Create RLS policies for billing
create policy "Allow authenticated users to view billing" on public.billing
    for select using (auth.role() = 'authenticated');

create policy "Allow authenticated users to insert billing" on public.billing
    for insert with check (auth.role() = 'authenticated' and auth.uid() = user_id);

create policy "Allow users to update their own billing" on public.billing
    for update using (auth.uid() = user_id);

create policy "Allow users to delete their own billing" on public.billing
    for delete using (auth.uid() = user_id);

-- Create RLS policies for behavioral_health
create policy "Allow authenticated users to view behavioral_health" on public.behavioral_health
    for select using (auth.role() = 'authenticated');

create policy "Allow authenticated users to insert behavioral_health" on public.behavioral_health
    for insert with check (auth.role() = 'authenticated' and auth.uid() = user_id);

create policy "Allow users to update their own behavioral_health" on public.behavioral_health
    for update using (auth.uid() = user_id);

create policy "Allow users to delete their own behavioral_health" on public.behavioral_health
    for delete using (auth.uid() = user_id);

-- Grant necessary permissions
grant all on public.front_staff to authenticated;
grant all on public.billing to authenticated;
grant all on public.behavioral_health to authenticated;

-- Grant sequence permissions if using serial columns (not needed for uuid, but good practice)
grant usage on all sequences in schema public to authenticated;

-- Success message
select 'New staff tables created successfully! You can now add Front Staff, Billing, and Behavioral Health staff members.' as message;