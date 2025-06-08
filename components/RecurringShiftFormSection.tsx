
import React from 'react';
import { RecurringRule, RecurringFrequency } from '../types';
import { DAYS_OF_WEEK, RECURRING_FREQUENCY_OPTIONS } from '../constants';
import { getISODateString } from '../utils/dateUtils';

interface RecurringShiftFormSectionProps {
  recurringRule: RecurringRule | undefined;
  onRecurringRuleChange: <K extends keyof RecurringRule>(field: K, value: RecurringRule[K] | undefined) => void;
  baseStartDate: string; // Used to set default end date for recurrence
}

const RecurringShiftFormSection: React.FC<RecurringShiftFormSectionProps> = ({ recurringRule, onRecurringRuleChange, baseStartDate }) => {
  const handleFrequencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFrequency = e.target.value as RecurringFrequency;
    const oldFrequency = recurringRule?.frequency;

    // First, update the frequency itself
    onRecurringRuleChange('frequency', newFrequency);

    // Prepare updates for other fields based on the new frequency
    const fieldsToUpdate: Partial<Omit<RecurringRule, 'frequency'>> = {};

    if (newFrequency === RecurringFrequency.NONE) {
      fieldsToUpdate.daysOfWeek = undefined;
      fieldsToUpdate.dayOfMonth = undefined;
      fieldsToUpdate.endDate = undefined; // Clear end date for "Does not repeat"
      fieldsToUpdate.interval = undefined;
    } else if (newFrequency === RecurringFrequency.DAILY) {
      fieldsToUpdate.daysOfWeek = undefined; // Not applicable for daily
      fieldsToUpdate.dayOfMonth = undefined; // Not applicable for daily
      fieldsToUpdate.interval = 1;
    } else if (newFrequency === RecurringFrequency.WEEKLY || newFrequency === RecurringFrequency.BI_WEEKLY) {
      fieldsToUpdate.dayOfMonth = undefined; // Not applicable for weekly/bi-weekly
      if ((oldFrequency === RecurringFrequency.WEEKLY || oldFrequency === RecurringFrequency.BI_WEEKLY) && recurringRule?.daysOfWeek && recurringRule.daysOfWeek.length > 0) {
        // If switching between Weekly and Bi-Weekly, and days were already selected, keep them.
        fieldsToUpdate.daysOfWeek = recurringRule.daysOfWeek;
      } else {
        // Otherwise (e.g., switching from None/Daily, or if no days were previously selected for a W/BW rule),
        // default to an empty array. User must explicitly select days.
        fieldsToUpdate.daysOfWeek = [];
      }
      fieldsToUpdate.interval = newFrequency === RecurringFrequency.BI_WEEKLY ? 2 : 1;
    } else if (newFrequency === RecurringFrequency.MONTHLY) {
      fieldsToUpdate.daysOfWeek = undefined; // Not applicable for monthly
      // Default to current day of month from baseStartDate if not already set or switching from non-monthly
      if (oldFrequency !== RecurringFrequency.MONTHLY || !recurringRule?.dayOfMonth) {
        fieldsToUpdate.dayOfMonth = new Date(baseStartDate + 'T00:00:00').getDate();
      } else {
        fieldsToUpdate.dayOfMonth = recurringRule.dayOfMonth; // Keep existing if was monthly
      }
      fieldsToUpdate.interval = 1;
    }

    // Set or clear recurring end date
    if (newFrequency !== RecurringFrequency.NONE) {
      if (!recurringRule?.endDate || // If no end date was set
          oldFrequency === RecurringFrequency.NONE // or switching from "None"
         ) {
        const defaultEndDate = new Date(baseStartDate + 'T00:00:00');
        defaultEndDate.setMonth(defaultEndDate.getMonth() + 3); // Default to 3 months from base start date
        fieldsToUpdate.endDate = getISODateString(defaultEndDate);
      } else if (recurringRule?.endDate) {
        // If an end date already exists, and we're not clearing it for "NONE", keep it.
        // This ensures if user toggles frequency but had an end date, it's not lost unless they go to NONE.
        fieldsToUpdate.endDate = recurringRule.endDate;
      }
    } else { // newFrequency is NONE
        fieldsToUpdate.endDate = undefined; // Explicitly clear endDate
    }
    
    // Apply all deduced changes
    // (The onRecurringRuleChange in ShiftForm handles actual state update and merging)
    for (const key in fieldsToUpdate) {
        const K = key as keyof Omit<RecurringRule, 'frequency'>;
        onRecurringRuleChange(K, fieldsToUpdate[K]);
    }
  };

  const handleDaysOfWeekChange = (dayIndex: number) => {
    const currentDays = recurringRule?.daysOfWeek || [];
    const newDays = currentDays.includes(dayIndex)
      ? currentDays.filter(d => d !== dayIndex)
      : [...currentDays, dayIndex];
    onRecurringRuleChange('daysOfWeek', newDays.sort());
  };

  return (
    <div className="space-y-4 p-4 border border-gray-200 rounded-md mt-4">
      <h4 className="text-md font-medium text-gray-800">Recurrence</h4>
      <div>
        <label htmlFor="recurringFrequency" className="block text-sm font-medium text-gray-700">Repeats</label>
        <select
          id="recurringFrequency"
          value={recurringRule?.frequency || RecurringFrequency.NONE}
          onChange={handleFrequencyChange}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
        >
          {RECURRING_FREQUENCY_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {(recurringRule?.frequency === RecurringFrequency.WEEKLY || recurringRule?.frequency === RecurringFrequency.BI_WEEKLY) && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Repeat on</label>
          <div className="mt-2 grid grid-cols-4 sm:grid-cols-7 gap-2">
            {DAYS_OF_WEEK.map((day, index) => (
              <button
                type="button"
                key={index}
                onClick={() => handleDaysOfWeekChange(index)}
                className={`px-3 py-2 border rounded-md text-sm ${
                  recurringRule?.daysOfWeek?.includes(index)
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
           {(!recurringRule?.daysOfWeek || recurringRule.daysOfWeek.length === 0) && (
             <p className="mt-1 text-xs text-red-500">Please select at least one day to repeat on.</p>
           )}
        </div>
      )}

      {recurringRule?.frequency === RecurringFrequency.MONTHLY && (
        <div>
          <label htmlFor="dayOfMonth" className="block text-sm font-medium text-gray-700">Day of Month</label>
          <input
            type="number"
            id="dayOfMonth"
            min="1" max="31"
            value={recurringRule?.dayOfMonth || ''}
            onChange={(e) => onRecurringRuleChange('dayOfMonth', parseInt(e.target.value, 10) || undefined)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            required
          />
           {(!recurringRule?.dayOfMonth) && (
             <p className="mt-1 text-xs text-red-500">Please select a day of the month.</p>
           )}
        </div>
      )}

      {recurringRule?.frequency !== RecurringFrequency.NONE && (
        <div>
          <label htmlFor="recurringEndDate" className="block text-sm font-medium text-gray-700">Ends on</label>
          <input
            type="date"
            id="recurringEndDate"
            value={recurringRule?.endDate || ''}
            min={baseStartDate} // Ensure end date is not before the shift's own start date
            onChange={(e) => onRecurringRuleChange('endDate', e.target.value || undefined)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            required
          />
          {(!recurringRule?.endDate) && (
             <p className="mt-1 text-xs text-red-500">Please select an end date for the recurrence.</p>
           )}
        </div>
      )}
    </div>
  );
};

export default RecurringShiftFormSection;
