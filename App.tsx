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
import SupabaseAuth from './components/SupabaseAuth';
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

// Simple admin password for the application
const ADMIN_PASSWORD = 'CPS2025!Admin';

// Main application component
const MainApplication: React.FC = () => {
  // Track Supabase connection and authentication status
  const [supabaseConnectionStatus, setSupabaseConnectionStatus] = useState<boolean>(false);
  const [isCheckingConnection, setIsCheckingConnection] = useState<boolean>(true);
  const [supabaseUser, setSupabaseUser] = useState<any>(null);
  const [showSupabaseLogin, setShowSupabaseLogin] = useState<boolean>(false);

  // Use Supabase for all data (anonymous reads, authenticated writes)
  const { 
    data: providers, 
    setData: setProviders, 
    isOnline: providersOnline,
    loading: providersLoading,
    error: providersError
  } = useSupabaseProviders(INITIAL_PROVIDERS);
  
  const { 
    data: clinics, 
    setData: setClinics, 
    isOnline: clinicsOnline,
    loading: clinicsLoading,
    error: clinicsError
  } = useSupabaseClinicTypes(INITIAL_CLINIC_TYPES);
  
  const { 
    data: medicalAssistants, 
    setData: setMedicalAssistants, 
    isOnline: medicalAssistantsOnline,
    loading: medicalAssistantsLoading,
    error: medicalAssistantsError
  } = useSupabaseMedicalAssistants(INITIAL_MEDICAL_ASSISTANTS);
  
  const { 
    data: shifts, 
    setData: setShifts, 
    isOnline: shiftsOnline,
    loading: shiftsLoading,
    error: shiftsError
  } = useSupabaseShifts(INITIAL_SHIFTS);
  
  // Test Supabase connection on mount (but don't require authentication)
  useEffect(() => {
    const initializeSupabase = async () => {
      console.log('🔍 Testing Supabase connection...');
      
      try {
        if (isSupabaseConfigured()) {
          console.log('🔧 Supabase is configured, testing connection...');
          
          // Test connection with timeout
          const connectionPromise = testSupabaseConnection();
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Connection test timeout')), 10000)
          );
          
          const result = await Promise.race([connectionPromise, timeoutPromise]) as any;
          setSupabaseConnectionStatus(result.success);
          
          if (result.success) {
            console.log('✅ Supabase connection successful:', result.message);
            console.log('📊 Connection details:', result.details);
            
            // Set up auth listener for when user logs in later
            if (supabase) {
              const { data: { subscription } } = supabase.auth.onAuthStateChange(
                (_event, session) => {
                  console.log('🔄 Auth state changed:', _event, session?.user ? 'User found' : 'No user');
                  setSupabaseUser(session?.user || null);
                }
              );

              // Cleanup function
              return () => {
                console.log('🧹 Cleaning up auth subscription');
                subscription.unsubscribe();
              };
            }
          } else {
            console.warn('❌ Supabase connection failed:', result.error);
            if (result.solution) {
              console.info('💡 Solution:', result.solution);
            }
          }
        } else {
          console.log('⚙️ Supabase not configured, using localStorage mode');
          setSupabaseConnectionStatus(false);
        }
      } catch (error) {
        console.error('❌ Supabase initialization error:', error);
        setSupabaseConnectionStatus(false);
      } finally {
        console.log('✅ Supabase connection test complete');
        setIsCheckingConnection(false);
      }
    };

    initializeSupabase();

    // Fallback: Force loading to complete after 15 seconds
    const fallbackTimeout = setTimeout(() => {
      console.warn('⏰ Supabase initialization taking too long, forcing completion');
      setIsCheckingConnection(false);
      setSupabaseConnectionStatus(false);
    }, 10000);

    return () => {
      clearTimeout(fallbackTimeout);
    };
  }, []);
  
  // Use actual Supabase data storage status 
  const isFullyOnline = providersOnline && clinicsOnline && medicalAssistantsOnline && shiftsOnline;
  
  // User settings use localStorage, but auth now uses Supabase
  const [userSettings, setUserSettings] = useLocalStorage<UserSettings>('tempoUserSettings', INITIAL_USER_SETTINGS);
  
  // Keep old system for fallback/compatibility but use Supabase auth as primary
  const [currentUser, setCurrentUser] = useLocalStorage<User | null>('tempoCurrentUser', { 
    id: 'default-user', 
    username: 'User', 
    role: UserRole.USER 
  });
  const [isAuthenticated, setIsAuthenticated] = useLocalStorage<boolean>('tempoIsAuthenticated', false);
  
  // Use Supabase authentication status as primary
  const isUserAuthenticated = !!supabaseUser || isAuthenticated;
  const isUserAdmin = !!supabaseUser || isAuthenticated;
  const [modalState, setModalState] = useState<ModalState>({ type: null, props: {} });
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
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

  // Use Supabase authentication status as primary, fallback to localStorage
  const isAdmin = isUserAdmin;

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

  const addToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', duration?: number) => {
    const id = uuidv4();
    const toast: ToastMessage = { id, message, type, duration };
    setToasts(prev => [...prev, toast]);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const closeModal = () => setModalState({ type: null, props: {} });

  const openModal = (type: ModalState['type'], props?: any) => {
    // Check if this is an edit action that requires authentication
    const editActions = [
      'addProvider', 'editProvider', 'deleteProvider',
      'addClinicType', 'editClinicType', 'deleteClinicType', 
      'addMedicalAssistant', 'editMedicalAssistant', 'deleteMedicalAssistant',
      'addShift', 'editShift', 'duplicateShift', 'deleteShift',
      'importData', 'settings'
    ];

    if (editActions.includes(type as string) && !supabaseUser) {
      // Prompt for Supabase login instead of password
      setShowSupabaseLogin(true);
      return;
    }

    setModalState({ type, props });
  };

  // Simple authentication functions
  const authenticateAdmin = (password: string): boolean => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setCurrentUser({ 
        id: 'admin-user', 
        username: 'Admin', 
        role: UserRole.ADMIN 
      });
      addToast('Authenticated as admin successfully.', 'success');
      return true;
    }
    addToast('Invalid password.', 'error');
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser({ 
      id: 'default-user', 
      username: 'User', 
      role: UserRole.USER 
    });
    addToast('Logged out successfully.', 'info');
  };

  const setCurrentUserRole = (role: UserRole) => {
    if (currentUser) {
      const updatedUser = { ...currentUser, role };
      setCurrentUser(updatedUser);
      if (role === UserRole.USER) {
        setIsAuthenticated(false);
      }
    }
  };
  
  const getProviderById = useCallback((id: string) => providers.find((p: Provider) => p.id === id), [providers]);
  const getClinicTypeById = useCallback((id: string) => clinics.find((c: ClinicType) => c.id === id), [clinics]);
  const getMedicalAssistantById = useCallback((id: string) => medicalAssistants.find((ma: MedicalAssistant) => ma.id === id), [medicalAssistants]);
  const getShiftById = useCallback((id: string) => shifts.find((s: Shift) => s.id === id), [shifts]);

  const addProvider = async (providerData: Omit<Provider, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProvider: Provider = {
      ...providerData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await setProviders((prev: Provider[]) => [...prev, newProvider]);
    addToast(`Provider "${newProvider.name}" added.`, 'success');
  };

  const updateProvider = async (updatedProvider: Provider) => {
    await setProviders((prev: Provider[]) => prev.map((p: Provider) => p.id === updatedProvider.id ? { ...updatedProvider, updatedAt: new Date().toISOString() } : p));
    await setShifts((prevShifts: Shift[]) => prevShifts.map((s: Shift) => {
        if (s.providerId === updatedProvider.id && !s.isVacation) {
            const clinic = s.clinicTypeId ? getClinicTypeById(s.clinicTypeId) : undefined;
            return {
                ...s,
                color: updatedProvider.color || clinic?.color || DEFAULT_EVENT_COLOR,
                title: `${updatedProvider.name} @ ${clinic?.name || 'N/A'}`
            };
        }
        return s;
    }));
    addToast(`Provider "${updatedProvider.name}" updated.`, 'success');
  };

  const deleteProvider = async (providerId: string) => {
    const providerName = providers.find((p: Provider) => p.id === providerId)?.name || 'Unknown Provider';
    await setProviders((prev: Provider[]) => prev.filter((p: Provider) => p.id !== providerId));
    await setShifts((prev: Shift[]) => prev.filter((s: Shift) => s.providerId !== providerId)); 
    addToast(`Provider "${providerName}" and their shifts deleted.`, 'success');
  };

  const addClinicType = async (clinicData: Omit<ClinicType, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newClinic: ClinicType = {
      ...clinicData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await setClinics((prev: ClinicType[]) => [...prev, newClinic]);
    addToast(`Clinic Type "${newClinic.name}" added.`, 'success');
  };

  const updateClinicType = async (updatedClinic: ClinicType) => {
    await setClinics((prev: ClinicType[]) => prev.map((c: ClinicType) => c.id === updatedClinic.id ? { ...updatedClinic, updatedAt: new Date().toISOString() } : c));
    await setShifts((prevShifts: Shift[]) => prevShifts.map((s: Shift) => {
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
    const clinicName = clinics.find((c: ClinicType) => c.id === clinicId)?.name || 'Unknown Clinic';
    await setClinics((prev: ClinicType[]) => prev.filter((c: ClinicType) => c.id !== clinicId));
    await setShifts((prev: Shift[]) => prev.map((s: Shift) => s.clinicTypeId === clinicId ? { ...s, clinicTypeId: undefined, title: `${getProviderById(s.providerId)?.name} @ N/A` } : s));
    addToast(`Clinic Type "${clinicName}" deleted and unassigned from shifts.`, 'success');
  };

  const addMedicalAssistant = async (maData: Omit<MedicalAssistant, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newMA: MedicalAssistant = {
      ...maData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await setMedicalAssistants((prev: MedicalAssistant[]) => [...prev, newMA]);
    addToast(`Medical Assistant "${newMA.name}" added.`, 'success');
  };

  const updateMedicalAssistant = async (updatedMA: MedicalAssistant) => {
    await setMedicalAssistants((prev: MedicalAssistant[]) => prev.map((ma: MedicalAssistant) => ma.id === updatedMA.id ? { ...updatedMA, updatedAt: new Date().toISOString() } : ma));
    addToast(`Medical Assistant "${updatedMA.name}" updated.`, 'success');
  };

  const deleteMedicalAssistant = async (maId: string) => {
    const maName = medicalAssistants.find((ma: MedicalAssistant) => ma.id === maId)?.name || 'Unknown MA';
    await setMedicalAssistants((prev: MedicalAssistant[]) => prev.filter((ma: MedicalAssistant) => ma.id !== maId));
    await setShifts((prevShifts: Shift[]) => prevShifts.map((s: Shift) => ({
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

    await setShifts((prev: Shift[]) => [...prev, newShift]);
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

    await setShifts((prev: Shift[]) => prev.map((s: Shift) => (s.id === finalShift.id ? finalShift : s)));
    addToast('Shift updated.', 'success');
  };

  const deleteShift = async (shiftId: string, seriesIdToDelete?: string, deleteAllOccurrences?: boolean) => {
    const shiftToDelete = getShiftById(shiftId);
    if (!shiftToDelete) { addToast("Shift not found to delete.", "error"); return; }

    if (deleteAllOccurrences && seriesIdToDelete) {
        await setShifts((prev: Shift[]) => prev.filter((s: Shift) => s.seriesId !== seriesIdToDelete && s.id !== seriesIdToDelete)); // also remove the base shift
        addToast(`Recurring series and all its occurrences/exceptions deleted.`, 'success');
    } else if (shiftToDelete.isExceptionInstance) {
        await setShifts((prev: Shift[]) => prev.filter((s: Shift) => s.id !== shiftId));
        addToast(`Shift exception for ${shiftToDelete.exceptionForDate} deleted.`, 'success');
    } else { 
        await setShifts((prev: Shift[]) => prev.filter((s: Shift) => s.id !== shiftId)); 
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
            createdByUserId: existingShift?.createdByUserId || incomingShift.createdByUserId || currentUser?.id,
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
  
    if (!isAdmin || !over || !active.data.current) return;
  
    const draggedItemType = active.data.current.type as 'provider' | 'shift';
    const dropTargetType = over.data.current?.type as 'dayCell' | undefined;
  
    if (draggedItemType === 'provider' && dropTargetType === 'dayCell') {
      const providerId = active.data.current?.providerId as string;
      const dateString = over.data.current?.dateString as string;
      
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
      const draggedShiftId = active.data.current?.shiftId as string;
      // const instanceDateString = active.data.current.instanceDateString as string; // Original date of dragged instance
      const newDateString = over.data.current?.dateString as string; // Target date cell
  
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
            createdByUserId: currentUser?.id,
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
      case 'SUPABASE_LOGIN_FORM':
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
      case 'SUPABASE_LOGIN_FORM':
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
    getProviderById, getClinicTypeById, getMedicalAssistantById, getShiftById,
    isOnline: isFullyOnline
  };
  
  const settingsContextValue: SettingsContextType = {
    settings: userSettings,
    updateSettings,
  };

  // Handle Supabase logout
  const handleSupabaseLogout = async () => {
    if (supabase && supabase.auth) {
      await supabase.auth.signOut();
      addToast('Logged out successfully', 'success');
    }
  };

  // Show Supabase authentication modal when requested
  if (showSupabaseLogin) {
    return (
      <SupabaseAuth onSuccess={() => {
        console.log('Authentication successful');
        addToast('Successfully logged in with Supabase!', 'success');
        setShowSupabaseLogin(false);
      }} />
    );
  }

  // Show loading screen while checking connection
  if (isCheckingConnection) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Testing Supabase connection...</p>
          <p className="mt-2 text-sm text-gray-500">
            Checking database availability
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
          <AuthContext.Provider value={{ currentUser: supabaseUser || currentUser, isAuthenticated: isUserAuthenticated, login: authenticateAdmin, logout, setCurrentUserRole, isAdmin }}>
           <SettingsContext.Provider value={settingsContextValue}>
            <ModalContext.Provider value={{ modal: modalState, openModal, closeModal }}>
              <ToastContext.Provider value={{ addToast }}>
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
                      supabaseUser={supabaseUser}
                      onSupabaseLogout={handleSupabaseLogout}
                      onSupabaseLogin={() => setShowSupabaseLogin(true)}
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
                {modalState.type === 'SUPABASE_LOGIN_FORM' && <AdminPasswordForm {...modalState.props} />}
                {modalState.type === 'SUPABASE_TEST' && <AdminPasswordForm {...modalState.props} />}
                {modalState.type === 'adminPassword' && <AdminPasswordForm {...modalState.props} />}
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

// Main App component
const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <MainApplication />
    </ErrorBoundary>
  );
};

export default App;