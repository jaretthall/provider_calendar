import { Shift, Provider } from '../types';
import { generateRecurringDates, getISODateString } from './dateUtils';

/**
 * Find providers who have shifts scheduled on a specific date
 */
export function getProvidersWithShiftsOnDate(
  shifts: Shift[], 
  providers: Provider[], 
  targetDate: Date
): Provider[] {
  const targetDateString = getISODateString(targetDate);
  const providersWithShifts = new Set<string>();
  
  const providerShifts = shifts.filter(shift => shift.providerId);
  console.log(`🔍 DEBUG: Found ${providerShifts.length} provider shifts total`);
  
  providerShifts.forEach(shift => {
    let isProviderAvailable = false;
    
    if (shift.recurringRule?.frequency === 'WEEKLY' && (!shift.recurringRule.daysOfWeek || shift.recurringRule.daysOfWeek.length === 0)) {
      console.log(`🔧 Provider shift ${shift.id} has empty daysOfWeek, startDate: ${shift.startDate}`);
    }
    
    console.log(`🔍 Provider ${shift.providerId} shift ${shift.id} check:`, {
      targetDate: targetDateString,
      shiftStartDate: shift.startDate,
      shiftEndDate: shift.endDate,
      frequency: shift.recurringRule?.frequency,
      daysOfWeek: shift.recurringRule?.daysOfWeek
    });
    
    // First try: check direct date match for non-recurring or single-day shifts
    if (!shift.recurringRule || shift.recurringRule.frequency === 'NONE') {
      const shiftStartDate = shift.startDate;
      const shiftEndDate = shift.endDate || shift.startDate;
      if (targetDateString >= shiftStartDate && targetDateString <= shiftEndDate) {
        isProviderAvailable = true;
        console.log(`✅ Provider ${shift.providerId} direct date match: ${targetDateString} in range ${shiftStartDate} - ${shiftEndDate}`);
      }
    } else {
      // For recurring shifts, generate all occurrences and check if target date is included
      const occurrences = generateRecurringDates(shift, targetDate, targetDate, shifts);
      console.log(`🔍 Provider shift ${shift.id} generates ${occurrences.length} occurrences:`, 
        occurrences.map(d => getISODateString(d)));
      
      if (occurrences.length > 0 && occurrences.some(date => getISODateString(date) === targetDateString)) {
        isProviderAvailable = true;
        console.log(`✅ Provider ${shift.providerId} recurring shift generates target date ${targetDateString}`);
      } else if (occurrences.length === 0) {
        if (shift.recurringRule?.frequency === 'WEEKLY') {
          console.log(`❌ Provider ${shift.id} (WEEKLY) generates NO dates - daysOfWeek: ${JSON.stringify(shift.recurringRule.daysOfWeek)}, startDate: ${shift.startDate}`);
        }
      }
    }
    
    if (isProviderAvailable && shift.providerId) {
      providersWithShifts.add(shift.providerId);
    }
  });
  
  // Return only active providers who have shifts on this date
  const result = providers.filter(provider => 
    provider.isActive && providersWithShifts.has(provider.id)
  );
  
  if (providersWithShifts.size === 0) {
    console.log(`⚠️ No providers found with shifts on ${targetDateString}`);
  }
  return result;
}

/**
 * Get a specific provider's shift details for a given date
 * Used for time mismatch warnings
 */
export function getProviderShiftOnDate(
  shifts: Shift[], 
  providerId: string, 
  targetDate: Date
): Shift | undefined {
  const targetDateString = getISODateString(targetDate);
  
  for (const shift of shifts) {
    if (shift.providerId !== providerId) continue;
    
    console.log(`🔍 getProviderShiftOnDate checking shift ${shift.id} for provider ${providerId} on ${targetDateString}:`, {
      shiftStartDate: shift.startDate,
      shiftEndDate: shift.endDate,
      frequency: shift.recurringRule?.frequency
    });
    
    let isMatchingDate = false;
    
    // First try: check direct date match for non-recurring or single-day shifts
    if (!shift.recurringRule || shift.recurringRule.frequency === 'NONE') {
      const shiftStartDate = shift.startDate;
      const shiftEndDate = shift.endDate || shift.startDate;
      if (targetDateString >= shiftStartDate && targetDateString <= shiftEndDate) {
        isMatchingDate = true;
        console.log(`✅ getProviderShiftOnDate direct match: ${targetDateString} in range ${shiftStartDate} - ${shiftEndDate}`);
      }
    } else {
      // For recurring shifts, use generateRecurringDates
      const occurrences = generateRecurringDates(shift, targetDate, targetDate, shifts);
      if (occurrences.some(date => getISODateString(date) === targetDateString)) {
        isMatchingDate = true;
        console.log(`✅ getProviderShiftOnDate recurring match for ${targetDateString}`);
      }
    }
    
    if (isMatchingDate) {
      console.log(`✅ getProviderShiftOnDate found provider shift for ${providerId} on ${targetDateString}`);
      return shift;
    }
  }
  
  console.log(`❌ getProviderShiftOnDate: No shift found for provider ${providerId} on ${targetDateString}`);
  return undefined;
}

