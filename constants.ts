
import { Provider, ClinicType, Shift, RecurringFrequency, UserRole, MedicalAssistant, UserSettings, CalendarViewMode } from './types';

export const APP_NAME = "Clinica Provider Schedule";

export const PREDEFINED_COLORS: string[] = [
  // Reds
  'bg-red-500', 'bg-red-600',
  // Oranges
  'bg-orange-500', 'bg-orange-400',
  // Ambers
  'bg-amber-500', 'bg-amber-400',
  // Yellows
  'bg-yellow-500', 'bg-yellow-400',
  // Limes
  'bg-lime-500', 'bg-lime-600',
  // Greens
  'bg-green-500', 'bg-green-600',
  // Emeralds
  'bg-emerald-500', 'bg-emerald-400',
  // Teals
  'bg-teal-500', 'bg-teal-600',
  // Cyans
  'bg-cyan-500', 'bg-cyan-400',
  // Skies
  'bg-sky-500', 'bg-sky-600',
  // Blues
  'bg-blue-500', 'bg-blue-600',
  // Indigos
  'bg-indigo-500', 'bg-indigo-400',
  // Violets
  'bg-violet-500', 'bg-violet-600',
  // Purples
  'bg-purple-500', 'bg-purple-600',
  // Fuchsias
  'bg-fuchsia-500', 'bg-fuchsia-400',
  // Pinks
  'bg-pink-500', 'bg-pink-400',
  // Roses
  'bg-rose-500', 'bg-rose-400',
  // Grays/Neutrals
  'bg-slate-500', 'bg-gray-500',
];


export const VACATION_COLOR = 'bg-red-600'; 
export const DEFAULT_EVENT_COLOR = 'bg-gray-600'; 

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


const today = new Date();
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
    startDate: today.toISOString().split('T')[0],
    endDate: today.toISOString().split('T')[0],
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
    startDate: tomorrow.toISOString().split('T')[0],
    endDate: tomorrow.toISOString().split('T')[0],
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
    startDate: dayAfterTomorrow.toISOString().split('T')[0],
    endDate: dayAfterTomorrowVacationEnd.toISOString().split('T')[0],
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