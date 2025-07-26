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
import MobileMenu from './MobileMenu';

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
  // Sidebar props for mobile integration
  isSidebarOpen?: boolean;
  toggleSidebar?: () => void;
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
  clinics,
  isSidebarOpen,
  toggleSidebar
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
      <div className="container mx-auto">
        {/* Mobile Layout */}
        <div className="flex md:hidden items-center justify-between">
          {/* Left: Logo + Today button */}
          <div className="flex items-center space-x-3">
            <CalendarIcon className="h-6 w-6 text-blue-600" />
            <h1 className="text-lg font-bold text-gray-800">{APP_NAME}</h1>
          </div>
          
          {/* Right: Mobile menu */}
          <MobileMenu 
            currentViewDate={currentViewDate}
            onExportData={onExportData}
            calendarViewMode={calendarViewMode}
            onSetCalendarViewMode={onSetCalendarViewMode}
            onNavigateToday={onNavigateToday}
            isSidebarOpen={isSidebarOpen}
            toggleSidebar={toggleSidebar}
          />
        </div>

        {/* Mobile: Date and View Modes */}
        <div className="flex md:hidden flex-col items-center space-y-3 mt-3">
          <h2 className="text-lg font-semibold text-gray-700" aria-live="polite" aria-atomic="true">
            {centralDateDisplay}
          </h2>
          <div className="flex space-x-1">
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
          
          {/* Mobile: Filter */}
          <div className="w-full flex justify-center">
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
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex items-center justify-between space-y-0">
          {/* Left: Logo */}
          <div className="flex items-center space-x-3">
            <CalendarIcon className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-800">{APP_NAME}</h1>
          </div>

          {/* Center: Date and View Modes */}
          <div className="flex flex-col items-center space-y-2">
            <h2 className="text-xl font-semibold text-gray-700" aria-live="polite" aria-atomic="true">
              {centralDateDisplay}
            </h2>
            <div className="flex space-x-2">
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
          
          {/* Right: Desktop Actions */}
          <div className="flex items-center space-x-3">
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
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500"
            >
              Today
            </button>
            {canEdit && (
              <button
                onClick={() => openModal('SHIFT_FORM', { initialDate: currentViewDate.toISOString().split('T')[0] })}
                className="px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 flex items-center space-x-1"
              >
                <CalendarIcon className="h-4 w-4" />
                <span>New Shift</span>
              </button>
            )}
            {canEdit && (
              <button
                onClick={() => openModal('IMPORT_DATA_FORM')}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 flex items-center space-x-1"
                title="Import providers, clinics, assistants, and shifts from JSON"
              >
                <UploadIcon className="h-4 w-4" />
                <span>Import Data</span>
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
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 flex items-center space-x-1"
              title="Export schedules to JSON or PDF"
            >
              <DownloadIcon className="h-4 w-4" />
              <span>Export Data</span>
            </button>
            {canEdit && (
              <button
                onClick={() => openModal('SETTINGS_FORM' as ModalType)}
                className="p-2 text-gray-600 hover:text-blue-600 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500"
                title="Settings"
                aria-label="Application Settings"
              >
                <CogIcon className="h-5 w-5" />
              </button>
            )}

            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {canEdit ? 'Admin' : 'User'} ({user?.email?.split('@')[0] || 'User'})
                </span>
                <button
                  onClick={signOut}
                  className="px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500"
                  title="Sign out"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => openModal('LOGIN_FORM')}
                className="px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500"
                title="Sign in to manage schedules"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;