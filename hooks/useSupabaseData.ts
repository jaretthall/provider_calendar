import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured, dbHelpers, TABLES, authHelpers } from '../utils/supabase';
import useLocalStorage from './useLocalStorage';
import { 
  Provider, 
  ClinicType, 
  MedicalAssistant, 
  Shift, 
  UserSettings 
} from '../types';

export interface UseSupabaseDataReturn<T> {
  data: T;
  setData: (newData: T | ((prev: T) => T)) => Promise<void>;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  isOnline: boolean;
}

// Custom hook for managing data with Supabase (with localStorage fallback)
export function useSupabaseData<T>(
  localStorageKey: string,
  defaultValue: T,
  supabaseTable?: string,
  transformToSupabase?: (data: T) => any[],
  transformFromSupabase?: (data: any[]) => T
): UseSupabaseDataReturn<T> {
  const [localData, setLocalData] = useLocalStorage<T>(localStorageKey, defaultValue);
  const [supabaseData, setSupabaseData] = useState<T>(defaultValue);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const isOnline = isSupabaseConfigured();

  // Get current user
  useEffect(() => {
    if (!isOnline) return;

    const getCurrentUser = async () => {
      try {
        const { data: { user } } = await authHelpers.getCurrentUser();
        setCurrentUser(user);
      } catch (err) {
        console.error('Error getting current user:', err);
      }
    };

    getCurrentUser();

    // Listen for auth changes
    const { data: { subscription } } = authHelpers.onAuthStateChange((event, session) => {
      setCurrentUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, [isOnline]);

  // Fetch data from Supabase
  const fetchFromSupabase = useCallback(async () => {
    if (!isOnline || !supabaseTable || !currentUser) return;

    try {
      setLoading(true);
      setError(null);

      const data = await dbHelpers.getAll(supabaseTable, 'created_at');
      const transformedData = transformFromSupabase ? transformFromSupabase(data) : data as T;
      setSupabaseData(transformedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      console.error('Error fetching from Supabase:', err);
    } finally {
      setLoading(false);
    }
  }, [isOnline, supabaseTable, currentUser, transformFromSupabase]);

  // Initial data fetch
  useEffect(() => {
    if (isOnline && currentUser) {
      fetchFromSupabase();
    }
  }, [fetchFromSupabase, isOnline, currentUser]);

  // Update data function
  const updateData = useCallback(async (newData: T | ((prev: T) => T)) => {
    const dataToSet = typeof newData === 'function' 
      ? (newData as (prev: T) => T)(isOnline ? supabaseData : localData)
      : newData;

    if (isOnline && supabaseTable && currentUser) {
      try {
        setLoading(true);
        setError(null);

        // Transform and sync to Supabase
        if (transformToSupabase) {
          const supabaseItems = transformToSupabase(dataToSet);
          
          // Clear existing user data and insert new data
          await supabase
            .from(supabaseTable)
            .delete()
            .eq('user_id', currentUser.id);

          if (supabaseItems.length > 0) {
            const itemsWithUserId = supabaseItems.map(item => ({
              ...item,
              user_id: currentUser.id
            }));

            await supabase
              .from(supabaseTable)
              .insert(itemsWithUserId);
          }
        }

        setSupabaseData(dataToSet);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update data');
        console.error('Error updating Supabase:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    } else {
      // Fallback to localStorage
      setLocalData(dataToSet);
    }
  }, [isOnline, supabaseTable, currentUser, supabaseData, localData, transformToSupabase, setLocalData]);

  return {
    data: isOnline ? supabaseData : localData,
    setData: updateData,
    loading,
    error,
    refetch: fetchFromSupabase,
    isOnline
  };
}

// Specialized hooks for each data type
export function useSupabaseProviders(defaultValue: Provider[] = []) {
  return useSupabaseData(
    'tempoProviders',
    defaultValue,
    TABLES.PROVIDERS,
    (providers: Provider[]) => providers.map(p => ({
      id: p.id,
      name: p.name,
      color: p.color,
      is_active: p.isActive,
      created_at: p.createdAt,
      updated_at: p.updatedAt
    })),
    (data: any[]) => data.map(p => ({
      id: p.id,
      name: p.name,
      color: p.color,
      isActive: p.is_active,
      createdAt: p.created_at,
      updatedAt: p.updated_at
    }))
  );
}

export function useSupabaseClinicTypes(defaultValue: ClinicType[] = []) {
  return useSupabaseData(
    'tempoClinics',
    defaultValue,
    TABLES.CLINIC_TYPES,
    (clinics: ClinicType[]) => clinics.map(c => ({
      id: c.id,
      name: c.name,
      color: c.color,
      is_active: c.isActive,
      created_at: c.createdAt,
      updated_at: c.updatedAt
    })),
    (data: any[]) => data.map(c => ({
      id: c.id,
      name: c.name,
      color: c.color,
      isActive: c.is_active,
      createdAt: c.created_at,
      updatedAt: c.updated_at
    }))
  );
}

export function useSupabaseMedicalAssistants(defaultValue: MedicalAssistant[] = []) {
  return useSupabaseData(
    'tempoMAs',
    defaultValue,
    TABLES.MEDICAL_ASSISTANTS,
    (mas: MedicalAssistant[]) => mas.map(ma => ({
      id: ma.id,
      name: ma.name,
      color: ma.color,
      is_active: ma.isActive,
      created_at: ma.createdAt,
      updated_at: ma.updatedAt
    })),
    (data: any[]) => data.map(ma => ({
      id: ma.id,
      name: ma.name,
      color: ma.color,
      isActive: ma.is_active,
      createdAt: ma.created_at,
      updatedAt: ma.updated_at
    }))
  );
}

export function useSupabaseShifts(defaultValue: Shift[] = []) {
  return useSupabaseData(
    'tempoShifts',
    defaultValue,
    TABLES.SHIFTS,
    (shifts: Shift[]) => shifts.map(s => ({
      id: s.id,
      provider_id: s.providerId,
      clinic_type_id: s.clinicTypeId,
      medical_assistant_ids: s.medicalAssistantIds,
      title: s.title,
      start_date: s.startDate,
      end_date: s.endDate,
      start_time: s.startTime,
      end_time: s.endTime,
      is_vacation: s.isVacation,
      notes: s.notes,
      color: s.color,
      recurring_rule: s.recurringRule,
      series_id: s.seriesId,
      original_recurring_shift_id: s.originalRecurringShiftId,
      is_exception_instance: s.isExceptionInstance,
      exception_for_date: s.exceptionForDate,
      created_at: s.createdAt,
      updated_at: s.updatedAt,
      created_by_user_id: s.createdByUserId
    })),
    (data: any[]) => data.map(s => ({
      id: s.id,
      providerId: s.provider_id,
      clinicTypeId: s.clinic_type_id,
      medicalAssistantIds: s.medical_assistant_ids,
      title: s.title,
      startDate: s.start_date,
      endDate: s.end_date,
      startTime: s.start_time,
      endTime: s.end_time,
      isVacation: s.is_vacation,
      notes: s.notes,
      color: s.color,
      recurringRule: s.recurring_rule,
      seriesId: s.series_id,
      originalRecurringShiftId: s.original_recurring_shift_id,
      isExceptionInstance: s.is_exception_instance,
      exceptionForDate: s.exception_for_date,
      createdAt: s.created_at,
      updatedAt: s.updated_at,
      createdByUserId: s.created_by_user_id
    }))
  );
}

export function useSupabaseUserSettings(defaultValue: UserSettings, userId?: string) {
  const [settings, setSettings] = useState<UserSettings>(defaultValue);
  const [localSettings, setLocalSettings] = useLocalStorage<UserSettings>('tempoUserSettings', defaultValue);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isOnline = isSupabaseConfigured();

  // Fetch settings from Supabase
  const fetchSettings = useCallback(async () => {
    if (!isOnline || !userId) return;

    try {
      setLoading(true);
      const userSettings = await dbHelpers.getUserSettings(userId);
      if (userSettings) {
        setSettings(userSettings);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  }, [isOnline, userId]);

  // Update settings
  const updateSettings = useCallback(async (newSettings: Partial<UserSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };

    if (isOnline && userId) {
      try {
        setLoading(true);
        await dbHelpers.saveUserSettings(userId, updatedSettings);
        setSettings(updatedSettings);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save settings');
        throw err;
      } finally {
        setLoading(false);
      }
    } else {
      setLocalSettings(updatedSettings);
      setSettings(updatedSettings);
    }
  }, [isOnline, userId, settings, setLocalSettings]);

  useEffect(() => {
    if (isOnline && userId) {
      fetchSettings();
    } else {
      setSettings(localSettings);
    }
  }, [fetchSettings, isOnline, userId, localSettings]);

  return {
    settings: isOnline ? settings : localSettings,
    updateSettings,
    loading,
    error,
    isOnline
  };
} 