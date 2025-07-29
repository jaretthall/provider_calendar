-- Medical Assistant Data Restoration Script (Based on Schedule PDF 2025-07-23 to 2025-08-23)
-- This script creates accurate MA assignments based on the detailed schedule data

-- First, ensure the assigned_to_provider_id column exists
ALTER TABLE shifts ADD COLUMN IF NOT EXISTS assigned_to_provider_id uuid REFERENCES providers(id);

-- Clear any existing MA assignments from provider shifts (cleanup from old system)
UPDATE shifts 
SET medical_assistant_ids = ARRAY[]::uuid[]
WHERE provider_id IS NOT NULL 
AND medical_assistant_ids IS NOT NULL 
AND array_length(medical_assistant_ids, 1) > 0;

-- Delete any existing standalone MA shifts to avoid duplicates
DELETE FROM shifts 
WHERE provider_id IS NULL 
AND medical_assistant_ids IS NOT NULL 
AND array_length(medical_assistant_ids, 1) > 0;

-- Create MA assignments based on the schedule PDF data
-- The PDF shows specific MA assignments with dates, times, and provider assignments

-- Ana Guerrero assignments
INSERT INTO shifts (id, medical_assistant_ids, assigned_to_provider_id, clinic_type_id, start_date, end_date, start_time, end_time, is_vacation, notes, created_at, updated_at)
VALUES 
-- Ana Guerrero @ Centro assigned to Joy Elizabeth Ferro - July 24, 2025
(gen_random_uuid(), ARRAY['0ad107d1-ba52-4e86-8d07-ec9dea9485b4'], '71cd1d47-7d3d-4975-8bb3-6f5072f99c55', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2025-07-24', '2025-07-24', '08:00', '17:00', false, 'MA assignment restored from backup', NOW(), NOW()),
-- Ana Guerrero @ Centro assigned to Jim Knox - July 25, 2025
(gen_random_uuid(), ARRAY['0ad107d1-ba52-4e86-8d07-ec9dea9485b4'], 'df2de625-08e1-474a-a48a-b92b9576f71e', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2025-07-25', '2025-07-25', '08:00', '17:00', false, 'MA assignment restored from backup', NOW(), NOW()),
-- Ana Guerrero @ Urgente assigned to Philip Sutherland - July 28, 2025
(gen_random_uuid(), ARRAY['0ad107d1-ba52-4e86-8d07-ec9dea9485b4'], '11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2025-07-28', '2025-07-28', '08:00', '17:00', false, 'MA assignment restored from backup', NOW(), NOW()),
-- Ana Guerrero @ Urgente assigned to Joy Elizabeth Ferro - July 29, 2025
(gen_random_uuid(), ARRAY['0ad107d1-ba52-4e86-8d07-ec9dea9485b4'], '71cd1d47-7d3d-4975-8bb3-6f5072f99c55', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2025-07-29', '2025-07-29', '08:00', '17:00', false, 'MA assignment restored from backup', NOW(), NOW()),
-- Ana Guerrero @ Urgente assigned to Ludjelie Manigat - July 30, 2025
(gen_random_uuid(), ARRAY['0ad107d1-ba52-4e86-8d07-ec9dea9485b4'], '2437699b-6a55-4803-98e5-ac5c0a3d82a8', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2025-07-30', '2025-07-30', '08:00', '17:00', false, 'MA assignment restored from backup', NOW(), NOW()),
-- Ana Guerrero @ Urgente assigned to Joy Elizabeth Ferro - July 31, 2025
(gen_random_uuid(), ARRAY['0ad107d1-ba52-4e86-8d07-ec9dea9485b4'], '71cd1d47-7d3d-4975-8bb3-6f5072f99c55', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2025-07-31', '2025-07-31', '08:00', '17:00', false, 'MA assignment restored from backup', NOW(), NOW()),

-- Daniela Hernandez assignments
-- Daniela Hernandez @ Centro assigned to John Pound - July 23, 2025
(gen_random_uuid(), ARRAY['bf6d8fa4-eea9-497e-8e67-026753c9c1b0'], '109924c6-6150-415e-87dc-f2409883edcc', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2025-07-23', '2025-07-23', '08:00', '17:00', false, 'MA assignment restored from backup', NOW(), NOW()),
-- Daniela Hernandez @ Centro assigned to Tiffany Good - July 24, 2025
(gen_random_uuid(), ARRAY['bf6d8fa4-eea9-497e-8e67-026753c9c1b0'], '22222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2025-07-24', '2025-07-24', '08:00', '17:00', false, 'MA assignment restored from backup', NOW(), NOW()),
-- Daniela Hernandez @ Centro assigned to Heidi Kelly - July 25, 2025
(gen_random_uuid(), ARRAY['bf6d8fa4-eea9-497e-8e67-026753c9c1b0'], 'a2272239-fe8a-446c-a91c-c8a3eb180f32', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2025-07-25', '2025-07-25', '08:00', '17:00', false, 'MA assignment restored from backup', NOW(), NOW()),

-- Emily Perez assignments
-- Emily Perez @ Urgente assigned to Tiffany Good - July 23, 2025
(gen_random_uuid(), ARRAY['dec0d154-806c-40ec-80c0-3d0e443e0d31'], '22222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2025-07-23', '2025-07-23', '08:00', '17:00', false, 'MA assignment restored from backup', NOW(), NOW()),
-- Emily Perez @ Urgente assigned to Heidi Kelly - July 24, 2025
(gen_random_uuid(), ARRAY['dec0d154-806c-40ec-80c0-3d0e443e0d31'], 'a2272239-fe8a-446c-a91c-c8a3eb180f32', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2025-07-24', '2025-07-24', '08:00', '17:00', false, 'MA assignment restored from backup', NOW(), NOW()),
-- Emily Perez @ Urgente assigned to Elizabeth Swaggerty - July 25, 2025
(gen_random_uuid(), ARRAY['dec0d154-806c-40ec-80c0-3d0e443e0d31'], '97e08d3e-6d42-47a4-9fe1-853a01c5bde6', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2025-07-25', '2025-07-25', '08:00', '17:00', false, 'MA assignment restored from backup', NOW(), NOW()),

-- Ivan Lobo assignments
-- Ivan Lobo @ Centro assigned to Philip Sutherland - July 28, 2025
(gen_random_uuid(), ARRAY['f9d9f75c-3fbd-4edc-a1bf-28f8a5941a93'], '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2025-07-28', '2025-07-28', '08:00', '17:00', false, 'MA assignment restored from backup', NOW(), NOW()),
-- Ivan Lobo @ Centro assigned to Tiffany Good - July 29, 2025
(gen_random_uuid(), ARRAY['f9d9f75c-3fbd-4edc-a1bf-28f8a5941a93'], '22222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2025-07-29', '2025-07-29', '08:00', '17:00', false, 'MA assignment restored from backup', NOW(), NOW()),

-- Juan Martinez assignments
-- Juan Martinez @ Urgente assigned to Philip Sutherland - July 28, 2025
(gen_random_uuid(), ARRAY['4a9153a7-e8b9-464e-b88d-b3edb3d8ba48'], '11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2025-07-28', '2025-07-28', '08:00', '17:00', false, 'MA assignment restored from backup', NOW(), NOW()),
-- Juan Martinez @ Urgente assigned to Jim Knox - July 29, 2025
(gen_random_uuid(), ARRAY['4a9153a7-e8b9-464e-b88d-b3edb3d8ba48'], 'df2de625-08e1-474a-a48a-b92b9576f71e', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2025-07-29', '2025-07-29', '08:00', '17:00', false, 'MA assignment restored from backup', NOW(), NOW()),

-- Kenneth Acevedo assignments
-- Kenneth Acevedo @ Centro assigned to John Pound - July 23, 2025
(gen_random_uuid(), ARRAY['9c70c00c-8d5d-405d-b06a-32bf0d36f944'], '109924c6-6150-415e-87dc-f2409883edcc', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2025-07-23', '2025-07-23', '08:00', '17:00', false, 'MA assignment restored from backup', NOW(), NOW()),
-- Kenneth Acevedo @ Centro assigned to Heidi Kelly - July 25, 2025
(gen_random_uuid(), ARRAY['9c70c00c-8d5d-405d-b06a-32bf0d36f944'], 'a2272239-fe8a-446c-a91c-c8a3eb180f32', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2025-07-25', '2025-07-25', '08:00', '17:00', false, 'MA assignment restored from backup', NOW(), NOW()),
-- Kenneth Acevedo @ Centro assigned to Elizabeth Swaggerty - July 28, 2025
(gen_random_uuid(), ARRAY['9c70c00c-8d5d-405d-b06a-32bf0d36f944'], '97e08d3e-6d42-47a4-9fe1-853a01c5bde6', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2025-07-28', '2025-07-28', '08:00', '17:00', false, 'MA assignment restored from backup', NOW(), NOW()),

-- Keren Vicente assignments
-- Keren Vicente @ Urgente assigned to Ludjelie Manigat - July 23, 2025
(gen_random_uuid(), ARRAY['7d0d0d12-3fda-49e5-8d14-b330111cc5a1'], '2437699b-6a55-4803-98e5-ac5c0a3d82a8', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2025-07-23', '2025-07-23', '08:00', '17:00', false, 'MA assignment restored from backup', NOW(), NOW()),
-- Keren Vicente @ Urgente assigned to Joy Elizabeth Ferro - July 24, 2025
(gen_random_uuid(), ARRAY['7d0d0d12-3fda-49e5-8d14-b330111cc5a1'], '71cd1d47-7d3d-4975-8bb3-6f5072f99c55', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2025-07-24', '2025-07-24', '08:00', '17:00', false, 'MA assignment restored from backup', NOW(), NOW()),
-- Keren Vicente @ Urgente assigned to Elizabeth Swaggerty - July 25, 2025
(gen_random_uuid(), ARRAY['7d0d0d12-3fda-49e5-8d14-b330111cc5a1'], '97e08d3e-6d42-47a4-9fe1-853a01c5bde6', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2025-07-25', '2025-07-25', '08:00', '17:00', false, 'MA assignment restored from backup', NOW(), NOW()),

-- Lupita Ferreira assignments
-- Lupita Ferreira @ Centro assigned to Kelly Arnold - July 23, 2025
(gen_random_uuid(), ARRAY['cf5e7c66-d229-48bf-b8e5-ee21df8fa349'], '33333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2025-07-23', '2025-07-23', '08:00', '17:00', false, 'MA assignment restored from backup', NOW(), NOW()),
-- Lupita Ferreira @ Centro assigned to Kelly Arnold - July 24, 2025
(gen_random_uuid(), ARRAY['cf5e7c66-d229-48bf-b8e5-ee21df8fa349'], '33333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2025-07-24', '2025-07-24', '08:00', '17:00', false, 'MA assignment restored from backup', NOW(), NOW()),
-- Lupita Ferreira @ Urgente assigned to Tiffany Good - July 25, 2025
(gen_random_uuid(), ARRAY['cf5e7c66-d229-48bf-b8e5-ee21df8fa349'], '22222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2025-07-25', '2025-07-25', '08:00', '17:00', false, 'MA assignment restored from backup', NOW(), NOW()),
-- Lupita Ferreira @ Urgente assigned to Heidi Kelly - July 28, 2025
(gen_random_uuid(), ARRAY['cf5e7c66-d229-48bf-b8e5-ee21df8fa349'], 'a2272239-fe8a-446c-a91c-c8a3eb180f32', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2025-07-28', '2025-07-28', '08:00', '17:00', false, 'MA assignment restored from backup', NOW(), NOW()),

-- Maira Pozos assignments
-- Maira Pozos @ Centro assigned to John Pound - July 29, 2025
(gen_random_uuid(), ARRAY['6814909b-c624-4185-ab31-cbc5c8db8cd3'], '109924c6-6150-415e-87dc-f2409883edcc', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2025-07-29', '2025-07-29', '08:00', '17:00', false, 'MA assignment restored from backup', NOW(), NOW()),
-- Maira Pozos @ Centro assigned to Heidi Kelly - July 30, 2025
(gen_random_uuid(), ARRAY['6814909b-c624-4185-ab31-cbc5c8db8cd3'], 'a2272239-fe8a-446c-a91c-c8a3eb180f32', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2025-07-30', '2025-07-30', '08:00', '17:00', false, 'MA assignment restored from backup', NOW(), NOW()),
-- Maira Pozos @ Urgente assigned to Ludjelie Manigat - July 31, 2025
(gen_random_uuid(), ARRAY['6814909b-c624-4185-ab31-cbc5c8db8cd3'], '2437699b-6a55-4803-98e5-ac5c0a3d82a8', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2025-07-31', '2025-07-31', '08:00', '17:00', false, 'MA assignment restored from backup', NOW(), NOW()),
-- Maira Pozos @ Urgente assigned to Joy Elizabeth Ferro - August 1, 2025
(gen_random_uuid(), ARRAY['6814909b-c624-4185-ab31-cbc5c8db8cd3'], '71cd1d47-7d3d-4975-8bb3-6f5072f99c55', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2025-08-01', '2025-08-01', '08:00', '17:00', false, 'MA assignment restored from backup', NOW(), NOW()),

-- Marseris Kaid Bay Choate assignments
-- Marseris @ Urgente assigned to Jim Knox - July 23, 2025
(gen_random_uuid(), ARRAY['250c52f8-a67f-4cf4-b593-0e3357d1df21'], 'df2de625-08e1-474a-a48a-b92b9576f71e', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2025-07-23', '2025-07-23', '08:00', '17:00', false, 'MA assignment restored from backup', NOW(), NOW()),
-- Marseris @ Urgente assigned to Elizabeth Swaggerty - July 24, 2025
(gen_random_uuid(), ARRAY['250c52f8-a67f-4cf4-b593-0e3357d1df21'], '97e08d3e-6d42-47a4-9fe1-853a01c5bde6', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2025-07-24', '2025-07-24', '08:00', '17:00', false, 'MA assignment restored from backup', NOW(), NOW()),
-- Marseris @ Urgente assigned to Jim Knox - July 25, 2025
(gen_random_uuid(), ARRAY['250c52f8-a67f-4cf4-b593-0e3357d1df21'], 'df2de625-08e1-474a-a48a-b92b9576f71e', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2025-07-25', '2025-07-25', '08:00', '17:00', false, 'MA assignment restored from backup', NOW(), NOW()),
-- Marseris @ Urgente assigned to Philip Sutherland - July 28, 2025
(gen_random_uuid(), ARRAY['250c52f8-a67f-4cf4-b593-0e3357d1df21'], '11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2025-07-28', '2025-07-28', '08:00', '17:00', false, 'MA assignment restored from backup', NOW(), NOW()),

-- Oscar Garcia assignments
-- Oscar Garcia @ Urgente assigned to Philip Sutherland - July 23, 2025
(gen_random_uuid(), ARRAY['de19f883-b216-4bc5-8a39-fe6657097983'], '11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2025-07-23', '2025-07-23', '08:00', '17:00', false, 'MA assignment restored from backup', NOW(), NOW()),
-- Oscar Garcia @ Urgente assigned to Elizabeth Swaggerty - July 28, 2025
(gen_random_uuid(), ARRAY['de19f883-b216-4bc5-8a39-fe6657097983'], '97e08d3e-6d42-47a4-9fe1-853a01c5bde6', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2025-07-28', '2025-07-28', '08:00', '17:00', false, 'MA assignment restored from backup', NOW(), NOW()),
-- Oscar Garcia @ Urgente assigned to Joy Elizabeth Ferro - July 29, 2025
(gen_random_uuid(), ARRAY['de19f883-b216-4bc5-8a39-fe6657097983'], '71cd1d47-7d3d-4975-8bb3-6f5072f99c55', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2025-07-29', '2025-07-29', '08:00', '17:00', false, 'MA assignment restored from backup', NOW(), NOW()),

-- Quiana Carmuega assignments
-- Quiana Carmuega @ Centro assigned to Philip Sutherland - July 23, 2025
(gen_random_uuid(), ARRAY['fd0102f2-570a-4f87-b4cb-2d2bb1bc55ab'], '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2025-07-23', '2025-07-23', '08:00', '17:00', false, 'MA assignment restored from backup', NOW(), NOW()),
-- Quiana Carmuega @ Urgente assigned to Elizabeth Swaggerty - July 29, 2025
(gen_random_uuid(), ARRAY['fd0102f2-570a-4f87-b4cb-2d2bb1bc55ab'], '97e08d3e-6d42-47a4-9fe1-853a01c5bde6', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2025-07-29', '2025-07-29', '08:00', '17:00', false, 'MA assignment restored from backup', NOW(), NOW()),

-- Viviana Francisco assignments
-- Viviana Francisco @ Centro assigned to Kelly Arnold - July 25, 2025
(gen_random_uuid(), ARRAY['7bf9cd6c-a340-478e-9072-0befc15b446c'], '33333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2025-07-25', '2025-07-25', '08:00', '17:00', false, 'MA assignment restored from backup', NOW(), NOW()),
-- Viviana Francisco @ Centro assigned to Kelly Arnold - July 28, 2025
(gen_random_uuid(), ARRAY['7bf9cd6c-a340-478e-9072-0befc15b446c'], '33333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2025-07-28', '2025-07-28', '08:00', '17:00', false, 'MA assignment restored from backup', NOW(), NOW()),
-- Viviana Francisco @ Urgente assigned to Tiffany Good - July 29, 2025
(gen_random_uuid(), ARRAY['7bf9cd6c-a340-478e-9072-0befc15b446c'], '22222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2025-07-29', '2025-07-29', '08:00', '17:00', false, 'MA assignment restored from backup', NOW(), NOW()),

-- Yaniris Soto assignments  
-- Yaniris Soto @ Centro assigned to John Pound - July 24, 2025
(gen_random_uuid(), ARRAY['2946a856-5a23-408c-af54-3a6e2d314a71'], '109924c6-6150-415e-87dc-f2409883edcc', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2025-07-24', '2025-07-24', '08:00', '17:00', false, 'MA assignment restored from backup', NOW(), NOW()),
-- Yaniris Soto @ Centro assigned to Tiffany Good - July 25, 2025
(gen_random_uuid(), ARRAY['2946a856-5a23-408c-af54-3a6e2d314a71'], '22222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2025-07-25', '2025-07-25', '08:00', '17:00', false, 'MA assignment restored from backup', NOW(), NOW()),
-- Yaniris Soto @ Centro assigned to Heidi Kelly - July 28, 2025
(gen_random_uuid(), ARRAY['2946a856-5a23-408c-af54-3a6e2d314a71'], 'a2272239-fe8a-446c-a91c-c8a3eb180f32', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2025-07-28', '2025-07-28', '08:00', '17:00', false, 'MA assignment restored from backup', NOW(), NOW()),
-- Yaniris Soto @ Centro assigned to John Pound - July 29, 2025
(gen_random_uuid(), ARRAY['2946a856-5a23-408c-af54-3a6e2d314a71'], '109924c6-6150-415e-87dc-f2409883edcc', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2025-07-29', '2025-07-29', '08:00', '17:00', false, 'MA assignment restored from backup', NOW(), NOW()),
-- Yaniris Soto @ Centro assigned to Heidi Kelly - July 30, 2025
(gen_random_uuid(), ARRAY['2946a856-5a23-408c-af54-3a6e2d314a71'], 'a2272239-fe8a-446c-a91c-c8a3eb180f32', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2025-07-30', '2025-07-30', '08:00', '17:00', false, 'MA assignment restored from backup', NOW(), NOW()),
-- Yaniris Soto @ Centro assigned to Tiffany Good - July 31, 2025
(gen_random_uuid(), ARRAY['2946a856-5a23-408c-af54-3a6e2d314a71'], '22222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2025-07-31', '2025-07-31', '08:00', '17:00', false, 'MA assignment restored from backup', NOW(), NOW()),
-- Yaniris Soto @ Centro assigned to Philip Sutherland - August 1, 2025
(gen_random_uuid(), ARRAY['2946a856-5a23-408c-af54-3a6e2d314a71'], '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2025-08-01', '2025-08-01', '08:00', '17:00', false, 'MA assignment restored from backup', NOW(), NOW());

-- Verification queries
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

-- Show sample assignments
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
ORDER BY s.start_date, ma.name
LIMIT 20;