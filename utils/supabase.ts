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
    
    console.log(`🔍 Fetching from table: ${table}, orderBy: ${orderBy}`);
    let query = supabase.from(table).select('*');
    
    if (orderBy) {
      query = query.order(orderBy);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error(`❌ Error fetching ${table}:`, {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw error;
    }

    console.log(`✅ Successfully fetched ${data?.length || 0} records from ${table}`);
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
    // Test database connection by checking if we can access the providers table
    // This verifies both auth and database connectivity
    const { data, error } = await supabase!
      .from('providers')
      .select('id')
      .limit(1);
    
    if (error) {
      // If we get an auth error, the API key or URL is wrong
      if (error.code === 'PGRST301' || error.message?.includes('JWT')) {
        return {
          success: false,
          error: 'Invalid Supabase API key - check your .env file',
          details: error
        };
      }
      
      // If table doesn't exist, the schema hasn't been set up
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        return {
          success: false,
          error: 'Database tables not found - please run the schema setup in Supabase SQL Editor',
          details: error,
          solution: 'Copy and paste the contents of supabase-schema.sql into your Supabase SQL Editor and run it'
        };
      }
      
      // Other database errors
      return {
        success: false,
        error: `Database error: ${error.message}`,
        details: error
      };
    }

    // If we get here, everything is working perfectly
    return {
      success: true,
      message: 'Supabase connection and database access verified',
      details: {
        tablesAccessible: true,
        recordsFound: data?.length || 0,
        projectId: supabaseUrl.replace(/^https?:\/\/([^.]+)\..*/, '$1')
      }
    };
  } catch (error: any) {
    // If we get a network error or similar, the configuration might be wrong
    if (error.message?.includes('fetch')) {
      return {
        success: false,
        error: 'Unable to connect to Supabase - check your project URL',
        details: error
      };
    }
    
    return {
      success: false,
      error: error.message || 'Unknown connection error',
      details: error
    };
  }
};

export default supabase; 