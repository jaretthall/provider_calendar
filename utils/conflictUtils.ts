import { Shift, RecurringFrequency } from '../types';
import { getISODateString, generateRecurringDates, addDays } from './dateUtils';

// Helper function to get the primary staff member info for conflict detection
const getPrimaryStaffForConflictDetection = (shift: Shift): { staffId: string; staffType: 'provider' | 'frontStaff' | 'billing' | 'behavioralHealth' } | null => {
  if (shift.providerId) {
    return { staffId: shift.providerId, staffType: 'provider' };
  } else if (shift.frontStaffIds && shift.frontStaffIds.length > 0) {
    return { staffId: shift.frontStaffIds[0], staffType: 'frontStaff' };
  } else if (shift.billingIds && shift.billingIds.length > 0) {
    return { staffId: shift.billingIds[0], staffType: 'billing' };
  } else if (shift.behavioralHealthIds && shift.behavioralHealthIds.length > 0) {
    return { staffId: shift.behavioralHealthIds[0], staffType: 'behavioralHealth' };
  }
  return null;
};

export interface EffectiveTimeSlot {
  shiftId: string;
  staffId: string; // Changed from providerId to support all staff types
  staffType: 'provider' | 'frontStaff' | 'billing' | 'behavioralHealth';
  start: Date;
  end: Date;
}

export const combineDateAndTime = (dateStr: string, timeStr: string | undefined): Date => {
  if (!timeStr) { // For all-day events or shifts where time is not relevant (like some vacations)
    return new Date(dateStr + 'T00:00:00');
  }
  return new Date(`${dateStr}T${timeStr}`);
};

export const getEffectiveTimeSlotsForShift = (
  shift: Shift,
  windowStart: Date,
  windowEnd: Date,
  allShiftsForExceptionHandling: Shift[]
): EffectiveTimeSlot[] => {
  if (shift.isVacation) {
    return []; // Vacations do not participate in this conflict detection
  }

  const slots: EffectiveTimeSlot[] = [];
  const occurrences = generateRecurringDates(shift, windowStart, windowEnd, allShiftsForExceptionHandling);

  occurrences.forEach(occurrenceDate => {
    const shiftStartDate = new Date(shift.startDate + 'T00:00:00');
    const shiftEndDate = new Date(shift.endDate + 'T00:00:00');
    const durationDays = Math.max(0, (shiftEndDate.getTime() - shiftStartDate.getTime()) / (1000 * 60 * 60 * 24));

    const instanceStartDateTime = combineDateAndTime(getISODateString(occurrenceDate), shift.startTime);
    
    // Calculate the actual end date and time for this specific instance
    const tempInstanceEndDate = addDays(occurrenceDate, durationDays);
    const instanceEndDateTime = combineDateAndTime(getISODateString(tempInstanceEndDate), shift.endTime);

    // Ensure end time is after start time, especially for multi-day shifts ending early next day.
    // This simple check assumes shifts don't cross midnight for their time component alone.
    // More complex logic would be needed for shifts like 10 PM - 2 AM.
    if (instanceEndDateTime <= instanceStartDateTime && shift.startTime && shift.endTime) {
        // This typically happens if an all-day portion of a multi-day event is being calculated,
        // or if a shift spans midnight (e.g. 22:00 to 02:00 of next day, which is already handled by endDate)
        // For simplicity, if it's same day and end time is before start time, it's likely an error or an all-day assignment without times.
        // For this conflict detection, we need valid time ranges.
        // If end time is before start on the same effective day, it might mean it ends on the *next* day if it was a single day definition.
        // However, our generateRecurringDates and durationDays logic should handle multi-day spans correctly.
        // This check is more of a safeguard for single-day definitions with odd times.
    }


    const staffInfo = getPrimaryStaffForConflictDetection(shift);
    if (staffInfo) {
      slots.push({
        shiftId: shift.id,
        staffId: staffInfo.staffId,
        staffType: staffInfo.staffType,
        start: instanceStartDateTime,
        end: instanceEndDateTime,
      });
    }
  });

  return slots;
};

