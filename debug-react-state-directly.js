// ALTERNATIVE DEBUG SCRIPT - REACT STATE DIRECT ACCESS
// Run this in your browser's developer console while on the dynamic app
// This doesn't require window.supabase and works with current React state

console.log('🔍 DEBUGGING REACT STATE DIRECTLY');
console.log('===============================================\n');

// Function to find React component instance with DevTools
function findReactComponent() {
  console.log('⚛️  Searching for React component data...');
  
  // Try to find the main container
  const appContainer = document.querySelector('#root');
  if (!appContainer) {
    console.log('❌ Could not find React root container');
    return null;
  }
  
  // Check for React DevTools
  if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    console.log('✅ React DevTools detected');
    
    // Try to access fiber data
    const reactFiberKey = Object.keys(appContainer).find(key => 
      key.startsWith('__reactFiber') || key.startsWith('__reactInternalInstance')
    );
    
    if (reactFiberKey) {
      console.log('✅ React fiber found:', reactFiberKey);
      return appContainer[reactFiberKey];
    }
  }
  
  console.log('❌ Could not access React internals');
  return null;
}

// Function to traverse React tree and find hooks data
function findHooksData(fiber, depth = 0) {
  if (!fiber || depth > 20) return null;
  
  try {
    // Check if this component has hooks with shift data
    if (fiber.memoizedState) {
      let state = fiber.memoizedState;
      while (state) {
        if (state.memoizedState && Array.isArray(state.memoizedState)) {
          // Check if this looks like shift data
          const data = state.memoizedState;
          if (data.length > 0 && data[0].id && data[0].providerId) {
            console.log(`✅ Found shifts data with ${data.length} items`);
            return data;
          }
        }
        state = state.next;
      }
    }
    
    // Recursively check children
    let child = fiber.child;
    while (child) {
      const result = findHooksData(child, depth + 1);
      if (result) return result;
      child = child.sibling;
    }
    
    // Check parent if this is the starting point
    if (depth === 0 && fiber.return) {
      return findHooksData(fiber.return, depth + 1);
    }
  } catch (err) {
    // Silently ignore errors during traversal
  }
  
  return null;
}

// Function to check console logs for shift data
function checkConsoleLogs() {
  console.log('📋 Checking recent console logs for shift data...');
  
  // Look for any debug shifts data that might have been logged
  if (window.__DEBUG_SHIFTS__) {
    console.log('✅ Found __DEBUG_SHIFTS__ data:', window.__DEBUG_SHIFTS__.length);
    return window.__DEBUG_SHIFTS__;
  }
  
  console.log('❌ No __DEBUG_SHIFTS__ found in window');
  return null;
}

// Function to manually check local storage for any debugging data
function checkLocalStorageDebug() {
  console.log('💾 Checking localStorage for any debug data...');
  
  try {
    const keys = Object.keys(localStorage);
    const debugKeys = keys.filter(k => k.includes('debug') || k.includes('shift') || k.includes('tempo'));
    
    if (debugKeys.length > 0) {
      console.log('✅ Found potential debug keys:', debugKeys);
      debugKeys.forEach(key => {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '');
          if (Array.isArray(data) && data.length > 0) {
            console.log(`  - ${key}: ${data.length} items`);
          }
        } catch (e) {
          console.log(`  - ${key}: Not JSON data`);
        }
      });
    } else {
      console.log('❌ No debug-related localStorage keys found');
    }
  } catch (err) {
    console.log('❌ Error checking localStorage:', err);
  }
}

