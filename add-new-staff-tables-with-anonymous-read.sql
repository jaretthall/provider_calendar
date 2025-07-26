-- Add New Staff Tables with Anonymous Read Access
-- This script adds the new staff tables and includes anonymous read policies
-- Use this if your application supports anonymous viewers

-- First run the main table creation script
\i add-new-staff-tables.sql

-- Add anonymous read policies for the new tables
create policy "Allow anonymous users to view front_staff" on public.front_staff
    for select using (true);

create policy "Allow anonymous users to view billing" on public.billing
    for select using (true);

create policy "Allow anonymous users to view behavioral_health" on public.behavioral_health
    for select using (true);

-- Grant select permissions to anonymous users
grant select on public.front_staff to anon;
grant select on public.billing to anon;
grant select on public.behavioral_health to anon;

-- Success message
select 'New staff tables created with anonymous read access!' as message;