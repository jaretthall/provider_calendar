import React, { useContext } from 'react';
import { APP_NAME } from '../constants';
import { ModalContext } from '../App';
import { useAuth, usePermissions } from '../hooks/useAuth';
import { CalendarViewMode, ModalType, FilterState } from '../types';
import CalendarIcon from './icons/CalendarIcon';
import UploadIcon from './icons/UploadIcon';
import DownloadIcon from './icons/DownloadIcon';
import CogIcon from './icons/CogIcon';
import DepartmentFilter from './DepartmentFilter';

interface HeaderProps {
  currentViewDate: Date; // For "New Shift" button context
  calendarViewMode: CalendarViewMode;
  onSetCalendarViewMode: (mode: CalendarViewMode) => void;
  centralDateDisplay: string;
  onNavigateToday: () => void;
  onExportData: () => void;
  filters: FilterState;
  onFiltersChange: (newFilters: FilterState) => void;
  providerCount: number;
  maCount: number;
  frontStaffCount: number;
  billingCount: number;
  behavioralHealthCount: number;
  buildingCount: number;
  // Data arrays needed for filter functionality
  providers: any[];
  medicalAssistants: any[];
  frontStaff: any[];
  billing: any[];
  behavioralHealth: any[];
  clinics: any[];
}

const Header: React.FC<HeaderProps> = ({ 
  currentViewDate, 
  calendarViewMode,
  onSetCalendarViewMode,
  centralDateDisplay,
  onNavigateToday, 
  onExportData,
  filters,
  onFiltersChange,
  providerCount,
  maCount,
  frontStaffCount,
  billingCount,
  behavioralHealthCount,
  buildingCount,
  providers,
  medicalAssistants,
  frontStaff,
  billing,
  behavioralHealth,
  clinics
}) => {
  const { user, isAuthenticated, signOut } = useAuth();
  const { canEdit } = usePermissions();
  const modalContext = useContext(ModalContext);
  
  if (!modalContext) {
    throw new Error('ModalContext not found');
  }
  const { openModal } = modalContext;

  const viewModeButtonClasses = (isActive: boolean) => 
    `px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 ${
      isActive 
        ? 'bg-blue-600 text-white' 
        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
    }`;

  return (
    <header className="bg-white shadow-md p-3 sm:p-4 sticky top-0 z-40">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
        
        <div className="flex items-center space-x-3 self-start sm:self-center">
          <CalendarIcon className="h-7 w-7 sm:h-8 sm:w-8 text-blue-600" />
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{APP_NAME}</h1>
        </div>

        <div className="flex flex-col items-center space-y-2">
           <h2 className="text-lg md:text-xl font-semibold text-gray-700 order-first sm:order-none" aria-live="polite" aria-atomic="true">
            {centralDateDisplay}
          </h2>
          <div className="flex space-x-1 sm:space-x-2">
            <button
                onClick={() => onSetCalendarViewMode('month')}
                className={viewModeButtonClasses(calendarViewMode === 'month')}
            >
                Month
            </button>
            <button
                onClick={() => onSetCalendarViewMode('week')}
                className={viewModeButtonClasses(calendarViewMode === 'week')}
            >
                Week
            </button>
            <button
                onClick={() => onSetCalendarViewMode('day')}
                className={viewModeButtonClasses(calendarViewMode === 'day')}
             >
                Day
             </button>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-3 self-end sm:self-center">
          <DepartmentFilter
            filters={filters}
            onFiltersChange={onFiltersChange}
            providerCount={providerCount}
            maCount={maCount}
            frontStaffCount={frontStaffCount}
            billingCount={billingCount}
            behavioralHealthCount={behavioralHealthCount}
            buildingCount={buildingCount}
            providers={providers}
            medicalAssistants={medicalAssistants}
            frontStaff={frontStaff}
            billing={billing}
            behavioralHealth={behavioralHealth}
            clinics={clinics}
          />
           <button
            onClick={onNavigateToday}
            className="px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500"
          >
            Today
          </button>
          {canEdit && (
            <button
              onClick={() => openModal('SHIFT_FORM', { initialDate: currentViewDate.toISOString().split('T')[0] })}
              className="px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 flex items-center space-x-1"
            >
              <CalendarIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>New Shift</span>
            </button>
          )}
           {canEdit && (
            <button
              onClick={() => openModal('IMPORT_DATA_FORM')}
              className="px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 flex items-center space-x-1"
              title="Import providers, clinics, assistants, and shifts from JSON"
            >
              <UploadIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Import Data</span>
              <span className="sm:hidden">Import</span>
            </button>
          )}
          <button
            onClick={() => openModal('EXPORT_OPTIONS_MODAL' as ModalType, { 
              onExportJson: onExportData,
              openPdfSetupModal: () => openModal('PDF_EXPORT_SETUP_MODAL' as ModalType, {
                currentCalendarViewMode: calendarViewMode,
                onSetCalendarViewMode: onSetCalendarViewMode
              })
            })}
            className="px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 flex items-center space-x-1"
            title="Export schedules to JSON or PDF"
          >
            <DownloadIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Export Data</span>
            <span className="sm:hidden">Export</span>
          </button>
          {canEdit && (
            <button
                onClick={() => openModal('SETTINGS_FORM' as ModalType)}
                className="p-1.5 sm:p-2 text-gray-600 hover:text-blue-600 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500"
                title="Settings"
                aria-label="Application Settings"
            >
                <CogIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          )}

          {isAuthenticated ? (
            <div className="flex items-center space-x-2">
              <span className="text-xs sm:text-sm text-gray-600">
                {canEdit ? 'Admin' : 'User'} ({user?.email?.split('@')[0] || 'User'})
              </span>
              <button
                onClick={signOut}
                className="px-2.5 py-1.5 text-xs sm:text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500"
                title="Sign out"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => openModal('LOGIN_FORM')}
              className="px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500"
              title="Sign in to manage schedules"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;