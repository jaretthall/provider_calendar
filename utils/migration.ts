import { Provider, ClinicType, MedicalAssistant, Shift, UserSettings } from '../types';
import { supabase } from './supabase';

/**
 * Interface for localStorage backup data
 */
export interface LocalStorageBackup {
  providers: Provider[];
  clinics: ClinicType[];
  medicalAssistants: MedicalAssistant[];
  shifts: Shift[];
  userSettings: UserSettings;
  filters: any;
  timestamp: string;
  version: string;
}

/**
 * Create a backup of all localStorage data
 */
export const createLocalStorageBackup = (): LocalStorageBackup => {
  const providers = JSON.parse(localStorage.getItem('tempoProviders') || '[]');
  const clinics = JSON.parse(localStorage.getItem('tempoClinics') || '[]');
  const medicalAssistants = JSON.parse(localStorage.getItem('tempoMAs') || '[]');
  const shifts = JSON.parse(localStorage.getItem('tempoShifts') || '[]');
  const userSettings = JSON.parse(localStorage.getItem('tempoUserSettings') || '{}');
  const filters = JSON.parse(localStorage.getItem('tempoFilters') || '{}');

  return {
    providers,
    clinics,
    medicalAssistants,
    shifts,
    userSettings,
    filters,
    timestamp: new Date().toISOString(),
    version: '0.3.0'
  };
};

/**
 * Download localStorage backup as JSON file
 */
export const downloadBackup = (backup: LocalStorageBackup): void => {
  const dataStr = JSON.stringify(backup, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `clinica-schedule-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

/**
 * Validate backup data structure
 */
export const validateBackupData = (data: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    errors.push('Invalid backup file format');
    return { isValid: false, errors };
  }

  // Check required fields
  const requiredFields = ['providers', 'clinics', 'medicalAssistants', 'shifts'];
  for (const field of requiredFields) {
    if (!Array.isArray(data[field])) {
      errors.push(`Missing or invalid ${field} data`);
    }
  }

  // Validate data types
  if (data.providers) {
    data.providers.forEach((provider: any, index: number) => {
      if (!provider.id || !provider.name) {
        errors.push(`Invalid provider data at index ${index}`);
      }
    });
  }

  if (data.shifts) {
    data.shifts.forEach((shift: any, index: number) => {
      if (!shift.id || !shift.providerId || !shift.startDate) {
        errors.push(`Invalid shift data at index ${index}`);
      }
    });
  }

  return { isValid: errors.length === 0, errors };
};

/**
 * Sync localStorage data to Supabase (Future implementation)
 * This function will be implemented when we add Supabase data hooks
 */
export const syncToSupabase = async (backup: LocalStorageBackup): Promise<{ success: boolean; message: string }> => {
  if (!supabase) {
    return { success: false, message: 'Supabase is not configured' };
  }

  try {
    // TODO: Implement actual Supabase sync when data hooks are available
    // For now, just validate the connection
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      return { success: false, message: `Authentication error: ${error.message}` };
    }

    if (!data.user) {
      return { success: false, message: 'No authenticated user found' };
    }

    // Placeholder for future implementation
    console.log('Sync to Supabase would happen here with data:', backup);
    
    return { 
      success: true, 
      message: 'Data sync ready - this feature will be implemented in Phase 2' 
    };
  } catch (error) {
    return { 
      success: false, 
      message: `Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
};

/**
 * Clear localStorage data (use with caution!)
 */
export const clearLocalStorageData = (): void => {
  const keys = [
    'tempoProviders',
    'tempoClinics', 
    'tempoMAs',
    'tempoShifts',
    'tempoUserSettings',
    'tempoFilters',
    'tempoCurrentUser',
    'tempoIsAuthenticated'
  ];

  keys.forEach(key => localStorage.removeItem(key));
};

/**
 * Restore localStorage data from backup
 */
export const restoreFromBackup = (backup: LocalStorageBackup): { success: boolean; message: string } => {
  try {
    const validation = validateBackupData(backup);
    if (!validation.isValid) {
      return { success: false, message: `Invalid backup data: ${validation.errors.join(', ')}` };
    }

    localStorage.setItem('tempoProviders', JSON.stringify(backup.providers));
    localStorage.setItem('tempoClinics', JSON.stringify(backup.clinics));
    localStorage.setItem('tempoMAs', JSON.stringify(backup.medicalAssistants));
    localStorage.setItem('tempoShifts', JSON.stringify(backup.shifts));
    localStorage.setItem('tempoUserSettings', JSON.stringify(backup.userSettings));
    localStorage.setItem('tempoFilters', JSON.stringify(backup.filters));

    return { success: true, message: 'Data restored successfully from backup' };
  } catch (error) {
    return { 
      success: false, 
      message: `Restore failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}; 