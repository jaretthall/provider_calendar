-- Clinica Provider Schedule Database Schema for Supabase
-- This file contains all the SQL commands needed to set up the database

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create user roles enum
create type user_role as enum ('view_only', 'admin');

-- Create user_profiles table
create table public.user_profiles (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) on delete cascade not null unique,
    email text not null,
    role user_role not null default 'view_only',
    first_name text,
    last_name text,
    is_active boolean not null default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

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

-- Create audit_log table for tracking changes
create table public.audit_log (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) on delete set null not null,
    table_name text not null,
    record_id uuid not null,
    action text not null check (action in ('create', 'update', 'delete')),
    old_values jsonb,
    new_values jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes for better performance
create index user_profiles_user_id_idx on public.user_profiles(user_id);
create index user_profiles_email_idx on public.user_profiles(email);
create index user_profiles_role_idx on public.user_profiles(role);
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
create index audit_log_user_id_idx on public.audit_log(user_id);
create index audit_log_table_record_idx on public.audit_log(table_name, record_id);

-- Enable Row Level Security (RLS)
alter table public.user_profiles enable row level security;
alter table public.providers enable row level security;
alter table public.clinic_types enable row level security;
alter table public.medical_assistants enable row level security;
alter table public.shifts enable row level security;
alter table public.user_settings enable row level security;
alter table public.audit_log enable row level security;

-- Create helper function to get user role
create or replace function public.get_user_role(user_uuid uuid)
returns user_role as $$
declare
    user_role_result user_role;
begin
    select role into user_role_result
    from public.user_profiles
    where user_id = user_uuid and is_active = true;
    
    return coalesce(user_role_result, 'view_only');
end;
$$ language plpgsql security definer;

-- Create helper function to check if user is admin
create or replace function public.is_admin(user_uuid uuid default auth.uid())
returns boolean as $$
begin
    return public.get_user_role(user_uuid) = 'admin';
end;
$$ language plpgsql security definer;

-- Create RLS policies for user_profiles
create policy "Users can view their own profile" on public.user_profiles
    for select using (auth.uid() = user_id);

create policy "Users can update their own profile" on public.user_profiles
    for update using (auth.uid() = user_id);

create policy "System can insert profiles" on public.user_profiles
    for insert with check (true);

-- Admin-only policies for user management
create policy "Admins can view all profiles" on public.user_profiles
    for select using (public.is_admin());

create policy "Admins can update user roles" on public.user_profiles
    for update using (public.is_admin());

-- Create RLS policies for data tables with role-based access

-- Providers policies (view-only and admin access)
create policy "Authenticated users can view providers" on public.providers
    for select using (auth.uid() = user_id and public.get_user_role(auth.uid()) in ('view_only', 'admin'));

create policy "Admins can insert providers" on public.providers
    for insert with check (auth.uid() = user_id and public.is_admin());

create policy "Admins can update providers" on public.providers
    for update using (auth.uid() = user_id and public.is_admin());

create policy "Admins can delete providers" on public.providers
    for delete using (auth.uid() = user_id and public.is_admin());

-- Clinic types policies
create policy "Authenticated users can view clinic types" on public.clinic_types
    for select using (auth.uid() = user_id and public.get_user_role(auth.uid()) in ('view_only', 'admin'));

create policy "Admins can insert clinic types" on public.clinic_types
    for insert with check (auth.uid() = user_id and public.is_admin());

create policy "Admins can update clinic types" on public.clinic_types
    for update using (auth.uid() = user_id and public.is_admin());

create policy "Admins can delete clinic types" on public.clinic_types
    for delete using (auth.uid() = user_id and public.is_admin());

-- Medical assistants policies
create policy "Authenticated users can view medical assistants" on public.medical_assistants
    for select using (auth.uid() = user_id and public.get_user_role(auth.uid()) in ('view_only', 'admin'));

create policy "Admins can insert medical assistants" on public.medical_assistants
    for insert with check (auth.uid() = user_id and public.is_admin());

