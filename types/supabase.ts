export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          user_id: string;
          email: string;
          role: 'view_only' | 'admin';
          first_name: string | null;
          last_name: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          email: string;
          role?: 'view_only' | 'admin';
          first_name?: string | null;
          last_name?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: 'view_only' | 'admin';
          first_name?: string | null;
          last_name?: string | null;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      providers: {
        Row: {
          id: string;
          name: string;
          color: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          name: string;
          color: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          id?: string;
          name?: string;
          color?: string;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      clinic_types: {
        Row: {
          id: string;
          name: string;
          color: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          name: string;
          color: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          id?: string;
          name?: string;
          color?: string;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      medical_assistants: {
        Row: {
          id: string;
          name: string;
          color: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          name: string;
          color: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          id?: string;
          name?: string;
          color?: string;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      shifts: {
        Row: {
          id: string;
          provider_id: string;
          clinic_type_id: string | null;
          medical_assistant_ids: string[] | null;
          title: string | null;
          start_date: string;
          end_date: string;
          start_time: string | null;
          end_time: string | null;
          is_vacation: boolean;
          notes: string | null;
          color: string;
          recurring_rule: any | null;
          series_id: string | null;
          original_recurring_shift_id: string | null;
          is_exception_instance: boolean;
          exception_for_date: string | null;
          created_at: string;
          updated_at: string;
          created_by_user_id: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          provider_id: string;
          clinic_type_id?: string | null;
          medical_assistant_ids?: string[] | null;
          title?: string | null;
          start_date: string;
          end_date: string;
          start_time?: string | null;
          end_time?: string | null;
          is_vacation?: boolean;
          notes?: string | null;
          color: string;
          recurring_rule?: any | null;
          series_id?: string | null;
          original_recurring_shift_id?: string | null;
          is_exception_instance?: boolean;
          exception_for_date?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by_user_id: string;
          user_id: string;
        };
        Update: {
          id?: string;
          provider_id?: string;
          clinic_type_id?: string | null;
          medical_assistant_ids?: string[] | null;
          title?: string | null;
          start_date?: string;
          end_date?: string;
          start_time?: string | null;
          end_time?: string | null;
          is_vacation?: boolean;
          notes?: string | null;
          color?: string;
          recurring_rule?: any | null;
          series_id?: string | null;
          original_recurring_shift_id?: string | null;
          is_exception_instance?: boolean;
          exception_for_date?: string | null;
          updated_at?: string;
        };
      };
      user_settings: {
        Row: {
          id: string;
          user_id: string;
          settings: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          settings: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          settings?: any;
          updated_at?: string;
        };
      };
      audit_log: {
        Row: {
          id: string;
          user_id: string;
          table_name: string;
          record_id: string;
          action: 'create' | 'update' | 'delete';
          old_values: any | null;
          new_values: any | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          table_name: string;
          record_id: string;
          action: 'create' | 'update' | 'delete';
          old_values?: any | null;
          new_values?: any | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          table_name?: string;
          record_id?: string;
          action?: 'create' | 'update' | 'delete';
          old_values?: any | null;
          new_values?: any | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_user_role: {
        Args: {
          user_uuid: string;
        };
        Returns: 'view_only' | 'admin';
      };
      is_admin: {
        Args: {
          user_uuid?: string;
        };
        Returns: boolean;
      };
      get_shift_conflicts: {
        Args: {
          p_provider_id: string;
          p_start_date: string;
          p_end_date: string;
          p_start_time?: string;
          p_end_time?: string;
          p_exclude_shift_id?: string;
        };
        Returns: {
          shift_id: string;
        }[];
      };
    };
    Enums: {
      user_role: 'view_only' | 'admin';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
} 