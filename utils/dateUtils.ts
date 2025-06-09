import { MONTH_NAMES, DAYS_OF_WEEK } from '../constants';
import { Shift, RecurringRule, RecurringFrequency } from '../types';

// Timezone utilities for consistent Eastern Time handling
const EASTERN_TIMEZONE = 'America/New_York';

/**
 * Get the current date in Eastern Time
 */
export const getCurrentDateInEasternTime = (): Date => {
  const now = new Date();
  // Use Intl.DateTimeFormat to get reliable Eastern Time values
  const formatter = new Intl.DateTimeFormat('en-CA', { 
    timeZone: EASTERN_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  
  const parts = formatter.formatToParts(now);
  const year = parseInt(parts.find(p => p.type === 'year')?.value || '2025');
  const month = parseInt(parts.find(p => p.type === 'month')?.value || '1') - 1; // Month is 0-indexed
  const day = parseInt(parts.find(p => p.type === 'day')?.value || '1');
  const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '0');
  const minute = parseInt(parts.find(p => p.type === 'minute')?.value || '0');
  const second = parseInt(parts.find(p => p.type === 'second')?.value || '0');
  
  return new Date(year, month, day, hour, minute, second);
};

/**
 * Convert any date to Eastern Time
 */
export const convertToEasternTime = (date: Date): Date => {
  const formatter = new Intl.DateTimeFormat('en-CA', { 
    timeZone: EASTERN_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  
  const parts = formatter.formatToParts(date);
  const year = parseInt(parts.find(p => p.type === 'year')?.value || '2025');
  const month = parseInt(parts.find(p => p.type === 'month')?.value || '1') - 1;
  const day = parseInt(parts.find(p => p.type === 'day')?.value || '1');
  const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '0');
  const minute = parseInt(parts.find(p => p.type === 'minute')?.value || '0');
  const second = parseInt(parts.find(p => p.type === 'second')?.value || '0');
  
  return new Date(year, month, day, hour, minute, second);
};

/**
 * Create a date in Eastern Time from date components
 */
export const createEasternDate = (year: number, month: number, day: number): Date => {
  // Create date directly without timezone conversion issues
  return new Date(year, month, day);
};

/**
 * Get today's date in Eastern Time (date only, no time)
 */
export const getTodayInEasternTime = (): Date => {
  const now = getCurrentDateInEasternTime();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

/**
 * Format a date using Eastern Time locale
 */
export const formatDateInEasternTime = (date: Date, options?: Intl.DateTimeFormatOptions): string => {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    timeZone: EASTERN_TIMEZONE,
    ...options
  };
  return date.toLocaleDateString('en-US', defaultOptions);
};

/**
 * Format a date and time using Eastern Time locale
 */
export const formatDateTimeInEasternTime = (date: Date, options?: Intl.DateTimeFormatOptions): string => {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    timeZone: EASTERN_TIMEZONE,
    ...options
  };
  return date.toLocaleString('en-US', defaultOptions);
};

export const getDaysInMonth = (year: number, month: number): Date[] => {
  const date = new Date(year, month, 1);
  const days: Date[] = [];
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
};

export const getMonthYearString = (date: Date): string => {
  return `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
};

export const getFormattedDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const addMonths = (date: Date, months: number): Date => {
  const newDate = new Date(date);
  newDate.setMonth(newDate.getMonth() + months);
  return newDate;
};

export const addDays = (date: Date, days: number): Date => {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + days);
  return newDate;
};

export const getISODateString = (date: Date): string => {
    return date.toISOString().split('T')[0];
};

export const getWeekRangeString = (date: Date, weekStartsOn: 0 | 1 = 0): string => {
  const startOfWeek = new Date(date);
  const currentDay = startOfWeek.getDay();
  let diff = currentDay - weekStartsOn;
  if (diff < 0) {
    diff += 7;
  }
  startOfWeek.setDate(startOfWeek.getDate() - diff);

  const endOfWeek = addDays(new Date(startOfWeek), 6);

  const startMonth = MONTH_NAMES[startOfWeek.getMonth()];
  const endMonth = MONTH_NAMES[endOfWeek.getMonth()];

  if (startOfWeek.getFullYear() !== endOfWeek.getFullYear()) {
    return `${startMonth} ${startOfWeek.getDate()}, ${startOfWeek.getFullYear()} - ${endMonth} ${endOfWeek.getDate()}, ${endOfWeek.getFullYear()}`;
  }
  if (startMonth === endMonth) {
    return `${startMonth} ${startOfWeek.getDate()} - ${endOfWeek.getDate()}, ${startOfWeek.getFullYear()}`;
  }
  return `${startMonth} ${startOfWeek.getDate()} - ${endMonth} ${endOfWeek.getDate()}, ${startOfWeek.getFullYear()}`;
};


export const generateRecurringDates = (
    baseShift: Shift,
    viewStartDate: Date,
    viewEndDate: Date,
    allShifts: Shift[] // Pass all shifts to check for exceptions
): Date[] => {
    const dates: Date[] = [];
    // If it's an exception instance itself, it doesn't generate further dates, it just is.
    // Its single occurrence is handled by CalendarGrid directly.
    if (baseShift.isExceptionInstance) {
        const sDate = new Date(baseShift.startDate + 'T00:00:00');
        if (sDate >= viewStartDate && sDate <= viewEndDate) {
            dates.push(sDate);
        }
        return dates;
    }

    if (!baseShift.recurringRule || baseShift.recurringRule.frequency === RecurringFrequency.NONE) {
        const sDate = new Date(baseShift.startDate + 'T00:00:00');
        const eDate = new Date(baseShift.endDate + 'T00:00:00');
        let currentDateInSpan = new Date(sDate);
        while(currentDateInSpan <= eDate) {
            if (currentDateInSpan >= viewStartDate && currentDateInSpan <= viewEndDate) {
                 dates.push(new Date(currentDateInSpan));
            }
            currentDateInSpan = addDays(currentDateInSpan, 1);
        }
        return dates;
    }

    const { frequency, interval = 1, daysOfWeek, dayOfMonth, endDate: recurringEndDateStr } = baseShift.recurringRule;
    let currentDate = new Date(baseShift.startDate + 'T00:00:00');
    const recurringEndDate = recurringEndDateStr ? new Date(recurringEndDateStr + 'T00:00:00') : addMonths(new Date(baseShift.startDate + 'T00:00:00'), 12*5);

    const baseShiftStartDate = new Date(baseShift.startDate + 'T00:00:00');
    const baseShiftEndDate = new Date(baseShift.endDate + 'T00:00:00');
    const shiftDurationDays = (baseShiftEndDate.getTime() - baseShiftStartDate.getTime()) / (1000 * 60 * 60 * 24);


    while (currentDate <= recurringEndDate && currentDate <= viewEndDate) {
        if (currentDate >= baseShiftStartDate) {
            let isValidForPatternStart = false;
            switch (frequency) {
                case RecurringFrequency.DAILY:
                    if (interval > 0) {
                        const daysDiff = (currentDate.getTime() - baseShiftStartDate.getTime()) / (1000 * 60 * 60 * 24);
                        if (daysDiff % interval === 0) isValidForPatternStart = true;
                    }
                    break;
                case RecurringFrequency.WEEKLY:
                    if (daysOfWeek?.includes(currentDate.getDay())) isValidForPatternStart = true;
                    break;
                case RecurringFrequency.BI_WEEKLY:
                     if (daysOfWeek?.includes(currentDate.getDay())) {
                        const msInDay = 24 * 60 * 60 * 1000;
                        const daysSinceOriginalStart = Math.floor((currentDate.getTime() - baseShiftStartDate.getTime()) / msInDay);
                        const weeksSinceOriginalStart = Math.floor(daysSinceOriginalStart / 7);
                        if (weeksSinceOriginalStart % 2 === 0) isValidForPatternStart = true;
                    }
                    break;
                case RecurringFrequency.MONTHLY:
                    if (dayOfMonth && currentDate.getDate() === dayOfMonth) {
                         if (interval > 0) {
                            const monthDiff = (currentDate.getFullYear() - baseShiftStartDate.getFullYear()) * 12 + (currentDate.getMonth() - baseShiftStartDate.getMonth());
                            if (monthDiff % interval === 0) isValidForPatternStart = true;
                        }
                    }
                    break;
            }

            if (isValidForPatternStart) {
                const instanceStartDate = new Date(currentDate);
                for (let i = 0; i <= shiftDurationDays; i++) {
                    const dayOfInstance = addDays(new Date(instanceStartDate), i);
                    const dayOfInstanceStr = getISODateString(dayOfInstance);

                    if (dayOfInstance > recurringEndDate) break;
                    if (dayOfInstance < viewStartDate || dayOfInstance > viewEndDate) continue;

                    // Check for an overriding exception for this baseShift's seriesId on this specific dayOfInstance
                    const hasOverridingException = allShifts.some(s =>
                        s.isExceptionInstance &&
                        s.seriesId === (baseShift.seriesId || baseShift.id) && // Compare with baseShift's series identifier
                        s.exceptionForDate === dayOfInstanceStr
                    );

                    if (hasOverridingException) {
                        // If an exception exists for this day and this series, skip generating this instance day
                        continue;
                    }

                    let includeThisDayDueToRule = true;
                    if ((frequency === RecurringFrequency.WEEKLY || frequency === RecurringFrequency.BI_WEEKLY) && shiftDurationDays > 0) {
                        if (!daysOfWeek?.includes(dayOfInstance.getDay())) {
                            includeThisDayDueToRule = false;
                        }
                    }

                    if (includeThisDayDueToRule) {
                        if (!dates.find(d => d.getTime() === dayOfInstance.getTime())) {
                            dates.push(new Date(dayOfInstance));
                        }
                    }
                }
            }
        }

        // Advance currentDate based on the most granular unit of the frequency
        // For weekly/bi-weekly, we advance by day to check each day for meeting rule.
        // For daily, also by day. For monthly, also by day.
        currentDate = addDays(currentDate, 1);
    }

    return dates.sort((a, b) => a.getTime() - b.getTime());
};

export const getWeekDays = (date: Date, weekStartsOn: 0 | 1 = 0): Date[] => {
    // Normalize the input date to midnight to avoid time component issues
    const normalizedDateInput = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    const startOfWeekCalculated = new Date(normalizedDateInput);
    const currentDay = startOfWeekCalculated.getDay(); // 0 for Sunday, 1 for Monday, ...
    let diff = currentDay - weekStartsOn;
    if (diff < 0) {
      diff += 7;
    }
    startOfWeekCalculated.setDate(startOfWeekCalculated.getDate() - diff);
    // startOfWeekCalculated is now the correct date, at midnight.

    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
        // addDays creates a new Date object from startOfWeekCalculated and adds days to it.
        // Since startOfWeekCalculated is at midnight, all resulting dates will also be at midnight.
        week.push(addDays(startOfWeekCalculated, i));
    }
    return week;
};

export const formatTime = (timeStr?: string): string => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const h = parseInt(hours, 10);
    const m = parseInt(minutes, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const formattedHours = h % 12 || 12;
    return `${formattedHours}:${m < 10 ? '0' : ''}${m} ${ampm}`;
};

export const getInitials = (name?: string): string => {
  if (!name) return 'N/A';
  const parts = name.split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + (parts[parts.length - 1][0] || '')).toUpperCase();
};
