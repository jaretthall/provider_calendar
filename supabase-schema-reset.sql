-- Clinica Provider Schedule Database Schema - RESET VERSION
-- This file safely drops existing tables and recreates the entire schema fresh
-- Use this when you need to reset your database or when tables already exist

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Drop existing tables in reverse dependency order (to handle foreign key constraints)
drop table if exists public.shifts cascade;
drop table if exists public.user_settings cascade;
drop table if exists public.medical_assistants cascade;
drop table if exists public.clinic_types cascade;
drop table if exists public.providers cascade;

-- Drop existing functions
drop function if exists public.get_shift_conflicts(uuid, date, date, time, time, uuid);
drop function if exists public.handle_updated_at();

-- Create providers table
create table public.providers (
    id uuid default uuid_generate_v4() primary key,
    name text not null check (length(name) >= 1),
    color text not null check (length(color) >= 1),
    is_active boolean not null default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    user_id uuid references auth.users(id) on delete cascade not null
);

-- Create clinic_types table
create table public.clinic_types (
    id uuid default uuid_generate_v4() primary key,
    name text not null check (length(name) >= 1),
    color text not null check (length(color) >= 1),
    is_active boolean not null default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    user_id uuid references auth.users(id) on delete cascade not null
);

-- Create medical_assistants table
create table public.medical_assistants (
    id uuid default uuid_generate_v4() primary key,
    name text not null check (length(name) >= 1),
    color text not null check (length(color) >= 1),
    is_active boolean not null default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    user_id uuid references auth.users(id) on delete cascade not null
);

-- Create shifts table
create table public.shifts (
    id uuid default uuid_generate_v4() primary key,
    provider_id uuid references public.providers(id) on delete cascade not null,
    clinic_type_id uuid references public.clinic_types(id) on delete set null,
    medical_assistant_ids uuid[],
    title text,
    start_date date not null,
    end_date date not null,
    start_time time,
    end_time time,
    is_vacation boolean not null default false,
    notes text,
    color text not null,
    recurring_rule jsonb,
    series_id uuid,
    original_recurring_shift_id uuid,
    is_exception_instance boolean not null default false,
    exception_for_date date,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    created_by_user_id uuid references auth.users(id) on delete set null not null,
    user_id uuid references auth.users(id) on delete cascade not null,
    
    -- Constraints
    check (start_date <= end_date),
    check (start_time is null or end_time is null or start_time < end_time),
    check (not is_vacation or clinic_type_id is null) -- vacation shifts shouldn't have clinic types
);

-- Create user_settings table
create table public.user_settings (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) on delete cascade not null unique,
    settings jsonb not null default '{}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes for better performance
create index providers_user_id_idx on public.providers(user_id);
create index providers_name_idx on public.providers(name);
create index clinic_types_user_id_idx on public.clinic_types(user_id);
create index clinic_types_name_idx on public.clinic_types(name);
create index medical_assistants_user_id_idx on public.medical_assistants(user_id);
create index medical_assistants_name_idx on public.medical_assistants(name);
create index shifts_user_id_idx on public.shifts(user_id);
create index shifts_provider_id_idx on public.shifts(provider_id);
create index shifts_date_range_idx on public.shifts(start_date, end_date);
create index shifts_series_id_idx on public.shifts(series_id);
create index user_settings_user_id_idx on public.user_settings(user_id);

-- Enable Row Level Security (RLS)
alter table public.providers enable row level security;
alter table public.clinic_types enable row level security;
alter table public.medical_assistants enable row level security;
alter table public.shifts enable row level security;
alter table public.user_settings enable row level security;

-- Create RLS policies

-- Providers policies
create policy "Users can view their own providers" on public.providers
    for select using (auth.uid() = user_id);

create policy "Users can insert their own providers" on public.providers
    for insert with check (auth.uid() = user_id);

create policy "Users can update their own providers" on public.providers
    for update using (auth.uid() = user_id);

create policy "Users can delete their own providers" on public.providers
    for delete using (auth.uid() = user_id);

-- Clinic types policies
create policy "Users can view their own clinic types" on public.clinic_types
    for select using (auth.uid() = user_id);

create policy "Users can insert their own clinic types" on public.clinic_types
    for insert with check (auth.uid() = user_id);

create policy "Users can update their own clinic types" on public.clinic_types
    for update using (auth.uid() = user_id);

create policy "Users can delete their own clinic types" on public.clinic_types
    for delete using (auth.uid() = user_id);

-- Medical assistants policies
create policy "Users can view their own medical assistants" on public.medical_assistants
    for select using (auth.uid() = user_id);

create policy "Users can insert their own medical assistants" on public.medical_assistants
    for insert with check (auth.uid() = user_id);

create policy "Users can update their own medical assistants" on public.medical_assistants
    for update using (auth.uid() = user_id);

create policy "Users can delete their own medical assistants" on public.medical_assistants
    for delete using (auth.uid() = user_id);

-- Shifts policies
create policy "Users can view their own shifts" on public.shifts
    for select using (auth.uid() = user_id);

create policy "Users can insert their own shifts" on public.shifts
    for insert with check (auth.uid() = user_id and auth.uid() = created_by_user_id);

create policy "Users can update their own shifts" on public.shifts
    for update using (auth.uid() = user_id);

create policy "Users can delete their own shifts" on public.shifts
    for delete using (auth.uid() = user_id);

-- User settings policies
create policy "Users can view their own settings" on public.user_settings
    for select using (auth.uid() = user_id);

create policy "Users can insert their own settings" on public.user_settings
    for insert with check (auth.uid() = user_id);

create policy "Users can update their own settings" on public.user_settings
    for update using (auth.uid() = user_id);

create policy "Users can delete their own settings" on public.user_settings
    for delete using (auth.uid() = user_id);

-- Create functions for updated_at timestamps
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at
create trigger providers_updated_at before update on public.providers
    for each row execute procedure public.handle_updated_at();

create trigger clinic_types_updated_at before update on public.clinic_types
    for each row execute procedure public.handle_updated_at();

create trigger medical_assistants_updated_at before update on public.medical_assistants
    for each row execute procedure public.handle_updated_at();

create trigger shifts_updated_at before update on public.shifts
    for each row execute procedure public.handle_updated_at();

create trigger user_settings_updated_at before update on public.user_settings
    for each row execute procedure public.handle_updated_at();

-- Create a function to get shift conflicts
create or replace function public.get_shift_conflicts(
    p_provider_id uuid,
    p_start_date date,
    p_end_date date,
    p_start_time time,
    p_end_time time,
    p_exclude_shift_id uuid default null
)
returns table(shift_id uuid) as $$
begin
    return query
    select s.id
    from public.shifts s
    where s.provider_id = p_provider_id
      and s.user_id = auth.uid()
      and (p_exclude_shift_id is null or s.id != p_exclude_shift_id)
      and not s.is_vacation
      and (
        -- Date ranges overlap
        (s.start_date <= p_end_date and s.end_date >= p_start_date)
        and (
          -- Time ranges overlap (if both have times)
          (s.start_time is null or s.end_time is null or p_start_time is null or p_end_time is null)
          or (s.start_time < p_end_time and s.end_time > p_start_time)
        )
      );
end;
$$ language plpgsql security definer;

-- Grant permissions
grant usage on schema public to anon, authenticated;
grant all on all tables in schema public to authenticated;
grant all on all sequences in schema public to authenticated;
grant execute on all functions in schema public to authenticated;

-- Database reset complete!
-- Your database is now ready for the Clinica Provider Schedule application. 