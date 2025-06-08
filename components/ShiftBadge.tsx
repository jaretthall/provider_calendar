import React, { useContext } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Shift, MedicalAssistant, ClinicType, Provider as ProviderType } from '../types';
import { AppContext, ModalContext, AuthContext } from '../App';
import { getInitials, getISODateString, formatTime } from '../utils/dateUtils';
import { RecurringFrequency } from '../types';
import WarningIcon from './icons/WarningIcon';
import UsersIcon from './icons/UsersIcon'; 

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
  const authContext = useContext(AuthContext);

  if (!appContext || !modalContext || !authContext) throw new Error("Context not found");

  const { getProviderById, getClinicTypeById, getMedicalAssistantById } = appContext;
  const { openModal } = modalContext;
  const { isAdmin } = authContext;

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

  const provider = getProviderById(shift.providerId);
  const shiftColor = provider?.color || shift.color || 'bg-gray-500';
  const assignedMAs: MedicalAssistant[] = (shift.medicalAssistantIds || [])
    .map(id => getMedicalAssistantById(id))
    .filter(ma => ma !== undefined) as MedicalAssistant[];
  const clinic = shift.clinicTypeId ? getClinicTypeById(shift.clinicTypeId) : undefined;

  let tooltipText = `${provider?.name || 'Shift'}`; // Use full name for tooltip regardless of view
  if (clinic) tooltipText += ` @ ${clinic.name}`;
  if (assignedMAs.length > 0) {
    tooltipText += `\nMAs: ${assignedMAs.map(ma => ma.name).join(', ')}`;
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
  
  let ariaLabelText = `Shift for ${provider?.name || 'Unknown'}`;
  if (clinic) ariaLabelText += ` at ${clinic.name}`;
  if (assignedMAs.length > 0) {
    ariaLabelText += ` with Medical Assistants: ${assignedMAs.map(ma => ma.name).join(', ')}`;
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
        <p className="font-semibold text-[0.7rem] truncate w-full">{provider?.name || 'N/A Provider'}</p>
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
      className={`${baseClasses} h-full flex items-center justify-start text-[0.6rem] sm:text-xs font-semibold p-0.5 leading-none`}
      aria-label={ariaLabelText}
      role="button" 
      tabIndex={0} 
      onKeyDown={(e) => { 
        if (!isDragging && (e.key === 'Enter' || e.key === ' ')) {
          handleClick(e); 
        }
      }}
    >
      <span className="truncate flex-shrink min-w-0">{getInitials(provider?.name)}</span>
      {assignedMAs.length > 0 && (
        <div className="flex items-center ml-1 space-x-0.5 flex-shrink-0">
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