import React, { useState, useEffect, useContext } from 'react';
import { SettingsContext, ToastContext } from '../App';
import { UserSettings, CalendarViewMode } from '../types';
import SpinnerIcon from './icons/SpinnerIcon';

interface SettingsFormProps {
  onClose: () => void;
}

const SettingsForm: React.FC<SettingsFormProps> = ({ onClose }) => {
  const settingsContext = useContext(SettingsContext);
  const toastContext = useContext(ToastContext);

  if (!settingsContext) throw new Error("SettingsContext not found");
  if (!toastContext) throw new Error("ToastContext not found");

  const { settings, updateSettings } = settingsContext;
  const { addToast } = toastContext;

  const [currentSettings, setCurrentSettings] = useState<UserSettings>(settings);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setCurrentSettings(settings);
  }, [settings]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    
    let processedValue: string | number = value;
    if (name === "weekStartsOn") {
      processedValue = parseInt(value, 10);
    } else if (name === "defaultCalendarView") {
        processedValue = value as CalendarViewMode;
    }
    
    setCurrentSettings(prev => ({
      ...prev,
      [name]: processedValue,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // The updateSettings function in AppContext already handles showing a success toast.
      await updateSettings(currentSettings); 
      onClose();
    } catch (error) {
      console.error("Error saving settings:", error);
      addToast(`Error saving settings: ${error instanceof Error ? error.message : "Unknown error"}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="defaultCalendarView" className="block text-sm font-medium text-gray-700">
          Default Calendar View
        </label>
        <select
          id="defaultCalendarView"
          name="defaultCalendarView"
          value={currentSettings.defaultCalendarView}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          disabled={isSubmitting}
          aria-describedby="defaultCalendarViewHelp"
        >
          <option value="month">Month</option>
          <option value="week">Week</option>
          <option value="day">Day</option>
        </select>
        <p id="defaultCalendarViewHelp" className="mt-1 text-xs text-gray-500">Select the view that the calendar will default to when the application loads.</p>
      </div>

      <div>
        <label htmlFor="weekStartsOn" className="block text-sm font-medium text-gray-700">
          Week Starts On
        </label>
        <select
          id="weekStartsOn"
          name="weekStartsOn"
          value={currentSettings.weekStartsOn.toString()} // Value needs to be string for select compatibility
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          disabled={isSubmitting}
          aria-describedby="weekStartsOnHelp"
        >
          <option value="0">Sunday</option>
          <option value="1">Monday</option>
        </select>
        <p id="weekStartsOnHelp" className="mt-1 text-xs text-gray-500">Choose whether your week view starts on Sunday or Monday.</p>
      </div>
      
      {/* 
      Future settings example:
      <div>
        <label htmlFor="defaultShiftStartTime" className="block text-sm font-medium text-gray-700">
          Default Shift Start Time (Future)
        </label>
        <input
          type="time"
          id="defaultShiftStartTime"
          name="defaultShiftStartTime"
          // value={currentSettings.defaultShiftStartTime || '09:00'} // Assuming UserSettings would be extended
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          disabled={isSubmitting} // Or true if not implemented
        />
        <p className="mt-1 text-xs text-gray-500">Set a default start time when creating new shifts (not yet implemented).</p>
      </div>
       */}

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
          disabled={isSubmitting}
          aria-live="polite" // Announce changes for assistive technologies
          aria-busy={isSubmitting}
        >
          {isSubmitting && <SpinnerIcon className="mr-2 h-4 w-4" aria-hidden="true" />}
          {isSubmitting ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </form>
  );
};

export default SettingsForm;
