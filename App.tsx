import React, { useState, useCallback, useEffect, createContext } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  DndContext, 
  DragEndEvent, 
  DragStartEvent, 
  DragOverlay,
  PointerSensor, 
  KeyboardSensor, 
  useSensor, 
  useSensors,
  closestCenter
} from '@dnd-kit/core';

import Header from './components/Header';
import Sidebar from './components/Sidebar';
import CalendarGrid from './components/CalendarGrid';
import WeeklyCalendarGrid from './components/WeeklyCalendarGrid';
import DayCalendarGrid from './components/DayCalendarGrid';
import Modal from './components/Modal';
import ProviderForm from './components/ProviderForm';
import ClinicTypeForm from './components/ClinicTypeForm';
import MedicalAssistantForm from './components/MedicalAssistantForm';
import ShiftForm from './components/ShiftForm';
import ImportDataForm from './components/ImportDataForm';
import ViewShiftDetailsModal from './components/ViewShiftDetailsModal';
import EditRecurrenceChoiceModal from './components/EditRecurrenceChoiceModal';
import ConfirmationModal from './components/ConfirmationModal';
import SettingsForm from './components/SettingsForm';
import ExportOptionsModal from './components/ExportOptionsModal';
import PdfExportSetupModal from './components/PdfExportSetupModal';
import AdminPasswordForm from './components/AdminPasswordForm';
import LoginScreen from './components/LoginScreen';
import ErrorBoundary from './components/ErrorBoundary';
import Footer from './components/Footer';
import { ToastContainer } from './components/Toast';
import { 
  Provider, ClinicType, Shift, User, UserRole, ToastMessage, 
  AppContextType, AuthContextType, ModalContextType, ModalState, 
  FilterState, RecurringFrequency, MedicalAssistant, CalendarViewMode,
  UserSettings, SettingsContextType, ToastContextType
} from './types';
import { 
  INITIAL_PROVIDERS, INITIAL_CLINIC_TYPES, INITIAL_MEDICAL_ASSISTANTS, INITIAL_SHIFTS, 
  PREDEFINED_COLORS, VACATION_COLOR, DEFAULT_EVENT_COLOR, INITIAL_USER_SETTINGS 
} from './constants';
import useLocalStorage from './hooks/useLocalStorage';
import { 
  useSupabaseProviders, 
  useSupabaseClinicTypes, 
  useSupabaseMedicalAssistants, 
  useSupabaseShifts
} from './hooks/useSupabaseData';
import { isSupabaseConfigured, testSupabaseConnection, supabase } from './utils/supabase';
import { 
  getMonthYearString, addMonths, getISODateString, getInitials, 
  getWeekRangeString, addDays as dateAddDays, getTodayInEasternTime,
  formatDateInEasternTime 
} from './utils/dateUtils';
import { detectAllShiftConflicts } from './utils/conflictUtils';
import ChevronLeftIcon from './components/icons/ChevronLeftIcon';
import ChevronRightIcon from './components/icons/ChevronRightIcon';
import ShiftDragOverlayPreview from './components/ShiftDragOverlayPreview';

export const AppContext = createContext<AppContextType | null>(null);
export const AuthContext = createContext<AuthContextType | null>(null);
export const ModalContext = createContext<ModalContextType | null>(null);
export const ToastContext = createContext<ToastContextType | null>(null);
export const SettingsContext = createContext<SettingsContextType | null>(null);

interface DraggableItemData { 
  id: string; // The unique ID used by useDraggable (e.g., provider.id or composite shift badge ID)
  type: 'provider' | 'shift'; 
  name?: string; // For provider type
  color?: string; // For provider type
  shiftData?: Partial<Shift>; // For shift type
  providerInitials?: string; // For shift type
  shiftColor?: string; // For shift type
  maIndicators?: {initials: string, color: string}[]; 
}

// Simple admin password for backup access
const ADMIN_PASSWORD = 'CPS2025!Admin';

// Main application component (only shown when authenticated)
const AuthenticatedApp: React.FC<{ user: any }> = ({ user }) => {
  console.log('🔐 Authenticated user:', user.email);

  // Track Supabase connection status
  const [supabaseConnectionStatus, setSupabaseConnectionStatus] = useState<boolean>(false);
  const [isCheckingConnection, setIsCheckingConnection] = useState<boolean>(true);

  // Use Supabase for all data (authenticated users only)
  const { 
    data: providers, 
    setData: setProviders, 
    isOnline: providersOnline,
    loading: providersLoading,
    error: providersError
  } = useSupabaseProviders([]);
  
  const { 
    data: clinics, 
    setData: setClinics, 
    isOnline: clinicsOnline,
    loading: clinicsLoading,
    error: clinicsError
  } = useSupabaseClinicTypes([]);
  
  const { 
    data: medicalAssistants, 
    setData: setMedicalAssistants, 
    isOnline: medicalAssistantsOnline,
    loading: medicalAssistantsLoading,
    error: medicalAssistantsError
  } = useSupabaseMedicalAssistants([]);
  
  const { 
    data: shifts, 
    setData: setShifts, 
    isOnline: shiftsOnline,
    loading: shiftsLoading,
    error: shiftsError
  } = useSupabaseShifts([]);

  // Test Supabase connection on mount
  useEffect(() => {
    const initializeSupabase = async () => {
      console.log('🔍 Testing Supabase connection for authenticated user...');
      
      try {
        if (isSupabaseConfigured()) {
          const result = await testSupabaseConnection();
          setSupabaseConnectionStatus(result.success);
          
          if (result.success) {
            console.log('✅ Supabase connection successful:', result.message);
          } else {
            console.warn('❌ Supabase connection failed:', result.error);
          }
        } else {
          console.error('❌ Supabase not configured properly');
          setSupabaseConnectionStatus(false);
        }
      } catch (error) {
        console.error('❌ Supabase initialization error:', error);
        setSupabaseConnectionStatus(false);
      } finally {
        setIsCheckingConnection(false);
      }
    };

    initializeSupabase();
  }, []);
  
  // Check if fully online with Supabase
  const isFullyOnline = providersOnline && clinicsOnline && medicalAssistantsOnline && shiftsOnline;
  
  // User settings still use localStorage for simplicity
  const [userSettings, setUserSettings] = useLocalStorage<UserSettings>('tempoUserSettings', INITIAL_USER_SETTINGS);

  // App state
  const [currentDate, setCurrentDate] = useState<Date>(getTodayInEasternTime());
  const [calendarViewMode, setCalendarViewMode] = useState<CalendarViewMode>(userSettings.defaultCalendarView);
  const [modalState, setModalState] = useState<ModalState>({ type: null, props: {} });
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [activeDragItem, setActiveDragItem] = useState<DraggableItemData | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [filters, setFilters] = useState<FilterState>({
    providerIds: [],
    clinicTypeIds: [],
    medicalAssistantIds: [],
    showVacations: true,
  });

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor)
  );

  // Settings management
  const updateSettings = (newSettings: Partial<UserSettings>) => {
    const updated = { ...userSettings, ...newSettings };
    setUserSettings(updated);
    
    if (newSettings.defaultCalendarView) {
      setCalendarViewMode(newSettings.defaultCalendarView);
    }
    
    console.log('Settings updated:', updated);
  };

  // Settings context
  const settingsContextValue: SettingsContextType = {
    settings: userSettings,
    updateSettings,
  };

  // Toast management
  const addToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', duration?: number) => {
    const id = uuidv4();
    setToasts(prev => [...prev, { id, message, type, duration }]);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Modal management
  const closeModal = () => setModalState({ type: null, props: {} });

  const openModal = (type: ModalState['type'], props?: any) => {
    setModalState({ type, props: props || {} });
  };

  // Authentication management (all authenticated users are admins)
  const currentUser: User = {
    id: user.id,
    username: user.email || 'User',
    role: 'admin' as UserRole
  };

  const isAuthenticated = true; // Always true in this component
  const isAdmin = true; // All authenticated users have admin access

  const logout = async () => {
    try {
      if (supabase) {
        await supabase.auth.signOut();
        addToast('Logged out successfully', 'success');
      }
    } catch (error) {
      console.error('Logout error:', error);
      addToast('Error logging out', 'error');
    }
  };

  // CRUD Operations for Providers
  const addProvider = async (providerData: Omit<Provider, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newProvider: Provider = {
        ...providerData,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await setProviders(prev => [...prev, newProvider]);
      addToast(`Provider "${newProvider.name}" added successfully`, 'success');
      return newProvider;
    } catch (error) {
      addToast('Failed to add provider', 'error');
      throw error;
    }
  };

  const updateProvider = async (updatedProvider: Provider) => {
    try {
      const providerWithUpdatedTimestamp = {
        ...updatedProvider,
        updatedAt: new Date().toISOString()
      };
      await setProviders(prev => prev.map(p => p.id === updatedProvider.id ? providerWithUpdatedTimestamp : p));
      addToast(`Provider "${updatedProvider.name}" updated successfully`, 'success');
    } catch (error) {
      addToast('Failed to update provider', 'error');
      throw error;
    }
  };

  const deleteProvider = async (providerId: string) => {
    try {
      await setProviders(prev => prev.filter(p => p.id !== providerId));
      // Also delete all shifts for this provider
      await setShifts(prev => prev.filter(s => s.providerId !== providerId));
      addToast('Provider deleted successfully', 'success');
    } catch (error) {
      addToast('Failed to delete provider', 'error');
      throw error;
    }
  };

  // CRUD Operations for Clinic Types
  const addClinicType = async (clinicData: Omit<ClinicType, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newClinic: ClinicType = {
        ...clinicData,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await setClinics(prev => [...prev, newClinic]);
      addToast(`Clinic type "${newClinic.name}" added successfully`, 'success');
      return newClinic;
    } catch (error) {
      addToast('Failed to add clinic type', 'error');
      throw error;
    }
  };

  const updateClinicType = async (updatedClinic: ClinicType) => {
    try {
      const clinicWithUpdatedTimestamp = {
        ...updatedClinic,
        updatedAt: new Date().toISOString()
      };
      await setClinics(prev => prev.map(c => c.id === updatedClinic.id ? clinicWithUpdatedTimestamp : c));
      addToast(`Clinic type "${updatedClinic.name}" updated successfully`, 'success');
    } catch (error) {
      addToast('Failed to update clinic type', 'error');
      throw error;
    }
  };

  const deleteClinicType = async (clinicId: string) => {
    try {
      await setClinics(prev => prev.filter(c => c.id !== clinicId));
      addToast('Clinic type deleted successfully', 'success');
    } catch (error) {
      addToast('Failed to delete clinic type', 'error');
      throw error;
    }
  };

  // CRUD Operations for Medical Assistants
  const addMedicalAssistant = async (maData: Omit<MedicalAssistant, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newMA: MedicalAssistant = {
        ...maData,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await setMedicalAssistants(prev => [...prev, newMA]);
      addToast(`Medical assistant "${newMA.name}" added successfully`, 'success');
      return newMA;
    } catch (error) {
      addToast('Failed to add medical assistant', 'error');
      throw error;
    }
  };

  const updateMedicalAssistant = async (updatedMA: MedicalAssistant) => {
    try {
      const maWithUpdatedTimestamp = {
        ...updatedMA,
        updatedAt: new Date().toISOString()
      };
      await setMedicalAssistants(prev => prev.map(ma => ma.id === updatedMA.id ? maWithUpdatedTimestamp : ma));
      addToast(`Medical assistant "${updatedMA.name}" updated successfully`, 'success');
    } catch (error) {
      addToast('Failed to update medical assistant', 'error');
      throw error;
    }
  };

  const deleteMedicalAssistant = async (maId: string) => {
    try {
      await setMedicalAssistants(prev => prev.filter(ma => ma.id !== maId));
      addToast('Medical assistant deleted successfully', 'success');
    } catch (error) {
      addToast('Failed to delete medical assistant', 'error');
      throw error;
    }
  };

  // CRUD Operations for Shifts
  const addShift = async (
    shiftData: Omit<Shift, 'id' | 'createdAt' | 'updatedAt' | 'color' | 'title' | 'seriesId'>,
    isCreatingException: boolean = false
  ): Promise<Shift | null> => {
    try {
      const provider = providers.find(p => p.id === shiftData.providerId);
      const clinic = clinics.find(c => c.id === shiftData.clinicTypeId);

      let shiftColor = DEFAULT_EVENT_COLOR;
      if (shiftData.isVacation) {
        shiftColor = VACATION_COLOR;
      } else if (provider?.color) {
        shiftColor = provider.color;
      } else if (clinic?.color) {
        shiftColor = clinic.color;
      }

      const seriesId = shiftData.recurringRule ? uuidv4() : undefined;
      const title = shiftData.isVacation ? 'Vacation' : (provider?.name || 'Shift');

      const newShift: Shift = {
        ...shiftData,
        id: uuidv4(),
        color: shiftColor,
        title,
        seriesId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await setShifts(prev => [...prev, newShift]);
      addToast(`Shift added successfully`, 'success');
      return newShift;
    } catch (error) {
      addToast('Failed to add shift', 'error');
      throw error;
    }
  };

  const updateShift = async (updatedShift: Shift) => {
    try {
      const shiftWithUpdatedTimestamp = {
        ...updatedShift,
        updatedAt: new Date().toISOString()
      };
      await setShifts(prev => prev.map(s => s.id === updatedShift.id ? shiftWithUpdatedTimestamp : s));
      addToast('Shift updated successfully', 'success');
    } catch (error) {
      addToast('Failed to update shift', 'error');
      throw error;
    }
  };

  const deleteShift = async (shiftId: string, seriesIdToDelete?: string, deleteAllOccurrences?: boolean) => {
    try {
      if (deleteAllOccurrences && seriesIdToDelete) {
        await setShifts(prev => prev.filter(s => s.seriesId !== seriesIdToDelete));
        addToast('All recurring shifts deleted successfully', 'success');
      } else {
        await setShifts(prev => prev.filter(s => s.id !== shiftId));
        addToast('Shift deleted successfully', 'success');
      }
    } catch (error) {
      addToast('Failed to delete shift', 'error');
      throw error;
    }
  };

  // Import data function
  const importData = async (data: { providers?: Partial<Provider>[], clinics?: Partial<ClinicType>[], medicalAssistants?: Partial<MedicalAssistant>[], shifts?: Partial<Shift>[] }) => {
    try {
      let totalImported = 0;

      // Import providers
      if (data.providers && data.providers.length > 0) {
        const finalProvidersList = [...providers];
        for (const providerData of data.providers) {
          const existingIndex = finalProvidersList.findIndex(p => p.id === providerData.id);
          const now = new Date().toISOString();
          const fullProvider: Provider = {
            id: providerData.id || uuidv4(),
            name: providerData.name || 'Unnamed Provider',
            color: providerData.color || PREDEFINED_COLORS[0],
            isActive: providerData.isActive !== undefined ? providerData.isActive : true,
            createdAt: providerData.createdAt || now,
            updatedAt: now
          };

          if (existingIndex >= 0) {
            finalProvidersList[existingIndex] = fullProvider;
          } else {
            finalProvidersList.push(fullProvider);
          }
          totalImported++;
        }
        await setProviders(finalProvidersList);
      }

      // Import clinic types
      if (data.clinics && data.clinics.length > 0) {
        const finalClinicsList = [...clinics];
        for (const clinicData of data.clinics) {
          const existingIndex = finalClinicsList.findIndex(c => c.id === clinicData.id);
          const now = new Date().toISOString();
          const fullClinic: ClinicType = {
            id: clinicData.id || uuidv4(),
            name: clinicData.name || 'Unnamed Clinic',
            color: clinicData.color || PREDEFINED_COLORS[1],
            isActive: clinicData.isActive !== undefined ? clinicData.isActive : true,
            createdAt: clinicData.createdAt || now,
            updatedAt: now
          };

          if (existingIndex >= 0) {
            finalClinicsList[existingIndex] = fullClinic;
          } else {
            finalClinicsList.push(fullClinic);
          }
          totalImported++;
        }
        await setClinics(finalClinicsList);
      }

      // Import medical assistants
      if (data.medicalAssistants && data.medicalAssistants.length > 0) {
        const finalMAsList = [...medicalAssistants];
        for (const maData of data.medicalAssistants) {
          const existingIndex = finalMAsList.findIndex(ma => ma.id === maData.id);
          const now = new Date().toISOString();
          const fullMA: MedicalAssistant = {
            id: maData.id || uuidv4(),
            name: maData.name || 'Unnamed MA',
            color: maData.color || PREDEFINED_COLORS[2],
            isActive: maData.isActive !== undefined ? maData.isActive : true,
            createdAt: maData.createdAt || now,
            updatedAt: now
          };

          if (existingIndex >= 0) {
            finalMAsList[existingIndex] = fullMA;
          } else {
            finalMAsList.push(fullMA);
          }
          totalImported++;
        }
        await setMedicalAssistants(finalMAsList);
      }

      // Import shifts
      if (data.shifts && data.shifts.length > 0) {
        const finalShiftsList = [...shifts];
        for (const shiftData of data.shifts) {
          const existingIndex = finalShiftsList.findIndex(s => s.id === shiftData.id);
          const now = new Date().toISOString();
          const fullShift: Shift = {
            id: shiftData.id || uuidv4(),
            providerId: shiftData.providerId || '',
            clinicTypeId: shiftData.clinicTypeId,
            medicalAssistantIds: shiftData.medicalAssistantIds,
            title: shiftData.title,
            startDate: shiftData.startDate || '',
            endDate: shiftData.endDate || '',
            startTime: shiftData.startTime,
            endTime: shiftData.endTime,
            isVacation: shiftData.isVacation || false,
            notes: shiftData.notes,
            color: shiftData.color || DEFAULT_EVENT_COLOR,
            recurringRule: shiftData.recurringRule,
            seriesId: shiftData.seriesId,
            originalRecurringShiftId: shiftData.originalRecurringShiftId,
            isExceptionInstance: shiftData.isExceptionInstance,
            exceptionForDate: shiftData.exceptionForDate,
            createdAt: shiftData.createdAt || now,
            updatedAt: now
          };

          if (existingIndex >= 0) {
            finalShiftsList[existingIndex] = fullShift;
          } else {
            finalShiftsList.push(fullShift);
          }
          totalImported++;
        }
        await setShifts(finalShiftsList);
      }

      addToast(`Successfully imported ${totalImported} items`, 'success');
    } catch (error) {
      console.error('Import error:', error);
      addToast('Failed to import data', 'error');
      throw error;
    }
  };

  // Helper functions
  const getProviderById = useCallback((id: string) => providers.find(p => p.id === id), [providers]);
  const getClinicTypeById = useCallback((id: string) => clinics.find(c => c.id === id), [clinics]);
  const getMedicalAssistantById = useCallback((id: string) => medicalAssistants.find(ma => ma.id === id), [medicalAssistants]);
  const getShiftById = useCallback((id: string) => shifts.find(s => s.id === id), [shifts]);

  // Calculate conflicts
  const conflictingShiftIds = detectAllShiftConflicts(shifts);

  // Date display
  const centralDateDisplay = calendarViewMode === 'month' 
    ? getMonthYearString(currentDate)
    : calendarViewMode === 'week' 
      ? getWeekRangeString(currentDate, userSettings.weekStartsOn)
      : formatDateInEasternTime(currentDate, { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });

  // Event handlers
  const handleExportData = () => {
    const exportData = {
      providers,
      clinics,
      medicalAssistants,
      shifts,
      userSettings,
      exportedAt: new Date().toISOString(),
      version: '1.0.5'
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `clinica-schedule-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    addToast('Data exported successfully', 'success');
  };

  const handleNavigatePrevious = () => {
    if (calendarViewMode === 'month') {
      setCurrentDate(addMonths(currentDate, -1));
    } else if (calendarViewMode === 'week') {
      setCurrentDate(dateAddDays(currentDate, -7));
    } else {
      setCurrentDate(dateAddDays(currentDate, -1));
    }
  };

  const handleNavigateNext = () => {
    if (calendarViewMode === 'month') {
      setCurrentDate(addMonths(currentDate, 1));
    } else if (calendarViewMode === 'week') {
      setCurrentDate(dateAddDays(currentDate, 7));
    } else {
      setCurrentDate(dateAddDays(currentDate, 1));
    }
  };

  const handleNavigateToday = () => setCurrentDate(getTodayInEasternTime());

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Resize handler
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Drag and drop handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    
    if (active.data.current?.type === 'provider') {
      const providerData = active.data.current as DraggableItemData;
      setActiveDragItem(providerData);
    } else if (active.data.current?.type === 'shift') {
      const shiftData = active.data.current as DraggableItemData;
      setActiveDragItem(shiftData);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragItem(null);

    if (!over || !active.data.current) return;

    const overData = over.data.current;
    const activeData = active.data.current as DraggableItemData;

    if (overData?.type === 'dayCell' && activeData?.type === 'provider') {
      const dateString = overData.dateString;
      openModal('SHIFT_FORM', { 
        initialDate: dateString, 
        preSelectedProviderId: activeData.id 
      });
    } else if (overData?.type === 'dayCell' && activeData?.type === 'shift') {
      // Handle shift drag to new date
      const newDateString = overData.dateString;
      const shift = getShiftById(activeData.id);
      
      if (shift && !shift.isVacation) {
        try {
          if (shift.recurringRule && !shift.isExceptionInstance) {
            // Create exception instance
            const newShift: Shift = {
              ...shift,
              id: uuidv4(),
              startDate: newDateString,
              endDate: newDateString,
              isExceptionInstance: true,
              exceptionForDate: newDateString,
              originalRecurringShiftId: shift.id,
              recurringRule: undefined,
              seriesId: undefined,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            
            await setShifts(prev => [...prev, newShift]);
            addToast('Shift moved successfully (exception created)', 'success');
          } else {
            // Move single shift
            const updatedShift = {
              ...shift,
              startDate: newDateString,
              endDate: newDateString,
              updatedAt: new Date().toISOString()
            };
            
            await setShifts(prev => prev.map(s => s.id === shift.id ? updatedShift : s));
            addToast('Shift moved successfully', 'success');
          }
        } catch (error) {
          addToast('Failed to move shift', 'error');
        }
      }
    }
  };

  // Modal helpers
  const getModalTitle = (): string => {
    switch (modalState.type) {
      case 'PROVIDER_FORM':
        return modalState.props?.provider ? 'Edit Provider' : 'Add New Provider';
      case 'CLINIC_TYPE_FORM':
        return modalState.props?.clinicType ? 'Edit Clinic Type' : 'Add New Clinic Type';
      case 'MEDICAL_ASSISTANT_FORM':
        return modalState.props?.medicalAssistant ? 'Edit Medical Assistant' : 'Add New Medical Assistant';
      case 'SHIFT_FORM':
        return modalState.props?.shift ? 'Edit Shift' : 'Add New Shift';
      case 'IMPORT_DATA_FORM':
        return 'Import Data';
      case 'VIEW_SHIFT_DETAILS':
        return 'Shift Details';
      case 'EDIT_RECURRENCE_CHOICE':
        return 'Edit Recurring Shift';
      case 'CONFIRMATION_MODAL':
        return modalState.props?.title || 'Confirm Action';
      case 'SETTINGS_FORM':
        return 'Application Settings';
      case 'EXPORT_OPTIONS_MODAL':
        return 'Export Options';
      case 'PDF_EXPORT_SETUP_MODAL':
        return 'PDF Export Setup';
      case 'LOGIN_FORM':
        return 'Admin Login';
      default:
        return 'Modal';
    }
  };

  const getModalSize = (): 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' => {
    switch (modalState.type) {
      case 'SHIFT_FORM':
        return '2xl';
      case 'VIEW_SHIFT_DETAILS':
        return 'xl';
      case 'IMPORT_DATA_FORM':
        return 'xl';
      case 'PDF_EXPORT_SETUP_MODAL':
        return '2xl';
      case 'SETTINGS_FORM':
        return 'md';
      case 'EXPORT_OPTIONS_MODAL':
        return 'sm';
      case 'EDIT_RECURRENCE_CHOICE':
        return 'sm';
      case 'CONFIRMATION_MODAL':
        return 'sm';
      case 'LOGIN_FORM':
        return 'sm';
      default:
        return 'lg';
    }
  };

  // App context value
  const appContextValue: AppContextType = {
    providers, clinics, medicalAssistants, shifts, 
    addProvider, updateProvider, deleteProvider, 
    addClinicType, updateClinicType, deleteClinicType, 
    addMedicalAssistant, updateMedicalAssistant, deleteMedicalAssistant,
    addShift, updateShift, deleteShift, 
    importData, 
    getProviderById, getClinicTypeById, getMedicalAssistantById, getShiftById,
    isOnline: isFullyOnline
  };

  const authContextValue: AuthContextType = {
    currentUser,
    isAuthenticated,
    login: () => true, // Not used in this context
    logout,
    setCurrentUserRole: () => {}, // Not used since all users are admins
    isAdmin
  };

  const toastContextValue: ToastContextType = {
    addToast
  };

  const modalContextValue: ModalContextType = {
    modal: modalState,
    openModal,
    closeModal
  };

  // Show loading screen while checking connection
  if (isCheckingConnection) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading application...</p>
          <p className="mt-2 text-sm text-gray-500">
            Initializing data connection
          </p>
        </div>
      </div>
    );
  }

  return (
    <DndContext 
      sensors={sensors} 
      collisionDetection={closestCenter} 
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <AppContext.Provider value={appContextValue}>
        <AuthContext.Provider value={authContextValue}>
          <SettingsContext.Provider value={settingsContextValue}>
            <ModalContext.Provider value={modalContextValue}>
              <ToastContext.Provider value={toastContextValue}>
                <div className="flex h-screen bg-gray-100">
                  <Sidebar 
                    filters={filters} 
                    onFiltersChange={setFilters} 
                    isSidebarOpen={isSidebarOpen} 
                    toggleSidebar={toggleSidebar} 
                  />
                  <div className="flex-1 flex flex-col overflow-hidden">
                    <Header 
                      currentViewDate={currentDate} 
                      calendarViewMode={calendarViewMode}
                      onSetCalendarViewMode={setCalendarViewMode}
                      centralDateDisplay={centralDateDisplay}
                      onNavigateToday={handleNavigateToday} 
                      onExportData={handleExportData}
                      isSuperAdmin={false}
                      supabaseUser={user}
                      onSupabaseLogout={logout}
                      onSupabaseLogin={() => {}} // Not used
                    />
                    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-2 md:p-6">
                      <div className="flex items-center justify-between mb-4 sm:mb-6 px-1">
                        <button
                          onClick={handleNavigatePrevious}
                          className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                          aria-label={
                            calendarViewMode === 'month' ? "Previous month" : 
                            calendarViewMode === 'week' ? "Previous week" : 
                            "Previous day"
                          }
                        >
                          <ChevronLeftIcon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                        </button>
                        <button
                          onClick={handleNavigateNext}
                          className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                          aria-label={
                            calendarViewMode === 'month' ? "Next month" : 
                            calendarViewMode === 'week' ? "Next week" : 
                            "Next day"
                          }
                        >
                          <ChevronRightIcon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                        </button>
                      </div>
                      <div id="main-calendar-grid">
                        {calendarViewMode === 'month' ? (
                          <CalendarGrid 
                            currentDate={currentDate} 
                            allShifts={shifts} 
                            filters={filters} 
                            conflictingShiftIds={conflictingShiftIds}
                            weekStartsOn={userSettings.weekStartsOn}
                          />
                        ) : calendarViewMode === 'week' ? (
                          <WeeklyCalendarGrid
                            currentDate={currentDate}
                            allShifts={shifts}
                            filters={filters}
                            conflictingShiftIds={conflictingShiftIds}
                            weekStartsOn={userSettings.weekStartsOn}
                          />
                        ) : (
                          <DayCalendarGrid
                            currentDate={currentDate}
                            allShifts={shifts}
                            filters={filters}
                            conflictingShiftIds={conflictingShiftIds}
                          />
                        )}
                      </div>
                    </main>
                    <Footer isOnline={isFullyOnline} isCheckingConnection={isCheckingConnection} />
                  </div>
                </div>

                <Modal isOpen={!!modalState.type} onClose={closeModal} title={getModalTitle()} size={getModalSize()}>
                  {modalState.type === 'PROVIDER_FORM' && <ProviderForm {...modalState.props} onClose={closeModal} />}
                  {modalState.type === 'CLINIC_TYPE_FORM' && <ClinicTypeForm {...modalState.props} onClose={closeModal} />}
                  {modalState.type === 'MEDICAL_ASSISTANT_FORM' && <MedicalAssistantForm {...modalState.props} onClose={closeModal} />}
                  {modalState.type === 'SETTINGS_FORM' && <SettingsForm {...modalState.props} onClose={closeModal} />}
                  {modalState.type === 'SHIFT_FORM' && <ShiftForm {...modalState.props} onClose={closeModal} />}
                  {modalState.type === 'IMPORT_DATA_FORM' && <ImportDataForm {...modalState.props} onClose={closeModal} />}
                  {modalState.type === 'VIEW_SHIFT_DETAILS' && <ViewShiftDetailsModal {...modalState.props} onClose={closeModal} />}
                  {modalState.type === 'EDIT_RECURRENCE_CHOICE' && <EditRecurrenceChoiceModal {...modalState.props} onClose={closeModal} />}
                  {modalState.type === 'CONFIRMATION_MODAL' && <ConfirmationModal {...modalState.props} onCancel={closeModal} />}
                  {modalState.type === 'EXPORT_OPTIONS_MODAL' && <ExportOptionsModal {...modalState.props} isSubmitting={isSubmitting} onClose={closeModal} />}
                  {modalState.type === 'PDF_EXPORT_SETUP_MODAL' && <PdfExportSetupModal {...modalState.props} onClose={closeModal} />}
                  {modalState.type === 'LOGIN_FORM' && <AdminPasswordForm {...modalState.props} />}
                </Modal>
                
                <ToastContainer toasts={toasts} dismissToast={dismissToast} />
                
                <DragOverlay dropAnimation={null}>
                  {activeDragItem?.type === 'provider' && activeDragItem.name && activeDragItem.color ? (
                    <div 
                      className={`flex items-center p-2 rounded text-sm font-semibold shadow-lg cursor-grabbing ${activeDragItem.color.replace('bg-', 'text-').replace('-500', '-700')} bg-white border-2 ${activeDragItem.color.replace('bg-', 'border-')}`}
                    >
                      <span 
                        className={`w-3 h-3 rounded-full mr-2 flex-shrink-0 ${activeDragItem.color}`} 
                        aria-hidden="true"
                      ></span>
                      {activeDragItem.name}
                    </div>
                  ) : activeDragItem?.type === 'shift' && activeDragItem.shiftData ? (
                    <ShiftDragOverlayPreview 
                      shiftData={activeDragItem.shiftData}
                      providerInitials={activeDragItem.providerInitials}
                      shiftColor={activeDragItem.shiftColor}
                      maIndicators={activeDragItem.maIndicators}
                    />
                  ) : null}
                </DragOverlay>

              </ToastContext.Provider>
            </ModalContext.Provider>
          </SettingsContext.Provider>
        </AuthContext.Provider>
      </AppContext.Provider>
    </DndContext>
  );
};

// Main Application Controller Component
const MainApplication: React.FC = () => {
  const [supabaseUser, setSupabaseUser] = useState<any>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [showAdminBackup, setShowAdminBackup] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  // Check for existing Supabase session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      if (!supabase) {
        console.error('Supabase not configured');
        setIsCheckingAuth(false);
        return;
      }

      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          console.log('Found existing session:', session.user.email);
          setSupabaseUser(session.user);
        }

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (_event, session) => {
            console.log('Auth state changed:', _event, session?.user ? 'User found' : 'No user');
            setSupabaseUser(session?.user || null);
          }
        );

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    initializeAuth();
  }, []);

  // Show loading while checking auth
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show admin backup if requested
  if (showAdminBackup) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full">
          <AdminPasswordForm 
            onSuccess={() => {
              setIsAdminAuthenticated(true);
              setShowAdminBackup(false);
            }}
            onCancel={() => setShowAdminBackup(false)}
          />
        </div>
      </div>
    );
  }

  // Show authenticated app if user is logged in OR admin backup is authenticated
  if (supabaseUser || isAdminAuthenticated) {
    const effectiveUser = supabaseUser || { 
      id: 'local-admin', 
      email: 'local-admin@localhost',
      role: 'admin'
    };
    
    return <AuthenticatedApp user={effectiveUser} />;
  }

  // Show login screen by default
  return (
    <LoginScreen 
      onSuccess={() => {
        // Success is handled by the auth state change listener
        console.log('Login successful');
      }}
      onAdminBackup={() => setShowAdminBackup(true)}
    />
  );
};

// Main App component with error boundary
const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <MainApplication />
    </ErrorBoundary>
  );
};

export default App;