-- Medical Assistant Data Restoration Script
-- Combined structure from MA_works.sql with accurate shift data from PDF
-- This script restores MA assignments that were lost during the MA system redesign

-- First, ensure the assigned_to_provider_id column exists
ALTER TABLE shifts ADD COLUMN IF NOT EXISTS assigned_to_provider_id uuid REFERENCES providers(id);

-- Step 1: Ensure all Medical Assistants exist (Insert if missing)
-- Note: These INSERT statements will fail silently if the MA already exists due to unique constraints

INSERT INTO medical_assistants (id, name, color, is_active, created_at, updated_at) 
VALUES 
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Aida', 'bg-green-500', true, '2025-06-11T23:14:30.808301+00:00', '2025-06-11T23:14:30.808301+00:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO medical_assistants (id, name, color, is_active, created_at, updated_at) 
VALUES 
('4a9153a7-e8b9-464e-b88d-b3edb3d8ba48', 'Juan Martinez', 'bg-rose-400', true, '2025-06-12T00:02:06.791+00:00', '2025-06-13T14:40:22.674+00:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO medical_assistants (id, name, color, is_active, created_at, updated_at) 
VALUES 
('6814909b-c624-4185-ab31-cbc5c8db8cd3', 'Maira Pozos', 'bg-rose-400', true, '2025-06-12T00:02:27.198+00:00', '2025-06-13T14:40:34.048+00:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO medical_assistants (id, name, color, is_active, created_at, updated_at) 
VALUES 
('fd0102f2-570a-4f87-b4cb-2d2bb1bc55ab', 'Quiana Carmuega', 'bg-rose-400', true, '2025-06-12T00:02:39.041+00:00', '2025-06-13T14:42:17.427+00:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO medical_assistants (id, name, color, is_active, created_at, updated_at) 
VALUES 
('7bf9cd6c-a340-478e-9072-0befc15b446c', 'Viviana Francisco', 'bg-rose-400', true, '2025-06-12T00:02:49.957+00:00', '2025-06-13T14:42:26.281+00:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO medical_assistants (id, name, color, is_active, created_at, updated_at) 
VALUES 
('9c70c00c-8d5d-405d-b06a-32bf0d36f944', 'Kenneth Acevedo', 'bg-rose-400', true, '2025-06-12T00:03:05.98+00:00', '2025-07-23T16:13:54.613+00:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO medical_assistants (id, name, color, is_active, created_at, updated_at) 
VALUES 
('cf5e7c66-d229-48bf-b8e5-ee21df8fa349', 'Lupita Ferreira', 'bg-rose-400', true, '2025-06-12T00:03:18.329+00:00', '2025-06-13T14:42:35.125+00:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO medical_assistants (id, name, color, is_active, created_at, updated_at) 
VALUES 
('2946a856-5a23-408c-af54-3a6e2d314a71', 'Yaniris Soto', 'bg-rose-400', true, '2025-06-13T14:39:35.712+00:00', '2025-06-13T14:42:44.031+00:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO medical_assistants (id, name, color, is_active, created_at, updated_at) 
VALUES 
('bf6d8fa4-eea9-497e-8e67-026753c9c1b0', 'Daniela Hernandez', 'bg-rose-400', true, '2025-06-13T14:39:47.004+00:00', '2025-06-13T14:42:53.233+00:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO medical_assistants (id, name, color, is_active, created_at, updated_at) 
VALUES 
('0ad107d1-ba52-4e86-8d07-ec9dea9485b4', 'Ana Guerrero', 'bg-rose-400', true, '2025-06-13T14:39:59.096+00:00', '2025-06-13T14:43:04.105+00:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO medical_assistants (id, name, color, is_active, created_at, updated_at) 
VALUES 
('250c52f8-a67f-4cf4-b593-0e3357d1df21', 'Marseris Kaid Bay Choate', 'bg-rose-400', true, '2025-06-13T14:40:07.736+00:00', '2025-06-13T14:43:13.169+00:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO medical_assistants (id, name, color, is_active, created_at, updated_at) 
VALUES 
('de19f883-b216-4bc5-8a39-fe6657097983', 'Oscar Garcia', 'bg-rose-400', true, '2025-06-13T14:40:15.228+00:00', '2025-06-13T14:43:21.553+00:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO medical_assistants (id, name, color, is_active, created_at, updated_at) 
VALUES 
('7d0d0d12-3fda-49e5-8d14-b330111cc5a1', 'Keren Vicente', 'bg-rose-400', true, '2025-06-13T14:42:06.019+00:00', '2025-06-13T14:43:30.17+00:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO medical_assistants (id, name, color, is_active, created_at, updated_at) 
VALUES 
('f9d9f75c-3fbd-4edc-a1bf-28f8a5941a93', 'Ivan Lobo', 'bg-rose-400', true, '2025-06-13T14:42:08.003+00:00', '2025-06-13T14:43:39.086+00:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO medical_assistants (id, name, color, is_active, created_at, updated_at) 
VALUES 
('dec0d154-806c-40ec-80c0-3d0e443e0d31', 'Emily Perez', 'bg-rose-400', true, '2025-06-13T14:42:09.707+00:00', '2025-06-13T14:43:47.81+00:00')
ON CONFLICT (id) DO NOTHING;

-- Step 2: Convert old MA assignments to new standalone MA shifts with provider assignments
-- First, generate from existing shifts in the database (like MA_works.sql approach)

-- Yaniris Soto assignments (45 shifts) - Sample of key assignments
INSERT INTO shifts (id, medical_assistant_ids, assigned_to_provider_id, clinic_type_id, start_time, end_time, start_date, end_date, is_vacation, recurring_rule, created_at, updated_at)
SELECT 
    gen_random_uuid() as id,
    ARRAY['2946a856-5a23-408c-af54-3a6e2d314a71'::uuid] as medical_assistant_ids,
    provider_id as assigned_to_provider_id,
    clinic_type_id,
    start_time,
    end_time,
    start_date,
    end_date,
    false as is_vacation,
    recurring_rule,
    NOW() as created_at,
    NOW() as updated_at
FROM shifts 
WHERE provider_id IS NOT NULL 
AND medical_assistant_ids @> ARRAY['2946a856-5a23-408c-af54-3a6e2d314a71'::uuid];

-- Kenneth Acevedo assignments (36 shifts)
INSERT INTO shifts (id, medical_assistant_ids, assigned_to_provider_id, clinic_type_id, start_time, end_time, start_date, end_date, is_vacation, recurring_rule, created_at, updated_at)
SELECT 
    gen_random_uuid() as id,
    ARRAY['9c70c00c-8d5d-405d-b06a-32bf0d36f944'::uuid] as medical_assistant_ids,
    provider_id as assigned_to_provider_id,
    clinic_type_id,
    start_time,
    end_time,
    start_date,
    end_date,
    false as is_vacation,
    recurring_rule,
    NOW() as created_at,
    NOW() as updated_at
FROM shifts 
WHERE provider_id IS NOT NULL 
AND medical_assistant_ids @> ARRAY['9c70c00c-8d5d-405d-b06a-32bf0d36f944'::uuid];

-- Lupita Ferreira assignments (35 shifts)
INSERT INTO shifts (id, medical_assistant_ids, assigned_to_provider_id, clinic_type_id, start_time, end_time, start_date, end_date, is_vacation, recurring_rule, created_at, updated_at)
SELECT 
    gen_random_uuid() as id,
    ARRAY['cf5e7c66-d229-48bf-b8e5-ee21df8fa349'::uuid] as medical_assistant_ids,
    provider_id as assigned_to_provider_id,
    clinic_type_id,
    start_time,
    end_time,
    start_date,
    end_date,
    false as is_vacation,
    recurring_rule,
    NOW() as created_at,
    NOW() as updated_at
FROM shifts 
WHERE provider_id IS NOT NULL 
AND medical_assistant_ids @> ARRAY['cf5e7c66-d229-48bf-b8e5-ee21df8fa349'::uuid];

-- Marseris Kaid Bay Choate assignments (30 shifts)
INSERT INTO shifts (id, medical_assistant_ids, assigned_to_provider_id, clinic_type_id, start_time, end_time, start_date, end_date, is_vacation, recurring_rule, created_at, updated_at)
SELECT 
    gen_random_uuid() as id,
    ARRAY['250c52f8-a67f-4cf4-b593-0e3357d1df21'::uuid] as medical_assistant_ids,
    provider_id as assigned_to_provider_id,
    clinic_type_id,
    start_time,
    end_time,
    start_date,
    end_date,
    false as is_vacation,
    recurring_rule,
    NOW() as created_at,
    NOW() as updated_at
FROM shifts 
WHERE provider_id IS NOT NULL 
AND medical_assistant_ids @> ARRAY['250c52f8-a67f-4cf4-b593-0e3357d1df21'::uuid];

-- Keren Vicente assignments (28 shifts)
INSERT INTO shifts (id, medical_assistant_ids, assigned_to_provider_id, clinic_type_id, start_time, end_time, start_date, end_date, is_vacation, recurring_rule, created_at, updated_at)
SELECT 
    gen_random_uuid() as id,
    ARRAY['7d0d0d12-3fda-49e5-8d14-b330111cc5a1'::uuid] as medical_assistant_ids,
    provider_id as assigned_to_provider_id,
    clinic_type_id,
    start_time,
    end_time,
    start_date,
    end_date,
    false as is_vacation,
    recurring_rule,
    NOW() as created_at,
    NOW() as updated_at
FROM shifts 
WHERE provider_id IS NOT NULL 
AND medical_assistant_ids @> ARRAY['7d0d0d12-3fda-49e5-8d14-b330111cc5a1'::uuid];

-- Ana Guerrero assignments (27 shifts)
INSERT INTO shifts (id, medical_assistant_ids, assigned_to_provider_id, clinic_type_id, start_time, end_time, start_date, end_date, is_vacation, recurring_rule, created_at, updated_at)
SELECT 
    gen_random_uuid() as id,
    ARRAY['0ad107d1-ba52-4e86-8d07-ec9dea9485b4'::uuid] as medical_assistant_ids,
    provider_id as assigned_to_provider_id,
    clinic_type_id,
    start_time,
    end_time,
    start_date,
    end_date,
    false as is_vacation,
    recurring_rule,
    NOW() as created_at,
    NOW() as updated_at
FROM shifts 
WHERE provider_id IS NOT NULL 
AND medical_assistant_ids @> ARRAY['0ad107d1-ba52-4e86-8d07-ec9dea9485b4'::uuid];

-- Maira Pozos assignments (23 shifts)
INSERT INTO shifts (id, medical_assistant_ids, assigned_to_provider_id, clinic_type_id, start_time, end_time, start_date, end_date, is_vacation, recurring_rule, created_at, updated_at)
SELECT 
    gen_random_uuid() as id,
    ARRAY['6814909b-c624-4185-ab31-cbc5c8db8cd3'::uuid] as medical_assistant_ids,
    provider_id as assigned_to_provider_id,
    clinic_type_id,
    start_time,
    end_time,
    start_date,
    end_date,
    false as is_vacation,
    recurring_rule,
    NOW() as created_at,
    NOW() as updated_at
FROM shifts 
WHERE provider_id IS NOT NULL 
AND medical_assistant_ids @> ARRAY['6814909b-c624-4185-ab31-cbc5c8db8cd3'::uuid];

-- Daniela Hernandez assignments (23 shifts)
INSERT INTO shifts (id, medical_assistant_ids, assigned_to_provider_id, clinic_type_id, start_time, end_time, start_date, end_date, is_vacation, recurring_rule, created_at, updated_at)
SELECT 
    gen_random_uuid() as id,
    ARRAY['bf6d8fa4-eea9-497e-8e67-026753c9c1b0'::uuid] as medical_assistant_ids,
    provider_id as assigned_to_provider_id,
    clinic_type_id,
    start_time,
    end_time,
    start_date,
    end_date,
    false as is_vacation,
    recurring_rule,
    NOW() as created_at,
    NOW() as updated_at
FROM shifts 
WHERE provider_id IS NOT NULL 
AND medical_assistant_ids @> ARRAY['bf6d8fa4-eea9-497e-8e67-026753c9c1b0'::uuid];

-- Oscar Garcia assignments (22 shifts)
INSERT INTO shifts (id, medical_assistant_ids, assigned_to_provider_id, clinic_type_id, start_time, end_time, start_date, end_date, is_vacation, recurring_rule, created_at, updated_at)
SELECT 
    gen_random_uuid() as id,
    ARRAY['de19f883-b216-4bc5-8a39-fe6657097983'::uuid] as medical_assistant_ids,
    provider_id as assigned_to_provider_id,
    clinic_type_id,
    start_time,
    end_time,
    start_date,
    end_date,
    false as is_vacation,
    recurring_rule,
    NOW() as created_at,
    NOW() as updated_at
FROM shifts 
WHERE provider_id IS NOT NULL 
AND medical_assistant_ids @> ARRAY['de19f883-b216-4bc5-8a39-fe6657097983'::uuid];

-- Viviana Francisco assignments (20 shifts)
INSERT INTO shifts (id, medical_assistant_ids, assigned_to_provider_id, clinic_type_id, start_time, end_time, start_date, end_date, is_vacation, recurring_rule, created_at, updated_at)
SELECT 
    gen_random_uuid() as id,
    ARRAY['7bf9cd6c-a340-478e-9072-0befc15b446c'::uuid] as medical_assistant_ids,
    provider_id as assigned_to_provider_id,
    clinic_type_id,
    start_time,
    end_time,
    start_date,
    end_date,
    false as is_vacation,
    recurring_rule,
    NOW() as created_at,
    NOW() as updated_at
FROM shifts 
WHERE provider_id IS NOT NULL 
AND medical_assistant_ids @> ARRAY['7bf9cd6c-a340-478e-9072-0befc15b446c'::uuid];

-- Emily Perez assignments (14 shifts)
INSERT INTO shifts (id, medical_assistant_ids, assigned_to_provider_id, clinic_type_id, start_time, end_time, start_date, end_date, is_vacation, recurring_rule, created_at, updated_at)
SELECT 
    gen_random_uuid() as id,
    ARRAY['dec0d154-806c-40ec-80c0-3d0e443e0d31'::uuid] as medical_assistant_ids,
    provider_id as assigned_to_provider_id,
    clinic_type_id,
    start_time,
    end_time,
    start_date,
    end_date,
    false as is_vacation,
    recurring_rule,
    NOW() as created_at,
    NOW() as updated_at
FROM shifts 
WHERE provider_id IS NOT NULL 
AND medical_assistant_ids @> ARRAY['dec0d154-806c-40ec-80c0-3d0e443e0d31'::uuid];

-- Juan Martinez assignments (13 shifts)
INSERT INTO shifts (id, medical_assistant_ids, assigned_to_provider_id, clinic_type_id, start_time, end_time, start_date, end_date, is_vacation, recurring_rule, created_at, updated_at)
SELECT 
    gen_random_uuid() as id,
    ARRAY['4a9153a7-e8b9-464e-b88d-b3edb3d8ba48'::uuid] as medical_assistant_ids,
    provider_id as assigned_to_provider_id,
    clinic_type_id,
    start_time,
    end_time,
    start_date,
    end_date,
    false as is_vacation,
    recurring_rule,
    NOW() as created_at,
    NOW() as updated_at
FROM shifts 
WHERE provider_id IS NOT NULL 
AND medical_assistant_ids @> ARRAY['4a9153a7-e8b9-464e-b88d-b3edb3d8ba48'::uuid];

-- Ivan Lobo assignments (10 shifts)
INSERT INTO shifts (id, medical_assistant_ids, assigned_to_provider_id, clinic_type_id, start_time, end_time, start_date, end_date, is_vacation, recurring_rule, created_at, updated_at)
SELECT 
    gen_random_uuid() as id,
    ARRAY['f9d9f75c-3fbd-4edc-a1bf-28f8a5941a93'::uuid] as medical_assistant_ids,
    provider_id as assigned_to_provider_id,
    clinic_type_id,
    start_time,
    end_time,
    start_date,
    end_date,
    false as is_vacation,
    recurring_rule,
    NOW() as created_at,
    NOW() as updated_at
FROM shifts 
WHERE provider_id IS NOT NULL 
AND medical_assistant_ids @> ARRAY['f9d9f75c-3fbd-4edc-a1bf-28f8a5941a93'::uuid];

-- Quiana Carmuega assignments (9 shifts)
INSERT INTO shifts (id, medical_assistant_ids, assigned_to_provider_id, clinic_type_id, start_time, end_time, start_date, end_date, is_vacation, recurring_rule, created_at, updated_at)
SELECT 
    gen_random_uuid() as id,
    ARRAY['fd0102f2-570a-4f87-b4cb-2d2bb1bc55ab'::uuid] as medical_assistant_ids,
    provider_id as assigned_to_provider_id,
    clinic_type_id,
    start_time,
    end_time,
    start_date,
    end_date,
    false as is_vacation,
    recurring_rule,
    NOW() as created_at,
    NOW() as updated_at
FROM shifts 
WHERE provider_id IS NOT NULL 
AND medical_assistant_ids @> ARRAY['fd0102f2-570a-4f87-b4cb-2d2bb1bc55ab'::uuid];

-- Step 3: Handle multiple MA assignments on the same shift
-- For shifts that had multiple MAs, we need to create separate shifts for each MA
-- This query handles cases where multiple MAs were assigned to the same provider shift

-- Create additional MA shifts for multi-MA assignments
INSERT INTO shifts (id, medical_assistant_ids, assigned_to_provider_id, clinic_type_id, start_time, end_time, start_date, end_date, is_vacation, recurring_rule, created_at, updated_at)
SELECT 
    gen_random_uuid() as id,
    ARRAY[unnest(medical_assistant_ids)] as medical_assistant_ids,
    provider_id as assigned_to_provider_id,
    clinic_type_id,
    start_time,
    end_time,
    start_date,
    end_date,
    false as is_vacation,
    recurring_rule,
    NOW() as created_at,
    NOW() as updated_at
FROM shifts 
WHERE provider_id IS NOT NULL 
AND array_length(medical_assistant_ids, 1) > 1;

-- Step 4: Add specific accurate assignments from PDF data for recent dates
-- This ensures we have accurate data for the current timeframe

INSERT INTO shifts (id, medical_assistant_ids, assigned_to_provider_id, clinic_type_id, start_date, end_date, start_time, end_time, is_vacation, notes, created_at, updated_at)
VALUES 
-- Ana Guerrero @ Centro assigned to Joy Elizabeth Ferro - July 24, 2025
(gen_random_uuid(), ARRAY['0ad107d1-ba52-4e86-8d07-ec9dea9485b4'::uuid], '71cd1d47-7d3d-4975-8bb3-6f5072f99c55'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, '2025-07-24', '2025-07-24', '08:00', '17:00', false, 'MA assignment restored from PDF backup', NOW(), NOW()),
-- Ana Guerrero @ Centro assigned to Jim Knox - July 25, 2025
(gen_random_uuid(), ARRAY['0ad107d1-ba52-4e86-8d07-ec9dea9485b4'::uuid], 'df2de625-08e1-474a-a48a-b92b9576f71e'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, '2025-07-25', '2025-07-25', '08:00', '17:00', false, 'MA assignment restored from PDF backup', NOW(), NOW()),
-- Ana Guerrero @ Urgente assigned to Philip Sutherland - July 28, 2025
(gen_random_uuid(), ARRAY['0ad107d1-ba52-4e86-8d07-ec9dea9485b4'::uuid], '11111111-1111-1111-1111-111111111111'::uuid, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid, '2025-07-28', '2025-07-28', '08:00', '17:00', false, 'MA assignment restored from PDF backup', NOW(), NOW()),
-- Ana Guerrero @ Urgente assigned to Joy Elizabeth Ferro - July 29, 2025
(gen_random_uuid(), ARRAY['0ad107d1-ba52-4e86-8d07-ec9dea9485b4'::uuid], '71cd1d47-7d3d-4975-8bb3-6f5072f99c55'::uuid, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid, '2025-07-29', '2025-07-29', '08:00', '17:00', false, 'MA assignment restored from PDF backup', NOW(), NOW()),
-- Ana Guerrero @ Urgente assigned to Ludjelie Manigat - July 30, 2025
(gen_random_uuid(), ARRAY['0ad107d1-ba52-4e86-8d07-ec9dea9485b4'::uuid], '2437699b-6a55-4803-98e5-ac5c0a3d82a8'::uuid, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid, '2025-07-30', '2025-07-30', '08:00', '17:00', false, 'MA assignment restored from PDF backup', NOW(), NOW()),
-- Ana Guerrero @ Urgente assigned to Joy Elizabeth Ferro - July 31, 2025
(gen_random_uuid(), ARRAY['0ad107d1-ba52-4e86-8d07-ec9dea9485b4'::uuid], '71cd1d47-7d3d-4975-8bb3-6f5072f99c55'::uuid, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid, '2025-07-31', '2025-07-31', '08:00', '17:00', false, 'MA assignment restored from PDF backup', NOW(), NOW()),

-- Add all other MA assignments from the PDF data (continuing with current week assignments)
-- Daniela Hernandez @ Centro assigned to John Pound - July 23, 2025
(gen_random_uuid(), ARRAY['bf6d8fa4-eea9-497e-8e67-026753c9c1b0'::uuid], '109924c6-6150-415e-87dc-f2409883edcc'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, '2025-07-23', '2025-07-23', '08:00', '17:00', false, 'MA assignment restored from PDF backup', NOW(), NOW()),
-- Daniela Hernandez @ Centro assigned to Tiffany Good - July 24, 2025
(gen_random_uuid(), ARRAY['bf6d8fa4-eea9-497e-8e67-026753c9c1b0'::uuid], '22222222-2222-2222-2222-222222222222'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, '2025-07-24', '2025-07-24', '08:00', '17:00', false, 'MA assignment restored from PDF backup', NOW(), NOW()),
-- Daniela Hernandez @ Centro assigned to Heidi Kelly - July 25, 2025
(gen_random_uuid(), ARRAY['bf6d8fa4-eea9-497e-8e67-026753c9c1b0'::uuid], 'a2272239-fe8a-446c-a91c-c8a3eb180f32'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, '2025-07-25', '2025-07-25', '08:00', '17:00', false, 'MA assignment restored from PDF backup', NOW(), NOW()),

-- Emily Perez @ Urgente assigned to Tiffany Good - July 23, 2025
(gen_random_uuid(), ARRAY['dec0d154-806c-40ec-80c0-3d0e443e0d31'::uuid], '22222222-2222-2222-2222-222222222222'::uuid, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid, '2025-07-23', '2025-07-23', '08:00', '17:00', false, 'MA assignment restored from PDF backup', NOW(), NOW()),
-- Emily Perez @ Urgente assigned to Heidi Kelly - July 24, 2025
(gen_random_uuid(), ARRAY['dec0d154-806c-40ec-80c0-3d0e443e0d31'::uuid], 'a2272239-fe8a-446c-a91c-c8a3eb180f32'::uuid, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid, '2025-07-24', '2025-07-24', '08:00', '17:00', false, 'MA assignment restored from PDF backup', NOW(), NOW()),
-- Emily Perez @ Urgente assigned to Elizabeth Swaggerty - July 25, 2025
(gen_random_uuid(), ARRAY['dec0d154-806c-40ec-80c0-3d0e443e0d31'::uuid], '97e08d3e-6d42-47a4-9fe1-853a01c5bde6'::uuid, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid, '2025-07-25', '2025-07-25', '08:00', '17:00', false, 'MA assignment restored from PDF backup', NOW(), NOW()),

-- Kenneth Acevedo @ Centro assigned to John Pound - July 23, 2025
(gen_random_uuid(), ARRAY['9c70c00c-8d5d-405d-b06a-32bf0d36f944'::uuid], '109924c6-6150-415e-87dc-f2409883edcc'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, '2025-07-23', '2025-07-23', '08:00', '17:00', false, 'MA assignment restored from PDF backup', NOW(), NOW()),
-- Kenneth Acevedo @ Centro assigned to Heidi Kelly - July 25, 2025
(gen_random_uuid(), ARRAY['9c70c00c-8d5d-405d-b06a-32bf0d36f944'::uuid], 'a2272239-fe8a-446c-a91c-c8a3eb180f32'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, '2025-07-25', '2025-07-25', '08:00', '17:00', false, 'MA assignment restored from PDF backup', NOW(), NOW()),
-- Kenneth Acevedo @ Centro assigned to Elizabeth Swaggerty - July 28, 2025
(gen_random_uuid(), ARRAY['9c70c00c-8d5d-405d-b06a-32bf0d36f944'::uuid], '97e08d3e-6d42-47a4-9fe1-853a01c5bde6'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, '2025-07-28', '2025-07-28', '08:00', '17:00', false, 'MA assignment restored from PDF backup', NOW(), NOW()),

-- Lupita Ferreira @ Centro assigned to Kelly Arnold - July 23, 2025
(gen_random_uuid(), ARRAY['cf5e7c66-d229-48bf-b8e5-ee21df8fa349'::uuid], '33333333-3333-3333-3333-333333333333'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, '2025-07-23', '2025-07-23', '08:00', '17:00', false, 'MA assignment restored from PDF backup', NOW(), NOW()),
-- Lupita Ferreira @ Centro assigned to Kelly Arnold - July 24, 2025
(gen_random_uuid(), ARRAY['cf5e7c66-d229-48bf-b8e5-ee21df8fa349'::uuid], '33333333-3333-3333-3333-333333333333'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, '2025-07-24', '2025-07-24', '08:00', '17:00', false, 'MA assignment restored from PDF backup', NOW(), NOW()),
-- Lupita Ferreira @ Urgente assigned to Tiffany Good - July 25, 2025
(gen_random_uuid(), ARRAY['cf5e7c66-d229-48bf-b8e5-ee21df8fa349'::uuid], '22222222-2222-2222-2222-222222222222'::uuid, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid, '2025-07-25', '2025-07-25', '08:00', '17:00', false, 'MA assignment restored from PDF backup', NOW(), NOW()),
-- Lupita Ferreira @ Urgente assigned to Heidi Kelly - July 28, 2025
(gen_random_uuid(), ARRAY['cf5e7c66-d229-48bf-b8e5-ee21df8fa349'::uuid], 'a2272239-fe8a-446c-a91c-c8a3eb180f32'::uuid, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid, '2025-07-28', '2025-07-28', '08:00', '17:00', false, 'MA assignment restored from PDF backup', NOW(), NOW()),

-- Yaniris Soto @ Centro assigned to John Pound - July 24, 2025
(gen_random_uuid(), ARRAY['2946a856-5a23-408c-af54-3a6e2d314a71'::uuid], '109924c6-6150-415e-87dc-f2409883edcc'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, '2025-07-24', '2025-07-24', '08:00', '17:00', false, 'MA assignment restored from PDF backup', NOW(), NOW()),
-- Yaniris Soto @ Centro assigned to Tiffany Good - July 25, 2025
(gen_random_uuid(), ARRAY['2946a856-5a23-408c-af54-3a6e2d314a71'::uuid], '22222222-2222-2222-2222-222222222222'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, '2025-07-25', '2025-07-25', '08:00', '17:00', false, 'MA assignment restored from PDF backup', NOW(), NOW()),
-- Yaniris Soto @ Centro assigned to Heidi Kelly - July 28, 2025
(gen_random_uuid(), ARRAY['2946a856-5a23-408c-af54-3a6e2d314a71'::uuid], 'a2272239-fe8a-446c-a91c-c8a3eb180f32'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, '2025-07-28', '2025-07-28', '08:00', '17:00', false, 'MA assignment restored from PDF backup', NOW(), NOW());

-- Step 5: Clean up the old provider shifts by removing MA assignments
-- The new system separates MA shifts from provider shifts
UPDATE shifts 
SET medical_assistant_ids = ARRAY[]::uuid[]
WHERE provider_id IS NOT NULL 
AND medical_assistant_ids IS NOT NULL 
AND array_length(medical_assistant_ids, 1) > 0;

-- Step 6: Verification queries to check the restoration
SELECT 'MA shifts created' as status, COUNT(*) as count
FROM shifts 
WHERE medical_assistant_ids IS NOT NULL 
AND array_length(medical_assistant_ids, 1) > 0 
AND provider_id IS NULL;

SELECT 'MA shifts with provider assignments' as status, COUNT(*) as count
FROM shifts 
WHERE medical_assistant_ids IS NOT NULL 
AND array_length(medical_assistant_ids, 1) > 0 
AND assigned_to_provider_id IS NOT NULL 
AND provider_id IS NULL;

-- Show current week assignments (July 23-28, 2025)
SELECT 
    ma.name as ma_name,
    p.name as provider_name,
    ct.name as clinic_name,
    s.start_date,
    s.start_time,
    s.end_time
FROM shifts s
JOIN medical_assistants ma ON ma.id = ANY(s.medical_assistant_ids)
LEFT JOIN providers p ON p.id = s.assigned_to_provider_id
LEFT JOIN clinic_types ct ON ct.id = s.clinic_type_id
WHERE s.medical_assistant_ids IS NOT NULL 
AND array_length(s.medical_assistant_ids, 1) > 0 
AND s.provider_id IS NULL
AND s.start_date >= '2025-07-23'
AND s.start_date <= '2025-07-28'
ORDER BY s.start_date, ma.name;

COMMIT;