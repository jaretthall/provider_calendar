import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase configuration missing. The application will run in localStorage mode.');
}

// Create Supabase client only if configuration is available
export const supabase: SupabaseClient<Database> | null = 
  (supabaseUrl && supabaseAnonKey) 
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true
        },
        realtime: {
          params: {
            eventsPerSecond: 10
          }
        }
      })
    : null;

// Check if Supabase is configured
export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseUrl && supabaseAnonKey && supabase);
};

// Database table names
export const TABLES = {
  PROVIDERS: 'providers',
  CLINIC_TYPES: 'clinic_types', 
  MEDICAL_ASSISTANTS: 'medical_assistants',
  SHIFTS: 'shifts',
  USER_SETTINGS: 'user_settings'
} as const;

// Auth helpers
export const authHelpers = {
  getCurrentUser: () => supabase?.auth.getUser() || Promise.resolve({ data: { user: null }, error: null }),
  signOut: () => supabase?.auth.signOut() || Promise.resolve({ error: null }),
  onAuthStateChange: (callback: (event: string, session: any) => void) => 
    supabase?.auth.onAuthStateChange(callback) || { data: { subscription: null }, error: null }
};

// Real-time subscription helpers
export const subscriptionHelpers = {
  subscribeToTable: <T>(
    table: string, 
    callback: (payload: any) => void,
    filter?: string
  ) => {
    if (!supabase) return null;
    
    const channel = supabase.channel(`${table}_changes`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table,
          filter
        }, 
        callback
      )
      .subscribe();
    
    return channel;
  },

  unsubscribe: (channel: any) => {
    if (supabase && channel) {
      supabase.removeChannel(channel);
    }
  }
};

// Database helpers
export const dbHelpers = {
  // Generic CRUD operations
  async create<T>(table: string, data: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<T | null> {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }
    
    const { data: result, error } = await supabase
      .from(table)
      .insert(data)
      .select()
      .single();
    
    if (error) {
      console.error(`Error creating ${table}:`, error);
      throw error;
    }
    
    return result;
  },

  async getAll<T>(table: string, orderBy?: string): Promise<T[]> {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }
    
    let query = supabase.from(table).select('*');
    
    if (orderBy) {
      query = query.order(orderBy);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error(`Error fetching ${table}:`, error);
      throw error;
    }
    
    return data || [];
  },

  async getById<T>(table: string, id: string): Promise<T | null> {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }
    
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error(`Error fetching ${table} by id:`, error);
      return null;
    }
    
    return data;
  },

  async update<T>(table: string, id: string, updates: Partial<T>): Promise<T | null> {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }
    
    const { data, error } = await supabase
      .from(table)
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error(`Error updating ${table}:`, error);
      throw error;
    }
    
    return data;
  },

  async delete(table: string, id: string): Promise<boolean> {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }
    
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error(`Error deleting from ${table}:`, error);
      throw error;
    }
    
    return true;
  },

  // User settings helpers
  async getUserSettings(userId: string): Promise<any> {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }
    
    const { data, error } = await supabase
      .from(TABLES.USER_SETTINGS)
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error fetching user settings:', error);
      throw error;
    }
    
    return data?.settings || null;
  },

  async saveUserSettings(userId: string, settings: any): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }
    
    const { error } = await supabase
      .from(TABLES.USER_SETTINGS)
      .upsert({
        user_id: userId,
        settings,
        updated_at: new Date().toISOString()
      });
    
    if (error) {
      console.error('Error saving user settings:', error);
      throw error;
    }
  }
};

// Test and status helpers
export const checkSupabaseStatus = async () => {
  return {
    isConfigured: isSupabaseConfigured(),
    url: supabaseUrl,
    hasAnonKey: Boolean(supabaseAnonKey),
    client: Boolean(supabase)
  };
};

export const testSupabaseConnection = async () => {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error: 'Supabase not configured - missing environment variables',
      details: {
        hasUrl: Boolean(supabaseUrl),
        hasKey: Boolean(supabaseAnonKey)
      }
    };
  }

  try {
    // Test basic connection
    const { data, error } = await supabase!.from('providers').select('count', { count: 'exact', head: true });
    
    if (error) {
      return {
        success: false,
        error: error.message,
        details: error
      };
    }

    return {
      success: true,
      message: 'Supabase connection successful',
      providersCount: data
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Unknown connection error',
      details: error
    };
  }
};

export default supabase; 