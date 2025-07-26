// Debug script to check behavioral health staff in database
// Run this in browser console while app is running

console.log('=== BEHAVIORAL HEALTH DEBUG ===');
console.log('1. Current behavioral health array:', window.behavioralHealth || 'Not available');
console.log('2. Array length:', (window.behavioralHealth || []).length);

// Let's also check if we can access the app's context
if (window.React) {
  console.log('3. React is available, trying to access app state...');
} else {
  console.log('3. React not available in window');
}

// Function to simulate adding a behavioral health staff member
function addTestBehavioralHealthStaff() {
  const testStaff = {
    name: 'Test BH Staff',
    color: '#8B5CF6',
    isActive: true
  };
  
  console.log('4. Would add test staff:', testStaff);
  // This would need to be called through the app's addBehavioralHealth function
}

addTestBehavioralHealthStaff();