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
  providerShifts.forEach(shift => {
    let isProviderAvailable = false;
    
    // First try: check direct date match for non-recurring or single-day shifts
    if (!shift.recurringRule || shift.recurringRule.frequency === 'NONE') {
      const shiftStartDate = shift.startDate;
      const shiftEndDate = shift.endDate || shift.startDate;
      if (targetDateString >= shiftStartDate && targetDateString <= shiftEndDate) {
        isProviderAvailable = true;
      }
    } else {
      // For recurring shifts, generate all occurrences and check if target date is included
      const occurrences = generateRecurringDates(shift, targetDate, targetDate, shifts);
      if (occurrences.length > 0 && occurrences.some(date => getISODateString(date) === targetDateString)) {
        isProviderAvailable = true;
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
    
    
    let isMatchingDate = false;
    
    // First try: check direct date match for non-recurring or single-day shifts
    if (!shift.recurringRule || shift.recurringRule.frequency === 'NONE') {
      const shiftStartDate = shift.startDate;
      const shiftEndDate = shift.endDate || shift.startDate;
      if (targetDateString >= shiftStartDate && targetDateString <= shiftEndDate) {
        isMatchingDate = true;
      }
    } else {
      // For recurring shifts, use generateRecurringDates
      const occurrences = generateRecurringDates(shift, targetDate, targetDate, shifts);
      if (occurrences.some(date => getISODateString(date) === targetDateString)) {
        isMatchingDate = true;
      }
    }
    
    if (isMatchingDate) {
      return shift;
    }
  }
  
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
 * Find all MAs assigned to a specific provider on a given date
 * This includes both separate MA shifts and MAs assigned directly to provider shifts
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
    let isMatchingShift = false;
    
    // Method 1: Check for separate MA shifts assigned to this provider
    if (!shift.providerId && shift.medicalAssistantIds && shift.medicalAssistantIds.length > 0 && shift.assignedToProviderId === providerId) {
      isMatchingShift = true;
    }
    
    // Method 2: Check if this IS the provider shift with MAs assigned directly
    if (shift.providerId === providerId && shift.medicalAssistantIds && shift.medicalAssistantIds.length > 0) {
      isMatchingShift = true;
    }
    
    if (!isMatchingShift) {
      return;
    }
    
    // Check if the shift occurs on the target date
    let isMatchingDate = false;
    
    // First try: check direct date match for non-recurring or single-day shifts
    if (!shift.recurringRule || shift.recurringRule.frequency === 'NONE') {
      const shiftStartDate = shift.startDate;
      const shiftEndDate = shift.endDate || shift.startDate;
      if (targetDateString >= shiftStartDate && targetDateString <= shiftEndDate) {
        isMatchingDate = true;
      }
    } else {
      // For recurring shifts, use generateRecurringDates
      const occurrences = generateRecurringDates(shift, targetDate, targetDate, shifts);
      if (occurrences.some(date => getISODateString(date) === targetDateString)) {
        isMatchingDate = true;
      }
    }
    
    if (isMatchingDate) {
      assignedMAShifts.push(shift);
    }
  });
  
  return assignedMAShifts;
}