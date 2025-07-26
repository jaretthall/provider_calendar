import React, { useMemo, useContext, useCallback } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { 
  formatDateInEasternTime, getISODateString, getInitials, formatTime, generateRecurringDates
} from '../utils/dateUtils';
import { ModalContext, AppContext } from '../App';
import { usePermissions } from '../hooks/useAuth';
import { Shift, Provider, ClinicType, MedicalAssistant, FilterState, RecurringFrequency } from '../types';
import ShiftBadge from './ShiftBadge';
import VacationBar from './VacationBar';

interface DayCalendarGridProps {
  currentDate: Date;
  allShifts: Shift[];
  filters: FilterState;
  conflictingShiftIds: Set<string>;
}

// Generate hourly time slots from 6 AM to 10 PM
const TIME_SLOTS = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00', '22:00'
];

interface TimeSlotProps {
  time: string;
  day: Date;
  shiftsForSlot: Shift[];
  vacationsForDay: Shift[];
  vacationProviderInitials: string[];
  conflictingShiftIds: Set<string>;
  openShiftFormForNewShift: (date: Date) => void;
  openShiftDetailsModal: (shifts: Shift[], date: Date, title?: string) => void;
  handleVacationBarClick: (vacationShifts: Shift[], dayDate: Date) => void;
  isFirstSlot: boolean;
}

