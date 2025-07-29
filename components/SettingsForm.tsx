import React, { useState, useEffect, useContext } from 'react';
import { SettingsContext, ToastContext, AppContext } from '../App';
import { UserSettings, CalendarViewMode } from '../types';
import SpinnerIcon from './icons/SpinnerIcon';
import { calculateStaffHours, exportStaffHoursToCSV, exportStaffHoursSummaryToCSV, StaffHoursReportOptions } from '../utils/staffHoursCalculator';
import { getISODateString } from '../utils/dateUtils';
import DownloadIcon from './icons/DownloadIcon';

interface SettingsFormProps {
  onClose: () => void;
}

const SettingsForm: React.FC<SettingsFormProps> = ({ onClose }) => {
  const settingsContext = useContext(SettingsContext);
  const toastContext = useContext(ToastContext);
  const appContext = useContext(AppContext);

  if (!settingsContext) throw new Error("SettingsContext not found");
  if (!toastContext) throw new Error("ToastContext not found");
  if (!appContext) throw new Error("AppContext not found");

  const { settings, updateSettings } = settingsContext;
  const { addToast } = toastContext;
  const { shifts, providers, frontStaff, billing, behavioralHealth } = appContext;

  const [currentSettings, setCurrentSettings] = useState<UserSettings>(settings);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Staff hours export state
  const today = new Date();
  const oneWeekAgo = new Date(today);
  oneWeekAgo.setDate(today.getDate() - 7);
  
  const [hoursStartDate, setHoursStartDate] = useState(getISODateString(oneWeekAgo));
  const [hoursEndDate, setHoursEndDate] = useState(getISODateString(today));
  const [hoursStaffType, setHoursStaffType] = useState<StaffHoursReportOptions['staffType']>('all');
  const [includeVacations, setIncludeVacations] = useState(false);
  const [exportFormat, setExportFormat] = useState<'detailed' | 'summary'>('summary');

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

  const handleDepartmentTimeChange = (department: string, field: 'startTime' | 'endTime', value: string) => {
    setCurrentSettings(prev => ({
      ...prev,
      departmentDefaults: {
        ...prev.departmentDefaults,
        [department]: {
          ...prev.departmentDefaults[department as keyof typeof prev.departmentDefaults],
          [field]: value
        }
      }
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

  const handleExportHours = () => {
    try {
      const options: StaffHoursReportOptions = {
        startDate: new Date(hoursStartDate),
        endDate: new Date(hoursEndDate),
        staffType: hoursStaffType,
        includeVacations
      };
      
      const reports = calculateStaffHours(
        shifts,
        providers,
        frontStaff,
        billing,
        behavioralHealth,
        options
      );
      
      if (reports.length === 0) {
        addToast('No staff hours found for the selected criteria', 'warning');
        return;
      }
      
      if (exportFormat === 'detailed') {
        exportStaffHoursToCSV(reports, options.startDate, options.endDate);
      } else {
        exportStaffHoursSummaryToCSV(reports, options.startDate, options.endDate);
      }
      
      addToast('Staff hours report exported successfully', 'success');
    } catch (error) {
      console.error('Error exporting staff hours:', error);
      addToast('Error exporting staff hours report', 'error');
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
      
      {/* Department Default Times Section */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Department Default Times</h3>
        <p className="text-sm text-gray-600 mb-4">Set default start and end times for each department when creating new shifts.</p>
        
        <div className="space-y-4">
          {/* Providers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="font-medium text-gray-700 flex items-center">
              <span className="mr-2">👨‍⚕️</span>
              Providers
            </div>
            <div>
              <label htmlFor="providers-start" className="block text-xs font-medium text-gray-600 mb-1">Start Time</label>
              <input
                type="time"
                id="providers-start"
                value={currentSettings.departmentDefaults?.providers?.startTime || '07:30'}
                onChange={(e) => handleDepartmentTimeChange('providers', 'startTime', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label htmlFor="providers-end" className="block text-xs font-medium text-gray-600 mb-1">End Time</label>
              <input
                type="time"
                id="providers-end"
                value={currentSettings.departmentDefaults?.providers?.endTime || '17:00'}
                onChange={(e) => handleDepartmentTimeChange('providers', 'endTime', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Medical Assistants */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="font-medium text-gray-700 flex items-center">
              <span className="mr-2">🩺</span>
              Medical Assistants
            </div>
            <div>
              <label htmlFor="medicalAssistants-start" className="block text-xs font-medium text-gray-600 mb-1">Start Time</label>
              <input
                type="time"
                id="medicalAssistants-start"
                value={currentSettings.departmentDefaults?.medicalAssistants?.startTime || '07:30'}
                onChange={(e) => handleDepartmentTimeChange('medicalAssistants', 'startTime', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label htmlFor="medicalAssistants-end" className="block text-xs font-medium text-gray-600 mb-1">End Time</label>
              <input
                type="time"
                id="medicalAssistants-end"
                value={currentSettings.departmentDefaults?.medicalAssistants?.endTime || '17:00'}
                onChange={(e) => handleDepartmentTimeChange('medicalAssistants', 'endTime', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Front Staff */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="font-medium text-gray-700 flex items-center">
              <span className="mr-2">🏢</span>
              Front Staff
            </div>
            <div>
              <label htmlFor="frontStaff-start" className="block text-xs font-medium text-gray-600 mb-1">Start Time</label>
              <input
                type="time"
                id="frontStaff-start"
                value={currentSettings.departmentDefaults?.frontStaff?.startTime || '08:00'}
                onChange={(e) => handleDepartmentTimeChange('frontStaff', 'startTime', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label htmlFor="frontStaff-end" className="block text-xs font-medium text-gray-600 mb-1">End Time</label>
              <input
                type="time"
                id="frontStaff-end"
                value={currentSettings.departmentDefaults?.frontStaff?.endTime || '17:00'}
                onChange={(e) => handleDepartmentTimeChange('frontStaff', 'endTime', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Billing */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="font-medium text-gray-700 flex items-center">
              <span className="mr-2">💰</span>
              Billing
            </div>
            <div>
              <label htmlFor="billing-start" className="block text-xs font-medium text-gray-600 mb-1">Start Time</label>
              <input
                type="time"
                id="billing-start"
                value={currentSettings.departmentDefaults?.billing?.startTime || '08:00'}
                onChange={(e) => handleDepartmentTimeChange('billing', 'startTime', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label htmlFor="billing-end" className="block text-xs font-medium text-gray-600 mb-1">End Time</label>
              <input
                type="time"
                id="billing-end"
                value={currentSettings.departmentDefaults?.billing?.endTime || '17:00'}
                onChange={(e) => handleDepartmentTimeChange('billing', 'endTime', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Behavioral Health */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="font-medium text-gray-700 flex items-center">
              <span className="mr-2">🧠</span>
              Behavioral Health
            </div>
            <div>
              <label htmlFor="behavioralHealth-start" className="block text-xs font-medium text-gray-600 mb-1">Start Time</label>
              <input
                type="time"
                id="behavioralHealth-start"
                value={currentSettings.departmentDefaults?.behavioralHealth?.startTime || '08:00'}
                onChange={(e) => handleDepartmentTimeChange('behavioralHealth', 'startTime', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label htmlFor="behavioralHealth-end" className="block text-xs font-medium text-gray-600 mb-1">End Time</label>
              <input
                type="time"
                id="behavioralHealth-end"
                value={currentSettings.departmentDefaults?.behavioralHealth?.endTime || '17:00'}
                onChange={(e) => handleDepartmentTimeChange('behavioralHealth', 'endTime', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                disabled={isSubmitting}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Staff Hours Export Section */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Export Staff Hours</h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="hoursStartDate" className="block text-sm font-medium text-gray-700">
                Start Date
              </label>
              <input
                type="date"
                id="hoursStartDate"
                value={hoursStartDate}
                onChange={(e) => setHoursStartDate(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="hoursEndDate" className="block text-sm font-medium text-gray-700">
                End Date
              </label>
              <input
                type="date"
                id="hoursEndDate"
                value={hoursEndDate}
                min={hoursStartDate}
                onChange={(e) => setHoursEndDate(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="hoursStaffType" className="block text-sm font-medium text-gray-700">
                Staff Type
              </label>
              <select
                id="hoursStaffType"
                value={hoursStaffType}
                onChange={(e) => setHoursStaffType(e.target.value as StaffHoursReportOptions['staffType'])}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="all">All Staff</option>
                <option value="providers">Providers Only</option>
                <option value="frontStaff">Front Staff Only</option>
                <option value="billing">Billing Staff Only</option>
                <option value="behavioralHealth">Behavioral Health Only</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="exportFormat" className="block text-sm font-medium text-gray-700">
                Export Format
              </label>
              <select
                id="exportFormat"
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as 'detailed' | 'summary')}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="summary">Summary (Total Hours Only)</option>
                <option value="detailed">Detailed (All Shifts)</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="includeVacations"
              checked={includeVacations}
              onChange={(e) => setIncludeVacations(e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="includeVacations" className="ml-2 text-sm text-gray-700">
              Include vacation/time-off entries
            </label>
          </div>
          
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleExportHours}
              className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <DownloadIcon className="mr-2 h-4 w-4" />
              Export Hours Report
            </button>
          </div>
        </div>
        
        <p className="mt-2 text-xs text-gray-500">
          Export a CSV file with staff hours for the selected date range. Summary shows total hours per staff member, while Detailed includes individual shifts.
        </p>
      </div>

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