/**
 * Check if MA shift times match with assigned provider's shift times
 * Returns warning message if times don't match, null if they do match
 */
export function checkTimesMismatch(
  maShift: { startTime?: string; endTime?: string },
  providerShift: { startTime?: string; endTime?: string }
): string | null {
  // If either shift has no times (vacation), no mismatch possible
  if (!maShift.startTime || !maShift.endTime || !providerShift.startTime || !providerShift.endTime) {
    return null;
  }
  
  const timesMatch = maShift.startTime === providerShift.startTime && 
                   maShift.endTime === providerShift.endTime;
  
  if (!timesMatch) {
    return `MA hours (${maShift.startTime} - ${maShift.endTime}) don't perfectly match provider's shift times (${providerShift.startTime} - ${providerShift.endTime})`;
  }
  
  return null;
}

/**
 * Find all MA shifts assigned to a specific provider on a given date
 * Used for displaying MA badges on provider shifts
 */
export function getMAsAssignedToProviderOnDate(
  shifts: Shift[], 
  providerId: string, 
  targetDate: Date
): Shift[] {
  const targetDateString = getISODateString(targetDate);
  const assignedMAShifts: Shift[] = [];
  
  shifts.forEach(shift => {
    // Only check MA shifts (those that have medicalAssistantIds but no providerId)
    if (shift.providerId || !shift.medicalAssistantIds || shift.medicalAssistantIds.length === 0) {
      return;
    }
    
    // Check if this MA shift is assigned to the target provider
    if (shift.assignedToProviderId !== providerId) {
      return;
    }
    
    console.log(`🔍 Checking MA shift ${shift.id} for provider ${providerId} on ${targetDateString}:`, {
      shiftStartDate: shift.startDate,
      shiftEndDate: shift.endDate,
      medicalAssistantIds: shift.medicalAssistantIds,
      assignedToProviderId: shift.assignedToProviderId,
      frequency: shift.recurringRule?.frequency
    });
    
    // Check if the shift occurs on the target date
    let isMatchingDate = false;
    
    // First try: check direct date match for non-recurring or single-day shifts
    if (!shift.recurringRule || shift.recurringRule.frequency === 'NONE') {
      const shiftStartDate = shift.startDate;
      const shiftEndDate = shift.endDate || shift.startDate;
      if (targetDateString >= shiftStartDate && targetDateString <= shiftEndDate) {
        isMatchingDate = true;
        console.log(`✅ MA shift ${shift.id} direct date match: ${targetDateString} in range ${shiftStartDate} - ${shiftEndDate}`);
      }
    } else {
      // For recurring shifts, use generateRecurringDates
      const occurrences = generateRecurringDates(shift, targetDate, targetDate, shifts);
      console.log(`🔍 MA shift ${shift.id} generates ${occurrences.length} occurrences:`, 
        occurrences.map(d => getISODateString(d)));
      
      if (occurrences.some(date => getISODateString(date) === targetDateString)) {
        isMatchingDate = true;
        console.log(`✅ MA shift ${shift.id} recurring match for target date ${targetDateString}`);
      }
    }
    
    if (isMatchingDate) {
      assignedMAShifts.push(shift);
    } else {
      console.log(`❌ MA shift ${shift.id} does not match target date ${targetDateString}`);
    }
  });
  
  if (assignedMAShifts.length > 0) {
    console.log(`✅ Found ${assignedMAShifts.length} MA(s) assigned to provider on ${targetDateString}`);
  }
  return assignedMAShifts;
}