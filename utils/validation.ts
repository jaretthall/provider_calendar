// Validation utility functions for forms and data

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface FieldValidationResult {
  isValid: boolean;
  error?: string;
}

// Basic field validations
export const validateRequired = (value: any, fieldName: string): FieldValidationResult => {
  if (value === null || value === undefined || value === '') {
    return { isValid: false, error: `${fieldName} is required` };
  }
  return { isValid: true };
};

export const validateEmail = (email: string): FieldValidationResult => {
  if (!email) return { isValid: true }; // Allow empty for optional fields
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  return { isValid: true };
};

export const validateMinLength = (value: string, minLength: number, fieldName: string): FieldValidationResult => {
  if (value && value.length < minLength) {
    return { isValid: false, error: `${fieldName} must be at least ${minLength} characters long` };
  }
  return { isValid: true };
};

export const validateMaxLength = (value: string, maxLength: number, fieldName: string): FieldValidationResult => {
  if (value && value.length > maxLength) {
    return { isValid: false, error: `${fieldName} must be no more than ${maxLength} characters long` };
  }
  return { isValid: true };
};

export const validateTime = (time: string): FieldValidationResult => {
  if (!time) return { isValid: true }; // Allow empty for optional fields
  
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(time)) {
    return { isValid: false, error: 'Please enter a valid time in HH:MM format' };
  }
  return { isValid: true };
};

export const validateDate = (date: string): FieldValidationResult => {
  if (!date) return { isValid: true }; // Allow empty for optional fields
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return { isValid: false, error: 'Please enter a valid date' };
  }
  return { isValid: true };
};

export const validateDateRange = (startDate: string, endDate: string): FieldValidationResult => {
  if (!startDate || !endDate) return { isValid: true };
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (start > end) {
    return { isValid: false, error: 'End date must be after start date' };
  }
  return { isValid: true };
};

export const validateTimeRange = (startTime: string, endTime: string): FieldValidationResult => {
  if (!startTime || !endTime) return { isValid: true };
  
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  
  if (startMinutes >= endMinutes) {
    return { isValid: false, error: 'End time must be after start time' };
  }
  return { isValid: true };
};

// Color validation
export const validateColor = (color: string): FieldValidationResult => {
  if (!color) return { isValid: false, error: 'Color is required' };
  
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  if (!hexRegex.test(color)) {
    return { isValid: false, error: 'Please enter a valid hex color (e.g., #FF0000)' };
  }
  return { isValid: true };
};

// Name validation with whitespace checking
export const validateName = (name: string, fieldName: string, options?: {
  minLength?: number;
  maxLength?: number;
  allowEmpty?: boolean;
  noSpecialChars?: boolean;
}): FieldValidationResult => {
  const opts = { minLength: 2, maxLength: 50, allowEmpty: false, noSpecialChars: false, ...options };
  
  if (!name || !name.trim()) {
    if (opts.allowEmpty) return { isValid: true };
    return { isValid: false, error: `${fieldName} is required` };
  }
  
  const trimmedName = name.trim();
  
  if (trimmedName.length < opts.minLength) {
    return { isValid: false, error: `${fieldName} must be at least ${opts.minLength} characters long` };
  }
  
  if (trimmedName.length > opts.maxLength) {
    return { isValid: false, error: `${fieldName} must be no more than ${opts.maxLength} characters long` };
  }
  
  if (opts.noSpecialChars && /[^a-zA-Z0-9\s\-_]/.test(trimmedName)) {
    return { isValid: false, error: `${fieldName} can only contain letters, numbers, spaces, hyphens, and underscores` };
  }
  
  return { isValid: true };
};

