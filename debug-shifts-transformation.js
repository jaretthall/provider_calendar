// DEBUG SHIFTS TRANSFORMATION ISSUE
// Run this in your browser's developer console while on the dynamic app

console.log('🔍 DEBUGGING SHIFT TRANSFORMATION ISSUE');
console.log('===============================================\n');

// Step 1: Check raw Supabase API response
async function checkRawSupabaseData() {
  console.log('📡 Step 1: Checking raw Supabase API response...');
  
  if (!window.supabase) {
    console.log('❌ Supabase client not available');
    return null;
  }

  try {
    const { data: rawShifts, error } = await window.supabase
      .from('shifts')
      .select('*')
      .order('created_at');

    if (error) {
      console.log('❌ Supabase query error:', error);
      return null;
    }

    console.log(`✅ Raw API response: ${rawShifts.length} shifts found`);
    
    // Log each shift with provider info
    for (const shift of rawShifts) {
      console.log(`  📅 Shift ${shift.id}:`);
      console.log(`    - Provider ID: ${shift.provider_id}`);
      console.log(`    - Start Date: ${shift.start_date}`);
      console.log(`    - Start Time: ${shift.start_time}`);
      console.log(`    - End Time: ${shift.end_time}`);
      console.log(`    - Clinic Type ID: ${shift.clinic_type_id}`);
      console.log(`    - Medical Assistant IDs: ${JSON.stringify(shift.medical_assistant_ids)}`);
      console.log(`    - Is Vacation: ${shift.is_vacation}`);
      console.log(`    - Title: ${shift.title}`);
      console.log(`    - Notes: ${shift.notes}`);
      console.log(`    - Color: ${shift.color}`);
      console.log('');
    }

    return rawShifts;
  } catch (err) {
    console.log('❌ Error fetching raw data:', err);
    return null;
  }
}

// Step 2: Apply the transformation logic from useSupabaseShifts
function transformShifts(rawShifts) {
  console.log('🔄 Step 2: Applying useSupabaseShifts transformation...');
  
  if (!rawShifts || rawShifts.length === 0) {
    console.log('❌ No raw shifts to transform');
    return [];
  }

  try {
    const transformedShifts = rawShifts.map(item => {
      console.log(`  🔄 Transforming shift ${item.id}...`);
      
      const transformed = {
        id: item.id,
        providerId: item.provider_id,
        clinicTypeId: item.clinic_type_id,
        medicalAssistantIds: item.medical_assistant_ids || [],
        title: item.title,
        startDate: item.start_date,
        endDate: item.end_date,
        startTime: item.start_time,
        endTime: item.end_time,
        isVacation: item.is_vacation,
        notes: item.notes,
        color: item.color,
        recurringRule: item.recurring_rule,
        seriesId: item.series_id,
        originalRecurringShiftId: item.original_recurring_shift_id,
        isExceptionInstance: item.is_exception_instance,
        exceptionForDate: item.exception_for_date,
        createdAt: item.created_at,
        updatedAt: item.updated_at
      };

      console.log(`    ✅ Transformed successfully`);
      return transformed;
    });

    console.log(`✅ Transformation complete: ${transformedShifts.length} shifts transformed`);
    
    // Log Philip Sutherland shift specifically if found
    const philipShift = transformedShifts.find(s => 
      s.providerId && s.providerId.includes('philip') || 
      s.title && s.title.toLowerCase().includes('philip') ||
      s.notes && s.notes.toLowerCase().includes('philip')
    );
    
    if (philipShift) {
      console.log('🎯 FOUND PHILIP SUTHERLAND SHIFT:');
      console.log(JSON.stringify(philipShift, null, 2));
    } else {
      console.log('❌ Philip Sutherland shift NOT found in transformed data');
    }

    return transformedShifts;
  } catch (err) {
    console.log('❌ Error during transformation:', err);
    return [];
  }
}

// Step 3: Check provider data to match provider IDs
async function checkProviders() {
  console.log('👥 Step 3: Checking provider data...');
  
  if (!window.supabase) {
    console.log('❌ Supabase client not available');
    return null;
  }

  try {
    const { data: providers, error } = await window.supabase
      .from('providers')
      .select('*');

    if (error) {
      console.log('❌ Error fetching providers:', error);
      return null;
    }

    console.log(`✅ Found ${providers.length} providers:`);
    providers.forEach(provider => {
      console.log(`  - ${provider.name} (ID: ${provider.id})`);
    });

    // Find Philip Sutherland specifically
    const philipProvider = providers.find(p => 
      p.name && p.name.toLowerCase().includes('philip')
    );
    
    if (philipProvider) {
      console.log('🎯 FOUND PHILIP SUTHERLAND PROVIDER:');
      console.log(`  Name: ${philipProvider.name}`);
      console.log(`  ID: ${philipProvider.id}`);
      console.log(`  Is Active: ${philipProvider.is_active}`);
    } else {
      console.log('❌ Philip Sutherland provider NOT found');
    }

    return providers;
  } catch (err) {
    console.log('❌ Error fetching providers:', err);
    return null;
  }
}

// Step 4: Check if React state matches transformed data
function checkReactState() {
  console.log('⚛️  Step 4: Checking React component state...');
  
  // Try to access React DevTools data
  if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    console.log('✅ React DevTools available - check Components tab for shift data');
  } else {
    console.log('❌ React DevTools not available');
  }
  
  // Check if there's a global reference to the shifts data
  if (window.__DEBUG_SHIFTS__) {
    console.log('✅ Found debug shifts data:', window.__DEBUG_SHIFTS__.length);
  } else {
    console.log('❌ No debug shifts data found');
  }
}

// Run all debug steps
async function runFullDebug() {
  console.log('🚀 Starting full debug process...\n');
  
  const rawShifts = await checkRawSupabaseData();
  console.log('\n' + '='.repeat(50) + '\n');
  
  const transformedShifts = transformShifts(rawShifts);
  console.log('\n' + '='.repeat(50) + '\n');
  
  const providers = await checkProviders();
  console.log('\n' + '='.repeat(50) + '\n');
  
  checkReactState();
  
  console.log('\n🎯 SUMMARY:');
  console.log(`  - Raw shifts from API: ${rawShifts ? rawShifts.length : 0}`);
  console.log(`  - Transformed shifts: ${transformedShifts.length}`);
  console.log(`  - Providers found: ${providers ? providers.length : 0}`);
  
  // Store results in global variables for further inspection
  window.__DEBUG_RAW_SHIFTS__ = rawShifts;
  window.__DEBUG_TRANSFORMED_SHIFTS__ = transformedShifts;
  window.__DEBUG_PROVIDERS__ = providers;
  
  console.log('\n💾 Debug data stored in window.__DEBUG_* variables for further inspection');
}

// Run the debug
runFullDebug(); 