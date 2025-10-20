-- List all shifts created since Monday October 13, 2025
-- Run this in your Supabase SQL editor

-- 1. Main query - all shifts created since Oct 13, 2025
SELECT
    id,
    provider_id,
    clinic_type_id,
    title,
    start_date,
    end_date,
    start_time,
    end_time,
    created_at,
    updated_at,
    to_char(created_at AT TIME ZONE 'America/New_York', 'Day, Mon DD YYYY at HH24:MI:SS') as created_readable,
    to_char(created_at AT TIME ZONE 'America/New_York', 'Day') as created_day
FROM shifts
WHERE created_at >= '2025-10-13 00:00:00'::timestamp
ORDER BY created_at DESC;

-- 2. Summary by day - count shifts created each day since Oct 13
SELECT
    DATE(created_at AT TIME ZONE 'America/New_York') as creation_date,
    to_char(created_at AT TIME ZONE 'America/New_York', 'Day') as day_name,
    COUNT(*) as shifts_created,
    STRING_AGG(DISTINCT provider_id::text, ', ') as providers
FROM shifts
WHERE created_at >= '2025-10-13 00:00:00'::timestamp
GROUP BY DATE(created_at AT TIME ZONE 'America/New_York'), to_char(created_at AT TIME ZONE 'America/New_York', 'Day')
ORDER BY creation_date DESC;

-- 3. Total count since Oct 13
SELECT
    'Total shifts created since Oct 13, 2025' as metric,
    COUNT(*) as count
FROM shifts
WHERE created_at >= '2025-10-13 00:00:00'::timestamp;

-- 4. Breakdown by provider - who created shifts this week
SELECT
    provider_id,
    COUNT(*) as shift_count,
    MIN(start_date) as earliest_shift_date,
    MAX(start_date) as latest_shift_date,
    STRING_AGG(DISTINCT to_char(created_at AT TIME ZONE 'America/New_York', 'Mon DD'), ', ' ORDER BY to_char(created_at AT TIME ZONE 'America/New_York', 'Mon DD')) as creation_dates
FROM shifts
WHERE created_at >= '2025-10-13 00:00:00'::timestamp
GROUP BY provider_id
ORDER BY shift_count DESC;

-- 5. Weekend vs Weekday breakdown
SELECT
    CASE
        WHEN EXTRACT(DOW FROM created_at) IN (0, 6) THEN 'Weekend'
        ELSE 'Weekday'
    END as day_type,
    COUNT(*) as shifts_created
FROM shifts
WHERE created_at >= '2025-10-13 00:00:00'::timestamp
GROUP BY CASE WHEN EXTRACT(DOW FROM created_at) IN (0, 6) THEN 'Weekend' ELSE 'Weekday' END;

-- 6. Show the 20 most recent shifts created (with more details)
SELECT
    id,
    provider_id,
    title,
    start_date,
    to_char(start_date, 'Day, Mon DD') as shift_date_readable,
    start_time || ' - ' || end_time as shift_hours,
    to_char(created_at AT TIME ZONE 'America/New_York', 'YYYY-MM-DD HH24:MI:SS') as created_at_eastern,
    CASE
        WHEN EXTRACT(DOW FROM created_at) IN (0, 6) THEN '🔴 WEEKEND'
        ELSE ''
    END as weekend_flag
FROM shifts
WHERE created_at >= '2025-10-13 00:00:00'::timestamp
ORDER BY created_at DESC
LIMIT 20;