// Enhanced date validation with min/max dates
export const validateDateWithRange = (
  date: string, 
  fieldName: string,
  options?: {
    minDate?: Date;
    maxDate?: Date;
    allowPast?: boolean;
    allowFuture?: boolean;
  }
): FieldValidationResult => {
  if (!date) return { isValid: true };
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return { isValid: false, error: `Please enter a valid ${fieldName.toLowerCase()}` };
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dateObj.setHours(0, 0, 0, 0);
  
  if (options?.allowPast === false && dateObj < today) {
    return { isValid: false, error: `${fieldName} cannot be in the past` };
  }
  
  if (options?.allowFuture === false && dateObj > today) {
    return { isValid: false, error: `${fieldName} cannot be in the future` };
  }
  
  if (options?.minDate && dateObj < options.minDate) {
    return { isValid: false, error: `${fieldName} cannot be before ${options.minDate.toLocaleDateString()}` };
  }
  
  if (options?.maxDate && dateObj > options.maxDate) {
    return { isValid: false, error: `${fieldName} cannot be after ${options.maxDate.toLocaleDateString()}` };
  }
  
  return { isValid: true };
};

// Enhanced time range validation with minimum duration
export const validateTimeRangeWithDuration = (
  startTime: string, 
  endTime: string,
  options?: {
    minDurationMinutes?: number;
    maxDurationMinutes?: number;
    allowOvernight?: boolean;
  }
): FieldValidationResult => {
  if (!startTime || !endTime) return { isValid: true };
  
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  
  if (isNaN(startHour) || isNaN(startMin) || isNaN(endHour) || isNaN(endMin)) {
    return { isValid: false, error: 'Invalid time format' };
  }
  
  const startMinutes = startHour * 60 + startMin;
  let endMinutes = endHour * 60 + endMin;
  
  // Handle overnight shifts
  if (endMinutes < startMinutes) {
    if (!options?.allowOvernight) {
      return { isValid: false, error: 'End time must be after start time' };
    }
    endMinutes += 24 * 60; // Add 24 hours for overnight calculation
  }
  
  const durationMinutes = endMinutes - startMinutes;
  
  if (options?.minDurationMinutes && durationMinutes < options.minDurationMinutes) {
    const minHours = Math.floor(options.minDurationMinutes / 60);
    const minMins = options.minDurationMinutes % 60;
    return { 
      isValid: false, 
      error: `Shift must be at least ${minHours > 0 ? `${minHours}h ` : ''}${minMins > 0 ? `${minMins}m` : ''}` 
    };
  }
  
  if (options?.maxDurationMinutes && durationMinutes > options.maxDurationMinutes) {
    const maxHours = Math.floor(options.maxDurationMinutes / 60);
    const maxMins = options.maxDurationMinutes % 60;
    return { 
      isValid: false, 
      error: `Shift cannot exceed ${maxHours > 0 ? `${maxHours}h ` : ''}${maxMins > 0 ? `${maxMins}m` : ''}` 
    };
  }
  
  return { isValid: true };
};

// Provider validation
export const validateProvider = (provider: { name: string; color: string }): ValidationResult => {
  const errors: string[] = [];
  
  const nameValidation = validateRequired(provider.name, 'Provider name');
  if (!nameValidation.isValid) errors.push(nameValidation.error!);
  
  const nameMinValidation = validateMinLength(provider.name, 2, 'Provider name');
  if (!nameMinValidation.isValid) errors.push(nameMinValidation.error!);
  
  const nameMaxValidation = validateMaxLength(provider.name, 50, 'Provider name');
  if (!nameMaxValidation.isValid) errors.push(nameMaxValidation.error!);
  
  const colorValidation = validateRequired(provider.color, 'Provider color');
  if (!colorValidation.isValid) errors.push(colorValidation.error!);
  
  return { isValid: errors.length === 0, errors };
};

// Clinic Type validation
export const validateClinicType = (clinicType: { name: string; color: string }): ValidationResult => {
  const errors: string[] = [];
  
  const nameValidation = validateRequired(clinicType.name, 'Clinic type name');
  if (!nameValidation.isValid) errors.push(nameValidation.error!);
  
  const nameMinValidation = validateMinLength(clinicType.name, 2, 'Clinic type name');
  if (!nameMinValidation.isValid) errors.push(nameMinValidation.error!);
  
  const nameMaxValidation = validateMaxLength(clinicType.name, 50, 'Clinic type name');
  if (!nameMaxValidation.isValid) errors.push(nameMaxValidation.error!);
  
  const colorValidation = validateRequired(clinicType.color, 'Clinic type color');
  if (!colorValidation.isValid) errors.push(colorValidation.error!);
  
  return { isValid: errors.length === 0, errors };
};

