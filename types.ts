
export interface UniqueItem {
  id: string;
  name: string;
  color: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Provider extends UniqueItem {}

export interface ClinicType extends UniqueItem {}

export interface MedicalAssistant extends UniqueItem {} // New MA interface

export enum RecurringFrequency {
  NONE = 'NONE',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  BI_WEEKLY = 'BI_WEEKLY',
  MONTHLY = 'MONTHLY',
}

export interface RecurringRule {
  frequency: RecurringFrequency;
  interval?: number; 
  daysOfWeek?: number[]; 
  dayOfMonth?: number; 
  endDate?: string; 
}

export interface Shift {
  id: string;
  providerId: string;
  clinicTypeId?: string; 
  medicalAssistantIds?: string[]; // Added MAs to shifts
  title?: string; 
  startDate: string; 
  endDate: string; 
  startTime?: string; 
  endTime?: string; 
  isVacation: boolean;
  notes?: string;
  color: string; 
  recurringRule?: RecurringRule;
  createdAt: string;
  updatedAt: string;
  createdByUserId?: string;

  // Fields for recurring series and exceptions
  seriesId?: string; 
  originalRecurringShiftId?: string; 
  isExceptionInstance?: boolean; 
  exceptionForDate?: string; 
}

export enum UserRole {
  ADMIN = 'admin',
  VIEW_ONLY = 'view_only',
  // Legacy support
  USER = 'view_only',
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Legacy field for backwards compatibility
  username?: string;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning'; 
  duration?: number;
}

export type CalendarViewMode = 'month' | 'week' | 'day';

export interface UserSettings {
  defaultCalendarView: CalendarViewMode;
  weekStartsOn: 0 | 1; // 0 for Sunday, 1 for Monday
  // Future settings can be added here
  // defaultShiftStartTime: string; // e.g., '09:00'
  // defaultShiftEndTime: string;   // e.g., '17:00'
}

// Context Types
export interface AppContextType {
  providers: Provider[];
  clinics: ClinicType[];
  medicalAssistants: MedicalAssistant[]; // Added MAs
  shifts: Shift[];
  addProvider: (provider: Omit<Provider, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProvider: (provider: Provider) => Promise<void>;
  deleteProvider: (providerId: string) => Promise<void>;
  addClinicType: (clinic: Omit<ClinicType, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateClinicType: (clinic: ClinicType) => Promise<void>;
  deleteClinicType: (clinicId: string) => Promise<void>;
  addMedicalAssistant: (ma: Omit<MedicalAssistant, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>; // MA CRUD
  updateMedicalAssistant: (ma: MedicalAssistant) => Promise<void>; // MA CRUD
  deleteMedicalAssistant: (maId: string) => Promise<void>; // MA CRUD
  addShift: (shiftData: Omit<Shift, 'id' | 'createdAt' | 'updatedAt' | 'color' | 'title' | 'seriesId'>, isCreatingException?: boolean) => Promise<Shift | null>;
  updateShift: (shift: Shift) => Promise<void>;
  deleteShift: (shiftId: string, seriesId?: string, deleteAllOccurrences?: boolean, deleteInstanceDate?: string) => Promise<void>;
  importData: (data: { providers?: Provider[], clinics?: ClinicType[], medicalAssistants?: MedicalAssistant[], shifts?: Shift[] }) => Promise<void>; // Added MAs to import
  getProviderById: (id: string) => Provider | undefined;
  getClinicTypeById: (id: string) => ClinicType | undefined;
  getMedicalAssistantById: (id: string) => MedicalAssistant | undefined; // MA getter
  getShiftById: (id: string) => Shift | undefined;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: () => boolean;
  isViewOnly: () => boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, firstName?: string, lastName?: string, role?: UserRole) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (updates: any) => Promise<{ success: boolean; error?: string }>;
  // Legacy support
  currentUser?: User | null;
  login?: (username: string, password: string) => boolean;
  logout?: () => void;
  setCurrentUserRole?: (role: UserRole) => void;
}

export type ModalType = 
  | 'PROVIDER_FORM' 
  | 'CLINIC_TYPE_FORM' 
  | 'MEDICAL_ASSISTANT_FORM' 
  | 'SHIFT_FORM' 
  | 'IMPORT_DATA_FORM' 
  | 'VIEW_SHIFT_DETAILS' 
  | 'EDIT_RECURRENCE_CHOICE' 
  | 'DELETE_RECURRENCE_CHOICE' 
  | 'CONFIRMATION_MODAL' 
  | 'SETTINGS_FORM'
  | 'EXPORT_OPTIONS_MODAL'
  | 'PDF_EXPORT_SETUP_MODAL'
  | 'LOGIN_FORM'
  | 'SIGNUP_FORM'
  | 'USER_PROFILE'
  | 'SUPABASE_TEST';

export interface ModalState {
  type: ModalType | null;
  props?: any;
}
export interface ModalContextType {
  modal: ModalState;
  openModal: (type: ModalType, props?: any) => void;
  closeModal: () => void;
}

export interface ToastContextType {
  addToast: (message: string, type: ToastMessage['type'], duration?: number) => void;
}

export interface SettingsContextType {
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
}

export interface FilterState {
  providerIds: string[];
  clinicTypeIds: string[];
  medicalAssistantIds: string[]; // Added MA filter
  showVacations: boolean;
}