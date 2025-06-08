import React, { useMemo, useContext, useCallback } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Shift, FilterState, RecurringFrequency, MedicalAssistant } from '../types';
import { getISODateString, generateRecurringDates, getInitials } from '../utils/dateUtils';
import ShiftBadge from './ShiftBadge';
import VacationBar from './VacationBar';
import { ModalContext, AppContext, AuthContext } from '../App';

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
  const authContext = useContext(AuthContext);
  if (!authContext) throw new Error("AuthContext not found");
  const { isAdmin } = authContext;
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
  const authContext = useContext(AuthContext);

  if (!modalContext || !appContext || !authContext) throw new Error("Context not found");
  const { openModal } = modalContext;
  const { isAdmin } = authContext;
  const { getProviderById, getMedicalAssistantById } = appContext;

  const dayData = useMemo(() => {
    const dateString = getISODateString(currentDate);
    const dayShifts: Shift[] = [];
    const dayVacations: Shift[] = [];
    const vacationInitials: string[] = [];

    const relevantShifts = allShifts.filter(shift => {
      const providerMatch = filters.providerIds.length === 0 || filters.providerIds.includes(shift.providerId);
      const maMatch = filters.medicalAssistantIds.length === 0 || (shift.medicalAssistantIds && shift.medicalAssistantIds.some(maId => filters.medicalAssistantIds.includes(maId)));
      const clinicMatch = shift.isVacation || filters.clinicTypeIds.length === 0 || (shift.clinicTypeId && filters.clinicTypeIds.includes(shift.clinicTypeId));
      const vacationMatchOverall = shift.isVacation ? filters.showVacations : true;
      
      if (shift.isVacation && filters.showVacations) {
        if (filters.providerIds.length > 0 && !filters.providerIds.includes(shift.providerId)) return false;
        return true;
      }
      return providerMatch && maMatch && clinicMatch && vacationMatchOverall;
    });

    relevantShifts.forEach(shift => {
      // Use a broader date range for generating recurring dates to ensure we catch all occurrences
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      const occurrences = generateRecurringDates(shift, startOfMonth, endOfMonth, allShifts);
      
      occurrences.forEach(occurrenceDate => {
        if (getISODateString(occurrenceDate) === dateString) {
          const shiftForDisplay = { ...shift };
          if (shift.isVacation) {
            const provider = getProviderById(shift.providerId);
            const initials = getInitials(provider?.name);
            if (initials && !vacationInitials.includes(initials)) {
              vacationInitials.push(initials);
            }
            if (!dayVacations.find(s => s.id === shiftForDisplay.id && s.startDate === getISODateString(occurrenceDate))) {
              dayVacations.push({...shiftForDisplay, startDate: getISODateString(occurrenceDate), endDate: getISODateString(occurrenceDate) });
            }
          } else {
            if (!dayShifts.find(s => s.id === shiftForDisplay.id && s.startDate === getISODateString(occurrenceDate))) {
              dayShifts.push({...shiftForDisplay, startDate: getISODateString(occurrenceDate), endDate: getISODateString(occurrenceDate) });
            }
          }
        }
      });

      if (shift.isExceptionInstance && shift.exceptionForDate === dateString) {
        if (shift.isVacation) {
          const provider = getProviderById(shift.providerId);
          const initials = getInitials(provider?.name);
          if (initials && !vacationInitials.includes(initials)) {
            vacationInitials.push(initials);
          }
          if (!dayVacations.find(s => s.id === shift.id)) { 
            dayVacations.push(shift); 
          }
        } else {
          if (!dayShifts.find(s => s.id === shift.id)) { 
            dayShifts.push(shift); 
          }
        }
      }
    });

    // Sort shifts by start time and remove duplicates
    dayShifts.sort((a, b) => (a.startTime || "00:00").localeCompare(b.startTime || "00:00"));
    
    const uniqueShifts = new Map<string, Shift>();
    dayShifts.forEach(s => {
      const key = `${s.id}-${s.startDate}`;
      if (!uniqueShifts.has(key)) {
        uniqueShifts.set(key, s);
      }
    });
    
    const uniqueVacations = new Map<string, Shift>();
    dayVacations.forEach(s => {
      const key = `${s.id}-${s.startDate}`;
      if (!uniqueVacations.has(key)) {
        uniqueVacations.set(key, s);
      }
    });

    return { 
      dayShifts: Array.from(uniqueShifts.values()), 
      dayVacations: Array.from(uniqueVacations.values()), 
      vacationInitials 
    };
  }, [allShifts, filters, currentDate, getProviderById, getMedicalAssistantById]);

  // Group shifts by time slots
  const shiftsByTimeSlot = useMemo(() => {
    const slotMap = new Map<string, Shift[]>();
    
    // Initialize all time slots
    TIME_SLOTS.forEach(slot => {
      slotMap.set(slot, []);
    });

    dayData.dayShifts.forEach(shift => {
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
  }, [dayData.dayShifts]);

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
      openModal('SHIFT_FORM', { 
        shift: singleVacationShift, 
        instanceDate: isRecurringVacationInstance ? getISODateString(dayDate) : undefined
      });
    } else if (vacationShiftsForDay.length > 0) { 
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
          {dayData.dayShifts.length} shifts scheduled
          {dayData.dayVacations.length > 0 && `, ${dayData.dayVacations.length} vacation${dayData.dayVacations.length === 1 ? '' : 's'}`}
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
              vacationsForDay={dayData.dayVacations}
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