const TimeSlot: React.FC<TimeSlotProps> = ({
  time,
  day, 
  shiftsForSlot,
  vacationsForDay,
  vacationProviderInitials,
  conflictingShiftIds,
  openShiftFormForNewShift,
  openShiftDetailsModal,
  handleVacationBarClick,
  isFirstSlot
}) => {
  const { isAdmin } = usePermissions();
  const dateString = getISODateString(day);

  const { setNodeRef, isOver } = useDroppable({
    id: `droppable-time-${dateString}-${time}`,
    data: {
      type: 'dayCell',
      dateString: dateString,
      time: time,
    },
    disabled: !isAdmin,
  });

  const handleCellClick = () => {
    if (shiftsForSlot.length > 0) {
      openShiftDetailsModal(
        shiftsForSlot,
        day,
        `Shifts at ${time} on ${day.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}`
      );
    } else if (isAdmin) {
      openShiftFormForNewShift(day);
    }
  };

  const handleCellKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleCellClick();
    }
  };

  // Convert 24-hour time to 12-hour format for display
  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  return (
    <div className="flex flex-col border-r border-gray-200 min-w-[120px] flex-1">
      {/* Time header */}
      <div className="p-2 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-600 text-center sticky top-0 z-10">
        {formatTime(time)}
      </div>
      
      {/* Content area - vertical column */}
      <div 
        ref={setNodeRef}
        className={`p-2 min-h-[300px] transition-colors duration-150 ${isOver && isAdmin ? 'bg-blue-100 ring-1 ring-blue-400' : 'bg-white'} ${isAdmin ? 'cursor-pointer hover:bg-gray-50 focus:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500' : ''} flex-1`}
        onClick={handleCellClick}
        onKeyDown={handleCellKeyDown}
        tabIndex={isAdmin ? 0 : -1}
        aria-label={`Time slot ${formatTime(time)}. ${shiftsForSlot.length} shifts.`}
      >
        <div className="flex flex-col gap-2">
          {shiftsForSlot.map(shift => (
            <ShiftBadge 
              key={shift.id + (shift.isExceptionInstance ? '-ex-' : '-') + dateString} 
              shift={shift} 
              instanceDate={day}
              isConflicting={conflictingShiftIds.has(shift.id)}
              viewMode="week" // Use week view mode for detailed display
            />
          ))}
          {shiftsForSlot.length === 0 && (
            <div className="text-xs text-gray-400 italic text-center mt-4">
              No shifts
            </div>
          )}
        </div>
        
        {/* Show vacation bar only in the first time slot */}
        {isFirstSlot && vacationsForDay.length > 0 && (
          <div className="mt-auto pt-2 border-t border-gray-200">
            <div className="text-xs text-gray-600 mb-1">Vacations:</div>
            <VacationBar 
              vacationingProviderInitials={vacationProviderInitials} 
              onClick={(e) => {
                e.stopPropagation();
                handleVacationBarClick(vacationsForDay, day);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

const DayCalendarGrid: React.FC<DayCalendarGridProps> = ({ currentDate, allShifts, filters, conflictingShiftIds }) => {
  const modalContext = useContext(ModalContext);
  const appContext = useContext(AppContext);
  const { isAdmin } = usePermissions();

  if (!modalContext || !appContext) throw new Error("Context not found");
  const { openModal } = modalContext;
  const { getProviderById, getMedicalAssistantById, getFrontStaffById, getBillingById, getBehavioralHealthById } = appContext;

  // Helper function to get staff initials for any shift type
  const getStaffInitials = (shift: Shift): string | undefined => {
    if (shift.providerId) {
      const provider = getProviderById(shift.providerId);
      return getInitials(provider?.name);
    } else if (shift.frontStaffIds && shift.frontStaffIds.length > 0) {
      const frontStaff = getFrontStaffById(shift.frontStaffIds[0]);
      return getInitials(frontStaff?.name);
    } else if (shift.billingIds && shift.billingIds.length > 0) {
      const billing = getBillingById(shift.billingIds[0]);
      return getInitials(billing?.name);
    } else if (shift.behavioralHealthIds && shift.behavioralHealthIds.length > 0) {
      const behavioralHealth = getBehavioralHealthById(shift.behavioralHealthIds[0]);
      return getInitials(behavioralHealth?.name);
    }
    return undefined;
  };

  const dayData = useMemo(() => {
    const dataForDay = { shifts: [] as Shift[], vacations: [] as Shift[], vacationInitials: [] as string[] };
    
    const relevantShifts = allShifts.filter(shift => {
        // New inverted logic: show all by default, hide if selected in filters
        const providerMatch = filters.providerIds.length === 0 || !filters.providerIds.includes(shift.providerId);
        const maMatch = filters.medicalAssistantIds.length === 0 || !(shift.medicalAssistantIds && shift.medicalAssistantIds.some(maId => filters.medicalAssistantIds.includes(maId)));
        const clinicMatch = shift.isVacation || filters.clinicTypeIds.length === 0 || !(shift.clinicTypeId && filters.clinicTypeIds.includes(shift.clinicTypeId));
        
        // Check new staff types - hide if selected
        const frontStaffMatch = filters.frontStaffIds.length === 0 || !(shift.frontStaffIds && shift.frontStaffIds.some(fsId => filters.frontStaffIds.includes(fsId)));
        const billingMatch = filters.billingIds.length === 0 || !(shift.billingIds && shift.billingIds.some(bId => filters.billingIds.includes(bId)));
        const behavioralHealthMatch = filters.behavioralHealthIds.length === 0 || !(shift.behavioralHealthIds && shift.behavioralHealthIds.some(bhId => filters.behavioralHealthIds.includes(bhId)));
        
        // Vacation logic: show if showVacations is true, hide if false
        const vacationMatchOverall = shift.isVacation ? filters.showVacations : true;
        
        if (shift.isVacation) {
            if (!filters.showVacations) return false;
            // For vacation shifts, still apply provider hiding if provider is selected to be hidden
            if (filters.providerIds.length > 0 && filters.providerIds.includes(shift.providerId)) return false;
            return true;
        }
        
        return providerMatch && maMatch && clinicMatch && frontStaffMatch && billingMatch && behavioralHealthMatch && vacationMatchOverall;
    });

    relevantShifts.forEach(shift => {
      const occurrences = generateRecurringDates(shift, currentDate, currentDate, allShifts);
      occurrences.forEach((occurrenceDate: Date) => {
        if (getISODateString(occurrenceDate) === getISODateString(currentDate)) {
          const shiftForDisplay = { ...shift };
          if (shift.isVacation) {
            const initials = getStaffInitials(shift);
            if (initials && !dataForDay.vacationInitials.includes(initials)) {
              dataForDay.vacationInitials.push(initials);
            }
            if (!dataForDay.vacations.find(s => s.id === shiftForDisplay.id)) {
              dataForDay.vacations.push(shiftForDisplay);
            }
          } else {
            if (!dataForDay.shifts.find(s => s.id === shiftForDisplay.id)) {
              dataForDay.shifts.push(shiftForDisplay);
            }
          }
        }
      });

      if (shift.isExceptionInstance && shift.exceptionForDate === getISODateString(currentDate)) {
        if (shift.isVacation) {
          const initials = getStaffInitials(shift);
          if (initials && !dataForDay.vacationInitials.includes(initials)) {
            dataForDay.vacationInitials.push(initials);
          }
          if (!dataForDay.vacations.find(s => s.id === shift.id)) {
            dataForDay.vacations.push(shift);
          }
        } else {
          if (!dataForDay.shifts.find(s => s.id === shift.id)) {
            dataForDay.shifts.push(shift);
          }
        }
      }
    });

    dataForDay.shifts.sort((a, b) => (a.startTime || "00:00").localeCompare(b.startTime || "00:00"));

    return dataForDay;
  }, [allShifts, filters, currentDate, getProviderById]);

  // Group shifts by time slots
  const shiftsByTimeSlot = useMemo(() => {
    const slotMap = new Map<string, Shift[]>();
    
    // Initialize all time slots
    TIME_SLOTS.forEach(slot => {
      slotMap.set(slot, []);
    });

    dayData.shifts.forEach(shift => {
      const startTime = shift.startTime || '09:00';
      const endTime = shift.endTime || '17:00';
      
      // Find which time slots this shift covers
      TIME_SLOTS.forEach(slot => {
        if (slot >= startTime && slot < endTime) {
          const existingShifts = slotMap.get(slot) || [];
          if (!existingShifts.find(s => s.id === shift.id)) {
            existingShifts.push(shift);
            slotMap.set(slot, existingShifts);
          }
        }
      });
    });

    return slotMap;
  }, [dayData.shifts]);

  const openShiftFormForNewShiftCb = useCallback((date: Date) => {
    if (isAdmin) {
      openModal('SHIFT_FORM', { initialDate: getISODateString(date) });
    }
  }, [isAdmin, openModal]);

  const openShiftDetailsModalCb = useCallback((shiftsToList: Shift[], dateToList: Date, title?: string) => {
     openModal('VIEW_SHIFT_DETAILS', { 
        shifts: shiftsToList, 
        date: dateToList, 
        isListView: true,
        listTitle: title || `Schedule for ${dateToList.toLocaleDateString()}`
    });
  }, [openModal]);

  const handleVacationBarClickCb = useCallback((vacationShiftsForDay: Shift[], dayDate: Date) => {
    if (!isAdmin && vacationShiftsForDay.length > 0) {
      openModal('VIEW_SHIFT_DETAILS', { shift: vacationShiftsForDay[0] });
      return;
    }

    if (vacationShiftsForDay.length === 1 && isAdmin) {
      const singleVacationShift = vacationShiftsForDay[0];
      const isRecurringVacationInstance = singleVacationShift.recurringRule && singleVacationShift.recurringRule.frequency !== RecurringFrequency.NONE;
      
      if (isRecurringVacationInstance) {
        openModal('SHIFT_FORM', { 
          shift: singleVacationShift, 
          instanceDate: getISODateString(dayDate) 
        });
      } else {
        openModal('SHIFT_FORM', { shift: singleVacationShift });
      }
    } else if (vacationShiftsForDay.length > 1) {
      openShiftDetailsModalCb(vacationShiftsForDay, dayDate, `Vacations on ${dayDate.toLocaleDateString()}`);
    }
  }, [isAdmin, openModal, openShiftDetailsModalCb]);

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      {/* Day header */}
      <div className="bg-gray-50 p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">
          {currentDate.toLocaleDateString(undefined, { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          {dayData.shifts.length} shifts scheduled
          {dayData.vacations.length > 0 && `, ${dayData.vacations.length} vacation${dayData.vacations.length === 1 ? '' : 's'}`}
        </p>
      </div>

      {/* Horizontal timeline with vertical columns */}
      <div className="overflow-x-auto max-h-[70vh]">
        <div className="flex min-w-max">
          {TIME_SLOTS.map((time, index) => (
            <TimeSlot
              key={time}
              time={time}
              day={currentDate}
              shiftsForSlot={shiftsByTimeSlot.get(time) || []}
              vacationsForDay={dayData.vacations}
              vacationProviderInitials={dayData.vacationInitials}
              conflictingShiftIds={conflictingShiftIds}
              openShiftFormForNewShift={openShiftFormForNewShiftCb}
              openShiftDetailsModal={openShiftDetailsModalCb}
              handleVacationBarClick={handleVacationBarClickCb}
              isFirstSlot={index === 0}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DayCalendarGrid; 