// Detects all conflicts within a given set of shifts
export const detectAllShiftConflicts = (
  shifts: Shift[],
  allShiftsForExceptionHandling: Shift[], // Typically the same as 'shifts' unless specific context
  detectionWindowStart: Date, // Start of the period to check for conflicts
  detectionWindowEnd: Date    // End of the period
): Set<string> => {
  const conflictingShiftIds = new Set<string>();
  const staffShiftsMap = new Map<string, Shift[]>();

  // Group shifts by staff member (any type)
  shifts.forEach(shift => {
    if (!shift.isVacation) { // Only consider non-vacation shifts for conflicts
      const staffInfo = getPrimaryStaffForConflictDetection(shift);
      if (staffInfo) {
        const list = staffShiftsMap.get(staffInfo.staffId) || [];
        list.push(shift);
        staffShiftsMap.set(staffInfo.staffId, list);
      }
    }
  });

  // For each staff member, check their shifts for overlaps
  staffShiftsMap.forEach(staffShifts => {
    const effectiveSlots: EffectiveTimeSlot[] = [];
    staffShifts.forEach(shift => {
      effectiveSlots.push(...getEffectiveTimeSlotsForShift(shift, detectionWindowStart, detectionWindowEnd, allShiftsForExceptionHandling));
    });

    for (let i = 0; i < effectiveSlots.length; i++) {
      for (let j = i + 1; j < effectiveSlots.length; j++) {
        const slotA = effectiveSlots[i];
        const slotB = effectiveSlots[j];

        // Check for overlap: (StartA < EndB) and (EndA > StartB)
        if (slotA.start < slotB.end && slotA.end > slotB.start) {
          conflictingShiftIds.add(slotA.shiftId);
          conflictingShiftIds.add(slotB.shiftId);
        }
      }
    }
  });

  return conflictingShiftIds;
};

// Finds conflicts for a single (potentially new or being edited) shift configuration
export const findConflictsForSingleShiftConfiguration = (
  targetShiftConfig: Omit<Shift, 'id' | 'color' | 'title' | 'createdAt' | 'updatedAt'> & { id?: string }, // id is optional for new shifts
  allExistingShifts: Shift[],
  detectionWindowStart: Date,
  detectionWindowEnd: Date
): string[] => { // Returns titles of conflicting shifts
  if (targetShiftConfig.isVacation || !targetShiftConfig.startTime || !targetShiftConfig.endTime) {
    return [];
  }

  const targetStaffInfo = getPrimaryStaffForConflictDetection(targetShiftConfig as Shift);
  if (!targetStaffInfo) {
    return []; // No staff assigned, no conflicts possible
  }

  // Create a temporary Shift object for the target configuration
  const tempTargetShift: Shift = {
    id: targetShiftConfig.id || 'temp-target-shift',
    providerId: targetShiftConfig.providerId,
    clinicTypeId: targetShiftConfig.clinicTypeId,
    medicalAssistantIds: targetShiftConfig.medicalAssistantIds,
    frontStaffIds: targetShiftConfig.frontStaffIds,
    billingIds: targetShiftConfig.billingIds,
    behavioralHealthIds: targetShiftConfig.behavioralHealthIds,
    startDate: targetShiftConfig.startDate,
    endDate: targetShiftConfig.endDate,
    startTime: targetShiftConfig.startTime,
    endTime: targetShiftConfig.endTime,
    isVacation: false, // Already checked
    notes: targetShiftConfig.notes,
    recurringRule: targetShiftConfig.recurringRule,
    seriesId: targetShiftConfig.seriesId,
    originalRecurringShiftId: targetShiftConfig.originalRecurringShiftId,
    isExceptionInstance: targetShiftConfig.isExceptionInstance,
    exceptionForDate: targetShiftConfig.exceptionForDate,
    createdByUserId: targetShiftConfig.createdByUserId,
    // Dummy values for non-essential fields for conflict check
    color: '',
    title: 'Current Configuration',
    createdAt: '',
    updatedAt: '',
  };

  const targetSlots = getEffectiveTimeSlotsForShift(tempTargetShift, detectionWindowStart, detectionWindowEnd, allExistingShifts);
  
  const conflictingShiftTitles: string[] = [];
  const processedConflictingShiftIds = new Set<string>();


  const otherShiftsForSameStaff = allExistingShifts.filter(s => {
    if (s.isVacation) {
      return false; // Exclude vacations
    }
    
    // Exclude the exact same shift if editing
    if (s.id === targetShiftConfig.id) {
      return false;
    }
    
    // Exclude entire series if editing a series (to prevent false conflicts when changing staff types)
    if (targetShiftConfig.seriesId && s.seriesId === targetShiftConfig.seriesId) {
      return false;
    }
    
    const otherStaffInfo = getPrimaryStaffForConflictDetection(s);
    return otherStaffInfo && otherStaffInfo.staffId === targetStaffInfo.staffId;
  });

  otherShiftsForSameStaff.forEach(otherShift => {
    const otherSlots = getEffectiveTimeSlotsForShift(otherShift, detectionWindowStart, detectionWindowEnd, allExistingShifts);
    
    for (const tSlot of targetSlots) {
      for (const oSlot of otherSlots) {
        if (tSlot.start < oSlot.end && tSlot.end > oSlot.start) {
          if (!processedConflictingShiftIds.has(otherShift.id)) {
            conflictingShiftTitles.push(otherShift.title || `Shift ID: ${otherShift.id}`);
            processedConflictingShiftIds.add(otherShift.id);
          }
          break; // Found a conflict for this otherShift, no need to check its other slots against this tSlot
        }
      }
      if (processedConflictingShiftIds.has(otherShift.id)) break; // Move to next otherShift
    }
  });
  
  return conflictingShiftTitles;
};