// Medical Assistant validation
export const validateMedicalAssistant = (ma: { name: string; color: string }): ValidationResult => {
  const errors: string[] = [];
  
  const nameValidation = validateRequired(ma.name, 'Medical Assistant name');
  if (!nameValidation.isValid) errors.push(nameValidation.error!);
  
  const nameMinValidation = validateMinLength(ma.name, 2, 'Medical Assistant name');
  if (!nameMinValidation.isValid) errors.push(nameMinValidation.error!);
  
  const nameMaxValidation = validateMaxLength(ma.name, 50, 'Medical Assistant name');
  if (!nameMaxValidation.isValid) errors.push(nameMaxValidation.error!);
  
  const colorValidation = validateRequired(ma.color, 'Medical Assistant color');
  if (!colorValidation.isValid) errors.push(colorValidation.error!);
  
  return { isValid: errors.length === 0, errors };
};

// Shift validation
export const validateShift = (shift: {
  providerId: string;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  isVacation: boolean;
  clinicTypeId?: string;
}): ValidationResult => {
  const errors: string[] = [];
  
  // Provider is required
  const providerValidation = validateRequired(shift.providerId, 'Provider');
  if (!providerValidation.isValid) errors.push(providerValidation.error!);
  
  // Dates are required
  const startDateValidation = validateRequired(shift.startDate, 'Start date');
  if (!startDateValidation.isValid) errors.push(startDateValidation.error!);
  
  const endDateValidation = validateRequired(shift.endDate, 'End date');
  if (!endDateValidation.isValid) errors.push(endDateValidation.error!);
  
  // Validate date format
  if (shift.startDate) {
    const startDateFormatValidation = validateDate(shift.startDate);
    if (!startDateFormatValidation.isValid) errors.push(startDateFormatValidation.error!);
  }
  
  if (shift.endDate) {
    const endDateFormatValidation = validateDate(shift.endDate);
    if (!endDateFormatValidation.isValid) errors.push(endDateFormatValidation.error!);
  }
  
  // Validate date range
  if (shift.startDate && shift.endDate) {
    const dateRangeValidation = validateDateRange(shift.startDate, shift.endDate);
    if (!dateRangeValidation.isValid) errors.push(dateRangeValidation.error!);
  }
  
  // Time validation (if provided)
  if (shift.startTime) {
    const startTimeValidation = validateTime(shift.startTime);
    if (!startTimeValidation.isValid) errors.push(startTimeValidation.error!);
  }
  
  if (shift.endTime) {
    const endTimeValidation = validateTime(shift.endTime);
    if (!endTimeValidation.isValid) errors.push(endTimeValidation.error!);
  }
  
  // Time range validation
  if (shift.startTime && shift.endTime) {
    const timeRangeValidation = validateTimeRange(shift.startTime, shift.endTime);
    if (!timeRangeValidation.isValid) errors.push(timeRangeValidation.error!);
  }
  
  // Clinic type is required for non-vacation shifts
  if (!shift.isVacation) {
    const clinicValidation = validateRequired(shift.clinicTypeId, 'Clinic type');
    if (!clinicValidation.isValid) errors.push('Clinic type is required for work shifts');
  }
  
  return { isValid: errors.length === 0, errors };
};

// Import data validation
export const validateImportData = (data: any): ValidationResult => {
  const errors: string[] = [];
  
  if (!data || typeof data !== 'object') {
    errors.push('Invalid JSON data format');
    return { isValid: false, errors };
  }
  
  // Validate structure
  const validKeys = ['providers', 'clinics', 'medicalAssistants', 'shifts'];
  const dataKeys = Object.keys(data);
  
  if (dataKeys.length === 0) {
    errors.push('Import data is empty');
  }
  
  // Check for invalid keys
  const invalidKeys = dataKeys.filter(key => !validKeys.includes(key));
  if (invalidKeys.length > 0) {
    errors.push(`Invalid data keys: ${invalidKeys.join(', ')}`);
  }
  
  // Validate arrays
  validKeys.forEach(key => {
    if (data[key] && !Array.isArray(data[key])) {
      errors.push(`${key} must be an array`);
    }
  });
  
  return { isValid: errors.length === 0, errors };
};

