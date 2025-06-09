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
  const [retryCount, setRetryCount] = useState(0);
  const [lastFetchTime, setLastFetchTime] = useState(0);

  // Check if Supabase is temporarily disabled (emergency fix)
  const isSupabaseDisabled = localStorage.getItem('tempoSupabaseDisabled') === 'true';
  const isOnline = !isSupabaseDisabled && isSupabaseConfigured();
  const MAX_RETRIES = 3;
  const MIN_RETRY_DELAY = 2000; // 2 seconds minimum between retries

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
    const { data: { subscription } } = authHelpers.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user || null);
    });

    return () => subscription?.unsubscribe();
  }, [isOnline]);

  // Fetch data from Supabase (no authentication required for reads)
  const fetchFromSupabase = useCallback(async () => {
    if (!isOnline || !supabaseTable) return;

    // Prevent too frequent retries
    const now = Date.now();
    if (now - lastFetchTime < MIN_RETRY_DELAY && retryCount > 0) {
      console.log('⏳ Skipping fetch - too soon after last attempt');
      return;
    }

    // Stop retrying after max attempts
    if (retryCount >= MAX_RETRIES) {
      console.error('🚫 Max retries reached, switching to localStorage');
      setError('Connection failed - using offline mode');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setLastFetchTime(now);

      console.log(`🔄 Fetching ${supabaseTable} (attempt ${retryCount + 1}/${MAX_RETRIES})`);
      const data = await dbHelpers.getAll(supabaseTable, 'created_at');
      const transformedData = transformFromSupabase ? transformFromSupabase(data) : data as T;
      setSupabaseData(transformedData);
      setRetryCount(0); // Reset retry count on success
      console.log(`✅ Successfully fetched ${supabaseTable}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
      setError(errorMessage);
      setRetryCount(prev => prev + 1);
      console.error(`❌ Error fetching ${supabaseTable}:`, errorMessage, `(attempt ${retryCount + 1})`);
    } finally {
      setLoading(false);
    }
  }, [isOnline, supabaseTable, transformFromSupabase, retryCount, lastFetchTime, MAX_RETRIES, MIN_RETRY_DELAY]);

  // Initial data fetch (no authentication required)
  useEffect(() => {
    if (isOnline && retryCount < MAX_RETRIES) {
      fetchFromSupabase();
    }
  }, [isOnline, retryCount, MAX_RETRIES]); // Removed fetchFromSupabase to prevent infinite loops

  // Update data function
  const updateData = useCallback(async (newData: T | ((prev: T) => T)) => {
    const dataToSet = typeof newData === 'function' 
      ? (newData as (prev: T) => T)(isOnline ? supabaseData : localData)
      : newData;

    console.log('🔄 updateData called:', {
      isOnline,
      supabaseTable,
      currentUser: !!currentUser,
      currentUserEmail: currentUser?.email
    });

    if (isOnline && supabaseTable && currentUser) {
      try {
        setLoading(true);
        setError(null);
        console.log(`💾 Writing to Supabase table: ${supabaseTable}`);

        // Transform and sync to Supabase (authenticated writes only)
        if (transformToSupabase) {
          const supabaseItems = transformToSupabase(dataToSet);
          console.log(`📝 Writing ${supabaseItems.length} items to ${supabaseTable}`);
          
          // For anonymous reads/authenticated writes, we don't need user-specific data
          // Clear existing data and insert new data
          await supabase
            .from(supabaseTable)
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all existing records

          if (supabaseItems.length > 0) {
            const { error: insertError } = await supabase
              .from(supabaseTable)
              .insert(supabaseItems);
            
            if (insertError) {
              console.error('❌ Supabase insert error:', insertError);
              throw insertError;
            }
          }
        }

        setSupabaseData(dataToSet);
        console.log(`✅ Successfully wrote to ${supabaseTable}`);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update data';
        setError(errorMessage);
        console.error('❌ Error updating Supabase:', err);
        console.log('⚠️ Falling back to localStorage due to error');
        setLocalData(dataToSet); // Fallback to localStorage on error
        throw err;
      } finally {
        setLoading(false);
      }
    } else if (!currentUser && isOnline) {
      console.log('⚠️ Not authenticated but online - attempting Supabase write anyway');
      // Not authenticated but Supabase is online - let RLS handle it
      try {
        setLoading(true);
        setError(null);

        if (transformToSupabase) {
          const supabaseItems = transformToSupabase(dataToSet);
          
          // Clear existing data and insert new data
          await supabase
            .from(supabaseTable!)
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000');

          if (supabaseItems.length > 0) {
            const { error: insertError } = await supabase
              .from(supabaseTable!)
              .insert(supabaseItems);
            
            if (insertError) {
              console.error('❌ Supabase insert error (unauthenticated):', insertError);
              throw insertError;
            }
          }
        }

        setSupabaseData(dataToSet);
        console.log(`✅ Successfully wrote to ${supabaseTable} (unauthenticated)`);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Authentication required to make changes');
        console.error('❌ Authentication required for edit operation:', err);
        console.log('⚠️ Falling back to localStorage due to auth error');
        setLocalData(dataToSet); // Fallback to localStorage on auth error
        throw new Error('Please sign in to make changes');
      } finally {
        setLoading(false);
      }
    } else {
      // Fallback to localStorage when offline or other conditions not met
      console.log('💾 Writing to localStorage (offline mode)');
      setLocalData(dataToSet);
    }
  }, [isOnline, supabaseTable, currentUser, supabaseData, localData, transformToSupabase, setLocalData]);

  // Reset retry count after some time
  useEffect(() => {
    if (retryCount >= MAX_RETRIES) {
      const resetTimeout = setTimeout(() => {
        console.log('🔄 Resetting retry count for', supabaseTable);
        setRetryCount(0);
        setError(null);
      }, 30000); // Reset after 30 seconds

      return () => clearTimeout(resetTimeout);
    }
  }, [retryCount, MAX_RETRIES, supabaseTable]);

  // Determine if we should use Supabase data or localStorage
  const shouldUseSupabase = isOnline && retryCount < MAX_RETRIES && !error;
  const effectiveData = shouldUseSupabase ? supabaseData : localData;
  const effectiveIsOnline = shouldUseSupabase;

  return {
    data: effectiveData,
    setData: updateData,
    loading,
    error,
         refetch: async () => {
       setRetryCount(0);
       setError(null);
       await fetchFromSupabase();
     },
    isOnline: effectiveIsOnline
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