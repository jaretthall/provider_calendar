import React, { useState, useRef, useEffect, useContext } from 'react';
import { ModalContext } from '../App';
import { useAuth, usePermissions } from '../hooks/useAuth';
import { CalendarViewMode, ModalType } from '../types';
import UploadIcon from './icons/UploadIcon';
import DownloadIcon from './icons/DownloadIcon';
import CogIcon from './icons/CogIcon';
import CalendarIcon from './icons/CalendarIcon';

interface MobileMenuProps {
  currentViewDate: Date;
  onExportData: () => void;
  calendarViewMode: CalendarViewMode;
  onSetCalendarViewMode: (mode: CalendarViewMode) => void;
  onNavigateToday: () => void;
  isSidebarOpen?: boolean;
  toggleSidebar?: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  currentViewDate,
  onExportData,
  calendarViewMode,
  onSetCalendarViewMode,
  onNavigateToday,
  isSidebarOpen,
  toggleSidebar
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated, signOut } = useAuth();
  const { canEdit } = usePermissions();
  const modalContext = useContext(ModalContext);
  
  if (!modalContext) {
    throw new Error('ModalContext not found');
  }
  const { openModal } = modalContext;

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menu when route changes or actions are taken
  const closeMenu = () => setIsOpen(false);

  const handleAction = (action: () => void) => {
    action();
    closeMenu();
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500"
        aria-label="Open menu"
        aria-expanded={isOpen}
      >
        <div className="w-6 h-6 flex flex-col justify-center items-center">
          <span className={`block h-0.5 w-6 bg-current transition-all duration-200 ${isOpen ? 'rotate-45 translate-y-0.5' : ''}`} />
          <span className={`block h-0.5 w-6 bg-current transition-all duration-200 mt-1 ${isOpen ? 'opacity-0' : ''}`} />
          <span className={`block h-0.5 w-6 bg-current transition-all duration-200 mt-1 ${isOpen ? '-rotate-45 -translate-y-0.5' : ''}`} />
        </div>
      </button>

      {/* Slide-down Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {/* Navigation */}
          {toggleSidebar && (
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Navigation</h3>
              <div className="space-y-2">
                <button
                  onClick={() => handleAction(toggleSidebar)}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md flex items-center space-x-2"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  <span>{isSidebarOpen ? 'Hide Sidebar' : 'Show Sidebar'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Primary Actions */}
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => handleAction(onNavigateToday)}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md flex items-center space-x-2"
              >
                <CalendarIcon className="h-4 w-4" />
                <span>Go to Today</span>
              </button>
              
              {canEdit && (
                <button
                  onClick={() => handleAction(() => openModal('SHIFT_FORM', { initialDate: currentViewDate.toISOString().split('T')[0] }))}
                  className="w-full text-left px-3 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md flex items-center space-x-2"
                >
                  <CalendarIcon className="h-4 w-4" />
                  <span>New Shift</span>
                </button>
              )}
            </div>
          </div>

          {/* Data Management */}
          {canEdit && (
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Data Management</h3>
              <div className="space-y-2">
                <button
                  onClick={() => handleAction(() => openModal('IMPORT_DATA_FORM'))}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md flex items-center space-x-2"
                >
                  <UploadIcon className="h-4 w-4" />
                  <span>Import Data</span>
                </button>
                
                <button
                  onClick={() => handleAction(() => openModal('EXPORT_OPTIONS_MODAL' as ModalType, { 
                    onExportJson: onExportData,
                    openPdfSetupModal: () => openModal('PDF_EXPORT_SETUP_MODAL' as ModalType, {
                      currentCalendarViewMode: calendarViewMode,
                      onSetCalendarViewMode: onSetCalendarViewMode
                    })
                  }))}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md flex items-center space-x-2"
                >
                  <DownloadIcon className="h-4 w-4" />
                  <span>Export Data</span>
                </button>
              </div>
            </div>
          )}

          {/* Settings & Account */}
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Settings & Account</h3>
            <div className="space-y-2">
              {canEdit && (
                <button
                  onClick={() => handleAction(() => openModal('SETTINGS_FORM' as ModalType))}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md flex items-center space-x-2"
                >
                  <CogIcon className="h-4 w-4" />
                  <span>Settings</span>
                </button>
              )}
              
              {isAuthenticated ? (
                <div className="space-y-2">
                  <div className="px-3 py-2 text-sm text-gray-500 border-t border-gray-100">
                    <div className="font-medium">{canEdit ? 'Admin' : 'User'}</div>
                    <div className="text-xs">{user?.email?.split('@')[0] || 'User'}</div>
                  </div>
                  <button
                    onClick={() => handleAction(signOut)}
                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleAction(() => openModal('LOGIN_FORM'))}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileMenu;