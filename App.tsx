import React, { useState, useCallback, useEffect, createContext, useContext } from 'react';
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
import EditRecurrenceChoiceModal, { EditRecurrenceChoice } from './components/EditRecurrenceChoiceModal';
import ConfirmationModal from './components/ConfirmationModal';
import SettingsForm from './components/SettingsForm';
import ExportOptionsModal from './components/ExportOptionsModal';
import PdfExportSetupModal from './components/PdfExportSetupModal';
import LoginForm from './components/LoginForm';
import ErrorBoundary from './components/ErrorBoundary';
import Footer from './components/Footer';
import SupabaseTest from './components/SupabaseTest';
import { ToastContainer } from './components/Toast';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth, usePermissions } from './hooks/useAuth';
import { isSupabaseConfigured } from './utils/supabase';
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
  getMonthYearString, addMonths, getISODateString, getInitials, 
  getWeekRangeString, addDays as dateAddDays, getTodayInEasternTime,
  formatDateInEasternTime 
} from './utils/dateUtils';
import { detectAllShiftConflicts } from './utils/conflictUtils';
import ChevronLeftIcon from './components/icons/ChevronLeftIcon';
import ChevronRightIcon from './components/icons/ChevronRightIcon';
import ShiftDragOverlayPreview from './components/ShiftDragOverlayPreview';

export const AppContext = createContext<AppContextType | null>(null);
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

// Authentication wrapper component
const AuthenticatedApp: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  
  // Show loading state while authentication is initializing
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login form if not authenticated and Supabase is configured
  if (!isAuthenticated && isSupabaseConfigured()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Clinica Provider Schedule</h1>
            <p className="text-gray-600">Please sign in to continue</p>
          </div>
          <LoginForm onClose={() => {}} />
        </div>
      </div>
    );
  }

  // Render the main application
  return <MainApplication />;
};

// Toast Provider component to manage toast state at the top level
const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((message: string, type: ToastMessage['type'], duration: number = 3000) => {
    const id = uuidv4();
    setToasts(prevToasts => [...prevToasts, { id, message, type, duration }]);
  }, []);
  
  const dismissToast = (id: string) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <ToastContainer toasts={toasts} dismissToast={dismissToast} />
    </ToastContext.Provider>
  );
};