// Login validation
export const validateLogin = (username: string, password: string): ValidationResult => {
  const errors: string[] = [];
  
  const usernameValidation = validateRequired(username, 'Username');
  if (!usernameValidation.isValid) errors.push(usernameValidation.error!);
  
  const passwordValidation = validateRequired(password, 'Password');
  if (!passwordValidation.isValid) errors.push(passwordValidation.error!);
  
  if (username) {
    const usernameMinValidation = validateMinLength(username, 3, 'Username');
    if (!usernameMinValidation.isValid) errors.push(usernameMinValidation.error!);
  }
  
  if (password) {
    const passwordMinValidation = validateMinLength(password, 6, 'Password');
    if (!passwordMinValidation.isValid) errors.push(passwordMinValidation.error!);
  }
  
  return { isValid: errors.length === 0, errors };
};

// Utility to combine multiple validation results
export const combineValidationResults = (...results: ValidationResult[]): ValidationResult => {
  const allErrors = results.flatMap(result => result.errors);
  return {
    isValid: allErrors.length === 0,
    errors: allErrors
  };
};

// Enhanced provider validation
export const validateProviderEnhanced = (provider: { 
  name: string; 
  color: string;
  existingProviders?: { name: string; id: string }[];
  id?: string;
}): ValidationResult => {
  const errors: string[] = [];
  
  const nameValidation = validateName(provider.name, 'Provider name', { 
    minLength: 2, 
    maxLength: 50, 
    noSpecialChars: true 
  });
  if (!nameValidation.isValid) errors.push(nameValidation.error!);
  
  const colorValidation = validateColor(provider.color);
  if (!colorValidation.isValid) errors.push(colorValidation.error!);
  
  // Check for duplicate names
  if (provider.existingProviders && provider.name.trim()) {
    const duplicate = provider.existingProviders.find(p => 
      p.name.toLowerCase() === provider.name.trim().toLowerCase() && 
      p.id !== provider.id
    );
    if (duplicate) {
      errors.push('A provider with this name already exists');
    }
  }
  
  return { isValid: errors.length === 0, errors };
};

// Enhanced clinic type validation
export const validateClinicTypeEnhanced = (clinicType: { 
  name: string; 
  color: string;
  existingClinics?: { name: string; id: string }[];
  id?: string;
}): ValidationResult => {
  const errors: string[] = [];
  
  const nameValidation = validateName(clinicType.name, 'Clinic type name', { 
    minLength: 2, 
    maxLength: 50, 
    noSpecialChars: true 
  });
  if (!nameValidation.isValid) errors.push(nameValidation.error!);
  
  const colorValidation = validateColor(clinicType.color);
  if (!colorValidation.isValid) errors.push(colorValidation.error!);
  
  // Check for duplicate names
  if (clinicType.existingClinics && clinicType.name.trim()) {
    const duplicate = clinicType.existingClinics.find(c => 
      c.name.toLowerCase() === clinicType.name.trim().toLowerCase() && 
      c.id !== clinicType.id
    );
    if (duplicate) {
      errors.push('A clinic type with this name already exists');
    }
  }
  
  return { isValid: errors.length === 0, errors };
};

// Enhanced medical assistant validation
export const validateMedicalAssistantEnhanced = (ma: { 
  name: string; 
  color: string;
  existingMAs?: { name: string; id: string }[];
  id?: string;
}): ValidationResult => {
  const errors: string[] = [];
  
  const nameValidation = validateName(ma.name, 'Medical Assistant name', { 
    minLength: 2, 
    maxLength: 50, 
    noSpecialChars: true 
  });
  if (!nameValidation.isValid) errors.push(nameValidation.error!);
  
  const colorValidation = validateColor(ma.color);
  if (!colorValidation.isValid) errors.push(colorValidation.error!);
  
  // Check for duplicate names
  if (ma.existingMAs && ma.name.trim()) {
    const duplicate = ma.existingMAs.find(m => 
      m.name.toLowerCase() === ma.name.trim().toLowerCase() && 
      m.id !== ma.id
    );
    if (duplicate) {
      errors.push('A medical assistant with this name already exists');
    }
  }
  
  return { isValid: errors.length === 0, errors };
};

