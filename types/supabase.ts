export interface Database {
  public: {
    Tables: {
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
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
} 