// Main application component (previously the main content of App)
const MainApplication: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { canEdit } = usePermissions();
  const { addToast } = useContext(ToastContext)!;
  
  const [userSettings, setUserSettings] = useLocalStorage<UserSettings>('tempoUserSettings', INITIAL_USER_SETTINGS);
  const [providers, setProviders] = useLocalStorage<Provider[]>('tempoProviders', INITIAL_PROVIDERS);
  const [clinics, setClinics] = useLocalStorage<ClinicType[]>('tempoClinics', INITIAL_CLINIC_TYPES);
  const [medicalAssistants, setMedicalAssistants] = useLocalStorage<MedicalAssistant[]>('tempoMAs', INITIAL_MEDICAL_ASSISTANTS);
  const [shifts, setShifts] = useLocalStorage<Shift[]>('tempoShifts', INITIAL_SHIFTS);
  const [modalState, setModalState] = useState<ModalState>({ type: null, props: {} });
  const [currentDate, setCurrentDate] = useState<Date>(getTodayInEasternTime());
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(window.innerWidth >= 1024); 
  const [conflictingShiftIds, setConflictingShiftIds] = useState<Set<string>>(new Set());
  const [activeDragItem, setActiveDragItem] = useState<DraggableItemData | null>(null);
  const [calendarViewMode, setCalendarViewMode] = useState<CalendarViewMode>(userSettings.defaultCalendarView);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [filters, setFilters] = useLocalStorage<FilterState>('tempoFilters', {
    providerIds: [],
    clinicTypeIds: [],
    medicalAssistantIds: [], 
    showVacations: true,
  });

  // Legacy support for components that still expect isAdmin boolean
  const isAdmin = canEdit;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  useEffect(() => {
    setCalendarViewMode(userSettings.defaultCalendarView);
  }, [userSettings.defaultCalendarView]);
  
  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setUserSettings(prev => ({...prev, ...newSettings}));
    addToast('Settings updated successfully.', 'success');
  };

  useEffect(() => {
    let detectionWindowStart: Date;
    let detectionWindowEnd: Date;

    if (calendarViewMode === 'month') {
        const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        detectionWindowStart = dateAddDays(monthStart, -45); 
        detectionWindowEnd = dateAddDays(monthStart, 45 + 30); 
    } else { 
        const weekStart = dateAddDays(currentDate, -currentDate.getDay() + userSettings.weekStartsOn); 
        if (currentDate.getDay() < userSettings.weekStartsOn && weekStart > currentDate) { 
          dateAddDays(weekStart, -7);
        }
        detectionWindowStart = dateAddDays(weekStart, -14); 
        detectionWindowEnd = dateAddDays(weekStart, 14 + 7);   
    }
    
    const conflicts = detectAllShiftConflicts(shifts, shifts, detectionWindowStart, detectionWindowEnd);
    setConflictingShiftIds(conflicts);
  }, [shifts, currentDate, calendarViewMode, userSettings.weekStartsOn]);

  const closeModal = () => setModalState({ type: null, props: {} });

  const openModal = (type: ModalState['type'], props?: any) => {
    const modalPropsBase = props ? { ...props } : {};

    if (type === 'SHIFT_FORM' && 
        modalPropsBase?.shift?.recurringRule && 
        modalPropsBase.shift.recurringRule.frequency !== RecurringFrequency.NONE && 
        !modalPropsBase.shift.isExceptionInstance && 
        modalPropsBase.instanceDate && 
        canEdit
       ) {
        setModalState({ 
            type: 'EDIT_RECURRENCE_CHOICE', 
            props: { 
                shiftToEdit: modalPropsBase.shift, 
                instanceDate: modalPropsBase.instanceDate,
                onComplete: (choice: EditRecurrenceChoice) => {
                    const { shift: originalShiftFromArgs, ...restOfOriginalArgs } = modalPropsBase;

                    if (choice === 'single') {
                        setModalState({ 
                            type: 'SHIFT_FORM', 
                            props: { 
                                ...restOfOriginalArgs, 
                                editMode: 'singleInstance', 
                                seriesOriginalShift: originalShiftFromArgs, 
                                shift: null, 
                                onClose: closeModal 
                            } 
                        }); 
                    } else if (choice === 'series') {
                        const baseShift = getShiftById(originalShiftFromArgs.seriesId || originalShiftFromArgs.id);
                        setModalState({ 
                            type: 'SHIFT_FORM', 
                            props: { 
                                ...restOfOriginalArgs, 
                                editMode: 'entireSeries', 
                                shift: baseShift, 
                                onClose: closeModal 
                            } 
                        }); 
                    } else { 
                        closeModal();
                    }
                },
                onCancel: closeModal
            }
        });
    } else {
        setModalState({ type, props: { ...modalPropsBase, onClose: closeModal } });
    }
  };

  // Legacy authentication functions for backward compatibility
  const login = (username: string, password: string): boolean => {
    // This is for backward compatibility with existing components
    // Real authentication is handled by AuthContext
    return false;
  };

  const logout = () => {
    // Legacy function - actual logout is handled by AuthContext
  };

  const setCurrentUserRole = (role: UserRole) => {
    // Legacy function - roles are managed through Supabase now
  };

  const addProvider = async (providerData: Omit<Provider, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!canEdit) {
      addToast('You do not have permission to add providers', 'error');
      return;
    }

    const newProvider: Provider = {
      ...providerData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setProviders(prev => [...prev, newProvider]);
    addToast(`Provider "${newProvider.name}" added successfully.`, 'success');
  };

  const updateProvider = async (updatedProvider: Provider) => {
    if (!canEdit) {
      addToast('You do not have permission to update providers', 'error');
      return;
    }

    setProviders(prev => prev.map(p => 
      p.id === updatedProvider.id 
        ? { ...updatedProvider, updatedAt: new Date().toISOString() }
        : p
    ));

    const shiftsToUpdate = shifts.filter(s => s.providerId === updatedProvider.id);
    if (shiftsToUpdate.length > 0) {
      setShifts(prev => prev.map(s => 
        s.providerId === updatedProvider.id 
          ? { ...s, color: s.isVacation ? VACATION_COLOR : updatedProvider.color, updatedAt: new Date().toISOString() }
          : s
      ));
    }

    addToast(`Provider "${updatedProvider.name}" updated successfully.`, 'success');
  };

  const deleteProvider = async (providerId: string) => {
    if (!canEdit) {
      addToast('You do not have permission to delete providers', 'error');
      return;
    }

    setProviders(prev => prev.filter(p => p.id !== providerId));
    setShifts(prev => prev.filter(s => s.providerId !== providerId));
    addToast('Provider deleted successfully.', 'success');
  };

  const getProviderById = (id: string) => providers.find(p => p.id === id);
  const getClinicTypeById = (id: string) => clinics.find(c => c.id === id);
  const getMedicalAssistantById = (id: string) => medicalAssistants.find(ma => ma.id === id);
  const getShiftById = (id: string) => shifts.find(s => s.id === id);

  const addClinicType = async (clinicData: Omit<ClinicType, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newClinic: ClinicType = {
      ...clinicData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setClinics(prev => [...prev, newClinic]);
    addToast(`Clinic Type "${newClinic.name}" added.`, 'success');
  };

  const updateClinicType = async (updatedClinic: ClinicType) => {
    setClinics(prev => prev.map(c => c.id === updatedClinic.id ? { ...updatedClinic, updatedAt: new Date().toISOString() } : c));
    setShifts(prevShifts => prevShifts.map(s => {
        if (s.clinicTypeId === updatedClinic.id && !s.isVacation) {
            const provider = getProviderById(s.providerId);
            return {
                ...s,
                color: provider?.color || updatedClinic.color || DEFAULT_EVENT_COLOR,
                title: `${provider?.name || 'N/A'} @ ${updatedClinic.name}`
            };
        }
        return s;
    }));
    addToast(`Clinic Type "${updatedClinic.name}" updated.`, 'success');
  };

  const deleteClinicType = async (clinicId: string) => {
    const clinicName = clinics.find(c => c.id === clinicId)?.name || 'Unknown Clinic';
    setClinics(prev => prev.filter(c => c.id !== clinicId));
    setShifts(prev => prev.map(s => s.clinicTypeId === clinicId ? { ...s, clinicTypeId: undefined, title: `${getProviderById(s.providerId)?.name} @ N/A` } : s));
    addToast(`Clinic Type "${clinicName}" deleted and unassigned from shifts.`, 'success');
  };

  const addMedicalAssistant = async (maData: Omit<MedicalAssistant, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newMA: MedicalAssistant = {
      ...maData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setMedicalAssistants(prev => [...prev, newMA]);
    addToast(`Medical Assistant "${newMA.name}" added.`, 'success');
  };

  const updateMedicalAssistant = async (updatedMA: MedicalAssistant) => {
    setMedicalAssistants(prev => prev.map(ma => ma.id === updatedMA.id ? { ...updatedMA, updatedAt: new Date().toISOString() } : ma));
    addToast(`Medical Assistant "${updatedMA.name}" updated.`, 'success');
  };

  const deleteMedicalAssistant = async (maId: string) => {
    const maName = medicalAssistants.find(ma => ma.id === maId)?.name || 'Unknown MA';
    setMedicalAssistants(prev => prev.filter(ma => ma.id !== maId));
    setShifts(prevShifts => prevShifts.map(s => ({
        ...s,
        medicalAssistantIds: s.medicalAssistantIds?.filter(id => id !== maId)
    })));
    addToast(`Medical Assistant "${maName}" deleted and unassigned from shifts.`, 'success');
  };

 const addShift = async (
    shiftData: Omit<Shift, 'id' | 'createdAt' | 'updatedAt' | 'color' | 'title' | 'seriesId'>,
    isCreatingException: boolean = false
 ): Promise<Shift | null> => {
    const provider = getProviderById(shiftData.providerId);
    if (!provider) {
      addToast('Provider not found for shift.', 'error');
      return null;
    }

    let color = provider.color;
    let title = provider.name;

    if (shiftData.isVacation) {
      color = VACATION_COLOR;
      title = `${provider.name} - Vacation`;
    } else if (shiftData.clinicTypeId) {
      const clinic = getClinicTypeById(shiftData.clinicTypeId);
      if (clinic) {
        color = provider.color || clinic.color || DEFAULT_EVENT_COLOR;
        title = `${provider.name} @ ${clinic.name}`;
      } else {
         addToast('Clinic type not found for shift.', 'error');
         return null;
      }
    } else { 
        color = provider.color || DEFAULT_EVENT_COLOR;
    }
    
    const newId = uuidv4();
    let seriesIdToSet: string;

    if (isCreatingException && shiftData.originalRecurringShiftId) {
        const originalBaseShift = getShiftById(shiftData.originalRecurringShiftId);
        seriesIdToSet = originalBaseShift?.seriesId || shiftData.originalRecurringShiftId; 
    } else if (shiftData.recurringRule && shiftData.recurringRule.frequency !== RecurringFrequency.NONE) {
        seriesIdToSet = newId;
    } else {
        seriesIdToSet = newId; 
    }

    const newShift: Shift = {
      ...shiftData,
      id: newId,
      seriesId: seriesIdToSet,
      color,
      title,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setShifts(prev => [...prev, newShift]);
    addToast(isCreatingException ? 'Shift exception created.' : 'Shift created.', 'success');
    return newShift;
  };

  const updateShift = async (updatedShift: Shift) => {
    const provider = getProviderById(updatedShift.providerId);
    if (!provider) { addToast('Provider not found.', 'error'); return; }

    let color = provider.color;
    let title = provider.name;

    if (updatedShift.isVacation) {
      color = VACATION_COLOR;
      title = `${provider.name} - Vacation`;
    } else if (updatedShift.clinicTypeId) {
      const clinic = getClinicTypeById(updatedShift.clinicTypeId);
      if (clinic) {
        color = provider.color || clinic.color || DEFAULT_EVENT_COLOR;
        title = `${provider.name} @ ${clinic.name}`;
      } 
    } else { 
        color = provider.color || DEFAULT_EVENT_COLOR;
    }
    
    let finalSeriesId = updatedShift.seriesId;
    if (!updatedShift.isExceptionInstance && updatedShift.recurringRule && updatedShift.recurringRule.frequency !== RecurringFrequency.NONE) {
        finalSeriesId = updatedShift.id; 
    } else if (!updatedShift.isExceptionInstance) { 
        finalSeriesId = updatedShift.id;
    }

    const finalShift = { 
        ...updatedShift, 
        color, 
        title, 
        seriesId: finalSeriesId,
        updatedAt: new Date().toISOString() 
    };

    setShifts(prev => prev.map(s => (s.id === finalShift.id ? finalShift : s)));
    addToast('Shift updated.', 'success');
  };

  const deleteShift = async (shiftId: string, seriesIdToDelete?: string, deleteAllOccurrences?: boolean, deleteInstanceDate?: string) => {
    const shiftToDelete = getShiftById(shiftId);
    if (!shiftToDelete) { addToast("Shift not found to delete.", "error"); return; }

    if (deleteAllOccurrences && seriesIdToDelete) {
        setShifts(prev => prev.filter(s => s.seriesId !== seriesIdToDelete && s.id !== seriesIdToDelete)); // also remove the base shift
        addToast(`Recurring series and all its occurrences/exceptions deleted.`, 'success');
    } else if (shiftToDelete.isExceptionInstance) {
        setShifts(prev => prev.filter(s => s.id !== shiftId));
        addToast(`Shift exception for ${shiftToDelete.exceptionForDate} deleted.`, 'success');
    } else { 
        setShifts(prev => prev.filter(s => s.id !== shiftId)); 
        addToast(`Shift "${shiftToDelete.title || shiftId}" deleted.`, 'success');
    }
  };

  const importData = async (data: { providers?: Partial<Provider>[], clinics?: Partial<ClinicType>[], medicalAssistants?: Partial<MedicalAssistant>[], shifts?: Partial<Shift>[] }) => {
    let importedProvidersCount = 0;
    let updatedProvidersCount = 0;
    let importedClinicsCount = 0;
    let updatedClinicsCount = 0;
    let importedMACount = 0;
    let updatedMACount = 0;
    let importedShiftsCount = 0;
    let updatedShiftsCount = 0;
    const now = new Date().toISOString();

    const finalProvidersMap = new Map(providers.map(p => [p.id, { ...p }]));
    if (data.providers) {
      data.providers.forEach(incomingProvider => {
        const existingProvider = incomingProvider.id ? finalProvidersMap.get(incomingProvider.id) : undefined;
        const fullProviderData = {
          ...INITIAL_PROVIDERS[0], 
          id: existingProvider?.id || incomingProvider.id || uuidv4(),
          name: incomingProvider.name || existingProvider?.name || 'Unnamed Provider',
          color: incomingProvider.color || existingProvider?.color || PREDEFINED_COLORS[0],
          isActive: typeof incomingProvider.isActive === 'boolean' ? incomingProvider.isActive : (existingProvider ? existingProvider.isActive : true),
          createdAt: existingProvider?.createdAt || now,
          updatedAt: now,
          ...incomingProvider 
        };
        if(existingProvider) updatedProvidersCount++; else importedProvidersCount++;
        finalProvidersMap.set(fullProviderData.id, fullProviderData);
      });
    }

    const finalClinicsMap = new Map(clinics.map(c => [c.id, { ...c }]));
    if (data.clinics) {
      data.clinics.forEach(incomingClinic => {
        const existingClinic = incomingClinic.id ? finalClinicsMap.get(incomingClinic.id) : undefined;
        const fullClinicData = {
          ...INITIAL_CLINIC_TYPES[0],
          id: existingClinic?.id || incomingClinic.id || uuidv4(),
          name: incomingClinic.name || existingClinic?.name || 'Unnamed Clinic',
          color: incomingClinic.color || existingClinic?.color || PREDEFINED_COLORS[1],
          isActive: typeof incomingClinic.isActive === 'boolean' ? incomingClinic.isActive : (existingClinic ? existingClinic.isActive : true),
          createdAt: existingClinic?.createdAt || now,
          updatedAt: now,
           ...incomingClinic
        };
        if(existingClinic) updatedClinicsCount++; else importedClinicsCount++;
        finalClinicsMap.set(fullClinicData.id, fullClinicData);
      });
    }
    
    const finalMAsMap = new Map(medicalAssistants.map(ma => [ma.id, { ...ma }]));
    if (data.medicalAssistants) {
        data.medicalAssistants.forEach(incomingMA => {
            const existingMA = incomingMA.id ? finalMAsMap.get(incomingMA.id) : undefined;
            const fullMAData = {
              ...INITIAL_MEDICAL_ASSISTANTS[0],
              id: existingMA?.id || incomingMA.id || uuidv4(),
              name: incomingMA.name || existingMA?.name || 'Unnamed MA',
              color: incomingMA.color || existingMA?.color || PREDEFINED_COLORS[2],
              isActive: typeof incomingMA.isActive === 'boolean' ? incomingMA.isActive : (existingMA ? existingMA.isActive : true),
              createdAt: existingMA?.createdAt || now,
              updatedAt: now,
              ...incomingMA
            };
            if(existingMA) updatedMACount++; else importedMACount++;
            finalMAsMap.set(fullMAData.id, fullMAData);
        });
    }

    const finalProvidersList = Array.from(finalProvidersMap.values());
    const finalClinicsList = Array.from(finalClinicsMap.values());
    const finalMAList = Array.from(finalMAsMap.values());

    const getProviderByIdLocal = (id: string) => finalProvidersList.find(p => p.id === id);
    const getClinicTypeByIdLocal = (id: string) => finalClinicsList.find(c => c.id === id);

    const finalShiftsMap = new Map(shifts.map(s => [s.id, { ...s }]));
    if (data.shifts) {
      data.shifts.forEach(incomingShift => {
        const existingShift = incomingShift.id ? finalShiftsMap.get(incomingShift.id) : undefined;
        
        const providerId = incomingShift.providerId || existingShift?.providerId;
        if (!providerId) {
          addToast(`Shift import: Missing providerId. Skipping shift ID: ${incomingShift.id || '(new)'}.`, 'warning');
          return;
        }
        const provider = getProviderByIdLocal(providerId);
        if (!provider) {
          addToast(`Shift import: Provider with ID ${providerId} not found. Skipping shift ID: ${incomingShift.id || '(new)'}.`, 'warning');
          return;
        }

        const isVacation = typeof incomingShift.isVacation === 'boolean' ? incomingShift.isVacation : (existingShift ? existingShift.isVacation : false);
        let color = provider.color || DEFAULT_EVENT_COLOR;
        let title = provider.name;
        let clinicTypeId = isVacation ? undefined : (incomingShift.clinicTypeId || existingShift?.clinicTypeId);

        if (isVacation) {
          color = VACATION_COLOR;
          title = `${provider.name} - Vacation`;
        } else {
          const clinic = clinicTypeId ? getClinicTypeByIdLocal(clinicTypeId) : undefined;
          if (clinicTypeId && !clinic) addToast(`Shift import: Clinic ID ${clinicTypeId} not found for shift ${incomingShift.id || '(new)'}. Appearance defaults.`, 'warning');
          if (clinic) {
            color = provider.color || clinic.color || DEFAULT_EVENT_COLOR;
            title = `${provider.name} @ ${clinic.name}`;
          } else { 
            title = `${provider.name} @ N/A`;
            if (clinicTypeId) addToast(`Shift import: Clinic Type ID "${clinicTypeId}" for shift "${incomingShift.id || title}" not found. Shift created without clinic.`, 'warning');
            clinicTypeId = undefined; 
          }
        }

        const startDate = incomingShift.startDate || existingShift?.startDate || getISODateString(new Date());
        const endDate = incomingShift.endDate || existingShift?.endDate || startDate;
        
        const validMAIds = incomingShift.medicalAssistantIds?.filter(maId => finalMAList.some(ma => ma.id === maId)) || existingShift?.medicalAssistantIds || [];
        if (incomingShift.medicalAssistantIds && incomingShift.medicalAssistantIds.length !== validMAIds.length) {
             addToast(`Shift import: Some MA IDs for shift ${incomingShift.id || '(new)'} are invalid and were ignored.`, 'warning');
        }

        const fullShiftData = {
            ...INITIAL_SHIFTS[0], 
            id: existingShift?.id || incomingShift.id || uuidv4(),
            providerId: provider.id,
            clinicTypeId,
            medicalAssistantIds: validMAIds,
            title,
            startDate,
            endDate,
            startTime: isVacation ? undefined : (incomingShift.startTime || existingShift?.startTime || '09:00'),
            endTime: isVacation ? undefined : (incomingShift.endTime || existingShift?.endTime || '17:00'),
            isVacation,
            notes: incomingShift.notes || existingShift?.notes || '',
            color,
            recurringRule: incomingShift.recurringRule || existingShift?.recurringRule,
            seriesId: existingShift?.seriesId || incomingShift.seriesId, 
            originalRecurringShiftId: existingShift?.originalRecurringShiftId || incomingShift.originalRecurringShiftId,
            isExceptionInstance: typeof incomingShift.isExceptionInstance === 'boolean' ? incomingShift.isExceptionInstance : (existingShift ? existingShift.isExceptionInstance : false),
            exceptionForDate: existingShift?.exceptionForDate || incomingShift.exceptionForDate,
            createdAt: existingShift?.createdAt || now,
            updatedAt: now,
            createdByUserId: existingShift?.createdByUserId || incomingShift.createdByUserId || user?.id,
            ...incomingShift 
        };
        
        if(!existingShift && fullShiftData.recurringRule && fullShiftData.recurringRule.frequency !== RecurringFrequency.NONE && !fullShiftData.isExceptionInstance) {
            fullShiftData.seriesId = fullShiftData.id;
        } else if (!existingShift && !fullShiftData.seriesId && !fullShiftData.isExceptionInstance) { 
            fullShiftData.seriesId = fullShiftData.id;
        }


        if(existingShift) updatedShiftsCount++; else importedShiftsCount++;
        finalShiftsMap.set(fullShiftData.id, fullShiftData);
      });
    }

    setProviders(finalProvidersList);
    setClinics(finalClinicsList);
    setMedicalAssistants(finalMAList);
    setShifts(Array.from(finalShiftsMap.values()));

    const summaryMessages: string[] = [];
    if (importedProvidersCount > 0) summaryMessages.push(`${importedProvidersCount} providers added`);
    if (updatedProvidersCount > 0) summaryMessages.push(`${updatedProvidersCount} providers updated`);
    if (importedClinicsCount > 0) summaryMessages.push(`${importedClinicsCount} clinics added`);
    if (updatedClinicsCount > 0) summaryMessages.push(`${updatedClinicsCount} clinics updated`);
    if (importedMACount > 0) summaryMessages.push(`${importedMACount} MAs added`);
    if (updatedMACount > 0) summaryMessages.push(`${updatedMACount} MAs updated`);
    if (importedShiftsCount > 0) summaryMessages.push(`${importedShiftsCount} shifts added`);
    if (updatedShiftsCount > 0) summaryMessages.push(`${updatedShiftsCount} shifts updated`);

    if (summaryMessages.length > 0) {
      addToast(`Import complete: ${summaryMessages.join(', ')}.`, 'success', 5000);
    } else {
      addToast('Import: No data found matching expected structure or no changes made.', 'info');
    }
  };

  const handleExportData = () => {
    const dataToExport = {
      providers,
      clinics,
      medicalAssistants,
      shifts,
      userSettings 
    };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(dataToExport, null, 2))}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = `clinica_schedule_export_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    addToast('Data exported successfully.', 'success');
  };
  
  const handleNavigatePrevious = () => {
    setCurrentDate(prev => {
      if (calendarViewMode === 'month') return addMonths(prev, -1);
      if (calendarViewMode === 'week') return dateAddDays(prev, -7);
      if (calendarViewMode === 'day') return dateAddDays(prev, -1);
      return prev;
    });
  };
  const handleNavigateNext = () => {
    setCurrentDate(prev => {
      if (calendarViewMode === 'month') return addMonths(prev, 1);
      if (calendarViewMode === 'week') return dateAddDays(prev, 7);
      if (calendarViewMode === 'day') return dateAddDays(prev, 1);
      return prev;
    });
  };
  const handleNavigateToday = () => setCurrentDate(getTodayInEasternTime());

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      } 
    };
    window.addEventListener('resize', handleResize);
    handleResize(); 
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const itemData = active.data.current;
  
    if (itemData?.type === 'provider' && itemData.provider) {
      const providerData = itemData.provider as Provider; 
      setActiveDragItem({
        id: active.id as string, // active.id is the ID from useDraggable
        type: 'provider',
        name: providerData.name,
        color: providerData.color,
      });
    } else if (itemData?.type === 'shift' && itemData.shiftId) {
      const shiftId = itemData.shiftId as string;
      const originalShift = getShiftById(shiftId);
      if (originalShift) {
        const provider = getProviderById(originalShift.providerId);
        const mas = (originalShift.medicalAssistantIds || [])
          .map(maId => getMedicalAssistantById(maId))
          .filter(Boolean) as MedicalAssistant[];
        
        setActiveDragItem({
          id: active.id as string, // active.id is the ID from useDraggable
          type: 'shift',
          shiftData: { ...originalShift }, 
          providerInitials: getInitials(provider?.name),
          shiftColor: originalShift.color,
          maIndicators: mas.slice(0, 2).map(ma => ({ initials: getInitials(ma.name)[0], color: ma.color })) 
        });
      }
    }
  };
  
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragItem(null); 
  
    if (!canEdit || !over || !active.data.current || !over.data.current) return;
  
    const draggedItemType = active.data.current.type as 'provider' | 'shift';
    const dropTargetType = over.data.current.type as 'dayCell' | undefined;
  
    if (draggedItemType === 'provider' && dropTargetType === 'dayCell') {
      const providerId = active.data.current.providerId as string;
      const dateString = over.data.current.dateString as string;
      
      // Get current filter settings to prepopulate the form
      const activeFilters = {
        providerIds: filters.providerIds.length > 0 ? filters.providerIds : undefined,
        clinicTypeIds: filters.clinicTypeIds.length > 0 ? filters.clinicTypeIds : undefined,
        medicalAssistantIds: filters.medicalAssistantIds.length > 0 ? filters.medicalAssistantIds : undefined,
      };
      
      openModal('SHIFT_FORM', { 
        initialDate: dateString,
        providerIdForNewShift: providerId,
        filterDefaults: activeFilters,
      });
    } else if (draggedItemType === 'shift' && dropTargetType === 'dayCell') {
      const draggedShiftId = active.data.current.shiftId as string;
      const newDateString = over.data.current.dateString as string;
  
      if (!draggedShiftId || !newDateString) return;
  
      if (new Date(newDateString + "T00:00:00") < new Date(getISODateString(new Date()) + "T00:00:00")) {
        // This check is a bit simplistic as "today" keeps moving. 
        // A better check might be if the target date is in a "locked" past period if such a concept exists.
        // For now, disallowing moves to any date before today's date.
        // addToast("Shifts can only be moved to current or future dates.", 'error');
        // return;
      }
  
      const originalShift = getShiftById(draggedShiftId);
      if (!originalShift) {
        addToast("Original shift not found.", "error");
        return;
      }
      
      setIsSubmitting(true); 
      try {
        if (!originalShift.recurringRule || originalShift.recurringRule.frequency === RecurringFrequency.NONE || originalShift.isExceptionInstance) {
          const startDateObj = new Date(originalShift.startDate + "T00:00:00");
          const endDateObj = new Date(originalShift.endDate + "T00:00:00");
          const durationDays = (endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24);
          
          const newEndDate = dateAddDays(new Date(newDateString + "T00:00:00"), durationDays);
  
          await updateShift({ 
            ...originalShift, 
            startDate: newDateString, 
            endDate: getISODateString(newEndDate) 
          });
          addToast("Shift rescheduled successfully.", "success");
        } else { 
          const baseSeriesShift = originalShift.seriesId ? getShiftById(originalShift.seriesId) : originalShift;
          if (!baseSeriesShift) {
            addToast("Base series shift not found.", "error");
            setIsSubmitting(false);
            return;
          }

          const originalSeriesStartDate = new Date(baseSeriesShift.startDate + "T00:00:00");
          const durationDays = (new Date(baseSeriesShift.endDate + "T00:00:00").getTime() - originalSeriesStartDate.getTime()) / (1000 * 60 * 60 * 24);

          const newExceptionEndDate = dateAddDays(new Date(newDateString + "T00:00:00"), durationDays);

          const newExceptionData: Omit<Shift, 'id' | 'createdAt' | 'updatedAt' | 'color' | 'title' | 'seriesId'> = {
            providerId: baseSeriesShift.providerId,
            clinicTypeId: baseSeriesShift.clinicTypeId,
            medicalAssistantIds: baseSeriesShift.medicalAssistantIds,
            startDate: newDateString,
            endDate: getISODateString(newExceptionEndDate),
            startTime: baseSeriesShift.startTime,
            endTime: baseSeriesShift.endTime,
            isVacation: baseSeriesShift.isVacation,
            notes: baseSeriesShift.notes,
            recurringRule: { frequency: RecurringFrequency.NONE }, 
            isExceptionInstance: true,
            originalRecurringShiftId: baseSeriesShift.seriesId || baseSeriesShift.id, 
            exceptionForDate: newDateString, 
            createdByUserId: user?.id,
          };
          await addShift(newExceptionData, true);
          addToast("Shift instance moved as a new, separate occurrence. The original series remains unchanged.", "success", 5000);
        }
      } catch (error) {
        console.error("Error rescheduling shift:", error);
        addToast(`Failed to reschedule shift: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      } finally {
        setIsSubmitting(false);
      }
    }
  };


  const getModalTitle = (): string => {
    if (!modalState.type) return '';
    switch (modalState.type) {
      case 'PROVIDER_FORM':
        return modalState.props?.provider ? 'Edit Provider' : 'Add New Provider';
      case 'CLINIC_TYPE_FORM':
        return modalState.props?.clinicType ? 'Edit Clinic Type' : 'Add New Clinic Type';
      case 'MEDICAL_ASSISTANT_FORM': 
        return modalState.props?.medicalAssistant ? 'Edit Medical Assistant' : 'Add New Medical Assistant';
      case 'SETTINGS_FORM':
        return 'Application Settings';
      case 'SHIFT_FORM':
        if (modalState.props?.editMode === 'singleInstance') return 'Edit This Shift Occurrence';
        if (modalState.props?.editMode === 'entireSeries') return 'Edit Entire Shift Series';
        return modalState.props?.shift ? 'Edit Shift' : 'Create New Shift';
      case 'IMPORT_DATA_FORM':
        return 'Import Data from JSON';
      case 'VIEW_SHIFT_DETAILS':
        return modalState.props?.listTitle || (modalState.props?.shift?.title ? `Shift: ${modalState.props.shift.title}` : 'Shift Details');
      case 'EDIT_RECURRENCE_CHOICE':
        return 'Edit Recurring Shift';
      case 'CONFIRMATION_MODAL':
        return modalState.props?.title || 'Confirm Action';
      case 'EXPORT_OPTIONS_MODAL':
        return 'Export Options';
      case 'PDF_EXPORT_SETUP_MODAL':
        return 'PDF Export Configuration';
      case 'LOGIN_FORM':
        return 'Sign In';
      case 'SUPABASE_TEST':
        return 'Supabase Connection Test';
      default:
        return 'Modal';
    }
  };

  const getModalSize = (): 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' => {
    if (!modalState.type) return 'md';
    switch (modalState.type) {
      case 'SHIFT_FORM': return '2xl';
      case 'PROVIDER_FORM':
      case 'CLINIC_TYPE_FORM':
      case 'MEDICAL_ASSISTANT_FORM': 
      case 'SETTINGS_FORM':
        return 'lg';
      case 'IMPORT_DATA_FORM':
        return '3xl';
      case 'VIEW_SHIFT_DETAILS':
        return modalState.props?.isListView ? 'xl' : 'lg';
      case 'EDIT_RECURRENCE_CHOICE':
      case 'CONFIRMATION_MODAL':
      case 'EXPORT_OPTIONS_MODAL':
      case 'PDF_EXPORT_SETUP_MODAL':
      case 'LOGIN_FORM':
        return 'md';
      case 'SUPABASE_TEST':
        return '4xl';
      default:
        return 'md';
    }
  };

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

  const appContextValue: AppContextType = {
    providers, clinics, medicalAssistants, shifts, 
    addProvider, updateProvider, deleteProvider, 
    addClinicType, updateClinicType, deleteClinicType, 
    addMedicalAssistant, updateMedicalAssistant, deleteMedicalAssistant,
    addShift, updateShift, deleteShift, 
    importData, 
    getProviderById, getClinicTypeById, getMedicalAssistantById, getShiftById
  };
  
  const settingsContextValue: SettingsContextType = {
    settings: userSettings,
    updateSettings,
  };


  return (
    <ErrorBoundary>
      <DndContext 
        sensors={sensors} 
        collisionDetection={closestCenter} 
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <AppContext.Provider value={appContextValue}>
           <SettingsContext.Provider value={settingsContextValue}>
            <ModalContext.Provider value={{ modal: modalState, openModal, closeModal }}>
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
                  <Footer />
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
                {modalState.type === 'LOGIN_FORM' && <LoginForm {...modalState.props} />}
                {modalState.type === 'SUPABASE_TEST' && <SupabaseTest />}
              </Modal>
              
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

          </ModalContext.Provider>
         </SettingsContext.Provider>
        </AppContext.Provider>
      </DndContext>
    </ErrorBoundary>
  );
};

// Final App component that provides authentication context
const App: React.FC = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <AuthenticatedApp />
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;