// Enhanced shift validation
export const validateShiftEnhanced = (shift: {
  providerId: string;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  isVacation: boolean;
  clinicTypeId?: string;
  medicalAssistantIds?: string[];
  notes?: string;
  existingProviders?: { id: string }[];
  existingClinics?: { id: string }[];
  existingMAs?: { id: string }[];
}): ValidationResult => {
  const errors: string[] = [];
  
  // Provider validation
  if (!shift.providerId) {
    errors.push('Provider is required');
  } else if (shift.existingProviders && !shift.existingProviders.find(p => p.id === shift.providerId)) {
    errors.push('Selected provider does not exist');
  }
  
  // Date validations
  const startDateValidation = validateRequired(shift.startDate, 'Start date');
  if (!startDateValidation.isValid) errors.push(startDateValidation.error!);
  
  const endDateValidation = validateRequired(shift.endDate, 'End date');
  if (!endDateValidation.isValid) errors.push(endDateValidation.error!);
  
  if (shift.startDate && shift.endDate) {
    const startDateRangeValidation = validateDateWithRange(shift.startDate, 'Start date');
    if (!startDateRangeValidation.isValid) errors.push(startDateRangeValidation.error!);
    
    const endDateRangeValidation = validateDateWithRange(shift.endDate, 'End date');
    if (!endDateRangeValidation.isValid) errors.push(endDateRangeValidation.error!);
    
    const dateRangeValidation = validateDateRange(shift.startDate, shift.endDate);
    if (!dateRangeValidation.isValid) errors.push(dateRangeValidation.error!);
    
    // Check for reasonable date ranges (max 1 year)
    const startDate = new Date(shift.startDate);
    const endDate = new Date(shift.endDate);
    const daysDifference = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysDifference > 365) {
      errors.push('Date range cannot exceed 365 days');
    }
  }
  
  // Time validations (only for work shifts)
  if (!shift.isVacation) {
    if (shift.startTime) {
      const startTimeValidation = validateTime(shift.startTime);
      if (!startTimeValidation.isValid) errors.push(startTimeValidation.error!);
    }
    
    if (shift.endTime) {
      const endTimeValidation = validateTime(shift.endTime);
      if (!endTimeValidation.isValid) errors.push(endTimeValidation.error!);
    }
    
    if (shift.startTime && shift.endTime) {
      const timeRangeValidation = validateTimeRangeWithDuration(shift.startTime, shift.endTime, {
        minDurationMinutes: 30, // Minimum 30-minute shifts
        maxDurationMinutes: 24 * 60, // Maximum 24-hour shifts
        allowOvernight: true
      });
      if (!timeRangeValidation.isValid) errors.push(timeRangeValidation.error!);
    }
  }
  
  // Clinic type validation for work shifts
  if (!shift.isVacation) {
    if (!shift.clinicTypeId) {
      errors.push('Clinic type is required for work shifts');
    } else if (shift.existingClinics && !shift.existingClinics.find(c => c.id === shift.clinicTypeId)) {
      errors.push('Selected clinic type does not exist');
    }
  }
  
  // Medical assistant validation
  if (shift.medicalAssistantIds && shift.medicalAssistantIds.length > 0 && shift.existingMAs) {
    const invalidMAIds = shift.medicalAssistantIds.filter(maId => 
      !shift.existingMAs!.find(ma => ma.id === maId)
    );
    if (invalidMAIds.length > 0) {
      errors.push('One or more selected medical assistants do not exist');
    }
  }
  
  // Notes validation
  if (shift.notes) {
    const notesValidation = validateMaxLength(shift.notes, 500, 'Notes');
    if (!notesValidation.isValid) errors.push(notesValidation.error!);
  }
  
  return { isValid: errors.length === 0, errors };
};

