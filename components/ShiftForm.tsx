import React, { useState, useEffect, useContext } from 'react';
import { Shift, Provider, ClinicType, RecurringRule, RecurringFrequency, MedicalAssistant, FrontStaff, Billing, BehavioralHealth } from '../types';
import { AppContext, ToastContext, ModalContext, SettingsContext } from '../App';
import { useAuth, usePermissions } from '../hooks/useAuth';
import { PREDEFINED_COLORS, VACATION_COLOR, DEFAULT_EVENT_COLOR } from '../constants';
import RecurringShiftFormSection from './RecurringShiftFormSection';
import { getISODateString, getInitials } from '../utils/dateUtils'; // Added getInitials
import { findConflictsForSingleShiftConfiguration } from '../utils/conflictUtils'; 
import TrashIcon from './icons/TrashIcon';
import SpinnerIcon from './icons/SpinnerIcon';
import WarningIcon from './icons/WarningIcon';
import { validateShiftEnhanced } from '../utils/validation';
import { getProvidersWithShiftsOnDate, getProviderShiftOnDate, checkTimesMismatch } from '../utils/providerShiftUtils';


interface ShiftFormProps {
  shift?: Shift | null; 
  initialDate?: string; 
  instanceDate?: string; 
  editMode?: 'singleInstance' | 'entireSeries' | 'direct' | 'directException'; 
  seriesOriginalShift?: Shift | null; 
  providerIdForNewShift?: string;
  filterDefaults?: {
    providerIds?: string[];
    clinicTypeIds?: string[];
    medicalAssistantIds?: string[];
  };
  onClose: () => void;
}

