
import { Provider, ClinicType, Shift, RecurringFrequency, UserRole, MedicalAssistant, UserSettings, CalendarViewMode } from './types';
import { getTodayInEasternTime, getISODateString } from './utils/dateUtils';

export const APP_NAME = "Clínica Médicos";

// Clínica Médicos Brand Colors - Based on Pantone Color Palette
export const CLINICA_BRAND_COLORS = {
  // Primary Brand Gradient (Pantone 200C to 114C)
  crimson: '#D91A55',      // Deep magenta-red (Pantone 200C)
  scarlet: '#E63946',      // Bright red (Pantone 179C) 
  vermillion: '#F77F00',   // Orange-red (Pantone 172C)
  orange: '#FCBF49',       // Bright orange (Pantone 1495C)
  amber: '#FFD60A',        // Golden orange (Pantone 1365C)
  gold: '#FFE066',         // Golden yellow (Pantone 136C)
  yellow: '#FFEE32',       // Bright yellow (Pantone 114C)
};

export const PREDEFINED_COLORS: string[] = [
  // Clínica Brand Colors (Primary Palette)
  '#D91A55', // Crimson
  '#E63946', // Scarlet  
  '#F77F00', // Vermillion
  '#FCBF49', // Orange
  '#FFD60A', // Amber
  '#FFE066', // Gold
  '#FFEE32', // Yellow
  
  // Extended Palette (Complementary Colors)
  '#2A9D8F', // Teal (complementary)
  '#264653', // Dark teal
  '#E76F51', // Coral
  '#F4A261', // Sandy orange
  '#E9C46A', // Warm yellow
  
  // Supporting Colors
  'bg-red-500', 'bg-red-600',
  'bg-orange-500', 'bg-orange-400', 
  'bg-amber-500', 'bg-amber-400',
  'bg-yellow-500', 'bg-yellow-400',
  'bg-pink-500', 'bg-pink-400',
  'bg-rose-500', 'bg-rose-400',
  
  // Neutrals
  'bg-slate-500', 'bg-gray-500',
];


export const VACATION_COLOR = '#D91A55'; // Using brand crimson for vacations
export const DEFAULT_EVENT_COLOR = '#264653'; // Using dark teal for default events 

export const INITIAL_PROVIDERS: Provider[] = [
  { id: 'prov1', name: 'Dr. Smith', color: PREDEFINED_COLORS[0], isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'prov2', name: 'Dr. Jones', color: PREDEFINED_COLORS[1], isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'prov3', name: 'Nurse K.', color: PREDEFINED_COLORS[2], isActive: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

export const INITIAL_CLINIC_TYPES: ClinicType[] = [
  { id: 'clinic1', name: 'Emergency', color: PREDEFINED_COLORS[3], isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'clinic2', name: 'Pediatrics', color: PREDEFINED_COLORS[4], isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'clinic3', name: 'Surgery', color: PREDEFINED_COLORS[5], isActive: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

export const INITIAL_MEDICAL_ASSISTANTS: MedicalAssistant[] = [
  { id: 'ma1', name: 'Alex Chen', color: PREDEFINED_COLORS[10], isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'ma2', name: 'Maria Garcia', color: PREDEFINED_COLORS[11], isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'ma3', name: 'Sam Lee', color: PREDEFINED_COLORS[12], isActive: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];


const today = getTodayInEasternTime();
const tomorrow = new Date(today);
tomorrow.setDate(today.getDate() + 1);
const dayAfterTomorrow = new Date(today);
dayAfterTomorrow.setDate(today.getDate() + 2);
const dayAfterTomorrowVacationEnd = new Date(dayAfterTomorrow);
dayAfterTomorrowVacationEnd.setDate(dayAfterTomorrow.getDate() + 2);


export const INITIAL_SHIFTS: Shift[] = [
  {
    id: 'shift1',
    providerId: 'prov1',
    clinicTypeId: 'clinic1',
    medicalAssistantIds: ['ma1'],
    startDate: getISODateString(today),
    endDate: getISODateString(today),
    startTime: '09:00',
    endTime: '17:00',
    isVacation: false,
    notes: 'Morning shift with Alex',
    color: PREDEFINED_COLORS[0], 
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdByUserId: 'admin1',
  },
  {
    id: 'shift2',
    providerId: 'prov2',
    clinicTypeId: 'clinic2',
    medicalAssistantIds: ['ma1', 'ma2'],
    startDate: getISODateString(tomorrow),
    endDate: getISODateString(tomorrow),
    startTime: '10:00',
    endTime: '18:00',
    isVacation: false,
    notes: 'Pediatrics coverage with Alex and Maria',
    color: PREDEFINED_COLORS[1], 
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdByUserId: 'admin1',
  },
  {
    id: 'shift3',
    providerId: 'prov1',
    startDate: getISODateString(dayAfterTomorrow),
    endDate: getISODateString(dayAfterTomorrowVacationEnd),
    isVacation: true,
    notes: 'Annual leave',
    color: VACATION_COLOR, 
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdByUserId: 'admin1',
  },
];

export const USER_ROLES_CONFIG = {
  [UserRole.ADMIN]: { name: 'Administrator', permissions: ['*'] },
  [UserRole.USER]: { name: 'User (Read-only)', permissions: ['read'] },
};

export const INITIAL_USER_SETTINGS: UserSettings = {
  defaultCalendarView: 'month',
  weekStartsOn: 0, // Sunday
};

export const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export const RECURRING_FREQUENCY_OPTIONS = [
    { value: RecurringFrequency.NONE, label: 'Does not repeat' },
    { value: RecurringFrequency.DAILY, label: 'Daily' },
    { value: RecurringFrequency.WEEKLY, label: 'Weekly' },
    { value: RecurringFrequency.BI_WEEKLY, label: 'Bi-Weekly' },
    { value: RecurringFrequency.MONTHLY, label: 'Monthly' },
];