// Function to inspect DOM for any data attributes or content
function checkDOMForData() {
  console.log('🌐 Checking DOM for visible shift data...');
  
  // Look for shift badges or other calendar elements
  const shiftElements = document.querySelectorAll('[class*="shift"], [class*="badge"], [data-shift]');
  console.log(`✅ Found ${shiftElements.length} potential shift-related DOM elements`);
  
  if (shiftElements.length > 0) {
    console.log('📊 DOM shift elements:');
    Array.from(shiftElements).slice(0, 5).forEach((el, index) => {
      console.log(`  ${index + 1}. ${el.tagName}.${el.className}`);
      if (el.textContent && el.textContent.trim()) {
        console.log(`     Text: "${el.textContent.trim()}"`);
      }
    });
    
    if (shiftElements.length > 5) {
      console.log(`     ... and ${shiftElements.length - 5} more elements`);
    }
  }
  
  // Look for provider names in DOM
  const philipElements = document.querySelectorAll('*');
  let philipFound = false;
  
  Array.from(philipElements).forEach(el => {
    if (el.textContent && el.textContent.toLowerCase().includes('philip')) {
      if (!philipFound) {
        console.log('🎯 Found "Philip" in DOM:');
        philipFound = true;
      }
      console.log(`  - ${el.tagName}: "${el.textContent.trim()}"`);
    }
  });
  
  if (!philipFound) {
    console.log('❌ No "Philip" text found in DOM');
  }
}

// Function to provide debugging instructions
function provideDebuggingSteps() {
  console.log('\n🛠️  DEBUGGING STEPS TO TRY:');
  console.log('=====================================');
  
  console.log('\n1. Check Browser Console for Error Messages:');
  console.log('   - Look for red error messages');
  console.log('   - Check Network tab for failed requests');
  console.log('   - Look for 400/500 HTTP status codes');
  
  console.log('\n2. Check React DevTools:');
  console.log('   - Install React DevTools browser extension');
  console.log('   - Go to Components tab');
  console.log('   - Find MainApplication component');
  console.log('   - Look for shifts prop/state');
  
  console.log('\n3. Force Refresh App Data:');
  console.log('   - Try hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)');
  console.log('   - Clear browser cache');
  console.log('   - Try incognito/private browsing mode');
  
  console.log('\n4. Check Authentication:');
  console.log('   - Make sure you\'re signed in');
  console.log('   - Try signing out and back in');
  console.log('   - Check if you have the right permissions');
  
  console.log('\n5. Manual Database Check:');
  console.log('   - Go to Supabase dashboard');
  console.log('   - Check Table Editor → shifts');
  console.log('   - Verify Philip Sutherland shift exists');
  console.log('   - Check provider_id matches providers table');
}

// Main debugging function
async function runReactStateDebug() {
  console.log('🚀 Starting React state debugging...\n');
  
  // Step 1: Try to find React data
  const reactFiber = findReactComponent();
  if (reactFiber) {
    const shiftsData = findHooksData(reactFiber);
    if (shiftsData) {
      console.log('🎯 FOUND REACT SHIFTS DATA:');
      console.log(`  Total shifts: ${shiftsData.length}`);
      
      // Look for Philip specifically
      const philipShifts = shiftsData.filter(s => 
        (s.providerId && s.providerId.toLowerCase().includes('philip')) ||
        (s.title && s.title.toLowerCase().includes('philip')) ||
        (s.notes && s.notes.toLowerCase().includes('philip'))
      );
      
      if (philipShifts.length > 0) {
        console.log('🎯 FOUND PHILIP SUTHERLAND SHIFTS IN REACT STATE:');
        philipShifts.forEach((shift, index) => {
          console.log(`  ${index + 1}. Shift ${shift.id}:`);
          console.log(`     Provider ID: ${shift.providerId}`);
          console.log(`     Date: ${shift.startDate}`);
          console.log(`     Time: ${shift.startTime} - ${shift.endTime}`);
        });
        
        // Store for inspection
        window.__FOUND_PHILIP_SHIFTS__ = philipShifts;
        console.log('💾 Philip shifts stored in window.__FOUND_PHILIP_SHIFTS__');
      } else {
        console.log('❌ No Philip Sutherland shifts found in React state');
      }
      
      // Store all shifts for inspection
      window.__FOUND_ALL_SHIFTS__ = shiftsData;
      console.log('💾 All shifts stored in window.__FOUND_ALL_SHIFTS__');
    }
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Step 2: Check other data sources
  checkConsoleLogs();
  console.log('\n' + '='.repeat(30) + '\n');
  
  checkLocalStorageDebug();
  console.log('\n' + '='.repeat(30) + '\n');
  
  checkDOMForData();
  console.log('\n' + '='.repeat(30) + '\n');
  
  provideDebuggingSteps();
}

// Run the debug
runReactStateDebug(); 