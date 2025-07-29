import React, { useContext } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { AppContext, ModalContext } from '../App';
import { usePermissions } from '../hooks/useAuth';
import { Shift, Provider, ClinicType, MedicalAssistant, FrontStaff, Billing, BehavioralHealth } from '../types';
import { getInitials, getISODateString, formatTime } from '../utils/dateUtils';
import { RecurringFrequency } from '../types';
import WarningIcon from './icons/WarningIcon';
import UsersIcon from './icons/UsersIcon';
import { getMAsAssignedToProviderOnDate } from '../utils/providerShiftUtils';

interface ShiftBadgeProps {
  shift: Shift;
  instanceDate: Date; 
  isConflicting?: boolean;
  viewMode?: 'month' | 'week';
}

const MAX_MA_DISPLAY_MONTH = 2; 

const ShiftBadge: React.FC<ShiftBadgeProps> = ({ shift, instanceDate, isConflicting, viewMode = 'month' }) => {
  const appContext = useContext(AppContext);
  const modalContext = useContext(ModalContext);
  const { isAdmin } = usePermissions();

  if (!appContext || !modalContext) throw new Error("Context not found");

  const { getProviderById, getClinicTypeById, getMedicalAssistantById, getFrontStaffById, getBillingById, getBehavioralHealthById, shifts: allShifts } = appContext;
  const { openModal } = modalContext;

  const dateString = getISODateString(instanceDate);

  const {attributes, listeners, setNodeRef, transform, isDragging} = useDraggable({
    id: `shift-badge-${shift.id}-${dateString}`, 
    data: {
      type: 'shift',
      shiftId: shift.id,
      instanceDateString: dateString,
    },
    disabled: !isAdmin || shift.isVacation, 
  });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    cursor: isAdmin && !shift.isVacation ? 'grab' : 'pointer',
    touchAction: 'none', 
  };


  if (shift.isVacation) return null; 

  // Determine the primary staff member for display
  let primaryStaffMember = null;
  let primaryStaffName = 'Unknown Staff';
  
  if (shift.providerId) {
    primaryStaffMember = getProviderById(shift.providerId);
    primaryStaffName = primaryStaffMember?.name || 'Provider';
  } else if (shift.frontStaffIds && shift.frontStaffIds.length > 0) {
    primaryStaffMember = getFrontStaffById(shift.frontStaffIds[0]);
    primaryStaffName = shift.frontStaffIds.length > 1 
      ? `${primaryStaffMember?.name || 'Front Staff'} +${shift.frontStaffIds.length - 1} more`
      : primaryStaffMember?.name || 'Front Staff';
  } else if (shift.billingIds && shift.billingIds.length > 0) {
    primaryStaffMember = getBillingById(shift.billingIds[0]);
    primaryStaffName = shift.billingIds.length > 1 
      ? `${primaryStaffMember?.name || 'Billing'} +${shift.billingIds.length - 1} more`
      : primaryStaffMember?.name || 'Billing';
  } else if (shift.behavioralHealthIds && shift.behavioralHealthIds.length > 0) {
    primaryStaffMember = getBehavioralHealthById(shift.behavioralHealthIds[0]);
    primaryStaffName = shift.behavioralHealthIds.length > 1 
      ? `${primaryStaffMember?.name || 'Behavioral Health'} +${shift.behavioralHealthIds.length - 1} more`
      : primaryStaffMember?.name || 'Behavioral Health';
  } else if (shift.medicalAssistantIds && shift.medicalAssistantIds.length > 0) {
    // This handles standalone MA shifts (not assigned to providers)
    primaryStaffMember = getMedicalAssistantById(shift.medicalAssistantIds[0]);
    primaryStaffName = shift.medicalAssistantIds.length > 1 
      ? `${primaryStaffMember?.name || 'Medical Assistant'} +${shift.medicalAssistantIds.length - 1} more`
      : primaryStaffMember?.name || 'Medical Assistant';
  }
  
  const shiftColor = primaryStaffMember?.color || shift.color || 'bg-gray-500';
  
  // For provider shifts, get MAs assigned to work with this provider
  // For other shift types, no MA badges are shown (they have their own shifts)
  let assignedMAs: MedicalAssistant[] = [];
  if (shift.providerId) {
    const assignedMAShifts = getMAsAssignedToProviderOnDate(allShifts, shift.providerId, instanceDate);
    console.log(`🔍 ShiftBadge Debug for provider ${shift.providerId} on ${getISODateString(instanceDate)}:`, {
      assignedMAShifts: assignedMAShifts.length,
      maIds: assignedMAShifts.flatMap(s => s.medicalAssistantIds || [])
    });
    assignedMAs = assignedMAShifts
      .flatMap(maShift => maShift.medicalAssistantIds || [])
      .map(id => {
        const ma = getMedicalAssistantById(id);
        if (!ma) console.log(`❌ Could not find MA with ID: ${id}`);
        return ma;
      })
      .filter(ma => ma !== undefined) as MedicalAssistant[];
    if (assignedMAs.length > 0) {
      console.log(`✅ ShiftBadge found ${assignedMAs.length} MAs:`, assignedMAs.map(ma => ma.name));
    }
  }

  // For MA shifts, get the assigned provider information
  let assignedProvider: Provider | undefined;
  if (shift.medicalAssistantIds && shift.medicalAssistantIds.length > 0 && shift.assignedToProviderId) {
    assignedProvider = getProviderById(shift.assignedToProviderId);
    console.log(`🔍 MA shift assigned to provider:`, {
      assignedToProviderId: shift.assignedToProviderId,
      providerName: assignedProvider?.name
    });
  }
  const clinic = shift.clinicTypeId ? getClinicTypeById(shift.clinicTypeId) : undefined;

  let tooltipText = `${primaryStaffName}`; // Use full name for tooltip regardless of view
  if (clinic) tooltipText += ` @ ${clinic.name}`;
  if (assignedMAs.length > 0) {
    tooltipText += `\nMAs: ${assignedMAs.map(ma => ma.name).join(', ')}`;
  }
  if (assignedProvider) {
    tooltipText += `\nWorking with: ${assignedProvider.name}`;
  }
  if (shift.startTime && shift.endTime) {
    tooltipText += `\nTime: ${formatTime(shift.startTime)} - ${formatTime(shift.endTime)}`;
  }
  if (isConflicting) {
    tooltipText += '\n(CONFLICTING)';
  }
  if (shift.notes) {
    tooltipText += `\nNotes: ${shift.notes}`;
  }
  
  let ariaLabelText = `Shift for ${primaryStaffName}`;
  if (clinic) ariaLabelText += ` at ${clinic.name}`;
  if (assignedMAs.length > 0) {
    ariaLabelText += ` with Medical Assistants: ${assignedMAs.map(ma => ma.name).join(', ')}`;
  }
  if (assignedProvider) {
    ariaLabelText += ` working with Provider: ${assignedProvider.name}`;
  }
  ariaLabelText += ` on ${instanceDate.toLocaleDateString()}`;
  if (shift.startTime && shift.endTime) {
    ariaLabelText += ` from ${formatTime(shift.startTime)} to ${formatTime(shift.endTime)}.`;
  }
  if (isConflicting) {
    ariaLabelText += ' Warning: This shift has a conflict.';
  }
  if (isDragging) {
    ariaLabelText += ' (Dragging)';
  }


  const handleClick = (e: React.MouseEvent | React.KeyboardEvent) => {
    if (isDragging) return; 
    e.stopPropagation(); 
    
    console.log(`🔍 SHIFT CLICKED: ${shift.id} on ${dateString}`, {
      providerId: shift.providerId,
      behavioralHealthIds: shift.behavioralHealthIds,
      frontStaffIds: shift.frontStaffIds,
      primaryStaffName,
      shiftData: shift
    });
    
    let modalProps: any = { shift };

    if (isAdmin) {
      if (shift.isExceptionInstance) {
        modalProps.editMode = 'directException';
      } else if (shift.recurringRule && shift.recurringRule.frequency !== RecurringFrequency.NONE) {
        modalProps.instanceDate = dateString;
      } else {
        modalProps.editMode = 'direct';
      }
      openModal('SHIFT_FORM', modalProps);
    } else {
      openModal('VIEW_SHIFT_DETAILS', { shift });
    }
  };
  
  const baseClasses = `w-full text-white rounded-md hover:opacity-80 transition-opacity ${shiftColor} relative ${isDragging ? 'shadow-2xl z-50' : ''}`;

  if (viewMode === 'week') {
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...(isAdmin && !shift.isVacation ? listeners : {})}
        onClick={handleClick}
        title={tooltipText}
        className={`${baseClasses} p-1.5 text-[0.65rem] leading-tight flex flex-col items-start space-y-0.5`}
        aria-label={ariaLabelText}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (!isDragging && (e.key === 'Enter' || e.key === ' ')) {
            handleClick(e);
          }
        }}
      >
        <p className="font-semibold text-[0.7rem] truncate w-full">{primaryStaffName}</p>
        {clinic && <p className="truncate w-full text-white/90">@ {clinic.name}</p>}
        {shift.startTime && shift.endTime && (
            <p className="text-white/80 text-[0.6rem]">
                {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
            </p>
        )}
        {assignedMAs.length > 0 && (
          <div className="flex items-center space-x-1 w-full truncate text-white/80 mt-0.5">
            <UsersIcon className="h-2.5 w-2.5 flex-shrink-0 opacity-70" aria-hidden="true" />
            <span className="truncate" title={`MAs: ${assignedMAs.map(ma => ma.name).join(', ')}`}>
              {assignedMAs.map(ma => ma.name).join(', ')}
            </span>
          </div>
        )}
        {assignedProvider && (
          <div className="flex items-center space-x-1 w-full truncate text-white/80 mt-0.5">
            <svg className="h-2.5 w-2.5 flex-shrink-0 opacity-70" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            <span className="truncate" title={`Working with: ${assignedProvider.name}`}>
              w/ {assignedProvider.name}
            </span>
          </div>
        )}
        {isConflicting && (
          <span className="absolute top-1 right-1" title="Conflicting Shift">
            <WarningIcon className="h-3 w-3 text-yellow-300" />
          </span>
        )}
      </div>
    );
  }

  // Month View (default)
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...(isAdmin && !shift.isVacation ? listeners : {})} 
      onClick={handleClick}
      title={tooltipText}
      className={`${baseClasses} h-full flex flex-col justify-center text-[0.6rem] sm:text-xs font-semibold p-0.5 leading-none`}
      aria-label={ariaLabelText}
      role="button" 
      tabIndex={0} 
      onKeyDown={(e) => { 
        if (!isDragging && (e.key === 'Enter' || e.key === ' ')) {
          handleClick(e); 
        }
      }}
    >
      <div className="flex items-center justify-center w-full">
        <span className="truncate flex-shrink min-w-0">{getInitials(primaryStaffName)}</span>
      </div>
      {assignedMAs.length > 0 && (
        <div className="flex items-center justify-center mt-0.5 space-x-0.5 flex-shrink-0">
          {assignedMAs.slice(0, MAX_MA_DISPLAY_MONTH).map(ma => (
            <div 
              key={ma.id}
              title={ma.name}
              className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full flex items-center justify-center text-[0.5rem] sm:text-[0.6rem] ${ma.color} border border-white/50`}
              style={{ color: 'white' }} 
            >
              {getInitials(ma.name)[0]}
            </div>
          ))}
          {assignedMAs.length > MAX_MA_DISPLAY_MONTH && (
            <span className="text-[0.5rem] sm:text-[0.6rem] ml-0.5 opacity-80">+{assignedMAs.length - MAX_MA_DISPLAY_MONTH}</span>
          )}
        </div>
      )}
      {isConflicting && (
        <span className="absolute top-0.5 right-0.5" title="Conflicting Shift">
          <WarningIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-yellow-300" />
        </span>
      )}
    </div>
  );
};

export default ShiftBadge;