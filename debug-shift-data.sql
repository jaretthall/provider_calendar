-- Debug Shift Data Structure
-- Run this to see exactly what's in your shifts table

-- Show all shift data with detailed column information
SELECT 
    'SHIFT DATA STRUCTURE:' as info;

SELECT 
    id,
    provider_id,
    clinic_type_id,
    medical_assistant_ids,
    title,
    start_date,
    end_date,
    start_time,
    end_time,
    is_vacation,
    notes,
    color,
    recurring_rule,
    series_id,
    original_recurring_shift_id,
    is_exception_instance,
    exception_for_date,
    created_at,
    updated_at
FROM shifts
ORDER BY created_at DESC;

-- Show provider and clinic type names for reference
SELECT 'PROVIDERS:' as info;
SELECT id, name FROM providers;

SELECT 'CLINIC TYPES:' as info; 
SELECT id, name FROM clinic_types; 