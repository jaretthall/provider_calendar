
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

export interface FrontStaff extends UniqueItem {}

export interface Billing extends UniqueItem {}

export interface BehavioralHealth extends UniqueItem {}

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
  providerId?: string;
  clinicTypeId?: string; 
  medicalAssistantIds?: string[]; // Added MAs to shifts - kept for backward compatibility
  frontStaffIds?: string[]; // Added Front Staff to shifts
  billingIds?: string[]; // Added Billing to shifts
  behavioralHealthIds?: string[]; // Added Behavioral Health to shifts
  assignedToProviderId?: string; // For MA shifts assigned to work with a specific provider
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

export interface DepartmentDefaultTimes {
  startTime: string; // e.g., '07:30'
  endTime: string;   // e.g., '17:00'
}

export interface UserSettings {
  defaultCalendarView: CalendarViewMode;
  weekStartsOn: 0 | 1; // 0 for Sunday, 1 for Monday
  // Department-specific default shift times
  departmentDefaults: {
    providers: DepartmentDefaultTimes;
    medicalAssistants: DepartmentDefaultTimes;
    frontStaff: DepartmentDefaultTimes;
    billing: DepartmentDefaultTimes;
    behavioralHealth: DepartmentDefaultTimes;
  };
}

// Context Types
export interface AppContextType {
  providers: Provider[];
  clinics: ClinicType[];
  medicalAssistants: MedicalAssistant[]; // Added MAs
  frontStaff: FrontStaff[];
  billing: Billing[];
  behavioralHealth: BehavioralHealth[];
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
  addFrontStaff: (fs: Omit<FrontStaff, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateFrontStaff: (fs: FrontStaff) => Promise<void>;
  deleteFrontStaff: (fsId: string) => Promise<void>;
  addBilling: (billing: Omit<Billing, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateBilling: (billing: Billing) => Promise<void>;
  deleteBilling: (billingId: string) => Promise<void>;
  addBehavioralHealth: (bh: Omit<BehavioralHealth, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateBehavioralHealth: (bh: BehavioralHealth) => Promise<void>;
  deleteBehavioralHealth: (bhId: string) => Promise<void>;
  addShift: (shiftData: Omit<Shift, 'id' | 'createdAt' | 'updatedAt' | 'color' | 'title' | 'seriesId'>, isCreatingException?: boolean) => Promise<Shift | null>;
  updateShift: (shift: Shift) => Promise<void>;
  deleteShift: (shiftId: string, seriesId?: string, deleteAllOccurrences?: boolean, deleteInstanceDate?: string) => Promise<void>;
  importData: (data: { providers?: Provider[], clinics?: ClinicType[], medicalAssistants?: MedicalAssistant[], frontStaff?: FrontStaff[], billing?: Billing[], behavioralHealth?: BehavioralHealth[], shifts?: Shift[] }) => Promise<void>;
  getProviderById: (id: string) => Provider | undefined;
  getClinicTypeById: (id: string) => ClinicType | undefined;
  getMedicalAssistantById: (id: string) => MedicalAssistant | undefined; // MA getter
  getFrontStaffById: (id: string) => FrontStaff | undefined;
  getBillingById: (id: string) => Billing | undefined;
  getBehavioralHealthById: (id: string) => BehavioralHealth | undefined;
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
  | 'FRONT_STAFF_FORM'
  | 'BILLING_FORM'
  | 'BEHAVIORAL_HEALTH_FORM'
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
  | 'SUPABASE_TEST'
  | 'USER_MANAGEMENT';

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
  frontStaffIds: string[];
  billingIds: string[];
  behavioralHealthIds: string[];
  showVacations: boolean;
}