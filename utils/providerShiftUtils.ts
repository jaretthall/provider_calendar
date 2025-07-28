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
  
  shifts.forEach(shift => {
    // Only check provider shifts, not other staff types
    if (!shift.providerId) return;
    
    // For recurring shifts, generate all occurrences and check if target date is included
    const occurrences = generateRecurringDates(shift, targetDate, targetDate, shifts);
    
    if (occurrences.some(date => getISODateString(date) === targetDateString)) {
      providersWithShifts.add(shift.providerId);
    }
  });
  
  // Return only active providers who have shifts on this date
  return providers.filter(provider => 
    provider.isActive && providersWithShifts.has(provider.id)
  );
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
    
    const occurrences = generateRecurringDates(shift, targetDate, targetDate, shifts);
    
    if (occurrences.some(date => getISODateString(date) === targetDateString)) {
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
    
    // Check if the shift occurs on the target date
    const occurrences = generateRecurringDates(shift, targetDate, targetDate, shifts);
    
    if (occurrences.some(date => getISODateString(date) === targetDateString)) {
      assignedMAShifts.push(shift);
    }
  });
  
  return assignedMAShifts;
}