const ShiftForm: React.FC<ShiftFormProps> = ({ 
    shift, 
    initialDate, 
    instanceDate, 
    editMode = 'direct', 
    seriesOriginalShift,
    providerIdForNewShift,
    filterDefaults,
    onClose 
}) => {
  const appContext = useContext(AppContext);
  const toastContext = useContext(ToastContext); 
  const modalContext = useContext(ModalContext);
  const settingsContext = useContext(SettingsContext);
  
  // Use new authentication hooks
  const { user: currentUser } = useAuth();
  const { canEdit } = usePermissions();

  if (!appContext || !toastContext || !modalContext || !settingsContext) throw new Error("Context not found");
  const { providers, clinics, medicalAssistants, frontStaff, billing, behavioralHealth, shifts: allShifts, addShift, updateShift, deleteShift, getProviderById, getClinicTypeById, getMedicalAssistantById } = appContext; 
  const { addToast } = toastContext; 
  const { openModal } = modalContext;
  const { settings } = settingsContext;

  // Helper function to get default times for a department
  const getDepartmentDefaults = (department: string) => {
    const defaults = settings.departmentDefaults;
    switch (department) {
      case 'providers':
        return defaults?.providers || { startTime: '07:30', endTime: '17:00' };
      case 'medicalAssistants':
        return defaults?.medicalAssistants || { startTime: '07:30', endTime: '17:00' };
      case 'frontStaff':
        return defaults?.frontStaff || { startTime: '08:00', endTime: '17:00' };
      case 'billing':
        return defaults?.billing || { startTime: '08:00', endTime: '17:00' };
      case 'behavioralHealth':
        return defaults?.behavioralHealth || { startTime: '08:00', endTime: '17:00' };
      default:
        return { startTime: '09:00', endTime: '17:00' };
    }
  };

  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [providerId, setProviderId] = useState<string>('');
  const [clinicTypeId, setClinicTypeId] = useState<string | undefined>(undefined);
  const [selectedMAIds, setSelectedMAIds] = useState<string[]>([]);
  const [selectedFrontStaffIds, setSelectedFrontStaffIds] = useState<string[]>([]);
  const [selectedBillingIds, setSelectedBillingIds] = useState<string[]>([]);
  const [selectedBehavioralHealthIds, setSelectedBehavioralHealthIds] = useState<string[]>([]);
  const [currentStartDate, setStartDate] = useState<string>(initialDate || getISODateString(new Date()));
  const [currentEndDate, setEndDate] = useState<string>(initialDate || getISODateString(new Date()));
  const [startTime, setStartTime] = useState<string>(() => {
    // Get default times based on initial department selection
    const initialDepartment = shift ? (shift.providerId ? 'providers' : 
      shift.medicalAssistantIds?.length ? 'medicalAssistants' : 
      shift.frontStaffIds?.length ? 'frontStaff' : 
      shift.billingIds?.length ? 'billing' : 
      shift.behavioralHealthIds?.length ? 'behavioralHealth' : '') : '';
    return shift?.startTime || getDepartmentDefaults(initialDepartment).startTime;
  });
  const [endTime, setEndTime] = useState<string>(() => {
    // Get default times based on initial department selection
    const initialDepartment = shift ? (shift.providerId ? 'providers' : 
      shift.medicalAssistantIds?.length ? 'medicalAssistants' : 
      shift.frontStaffIds?.length ? 'frontStaff' : 
      shift.billingIds?.length ? 'billing' : 
      shift.behavioralHealthIds?.length ? 'behavioralHealth' : '') : '';
    return shift?.endTime || getDepartmentDefaults(initialDepartment).endTime;
  });
  const [isVacation, setIsVacation] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>('');
  const [currentRecurringRule, setRecurringRule] = useState<RecurringRule | undefined>({ frequency: RecurringFrequency.NONE });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formConflictWarning, setFormConflictWarning] = useState<string | null>(null);
  
  // MA-specific state for provider assignment
  const [assignedToProviderId, setAssignedToProviderId] = useState<string>('');
  const [timesMismatchWarning, setTimesMismatchWarning] = useState<string | null>(null);
  
  const activeProviders = providers.filter(p => p.isActive);
  const activeClinics = clinics.filter(c => c.isActive);
  const activeMAs = medicalAssistants.filter(ma => ma.isActive);
  const activeFrontStaff = frontStaff.filter(fs => fs.isActive);
  const activeBilling = billing.filter(b => b.isActive);
  const activeBehavioralHealth = behavioralHealth.filter(bh => bh.isActive);

  useEffect(() => {
    let effectiveShift = shift; 

    if (editMode === 'singleInstance' && seriesOriginalShift && instanceDate) {
      effectiveShift = seriesOriginalShift; 
      setStartDate(instanceDate);
      setEndDate(instanceDate);
      setRecurringRule({ frequency: RecurringFrequency.NONE }); 
    } else if (editMode === 'entireSeries' && shift) {
      effectiveShift = shift;
    } else if (editMode === 'directException' && shift) {
      effectiveShift = shift;
       setRecurringRule({ frequency: RecurringFrequency.NONE }); 
    }


    if (effectiveShift) {
      setProviderId(effectiveShift.providerId || '');
      setClinicTypeId(effectiveShift.clinicTypeId);
      setSelectedMAIds(effectiveShift.medicalAssistantIds || []);
      setSelectedFrontStaffIds(effectiveShift.frontStaffIds || []);
      setSelectedBillingIds(effectiveShift.billingIds || []);
      setSelectedBehavioralHealthIds(effectiveShift.behavioralHealthIds || []);
      setAssignedToProviderId(effectiveShift.assignedToProviderId || '');
      
      // Determine department based on existing data
      if (effectiveShift.providerId) {
        setSelectedDepartment('providers');
      } else if (effectiveShift.medicalAssistantIds && effectiveShift.medicalAssistantIds.length > 0) {
        setSelectedDepartment('medicalAssistants');
      } else if (effectiveShift.frontStaffIds && effectiveShift.frontStaffIds.length > 0) {
        setSelectedDepartment('frontStaff');
      } else if (effectiveShift.billingIds && effectiveShift.billingIds.length > 0) {
        setSelectedDepartment('billing');
      } else if (effectiveShift.behavioralHealthIds && effectiveShift.behavioralHealthIds.length > 0) {
        setSelectedDepartment('behavioralHealth');
      } else {
        setSelectedDepartment('providers'); // Default
      }
      if (editMode !== 'singleInstance') {
        setStartDate(effectiveShift.startDate);
        setEndDate(effectiveShift.endDate);
      }
      setStartTime(effectiveShift.startTime || (effectiveShift.isVacation ? '' : '09:00'));
      setEndTime(effectiveShift.endTime || (effectiveShift.isVacation ? '' : '17:00'));
      setIsVacation(effectiveShift.isVacation);
      setNotes(effectiveShift.notes || '');
      if (editMode !== 'singleInstance' && editMode !== 'directException') {
        setRecurringRule(effectiveShift.recurringRule ? {...effectiveShift.recurringRule} : { frequency: RecurringFrequency.NONE });
      }
    } else { 
      // Use dragged provider if available, otherwise default to first active provider
      const defaultProviderId = providerIdForNewShift || (activeProviders.length > 0 ? activeProviders[0].id : '');
      setProviderId(defaultProviderId);
      
      // Use filtered clinic if only one is selected, otherwise default to first
      const defaultClinicId = filterDefaults?.clinicTypeIds?.length === 1 
        ? filterDefaults.clinicTypeIds[0] 
        : (activeClinics.length > 0 ? activeClinics[0].id : undefined);
      setClinicTypeId(defaultClinicId);
      
      // Use filtered MAs if available
      const defaultMAIds = filterDefaults?.medicalAssistantIds || [];
      setSelectedMAIds(defaultMAIds);
      
      // Set default department to providers for new shifts
      setSelectedDepartment('providers');
      
      setStartDate(initialDate || getISODateString(new Date()));
      setEndDate(initialDate || getISODateString(new Date()));
      setStartTime('09:00');
      setEndTime('17:00');
      setIsVacation(false);
      setNotes('');
      setRecurringRule({ frequency: RecurringFrequency.NONE });
    }
  }, [shift, initialDate, instanceDate, editMode, seriesOriginalShift, providers, clinics, medicalAssistants, frontStaff, billing, behavioralHealth]);

  // Clear times when vacation mode is enabled
  useEffect(() => {
    if (isVacation) {
      setStartTime('');
      setEndTime('');
    }
  }, [isVacation]);

  useEffect(() => {
    if (isVacation || !providerId || !startTime || !endTime) {
      setFormConflictWarning(null);
      return;
    }

    const currentShiftConfig = {
      id: shift?.id, 
      providerId: selectedDepartment === 'providers' ? providerId : undefined,
      clinicTypeId,
      medicalAssistantIds: selectedDepartment === 'providers' ? selectedMAIds : [],
      frontStaffIds: selectedDepartment === 'frontStaff' ? selectedFrontStaffIds : [],
      billingIds: selectedDepartment === 'billing' ? selectedBillingIds : [],
      behavioralHealthIds: selectedDepartment === 'behavioralHealth' ? selectedBehavioralHealthIds : [],
      startDate: currentStartDate,
      endDate: currentEndDate,
      startTime,
      endTime,
      isVacation,
      notes,
      recurringRule: currentRecurringRule,
      seriesId: shift?.seriesId,
      originalRecurringShiftId: seriesOriginalShift?.id || shift?.originalRecurringShiftId,
      isExceptionInstance: editMode === 'singleInstance' || editMode === 'directException' || shift?.isExceptionInstance,
      exceptionForDate: instanceDate || shift?.exceptionForDate,
      createdByUserId: currentUser?.id,
    };
    
    const formDetectionStart = new Date(currentStartDate);
    formDetectionStart.setDate(formDetectionStart.getDate() - 30); 
    const formDetectionEnd = new Date(currentEndDate);
    formDetectionEnd.setDate(formDetectionEnd.getDate() + 30);

    const conflictingShiftTitles = findConflictsForSingleShiftConfiguration(currentShiftConfig, allShifts, formDetectionStart, formDetectionEnd);

    if (conflictingShiftTitles.length > 0) {
      setFormConflictWarning(`Warning: This shift may overlap with: ${conflictingShiftTitles.slice(0,2).join(', ')}${conflictingShiftTitles.length > 2 ? ' and others.' : '.'}`);
    } else {
      setFormConflictWarning(null);
    }
  }, [providerId, currentStartDate, currentEndDate, startTime, endTime, isVacation, currentRecurringRule, clinicTypeId, notes, shift, seriesOriginalShift, instanceDate, editMode, allShifts, selectedMAIds, selectedFrontStaffIds, selectedBillingIds, selectedBehavioralHealthIds, selectedDepartment]);

  // Check for time mismatch when MA is assigned to provider
  useEffect(() => {
    if (selectedDepartment !== 'medicalAssistants' || !assignedToProviderId || !startTime || !endTime) {
      setTimesMismatchWarning(null);
      return;
    }

    const targetDate = new Date(currentStartDate);
    const providerShift = getProviderShiftOnDate(allShifts, assignedToProviderId, targetDate);
    
    if (providerShift) {
      const mismatchWarning = checkTimesMismatch(
        { startTime, endTime },
        { startTime: providerShift.startTime, endTime: providerShift.endTime }
      );
      setTimesMismatchWarning(mismatchWarning);
    } else {
      setTimesMismatchWarning(null);
    }
  }, [selectedDepartment, assignedToProviderId, startTime, endTime, currentStartDate, allShifts]);


  const handleRecurringRuleChange = <K extends keyof RecurringRule,>(field: K, value: RecurringRule[K] | undefined) => {
    setRecurringRule(prev => {
        const newRule = prev ? { ...prev } : { frequency: RecurringFrequency.NONE };
        if (value === undefined) {
            delete newRule[field];
        } else {
            newRule[field] = value;
        }
        
        if (field === 'frequency' && value === RecurringFrequency.NONE) {
            return { frequency: RecurringFrequency.NONE }; 
        }
        return newRule;
    });
};

  const handleMASelectionChange = (maId: string) => {
    setSelectedMAIds(prev => 
      prev.includes(maId) ? prev.filter(id => id !== maId) : [...prev, maId]
    );
  };

  const handleFrontStaffSelectionChange = (fsId: string) => {
    setSelectedFrontStaffIds(prev => 
      prev.includes(fsId) ? prev.filter(id => id !== fsId) : [...prev, fsId]
    );
  };

  const handleBillingSelectionChange = (bId: string) => {
    setSelectedBillingIds(prev => 
      prev.includes(bId) ? prev.filter(id => id !== bId) : [...prev, bId]
    );
  };

  const handleBehavioralHealthSelectionChange = (bhId: string) => {
    setSelectedBehavioralHealthIds(prev => 
      prev.includes(bhId) ? prev.filter(id => id !== bhId) : [...prev, bhId]
    );
  };

  const handleDepartmentChange = (department: string) => {
    setSelectedDepartment(department);
    // Clear previous selections when switching departments
    setProviderId('');
    setSelectedMAIds([]);
    setSelectedFrontStaffIds([]);
    setSelectedBillingIds([]);
    setSelectedBehavioralHealthIds([]);
    setAssignedToProviderId('');
    setTimesMismatchWarning(null);
    
    // Update default times based on selected department
    if (!shift) { // Only set defaults for new shifts, not when editing existing ones
      const departmentDefaults = getDepartmentDefaults(department);
      setStartTime(departmentDefaults.startTime);
      setEndTime(departmentDefaults.endTime);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Enhanced validation using new utilities
    // Properly sanitize time inputs - ensure empty/whitespace strings become undefined
    // Also convert HH:MM:SS format to HH:MM format for validation
    const sanitizedStartTime = startTime && startTime.trim() ? startTime.trim().substring(0, 5) : undefined;
    const sanitizedEndTime = endTime && endTime.trim() ? endTime.trim().substring(0, 5) : undefined;
    
    console.log('DEBUG - Time validation:', {
      startTime: `"${startTime}"`,
      endTime: `"${endTime}"`,
      sanitizedStartTime: `"${sanitizedStartTime}"`,
      sanitizedEndTime: `"${sanitizedEndTime}"`,
      selectedDepartment,
      isVacation
    });
    
    console.log('DEBUG - MA Assignment:', {
      selectedDepartment,
      assignedToProviderId,
      selectedMAIds
    });
    
    const shiftValidation = validateShiftEnhanced({
      providerId,
      startDate: currentStartDate,
      endDate: currentEndDate,
      startTime: sanitizedStartTime,
      endTime: sanitizedEndTime,
      isVacation,
      clinicTypeId,
      medicalAssistantIds: selectedMAIds,
      notes,
      existingProviders: providers.map(p => ({ id: p.id })),
      existingClinics: clinics.map(c => ({ id: c.id })),
      existingMAs: medicalAssistants.map(ma => ({ id: ma.id })),
      skipProviderValidation: selectedDepartment !== 'providers' // Skip provider validation for non-provider departments
    });

    if (!shiftValidation.isValid) {
      addToast(`Please fix the following errors: ${shiftValidation.errors.join(', ')}`, 'error');
      return;
    }

    // Additional business logic validation based on department
    if (!selectedDepartment) {
      addToast("Please select a department.", 'error'); 
      return;
    }

    if (selectedDepartment === 'providers' && !providerId) {
      addToast("Please select a provider.", 'error'); 
      return;
    }

    if (selectedDepartment === 'medicalAssistants') {
      if (selectedMAIds.length === 0) {
        addToast("Please select at least one medical assistant.", 'error'); 
        return;
      }
      
      // If assigned to provider, validate that provider has a shift on this date
      if (assignedToProviderId) {
        const targetDate = new Date(currentStartDate);
        const providerShift = getProviderShiftOnDate(allShifts, assignedToProviderId, targetDate);
        if (!providerShift) {
          addToast("The selected provider does not have a shift on this date.", 'error'); 
          return;
        }
      }
    }

    if (selectedDepartment === 'frontStaff' && selectedFrontStaffIds.length === 0) {
      addToast("Please select at least one front staff member.", 'error'); 
      return;
    }

    if (selectedDepartment === 'billing' && selectedBillingIds.length === 0) {
      addToast("Please select at least one billing staff member.", 'error'); 
      return;
    }

    if (selectedDepartment === 'behavioralHealth' && selectedBehavioralHealthIds.length === 0) {
      addToast("Please select at least one behavioral health staff member.", 'error'); 
      return;
    }
    
    if (!isVacation && !clinicTypeId) {
      addToast("Please select a building for a non-vacation shift.", 'error'); 
      return;
    }
    
    if (new Date(currentEndDate) < new Date(currentStartDate)) {
      addToast("End date cannot be before start date.", 'error'); 
      return;
    }

    setIsSubmitting(true);
    try {
      const baseShiftData = {
        providerId: selectedDepartment === 'providers' ? providerId : undefined,
        clinicTypeId: isVacation ? undefined : clinicTypeId,
        medicalAssistantIds: selectedDepartment === 'providers' ? selectedMAIds : (selectedDepartment === 'medicalAssistants' ? selectedMAIds : []),
        frontStaffIds: selectedDepartment === 'frontStaff' ? selectedFrontStaffIds : [],
        billingIds: selectedDepartment === 'billing' ? selectedBillingIds : [],
        behavioralHealthIds: selectedDepartment === 'behavioralHealth' ? selectedBehavioralHealthIds : [],
        assignedToProviderId: selectedDepartment === 'medicalAssistants' ? (assignedToProviderId || undefined) : undefined,
        startDate: currentStartDate,
        endDate: currentEndDate,
        startTime: sanitizedStartTime,
        endTime: sanitizedEndTime,
        isVacation,
        notes: notes.trim() || undefined,
        recurringRule: currentRecurringRule?.frequency === RecurringFrequency.NONE ? undefined : currentRecurringRule,
        createdByUserId: currentUser?.id,
      };

      if (editMode === 'singleInstance' && seriesOriginalShift && instanceDate) {
        const newShift = await addShift(baseShiftData, true);
        if (newShift) {
          addToast('Exception shift created successfully', 'success');
        }
      } else if (editMode === 'entireSeries' && shift) {
        const updatedShift: Shift = {
          ...shift,
          ...baseShiftData,
          updatedAt: new Date().toISOString(),
        };
        await updateShift(updatedShift);
        addToast('Recurring shift series updated successfully', 'success');
      } else if (editMode === 'directException' && shift) {
        const updatedShift: Shift = {
          ...shift,
          ...baseShiftData,
          recurringRule: undefined,
          updatedAt: new Date().toISOString(),
        };
        await updateShift(updatedShift);
        addToast('Shift updated successfully', 'success');
      } else if (shift) {
        const updatedShift: Shift = {
          ...shift,
          ...baseShiftData,
          updatedAt: new Date().toISOString(),
        };
        await updateShift(updatedShift);
        addToast('Shift updated successfully', 'success');
      } else {
        const newShift = await addShift(baseShiftData);
        if (newShift) {
          addToast('Shift created successfully', 'success');
        }
      }
      onClose();
    } catch (error) {
      console.error("Error saving shift:", error);
      addToast(`Error saving shift: ${error instanceof Error ? error.message : "Unknown error"}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDuplicate = async () => {
    if (!canEdit) {
        addToast("You don't have permission to duplicate shifts.", 'error');
        return;
    }
    setIsSubmitting(true);
    try {
      const formData = {
          providerId,
          clinicTypeId: isVacation ? undefined : clinicTypeId,
          medicalAssistantIds: selectedMAIds, // Duplicate MAs
          startDate: currentStartDate,
          endDate: currentEndDate,
          startTime: isVacation ? undefined : startTime,
          endTime: isVacation ? undefined : endTime,
          isVacation,
          notes: notes.trim(),
          createdByUserId: currentUser?.id,
      };

      let dataForAddShift: Omit<Shift, 'id' | 'createdAt' | 'updatedAt' | 'color' | 'title' | 'seriesId'>;
      let toastMessage = "";

      if (editMode === 'entireSeries') {
          dataForAddShift = {
              ...formData,
              recurringRule: currentRecurringRule, 
          };
          toastMessage = "Series duplicated successfully as a new series.";
      } else if (editMode === 'singleInstance') {
          dataForAddShift = {
              ...formData,
              recurringRule: { frequency: RecurringFrequency.NONE }, 
          };
          toastMessage = "Instance duplicated as a new, non-recurring shift.";
      } else { 
          addToast("Duplication not applicable for this mode.", "error");
          setIsSubmitting(false);
          return;
      }

      const newDuplicatedShift = await addShift(dataForAddShift, false); 
      if (newDuplicatedShift) {
          addToast(toastMessage, 'success');
          onClose(); 
      } else {
          addToast("Failed to duplicate shift.", 'error');
      }
    } catch (error) {
        console.error("Error duplicating shift:", error);
        addToast(`Error duplicating shift: ${error instanceof Error ? error.message : "Unknown error"}`, 'error');
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleDeleteShift = () => {
    if (!shift?.id || !canEdit) return;

    const shiftBeingEdited = shift;
    let confirmMessage = "";
    let action = () => {};

    if (shiftBeingEdited.isExceptionInstance) {
        confirmMessage = "Are you sure you want to delete this specific modified occurrence?";
        action = async () => {
            await deleteShift(shiftBeingEdited.id);
            addToast("Occurrence deleted.", "success");
            onClose(); 
        };
    } else if (shiftBeingEdited.recurringRule && shiftBeingEdited.recurringRule.frequency !== RecurringFrequency.NONE) {
        confirmMessage = "This is a recurring shift. Are you sure you want to delete the entire series and all its occurrences/exceptions?";
        action = async () => {
            await deleteShift(shiftBeingEdited.id, shiftBeingEdited.seriesId || shiftBeingEdited.id, true);
            addToast("Recurring series deleted.", "success");
            onClose(); 
        };
    } else { 
        confirmMessage = "Are you sure you want to delete this shift?";
        action = async () => {
            await deleteShift(shiftBeingEdited.id);
            addToast("Shift deleted.", "success");
            onClose(); 
        };
    }

    openModal('CONFIRMATION_MODAL', {
        title: 'Confirm Deletion',
        message: confirmMessage,
        onConfirm: action,
        confirmText: 'Delete',
        confirmButtonClass: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
    });
  };
  
  useEffect(() => {
    if (isVacation) {
      setClinicTypeId(undefined);
      setSelectedMAIds([]); // Clear MAs if vacation
    }
  }, [isVacation]);

  useEffect(() => { 
    if (new Date(currentEndDate) < new Date(currentStartDate)) setEndDate(currentStartDate);
  }, [currentStartDate, currentEndDate]);

  const getButtonText = () => {
    if (isSubmitting) return editMode === 'singleInstance' ? 'Saving...' : (shift?.id ? 'Updating...' : 'Creating...');
    if (editMode === 'singleInstance') return 'Save Changes for This Instance';
    if (shift?.id) return 'Update Shift';
    return 'Create Shift';
  }

  const getDuplicateButtonText = () => {
    if (isSubmitting) return 'Duplicating...';
    if (editMode === 'singleInstance') return 'Duplicate This Instance';
    if (editMode === 'entireSeries') return 'Duplicate This Series';
    return ''; 
  }

  const showDuplicateButton = canEdit && (editMode === 'singleInstance' || editMode === 'entireSeries');
  const showDeleteButton = canEdit && shift?.id;


  return (
    <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6 max-h-[80vh] overflow-y-auto p-1">
      {formConflictWarning && (
        <div className="p-3 mb-4 text-sm text-yellow-700 bg-yellow-100 border border-yellow-300 rounded-md flex items-center space-x-2" role="alert">
          <WarningIcon className="h-5 w-5 text-yellow-600 flex-shrink-0" />
          <span>{formConflictWarning}</span>
        </div>
      )}
      {/* Department Selection */}
      <div>
        <label htmlFor="department" className="block text-sm font-medium text-gray-700">Department</label>
        <select 
          id="department" 
          value={selectedDepartment} 
          onChange={(e) => handleDepartmentChange(e.target.value)} 
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-gray-50 border-2 border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:bg-white sm:text-sm rounded-md disabled:bg-gray-100 disabled:text-gray-500" 
          required 
          disabled={isSubmitting}
        >
          <option value="" disabled>Select Department</option>
          <option value="providers">Providers</option>
          <option value="medicalAssistants">Medical Assistants</option>
          <option value="frontStaff">Front Staff</option>
          <option value="billing">Billing</option>
          <option value="behavioralHealth">Behavioral Health</option>
        </select>
      </div>

      {/* Provider Selection - Only for Providers department */}
      {selectedDepartment === 'providers' && (
        <div>
          <label htmlFor="provider" className="block text-sm font-medium text-gray-700">Provider</label>
          <select id="provider" value={providerId} onChange={(e) => setProviderId(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-gray-50 border-2 border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:bg-white sm:text-sm rounded-md disabled:bg-gray-100 disabled:text-gray-500" required disabled={isSubmitting}>
            <option value="" disabled>Select Provider</option>
            {activeProviders.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
          </select>
        </div>
      )}

      {/* Medical Assistants Selection - Only for Medical Assistants department */}
      {selectedDepartment === 'medicalAssistants' && (
        <div className="space-y-4">
          {/* MA Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Medical Assistants</label>
            <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 max-h-32 overflow-y-auto border border-gray-200 p-2 rounded-md">
              {activeMAs.map(ma => (
                <label key={ma.id} className="flex items-center space-x-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    value={ma.id}
                    checked={selectedMAIds.includes(ma.id)}
                    onChange={() => handleMASelectionChange(ma.id)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                    disabled={isSubmitting}
                  />
                  <span className="truncate" title={ma.name}>{ma.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Optional Provider Assignment */}
          <div>
            <label htmlFor="assignedProvider" className="block text-sm font-medium text-gray-700">
              Assign to Provider (Optional)
            </label>
            <select 
              id="assignedProvider" 
              value={assignedToProviderId} 
              onChange={(e) => setAssignedToProviderId(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-gray-50 border-2 border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:bg-white sm:text-sm rounded-md disabled:bg-gray-100 disabled:text-gray-500" 
              disabled={isSubmitting}
            >
              <option value="">No provider assignment (floater)</option>
              {getProvidersWithShiftsOnDate(allShifts, activeProviders, new Date(currentStartDate)).map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Only providers with shifts on {currentStartDate} are shown.
            </p>
            {process.env.NODE_ENV === 'development' && (
              <p className="mt-1 text-xs text-blue-500">
                DEBUG - currentStartDate: {currentStartDate}, Available providers: {getProvidersWithShiftsOnDate(allShifts, activeProviders, new Date(currentStartDate)).length}
              </p>
            )}
          </div>

          {/* Time Mismatch Warning */}
          {timesMismatchWarning && (
            <div className="p-3 text-sm text-amber-700 bg-amber-100 border border-amber-300 rounded-md flex items-center space-x-2" role="alert">
              <WarningIcon className="h-5 w-5 text-amber-600 flex-shrink-0" />
              <span>{timesMismatchWarning}</span>
            </div>
          )}
        </div>
      )}

      {/* Front Staff Selection */}
      {selectedDepartment === 'frontStaff' && activeFrontStaff.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Front Staff</label>
          <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 max-h-32 overflow-y-auto border border-gray-200 p-2 rounded-md">
            {activeFrontStaff.map(fs => (
              <label key={fs.id} className="flex items-center space-x-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  value={fs.id}
                  checked={selectedFrontStaffIds.includes(fs.id)}
                  onChange={() => handleFrontStaffSelectionChange(fs.id)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                  disabled={isSubmitting}
                />
                <span className="truncate" title={fs.name}>{fs.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Billing Selection */}
      {selectedDepartment === 'billing' && activeBilling.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Billing</label>
          <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 max-h-32 overflow-y-auto border border-gray-200 p-2 rounded-md">
            {activeBilling.map(b => (
              <label key={b.id} className="flex items-center space-x-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  value={b.id}
                  checked={selectedBillingIds.includes(b.id)}
                  onChange={() => handleBillingSelectionChange(b.id)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                  disabled={isSubmitting}
                />
                <span className="truncate" title={b.name}>{b.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Behavioral Health Selection */}
      {selectedDepartment === 'behavioralHealth' && activeBehavioralHealth.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Behavioral Health</label>
          <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 max-h-32 overflow-y-auto border border-gray-200 p-2 rounded-md">
            {activeBehavioralHealth.map(bh => (
              <label key={bh.id} className="flex items-center space-x-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  value={bh.id}
                  checked={selectedBehavioralHealthIds.includes(bh.id)}
                  onChange={() => handleBehavioralHealthSelectionChange(bh.id)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                  disabled={isSubmitting}
                />
                <span className="truncate" title={bh.name}>{bh.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center">
        <input id="isVacation" type="checkbox" checked={isVacation} onChange={(e) => setIsVacation(e.target.checked)} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50" disabled={isSubmitting}/>
        <label htmlFor="isVacation" className="ml-2 block text-sm text-gray-900">This is a vacation / time-off</label>
      </div>

      {!isVacation && (
        <>
          <div>
            <label htmlFor="clinicType" className="block text-sm font-medium text-gray-700">Building</label>
            <select id="clinicType" value={clinicTypeId || ''} onChange={(e) => setClinicTypeId(e.target.value || undefined)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-gray-50 border-2 border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:bg-white sm:text-sm rounded-md disabled:bg-gray-100 disabled:text-gray-500" required={!isVacation} disabled={isVacation || isSubmitting}>
              <option value="" disabled>Select Building</option>
              {activeClinics.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
            </select>
          </div>

          {/* Medical Assistants - Only show for Providers department */}
          {selectedDepartment === 'providers' && activeMAs.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Medical Assistants</label>
              <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 max-h-32 overflow-y-auto border border-gray-200 p-2 rounded-md">
                {activeMAs.map(ma => (
                  <label key={ma.id} className="flex items-center space-x-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      value={ma.id}
                      checked={selectedMAIds.includes(ma.id)}
                      onChange={() => handleMASelectionChange(ma.id)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                      disabled={isSubmitting}
                    />
                    <span className="truncate" title={ma.name}>{ma.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
          <input type="date" id="startDate" value={currentStartDate} onChange={(e) => setStartDate(e.target.value)} disabled={editMode === 'singleInstance' || isSubmitting} className="mt-1 block w-full px-3 py-2 border-2 border-gray-400 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:border-gray-300" required />
        </div>
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date</label>
          <input type="date" id="endDate" value={currentEndDate} min={currentStartDate} onChange={(e) => setEndDate(e.target.value)} disabled={editMode === 'singleInstance' || isSubmitting} className="mt-1 block w-full px-3 py-2 border-2 border-gray-400 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:border-gray-300" required />
        </div>
      </div>
      
      {!isVacation && (
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">Start Time</label>
              <input type="time" id="startTime" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="mt-1 block w-full px-3 py-2 border-2 border-gray-400 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:border-gray-300" required={!isVacation} disabled={isSubmitting}/>
            </div>
            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">End Time</label>
              <input type="time" id="endTime" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100" required={!isVacation} disabled={isSubmitting}/>
            </div>
        </div>
      )}

      {editMode !== 'singleInstance' && editMode !== 'directException' && (
        <fieldset disabled={isSubmitting}>
          <RecurringShiftFormSection
            recurringRule={currentRecurringRule}
            onRecurringRuleChange={handleRecurringRuleChange}
            baseStartDate={currentStartDate}
          />
        </fieldset>
      )}

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes</label>
        <textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100" disabled={isSubmitting}/>
      </div>

      <div className="flex justify-between items-center pt-4">
        <div>
            {showDeleteButton && (
                <button
                    type="button"
                    onClick={handleDeleteShift}
                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-400"
                    disabled={isSubmitting}
                >
                    <TrashIcon className="w-4 h-4 mr-2" />
                    Delete
                </button>
            )}
        </div>
        <div className="flex space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-70" disabled={isSubmitting}>Cancel</button>
            {showDuplicateButton && (
                <button 
                    type="button" 
                    onClick={handleDuplicate} 
                    className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-400"
                    disabled={isSubmitting}
                >
                    {isSubmitting && <SpinnerIcon className="mr-2 h-4 w-4" />}
                    {getDuplicateButtonText()}
                </button>
            )}
            <button 
              type="submit" 
              className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
              disabled={isSubmitting || !!formConflictWarning} 
              title={formConflictWarning ? "Cannot save with unresolved conflicts indicated above." : getButtonText()}
            >
              {isSubmitting && <SpinnerIcon className="mr-2 h-4 w-4" />}
              {getButtonText()}
            </button>
        </div>
      </div>
    </form>
  );
};

export default ShiftForm;