// Enhanced import data validation
export const validateImportDataEnhanced = (data: any): ValidationResult => {
  const errors: string[] = [];
  
  if (!data || typeof data !== 'object') {
    errors.push('Invalid JSON data format');
    return { isValid: false, errors };
  }
  
  const validKeys = ['providers', 'clinics', 'medicalAssistants', 'shifts', 'userSettings'];
  const dataKeys = Object.keys(data);
  
  if (dataKeys.length === 0) {
    errors.push('Import data is empty');
  }
  
  // Check for invalid keys
  const invalidKeys = dataKeys.filter(key => !validKeys.includes(key));
  if (invalidKeys.length > 0) {
    errors.push(`Invalid data keys: ${invalidKeys.join(', ')}`);
  }
  
  // Validate arrays and structure
  validKeys.slice(0, 4).forEach(key => { // Exclude userSettings from array check
    if (data[key]) {
      if (!Array.isArray(data[key])) {
        errors.push(`${key} must be an array`);
      } else {
        // Basic structure validation for each array
        switch (key) {
          case 'providers':
            data[key].forEach((item: any, index: number) => {
              if (!item.name || typeof item.name !== 'string') {
                errors.push(`Provider at index ${index} is missing a valid name`);
              }
              if (!item.color || typeof item.color !== 'string') {
                errors.push(`Provider at index ${index} is missing a valid color`);
              }
            });
            break;
          case 'clinics':
            data[key].forEach((item: any, index: number) => {
              if (!item.name || typeof item.name !== 'string') {
                errors.push(`Clinic type at index ${index} is missing a valid name`);
              }
              if (!item.color || typeof item.color !== 'string') {
                errors.push(`Clinic type at index ${index} is missing a valid color`);
              }
            });
            break;
          case 'medicalAssistants':
            data[key].forEach((item: any, index: number) => {
              if (!item.name || typeof item.name !== 'string') {
                errors.push(`Medical assistant at index ${index} is missing a valid name`);
              }
              if (!item.color || typeof item.color !== 'string') {
                errors.push(`Medical assistant at index ${index} is missing a valid color`);
              }
            });
            break;
          case 'shifts':
            data[key].forEach((item: any, index: number) => {
              if (!item.providerId || typeof item.providerId !== 'string') {
                errors.push(`Shift at index ${index} is missing a valid provider ID`);
              }
              if (!item.startDate || typeof item.startDate !== 'string') {
                errors.push(`Shift at index ${index} is missing a valid start date`);
              }
              if (!item.endDate || typeof item.endDate !== 'string') {
                errors.push(`Shift at index ${index} is missing a valid end date`);
              }
            });
            break;
        }
      }
    }
  });
  
  // Validate userSettings if present
  if (data.userSettings && typeof data.userSettings !== 'object') {
    errors.push('userSettings must be an object');
  }
  
  return { isValid: errors.length === 0, errors };
};

// File validation for imports
export const validateImportFile = (file: File): FieldValidationResult => {
  if (!file) {
    return { isValid: false, error: 'No file selected' };
  }
  
  if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
    return { isValid: false, error: 'File must be a valid JSON file (.json)' };
  }
  
  if (file.size > 10 * 1024 * 1024) { // 10MB limit
    return { isValid: false, error: 'File size cannot exceed 10MB' };
  }
  
  if (file.size === 0) {
    return { isValid: false, error: 'File cannot be empty' };
  }
  
  return { isValid: true };
};

// Async validation for JSON content
export const validateJSONContent = async (content: string): Promise<ValidationResult> => {
  const errors: string[] = [];
  
  if (!content.trim()) {
    errors.push('JSON content cannot be empty');
    return { isValid: false, errors };
  }
  
  try {
    const parsed = JSON.parse(content);
    const structureValidation = validateImportDataEnhanced(parsed);
    return structureValidation;
  } catch (error) {
    errors.push(`Invalid JSON format: ${error instanceof Error ? error.message : 'Unknown parsing error'}`);
    return { isValid: false, errors };
  }
}; 