create policy "Admins can update medical assistants" on public.medical_assistants
    for update using (auth.uid() = user_id and public.is_admin());

create policy "Admins can delete medical assistants" on public.medical_assistants
    for delete using (auth.uid() = user_id and public.is_admin());

-- Shifts policies
create policy "Authenticated users can view shifts" on public.shifts
    for select using (auth.uid() = user_id and public.get_user_role(auth.uid()) in ('view_only', 'admin'));

create policy "Admins can insert shifts" on public.shifts
    for insert with check (auth.uid() = user_id and public.is_admin() and auth.uid() = created_by_user_id);

create policy "Admins can update shifts" on public.shifts
    for update using (auth.uid() = user_id and public.is_admin());

create policy "Admins can delete shifts" on public.shifts
    for delete using (auth.uid() = user_id and public.is_admin());

-- User settings policies
create policy "Users can view their own settings" on public.user_settings
    for select using (auth.uid() = user_id);

create policy "Users can insert their own settings" on public.user_settings
    for insert with check (auth.uid() = user_id);

create policy "Users can update their own settings" on public.user_settings
    for update using (auth.uid() = user_id);

create policy "Users can delete their own settings" on public.user_settings
    for delete using (auth.uid() = user_id);

-- Audit log policies
create policy "Users can view audit logs for their data" on public.audit_log
    for select using (auth.uid() = user_id);

create policy "System can insert audit logs" on public.audit_log
    for insert with check (true);

create policy "Admins can view all audit logs" on public.audit_log
    for select using (public.is_admin());

-- Create functions for updated_at timestamps
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at
create trigger user_profiles_updated_at before update on public.user_profiles
    for each row execute procedure public.handle_updated_at();

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

-- Function to create user profile after signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.user_profiles (user_id, email, role, first_name, last_name)
    values (
        new.id,
        new.email,
        'admin', -- First user is admin, subsequent users default to view_only
        new.raw_user_meta_data->>'first_name',
        new.raw_user_meta_data->>'last_name'
    );
    return new;
end;
$$ language plpgsql security definer;

-- Trigger to create user profile on signup
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();

-- Function to handle audit logging
create or replace function public.handle_audit_log()
returns trigger as $$
begin
    if TG_OP = 'DELETE' then
        insert into public.audit_log (user_id, table_name, record_id, action, old_values)
        values (auth.uid(), TG_TABLE_NAME, old.id, 'delete', to_jsonb(old));
        return old;
    elsif TG_OP = 'UPDATE' then
        insert into public.audit_log (user_id, table_name, record_id, action, old_values, new_values)
        values (auth.uid(), TG_TABLE_NAME, new.id, 'update', to_jsonb(old), to_jsonb(new));
        return new;
    elsif TG_OP = 'INSERT' then
        insert into public.audit_log (user_id, table_name, record_id, action, new_values)
        values (auth.uid(), TG_TABLE_NAME, new.id, 'create', to_jsonb(new));
        return new;
    end if;
    return null;
end;
$$ language plpgsql security definer;

-- Create audit triggers for all data tables
create trigger providers_audit_trigger
    after insert or update or delete on public.providers
    for each row execute procedure public.handle_audit_log();

create trigger clinic_types_audit_trigger
    after insert or update or delete on public.clinic_types
    for each row execute procedure public.handle_audit_log();

create trigger medical_assistants_audit_trigger
    after insert or update or delete on public.medical_assistants
    for each row execute procedure public.handle_audit_log();

create trigger shifts_audit_trigger
    after insert or update or delete on public.shifts
    for each row execute procedure public.handle_audit_log();

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
        and
        -- Time ranges overlap (if both have times)
        (
          (p_start_time is null or p_end_time is null or s.start_time is null or s.end_time is null)
          or
          (s.start_time < p_end_time and s.end_time > p_start_time)
        )
      );
end;
$$ language plpgsql security definer; 