-- Check for shifts created over the weekend and their visibility
-- Run this in your Supabase SQL editor

-- 1. Show all shifts with their timestamps
SELECT
    id,
    provider_id,
    clinic_type_id,
    title,
    start_date,
    end_date,
    start_time,
    end_time,
    is_vacation,
    created_at,
    updated_at,
    -- Add day of week for created_at
    to_char(created_at, 'Day') as created_day_name,
    -- Add readable timestamp
    to_char(created_at AT TIME ZONE 'America/New_York', 'YYYY-MM-DD HH24:MI:SS TZ') as created_at_eastern,
    to_char(updated_at AT TIME ZONE 'America/New_York', 'YYYY-MM-DD HH24:MI:SS TZ') as updated_at_eastern
FROM shifts
ORDER BY created_at DESC;

-- 2. Check specifically for weekend-created shifts
SELECT
    'Weekend Shifts' as category,
    COUNT(*) as total_count
FROM shifts
WHERE EXTRACT(DOW FROM created_at) IN (0, 6); -- 0 = Sunday, 6 = Saturday

-- 3. Show shifts created in the last 7 days with detailed info
SELECT
    id,
    provider_id,
    start_date,
    to_char(created_at, 'Day, Mon DD YYYY at HH24:MI:SS') as created_readable,
    CASE
        WHEN EXTRACT(DOW FROM created_at) IN (0, 6) THEN 'Weekend'
        ELSE 'Weekday'
    END as created_on,
    -- Check if date is in the past
    CASE
        WHEN start_date < CURRENT_DATE THEN 'Past'
        WHEN start_date = CURRENT_DATE THEN 'Today'
        ELSE 'Future'
    END as date_status
FROM shifts
WHERE created_at >= NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;

-- 4. Check for any potential date filtering issues
SELECT
    'Total Shifts' as metric,
    COUNT(*) as count
FROM shifts
UNION ALL
SELECT
    'Future Shifts' as metric,
    COUNT(*) as count
FROM shifts
WHERE start_date >= CURRENT_DATE
UNION ALL
SELECT
    'Past Shifts' as metric,
    COUNT(*) as count
FROM shifts
WHERE start_date < CURRENT_DATE
UNION ALL
SELECT
    'Today Shifts' as metric,
    COUNT(*) as count
FROM shifts
WHERE start_date = CURRENT_DATE;

-- 5. Show the most recent 10 shifts with all relevant details
SELECT
    id,
    provider_id,
    clinic_type_id,
    medical_assistant_ids,
    start_date,
    end_date,
    start_time,
    end_time,
    recurring_rule,
    series_id,
    created_at,
    updated_at
FROM shifts
ORDER BY created_at DESC
LIMIT 10;

-- 6. Check if there are any shifts with NULL or unusual dates
SELECT
    id,
    start_date,
    end_date,
    created_at,
    CASE
        WHEN start_date IS NULL THEN 'NULL start_date'
        WHEN end_date IS NULL THEN 'NULL end_date'
        WHEN start_date > end_date THEN 'Start after end'
        WHEN start_date < '2020-01-01' THEN 'Very old date'
        WHEN start_date > '2030-01-01' THEN 'Far future date'
        ELSE 'Normal'
    END as date_issue
FROM shifts
WHERE
    start_date IS NULL OR
    end_date IS NULL OR
    start_date > end_date OR
    start_date < '2020-01-01' OR
    start_date > '2030-01-01';

-- 7. Group shifts by provider to see distribution
SELECT
    provider_id,
    COUNT(*) as shift_count,
    MIN(start_date) as earliest_shift,
    MAX(start_date) as latest_shift,
    COUNT(CASE WHEN EXTRACT(DOW FROM created_at) IN (0, 6) THEN 1 END) as weekend_created_count
FROM shifts
GROUP BY provider_id
ORDER BY shift_count DESC;