import React, { useState, useContext } from 'react';
import { AppContext, ToastContext } from '../App';
import { PdfExportOptions, exportToPdf } from '../utils/pdfUtils';
import { getISODateString } from '../utils/dateUtils';
import { CalendarViewMode } from '../types';
import SpinnerIcon from './icons/SpinnerIcon';

interface PdfExportSetupModalProps {
  onClose: () => void;
  currentCalendarViewMode?: CalendarViewMode;
  onSetCalendarViewMode?: (mode: CalendarViewMode) => void;
}

const PdfExportSetupModal: React.FC<PdfExportSetupModalProps> = ({ 
  onClose, 
  currentCalendarViewMode, 
  onSetCalendarViewMode 
}) => {
  const appContext = useContext(AppContext);
  const toastContext = useContext(ToastContext);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!appContext || !toastContext) {
    return <div>Error: Context not available</div>;
  }

  const { providers = [], clinics: clinicTypes = [], medicalAssistants = [], shifts = [] } = appContext;
  const { addToast } = toastContext;

  // Initialize form state
  const today = new Date();
  const oneMonthFromNow = new Date();
  oneMonthFromNow.setMonth(today.getMonth() + 1);

  const [options, setOptions] = useState<PdfExportOptions>({
    startDate: getISODateString(today),
    endDate: getISODateString(oneMonthFromNow),
    viewType: 'list',
    calendarView: 'month',
    includeProviderIds: providers.filter(p => p.isActive).map(p => p.id),
    includeClinicTypeIds: clinicTypes.filter(c => c.isActive).map(c => c.id),
    includeMedicalAssistantIds: medicalAssistants.filter(ma => ma.isActive).map(ma => ma.id),
    includeVacations: true,
    orientation: 'portrait',
    paperSize: 'a4',
    title: ''
  });

  const handleInputChange = (field: keyof PdfExportOptions, value: any) => {
    setOptions(prev => ({ ...prev, [field]: value }));
  };

  const handleProviderToggle = (providerId: string) => {
    setOptions(prev => ({
      ...prev,
      includeProviderIds: prev.includeProviderIds.includes(providerId)
        ? prev.includeProviderIds.filter(id => id !== providerId)
        : [...prev.includeProviderIds, providerId]
    }));
  };

  const handleClinicToggle = (clinicId: string) => {
    setOptions(prev => ({
      ...prev,
      includeClinicTypeIds: prev.includeClinicTypeIds.includes(clinicId)
        ? prev.includeClinicTypeIds.filter(id => id !== clinicId)
        : [...prev.includeClinicTypeIds, clinicId]
    }));
  };

  const handleMaToggle = (maId: string) => {
    setOptions(prev => ({
      ...prev,
      includeMedicalAssistantIds: prev.includeMedicalAssistantIds.includes(maId)
        ? prev.includeMedicalAssistantIds.filter(id => id !== maId)
        : [...prev.includeMedicalAssistantIds, maId]
    }));
  };

  const handleSelectAllProviders = () => {
    const activeProviderIds = providers.filter(p => p.isActive).map(p => p.id);
    setOptions(prev => ({ ...prev, includeProviderIds: activeProviderIds }));
  };

  const handleSelectAllClinics = () => {
    const activeClinicIds = clinicTypes.filter(c => c.isActive).map(c => c.id);
    setOptions(prev => ({ ...prev, includeClinicTypeIds: activeClinicIds }));
  };

  const handleSelectAllMAs = () => {
    const activeMaIds = medicalAssistants.filter(ma => ma.isActive).map(ma => ma.id);
    setOptions(prev => ({ ...prev, includeMedicalAssistantIds: activeMaIds }));
  };

  const handleGeneratePdf = async () => {
    if (!options.startDate || !options.endDate) {
      addToast('Please select both start and end dates.', 'error');
      return;
    }

    if (new Date(options.startDate) > new Date(options.endDate)) {
      addToast('Start date must be before end date.', 'error');
      return;
    }

    if (options.includeProviderIds.length === 0) {
      addToast('Please select at least one provider.', 'error');
      return;
    }

    setIsGenerating(true);
    try {
      const data = {
        shifts,
        providers,
        clinicTypes,
        medicalAssistants,
        options
      };

      // For calendar view, temporarily switch to the selected view mode
      let originalViewMode: CalendarViewMode | undefined;
      if (options.viewType === 'calendar' && onSetCalendarViewMode && currentCalendarViewMode) {
        originalViewMode = currentCalendarViewMode;
        if (options.calendarView !== currentCalendarViewMode) {
          onSetCalendarViewMode(options.calendarView);
          // Give the calendar time to re-render
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      const calendarElementId = options.viewType === 'calendar' ? 'main-calendar-grid' : undefined;
      await exportToPdf(data, calendarElementId);
      
      // Restore original view mode if it was changed
      if (originalViewMode && onSetCalendarViewMode && originalViewMode !== options.calendarView) {
        onSetCalendarViewMode(originalViewMode);
      }
      
      addToast('PDF generated successfully!', 'success');
      onClose();
    } catch (error) {
      console.error('PDF generation error:', error);
      addToast(error instanceof Error ? error.message : 'Failed to generate PDF', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 max-h-[80vh] overflow-y-auto">
      {/* Header */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">PDF Export Configuration</h3>
        <p className="text-sm text-gray-600">
          Configure your PDF export settings to generate a customized schedule report.
        </p>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Report Title (optional)
        </label>
        <input
          type="text"
          value={options.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          placeholder="Custom title for your PDF report"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Date Range */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Date
          </label>
          <input
            type="date"
            value={options.startDate}
            onChange={(e) => handleInputChange('startDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            End Date
          </label>
          <input
            type="date"
            value={options.endDate}
            onChange={(e) => handleInputChange('endDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* View Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          View Type
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex items-center p-3 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
            <input
                             type="radio"
               name="viewType"
               value="list"
               checked={options.viewType === 'list'}
               onChange={(e) => handleInputChange('viewType', e.target.value as 'list' | 'calendar')}
               className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
               aria-describedby="list-view-description"
            />
            <div className="ml-3">
              <div className="text-sm font-medium text-gray-700">List View</div>
              <div className="text-xs text-gray-500">Detailed table format</div>
            </div>
          </label>
          <label className="flex items-center p-3 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
            <input
                             type="radio"
               name="viewType"
               value="calendar"
               checked={options.viewType === 'calendar'}
               onChange={(e) => handleInputChange('viewType', e.target.value as 'list' | 'calendar')}
               className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
               aria-describedby="calendar-view-description"
            />
            <div className="ml-3">
              <div className="text-sm font-medium text-gray-700">Calendar View</div>
              <div className="text-xs text-gray-500">Current calendar display</div>
            </div>
          </label>
        </div>
      </div>

      {/* Calendar View Type (only for calendar view) */}
      {options.viewType === 'calendar' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Calendar View Type
          </label>
          <p className="text-xs text-gray-500 mb-2">
            Choose which calendar view to capture. Week view shows more detailed information.
          </p>
                     <select
             value={options.calendarView}
             onChange={(e) => handleInputChange('calendarView', e.target.value as CalendarViewMode)}
             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
             aria-label="Calendar View Type"
          >
            <option value="month">Month View</option>
            <option value="week">Week View</option>
            <option value="day">Day View</option>
          </select>
        </div>
      )}

      {/* Providers */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Include Providers
          </label>
          <button
            type="button"
            onClick={handleSelectAllProviders}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            Select All Active
          </button>
        </div>
        <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2 space-y-1">
          {providers.filter(p => p.isActive).map((provider) => (
            <label key={provider.id} className="flex items-center text-sm">
              <input
                type="checkbox"
                checked={options.includeProviderIds.includes(provider.id)}
                onChange={() => handleProviderToggle(provider.id)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 flex items-center">
                <span className={`w-3 h-3 rounded-full mr-2 ${provider.color}`}></span>
                {provider.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Clinic Types */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Include Clinic Types
          </label>
          <button
            type="button"
            onClick={handleSelectAllClinics}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            Select All Active
          </button>
        </div>
        <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2 space-y-1">
          {clinicTypes.filter(c => c.isActive).map((clinic) => (
            <label key={clinic.id} className="flex items-center text-sm">
              <input
                type="checkbox"
                checked={options.includeClinicTypeIds.includes(clinic.id)}
                onChange={() => handleClinicToggle(clinic.id)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 flex items-center">
                <span className={`w-3 h-3 rounded-full mr-2 ${clinic.color}`}></span>
                {clinic.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Medical Assistants */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Include Medical Assistants
          </label>
          <button
            type="button"
            onClick={handleSelectAllMAs}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            Select All Active
          </button>
        </div>
        <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2 space-y-1">
          {medicalAssistants.filter(ma => ma.isActive).map((ma) => (
            <label key={ma.id} className="flex items-center text-sm">
              <input
                type="checkbox"
                checked={options.includeMedicalAssistantIds.includes(ma.id)}
                onChange={() => handleMaToggle(ma.id)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 flex items-center">
                <span className={`w-3 h-3 rounded-full mr-2 ${ma.color}`}></span>
                {ma.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Include Vacations */}
      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={options.includeVacations}
            onChange={(e) => handleInputChange('includeVacations', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <span className="ml-2 text-sm font-medium text-gray-700">Include Vacations/Time-off</span>
        </label>
      </div>

      {/* Output Options */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Orientation
          </label>
                     <select
             value={options.orientation}
             onChange={(e) => handleInputChange('orientation', e.target.value as 'portrait' | 'landscape')}
             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
             aria-label="Paper Orientation"
          >
            <option value="portrait">Portrait</option>
            <option value="landscape">Landscape</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Paper Size
          </label>
                     <select
             value={options.paperSize}
             onChange={(e) => handleInputChange('paperSize', e.target.value as 'a4' | 'letter' | 'legal')}
             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
             aria-label="Paper Size"
          >
            <option value="a4">A4</option>
            <option value="letter">Letter</option>
            <option value="legal">Legal</option>
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onClose}
          disabled={isGenerating}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleGeneratePdf}
          disabled={isGenerating}
          className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-teal-400 flex items-center"
        >
          {isGenerating ? (
            <>
              <SpinnerIcon className="h-4 w-4 mr-2" />
              Generating...
            </>
          ) : (
            'Generate PDF'
          )}
        </button>
      </div>
    </div>
  );
};

export default PdfExportSetupModal;