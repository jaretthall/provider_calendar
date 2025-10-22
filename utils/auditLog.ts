import { supabase } from './supabase';

export interface AuditLogEntry {
  userId?: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  tableName: string;
  recordId?: string;
  oldData?: any;
  newData?: any;
}

export const logUserAction = async (entry: AuditLogEntry): Promise<void> => {
  try {
    if (!supabase) {
      console.warn('Supabase not available - skipping audit log');
      return;
    }

    // Get current user info if not provided
    let userId = entry.userId;

    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        userId = user.id;
      }
    }

    const auditEntry = {
      user_id: userId,
      table_name: entry.tableName,
      record_id: entry.recordId,
      action: entry.action.toLowerCase(), // Schema expects lowercase
      old_values: entry.oldData ? entry.oldData : null,
      new_values: entry.newData ? entry.newData : null
    };

    console.log('📝 Logging audit entry:', {
      action: entry.action,
      table: entry.tableName,
      userId: userId,
      recordId: entry.recordId
    });

    const { error } = await supabase
      .from('audit_log')
      .insert([auditEntry]);

    if (error) {
      console.error('Failed to log audit entry:', error);
    }
  } catch (error) {
    console.error('Error logging user action:', error);
  }
};

// Helper function to generate a session ID
function generateSessionId(): string {
  // Use existing session storage or create new one
  let sessionId = sessionStorage.getItem('audit_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('audit_session_id', sessionId);
  }
  return sessionId;
}

// Convenience functions for specific actions
export const logShiftCreate = async (shift: any, userId?: string) => {
  await logUserAction({
    userId,
    action: 'CREATE',
    tableName: 'shifts',
    recordId: shift.id,
    newData: shift
  });
};

export const logShiftUpdate = async (oldShift: any, newShift: any, userId?: string) => {
  await logUserAction({
    userId,
    action: 'UPDATE',
    tableName: 'shifts',
    recordId: newShift.id,
    oldData: oldShift,
    newData: newShift
  });
};

export const logShiftDelete = async (shift: any, userId?: string) => {
  await logUserAction({
    userId,
    action: 'DELETE',
    tableName: 'shifts',
    recordId: shift.id,
    oldData: shift
  });
};

export const logProviderAction = async (action: 'CREATE' | 'UPDATE' | 'DELETE', provider: any, oldProvider?: any, userId?: string) => {
  await logUserAction({
    userId,
    action,
    tableName: 'providers',
    recordId: provider.id,
    oldData: oldProvider,
    newData: provider
  });
};