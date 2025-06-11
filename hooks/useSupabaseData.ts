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

// Updated providers hook with proper upsert logic
export function useSupabaseProviders(defaultValue: Provider[] = []) {
  const [data, setData] = useState<Provider[]>(defaultValue);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isOnline = isSupabaseConfigured();

  // Fetch providers from Supabase
  const fetchProviders = useCallback(async () => {
    if (!isOnline) return;

    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Fetching providers');
      
      const { data: providers, error: fetchError } = await supabase!
        .from(TABLES.PROVIDERS)
        .select('*')
        .order('created_at');

      if (fetchError) throw fetchError;

      const transformedProviders = (providers || []).map(item => ({
        id: item.id,
        name: item.name,
        color: item.color,
        isActive: item.is_active,
        createdAt: item.created_at,
        updatedAt: item.updated_at
      }));

      setData(transformedProviders);
      console.log('✅ Successfully fetched providers:', transformedProviders.length);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch providers';
      setError(errorMessage);
      console.error('❌ Error fetching providers:', err);
    } finally {
      setLoading(false);
    }
  }, [isOnline]);

  // Update providers with proper upsert logic
  const updateProviders = useCallback(async (newProviders: Provider[] | ((prev: Provider[]) => Provider[])) => {
    const providersToSet = typeof newProviders === 'function' 
      ? newProviders(data)
      : newProviders;

    if (!isOnline) {
      throw new Error('Supabase not available');
    }

    try {
      setLoading(true);
      setError(null);
      console.log('💾 Updating providers in Supabase');

      // Transform to Supabase format
      const supabaseProviders = providersToSet.map(p => ({
        id: p.id,
        name: p.name,
        color: p.color,
        is_active: p.isActive,
        created_at: p.createdAt,
        updated_at: p.updatedAt
      }));

      // Use upsert instead of delete-all-insert
      const { error: upsertError } = await supabase!
        .from(TABLES.PROVIDERS)
        .upsert(supabaseProviders, { onConflict: 'id' });

      if (upsertError) throw upsertError;

      setData(providersToSet);
      console.log('✅ Successfully updated providers');
      
      // Refetch to ensure consistency
      await fetchProviders();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update providers';
      setError(errorMessage);
      console.error('❌ Error updating providers:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isOnline, data, fetchProviders]);

  // Initial fetch
  useEffect(() => {
    if (isOnline) {
      fetchProviders();
    }
  }, [isOnline, fetchProviders]);

  return {
    data,
    setData: updateProviders,
    loading,
    error,
    refetch: fetchProviders,
    isOnline
  };
}

// Updated clinic types hook with proper upsert logic
export function useSupabaseClinicTypes(defaultValue: ClinicType[] = []) {
  const [data, setData] = useState<ClinicType[]>(defaultValue);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isOnline = isSupabaseConfigured();

  // Fetch clinic types from Supabase
  const fetchClinicTypes = useCallback(async () => {
    if (!isOnline) return;

    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Fetching clinic types');
      
      const { data: clinicTypes, error: fetchError } = await supabase!
        .from(TABLES.CLINIC_TYPES)
        .select('*')
        .order('created_at');

      if (fetchError) throw fetchError;

      const transformedClinicTypes = (clinicTypes || []).map(item => ({
        id: item.id,
        name: item.name,
        color: item.color,
        isActive: item.is_active,
        createdAt: item.created_at,
        updatedAt: item.updated_at
      }));

      setData(transformedClinicTypes);
      console.log('✅ Successfully fetched clinic types:', transformedClinicTypes.length);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch clinic types';
      setError(errorMessage);
      console.error('❌ Error fetching clinic types:', err);
    } finally {
      setLoading(false);
    }
  }, [isOnline]);

  // Update clinic types with proper upsert logic
  const updateClinicTypes = useCallback(async (newClinicTypes: ClinicType[] | ((prev: ClinicType[]) => ClinicType[])) => {
    const clinicTypesToSet = typeof newClinicTypes === 'function' 
      ? newClinicTypes(data)
      : newClinicTypes;

    if (!isOnline) {
      throw new Error('Supabase not available');
    }

    try {
      setLoading(true);
      setError(null);
      console.log('💾 Updating clinic types in Supabase');

      // Transform to Supabase format
      const supabaseClinicTypes = clinicTypesToSet.map(c => ({
        id: c.id,
        name: c.name,
        color: c.color,
        is_active: c.isActive,
        created_at: c.createdAt,
        updated_at: c.updatedAt
      }));

      // Use upsert instead of delete-all-insert
      const { error: upsertError } = await supabase!
        .from(TABLES.CLINIC_TYPES)
        .upsert(supabaseClinicTypes, { onConflict: 'id' });

      if (upsertError) throw upsertError;

      setData(clinicTypesToSet);
      console.log('✅ Successfully updated clinic types');
      
      // Refetch to ensure consistency
      await fetchClinicTypes();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update clinic types';
      setError(errorMessage);
      console.error('❌ Error updating clinic types:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isOnline, data, fetchClinicTypes]);

  // Initial fetch
  useEffect(() => {
    if (isOnline) {
      fetchClinicTypes();
    }
  }, [isOnline, fetchClinicTypes]);

  return {
    data,
    setData: updateClinicTypes,
    loading,
    error,
    refetch: fetchClinicTypes,
    isOnline
  };
}

// Updated medical assistants hook with proper upsert logic
export function useSupabaseMedicalAssistants(defaultValue: MedicalAssistant[] = []) {
  const [data, setData] = useState<MedicalAssistant[]>(defaultValue);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isOnline = isSupabaseConfigured();

  // Fetch medical assistants from Supabase
  const fetchMedicalAssistants = useCallback(async () => {
    if (!isOnline) return;

    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Fetching medical assistants');
      
      const { data: medicalAssistants, error: fetchError } = await supabase!
        .from(TABLES.MEDICAL_ASSISTANTS)
        .select('*')
        .order('created_at');

      if (fetchError) throw fetchError;

      const transformedMedicalAssistants = (medicalAssistants || []).map(item => ({
        id: item.id,
        name: item.name,
        color: item.color,
        isActive: item.is_active,
        createdAt: item.created_at,
        updatedAt: item.updated_at
      }));

      setData(transformedMedicalAssistants);
      console.log('✅ Successfully fetched medical assistants:', transformedMedicalAssistants.length);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch medical assistants';
      setError(errorMessage);
      console.error('❌ Error fetching medical assistants:', err);
    } finally {
      setLoading(false);
    }
  }, [isOnline]);

  // Update medical assistants with proper upsert logic
  const updateMedicalAssistants = useCallback(async (newMedicalAssistants: MedicalAssistant[] | ((prev: MedicalAssistant[]) => MedicalAssistant[])) => {
    const medicalAssistantsToSet = typeof newMedicalAssistants === 'function' 
      ? newMedicalAssistants(data)
      : newMedicalAssistants;

    if (!isOnline) {
      throw new Error('Supabase not available');
    }

    try {
      setLoading(true);
      setError(null);
      console.log('💾 Updating medical assistants in Supabase');

      // Transform to Supabase format
      const supabaseMedicalAssistants = medicalAssistantsToSet.map(ma => ({
        id: ma.id,
        name: ma.name,
        color: ma.color,
        is_active: ma.isActive,
        created_at: ma.createdAt,
        updated_at: ma.updatedAt
      }));

      // Use upsert instead of delete-all-insert
      const { error: upsertError } = await supabase!
        .from(TABLES.MEDICAL_ASSISTANTS)
        .upsert(supabaseMedicalAssistants, { onConflict: 'id' });

      if (upsertError) throw upsertError;

      setData(medicalAssistantsToSet);
      console.log('✅ Successfully updated medical assistants');
      
      // Refetch to ensure consistency
      await fetchMedicalAssistants();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update medical assistants';
      setError(errorMessage);
      console.error('❌ Error updating medical assistants:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isOnline, data, fetchMedicalAssistants]);

  // Initial fetch
  useEffect(() => {
    if (isOnline) {
      fetchMedicalAssistants();
    }
  }, [isOnline, fetchMedicalAssistants]);

  return {
    data,
    setData: updateMedicalAssistants,
    loading,
    error,
    refetch: fetchMedicalAssistants,
    isOnline
  };
}

// Special implementation for shifts that uses proper upsert instead of delete-all-insert
export function useSupabaseShifts(defaultValue: Shift[] = []) {
  const [data, setData] = useState<Shift[]>(defaultValue);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isOnline = isSupabaseConfigured();

  // Fetch shifts from Supabase
  const fetchShifts = useCallback(async () => {
    if (!isOnline) return;

    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Fetching shifts');
      
      const { data: shifts, error: fetchError } = await supabase!
        .from(TABLES.SHIFTS)
        .select('*')
        .order('created_at');

      if (fetchError) throw fetchError;

      const transformedShifts = (shifts || []).map(item => ({
        id: item.id,
        providerId: item.provider_id,
        clinicTypeId: item.clinic_type_id,
        medicalAssistantIds: item.medical_assistant_ids || [],
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
      }));

      setData(transformedShifts);
      console.log('✅ Successfully fetched shifts:', transformedShifts.length);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch shifts';
      setError(errorMessage);
      console.error('❌ Error fetching shifts:', err);
    } finally {
      setLoading(false);
    }
  }, [isOnline]);

  // Update shifts with proper upsert logic
  const updateShifts = useCallback(async (newShifts: Shift[] | ((prev: Shift[]) => Shift[])) => {
    const shiftsToSet = typeof newShifts === 'function' 
      ? newShifts(data)
      : newShifts;

    if (!isOnline) {
      throw new Error('Supabase not available');
    }

    try {
      setLoading(true);
      setError(null);
      console.log('💾 Updating shifts in Supabase');

      // CRITICAL FIX: Only upsert shifts that have actually changed
      // Find which shifts are new or different from current data
      const changedShifts = shiftsToSet.filter(newShift => {
        const existingShift = data.find(s => s.id === newShift.id);
        if (!existingShift) return true; // New shift
        
        // Check if shift has actually changed
        return JSON.stringify(existingShift) !== JSON.stringify(newShift);
      });

      console.log(`📊 Upserting ${changedShifts.length} changed shifts out of ${shiftsToSet.length} total`);

      if (changedShifts.length > 0) {
        // Transform only changed shifts to Supabase format
        const supabaseShifts = changedShifts.map(s => ({
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
        }));

        // Use upsert for only the changed shifts
        const { error: upsertError } = await supabase!
          .from(TABLES.SHIFTS)
          .upsert(supabaseShifts, { onConflict: 'id' });

        if (upsertError) throw upsertError;
      }

      // Update local state immediately (no refetch needed)
      setData(shiftsToSet);
      console.log('✅ Successfully updated shifts');
      
      // REMOVED: await fetchShifts(); - This was causing the duplication bug!
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update shifts';
      setError(errorMessage);
      console.error('❌ Error updating shifts:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isOnline, data]); // REMOVED fetchShifts from dependencies

  // Add proper delete function for individual shifts
  const deleteShift = useCallback(async (shiftId: string) => {
    if (!isOnline) {
      throw new Error('Supabase not available');
    }

    try {
      setLoading(true);
      setError(null);
      console.log('🗑️ Deleting shift:', shiftId);

      // Delete from Supabase
      const { error: deleteError } = await supabase!
        .from(TABLES.SHIFTS)
        .delete()
        .eq('id', shiftId);

      if (deleteError) throw deleteError;

      // Update local state immediately (remove the deleted shift)
      setData(prev => prev.filter(s => s.id !== shiftId));
      console.log('✅ Successfully deleted shift');
      
      // No refetch needed - local state is already updated
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete shift';
      setError(errorMessage);
      console.error('❌ Error deleting shift:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isOnline]);

  // Delete multiple shifts (for recurring series)
  const deleteShifts = useCallback(async (shiftIds: string[]) => {
    if (!isOnline) {
      throw new Error('Supabase not available');
    }

    try {
      setLoading(true);
      setError(null);
      console.log('🗑️ Deleting shifts:', shiftIds.length);

      // Delete from Supabase
      const { error: deleteError } = await supabase!
        .from(TABLES.SHIFTS)
        .delete()
        .in('id', shiftIds);

      if (deleteError) throw deleteError;

      // Update local state immediately (remove the deleted shifts)
      setData(prev => prev.filter(s => !shiftIds.includes(s.id)));
      console.log('✅ Successfully deleted shifts');
      
      // No refetch needed - local state is already updated
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete shifts';
      setError(errorMessage);
      console.error('❌ Error deleting shifts:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isOnline]);

  // Initial fetch
  useEffect(() => {
    if (isOnline) {
      fetchShifts();
    }
  }, [isOnline, fetchShifts]);

  return {
    data,
    setData: updateShifts,
    deleteShift,
    deleteShifts,
    loading,
    error,
    refetch: fetchShifts,
    isOnline
  };
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