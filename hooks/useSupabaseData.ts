import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured, dbHelpers, TABLES, authHelpers } from '../utils/supabase';
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

// Simplified Supabase-only hook (no localStorage fallback)
export function useSupabaseData<T>(
  defaultValue: T,
  supabaseTable?: string,
  transformToSupabase?: (data: T) => any[],
  transformFromSupabase?: (data: any[]) => T
): UseSupabaseDataReturn<T> {
  const [data, setData] = useState<T>(defaultValue);
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
    const { data: { subscription } } = authHelpers.onAuthStateChange((_event: any, session: any) => {
      setCurrentUser(session?.user || null);
    });

    return () => subscription?.unsubscribe();
  }, [isOnline]);

  // Fetch data from Supabase
  const fetchFromSupabase = useCallback(async () => {
    if (!isOnline || !supabaseTable) return;

    try {
      setLoading(true);
      setError(null);

      console.log(`🔄 Fetching ${supabaseTable}`);
      const result = await dbHelpers.getAll(supabaseTable, 'created_at');
      const transformedData = transformFromSupabase ? transformFromSupabase(result) : result as T;
      setData(transformedData);
      console.log(`✅ Successfully fetched ${supabaseTable}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
      setError(errorMessage);
      console.error(`❌ Error fetching ${supabaseTable}:`, errorMessage);
    } finally {
      setLoading(false);
    }
  }, [isOnline, supabaseTable, transformFromSupabase]);

  // Initial data fetch
  useEffect(() => {
    if (isOnline && supabaseTable) {
      fetchFromSupabase();
    }
  }, [isOnline, supabaseTable]); // Remove fetchFromSupabase from dependencies to prevent infinite loop

  // Update data function - works with both authenticated and anonymous users
  const updateData = useCallback(async (newData: T | ((prev: T) => T)) => {
    const dataToSet = typeof newData === 'function' 
      ? (newData as (prev: T) => T)(data)
      : newData;

    // Allow anonymous access since we've configured the database policies for it
    // In production, you would check for proper authentication here

    if (!isOnline || !supabaseTable) {
      throw new Error('Supabase not available');
    }

    try {
      setLoading(true);
      setError(null);
      console.log(`💾 Writing to Supabase table: ${supabaseTable}`);

      if (transformToSupabase) {
        const supabaseItems = transformToSupabase(dataToSet);
        console.log(`📝 Writing ${supabaseItems.length} items to ${supabaseTable}`);
        
        // Clear all existing data and insert new data (single user owns all data)
        await supabase!
          .from(supabaseTable)
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records

        if (supabaseItems.length > 0) {
          const { error: insertError } = await supabase!
            .from(supabaseTable)
            .insert(supabaseItems);
          
          if (insertError) {
            console.error('❌ Supabase insert error:', insertError);
            throw insertError;
          }
        }
      }

      setData(dataToSet);
      console.log(`✅ Successfully wrote to ${supabaseTable}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update data';
      setError(errorMessage);
      console.error('❌ Error updating Supabase:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isOnline, supabaseTable, currentUser, data, transformToSupabase]);

  return {
    data,
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
    defaultValue,
    TABLES.PROVIDERS,
    (providers: Provider[]) => providers.map(p => ({
      id: p.id,
      name: p.name,
      color: p.color,
      is_active: p.isActive,
      created_at: p.createdAt,
      updated_at: p.updatedAt
      // Removed user_id field - doesn't exist in actual database schema
    })),
    (data: any[]) => data.map(item => ({
      id: item.id,
      name: item.name,
      color: item.color,
      isActive: item.is_active,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }))
  );
}

export function useSupabaseClinicTypes(defaultValue: ClinicType[] = []) {
  return useSupabaseData(
    defaultValue,
    TABLES.CLINIC_TYPES,
    (clinics: ClinicType[]) => clinics.map(c => ({
      id: c.id,
      name: c.name,
      color: c.color,
      is_active: c.isActive,
      created_at: c.createdAt,
      updated_at: c.updatedAt
      // Removed user_id field - doesn't exist in actual database schema
    })),
    (data: any[]) => data.map(item => ({
      id: item.id,
      name: item.name,
      color: item.color,
      isActive: item.is_active,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }))
  );
}

export function useSupabaseMedicalAssistants(defaultValue: MedicalAssistant[] = []) {
  return useSupabaseData(
    defaultValue,
    TABLES.MEDICAL_ASSISTANTS,
    (medicalAssistants: MedicalAssistant[]) => medicalAssistants.map(ma => ({
      id: ma.id,
      name: ma.name,
      color: ma.color,
      is_active: ma.isActive,
      created_at: ma.createdAt,
      updated_at: ma.updatedAt
      // Removed user_id field - doesn't exist in actual database schema
    })),
    (data: any[]) => data.map(item => ({
      id: item.id,
      name: item.name,
      color: item.color,
      isActive: item.is_active,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }))
  );
}

export function useSupabaseShifts(defaultValue: Shift[] = []) {
  return useSupabaseData(
    defaultValue,
    TABLES.SHIFTS,
    (shifts: Shift[]) => shifts.map(s => ({
      id: s.id,
      provider_id: s.providerId,
      clinic_type_id: s.clinicTypeId || null,
      medical_assistant_ids: s.medicalAssistantIds || [],
      title: s.title || null,
      start_date: s.startDate,
      end_date: s.endDate,
      start_time: s.startTime || null,
      end_time: s.endTime || null,
      is_vacation: s.isVacation,
      notes: s.notes || null,
      color: s.color,
      recurring_rule: s.recurringRule || null,
      series_id: s.seriesId || null,
      original_recurring_shift_id: s.originalRecurringShiftId || null,
      is_exception_instance: s.isExceptionInstance || false,
      exception_for_date: s.exceptionForDate || null,
      created_at: s.createdAt,
      updated_at: s.updatedAt
      // Removed user_id fields - they don't exist in the actual database schema
    })),
    (data: any[]) => data.map(item => ({
      id: item.id,
      providerId: item.provider_id,
      clinicTypeId: item.clinic_type_id,
      medicalAssistantIds: item.medical_assistant_ids,
      title: item.title,
      startDate: item.start_date,
      endDate: item.end_date,
      startTime: item.start_time,
      endTime: item.end_time,
      isVacation: item.is_vacation,
      notes: item.notes,
      color: item.color,
      recurringRule: item.recurring_rule,
      seriesId: item.series_id,
      originalRecurringShiftId: item.original_recurring_shift_id,
      isExceptionInstance: item.is_exception_instance,
      exceptionForDate: item.exception_for_date,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }))
  );
}

// User settings can still use localStorage since they're user-specific preferences
export function useSupabaseUserSettings(defaultValue: UserSettings, userId?: string) {
  // For now, we'll keep this simple and use localStorage
  // In a full multi-user system, this would sync to Supabase
  const [settings, setSettings] = useState<UserSettings>(defaultValue);
  
  useEffect(() => {
    const stored = localStorage.getItem('tempoUserSettings');
    if (stored) {
      try {
        setSettings(JSON.parse(stored));
      } catch (e) {
        console.error('Error parsing user settings:', e);
      }
    }
  }, []);

  const updateSettings = useCallback(async (newSettings: UserSettings) => {
    setSettings(newSettings);
    localStorage.setItem('tempoUserSettings', JSON.stringify(newSettings));
  }, []);

  return {
    data: settings,
    setData: updateSettings,
    loading: false,
    error: null,
    refetch: async () => {},
    isOnline: true
  };
} 