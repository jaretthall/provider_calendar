import React, { useMemo, useContext, useCallback } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Shift, FilterState, RecurringFrequency, MedicalAssistant } from '../types'; // Added MedicalAssistant type
import { DAYS_OF_WEEK } from '../constants';
import { getISODateString, generateRecurringDates, addDays, getWeekDays, getInitials, getTodayInEasternTime } from '../utils/dateUtils';
import ShiftBadge from './ShiftBadge';
import VacationBar from './VacationBar';
import { ModalContext, AppContext } from '../App';
import { usePermissions } from '../hooks/useAuth';

interface WeeklyCalendarGridProps {
  currentDate: Date;
  allShifts: Shift[];
  filters: FilterState;
  conflictingShiftIds: Set<string>;
  weekStartsOn: 0 | 1; // 0 for Sunday, 1 for Monday
}

interface WeeklyDayColumnProps {
  day: Date;
  isToday: boolean;
  shiftsForDay: Shift[];
  vacationsForDay: Shift[];
  vacationProviderInitials: string[];
  conflictingShiftIds: Set<string>;
  openShiftFormForNewShift: (date: Date) => void;
  openShiftDetailsModal: (shifts: Shift[], date: Date, title?: string) => void;
  handleVacationBarClick: (vacationShifts: Shift[], dayDate: Date) => void;
}

const WeeklyDayColumn: React.FC<WeeklyDayColumnProps> = ({
  day,
  isToday,
  shiftsForDay,
  vacationsForDay,
  vacationProviderInitials,
  conflictingShiftIds,
  openShiftFormForNewShift,
  openShiftDetailsModal,
  handleVacationBarClick,
}) => {
  const { isAdmin } = usePermissions();
  const dateString = getISODateString(day);

  const { setNodeRef, isOver } = useDroppable({
    id: `droppable-day-${dateString}`, // Ensure unique ID for droppable
    data: {
      type: 'dayCell',
      dateString: dateString,
    },
    disabled: !isAdmin,
  });

  const handleCellClick = () => {
    if (shiftsForDay.length > 0 || vacationsForDay.length > 0) {
      openShiftDetailsModal(
        [...shiftsForDay, ...vacationsForDay], 
        day, 
        `Full Schedule for ${day.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}`
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

  return (
    <div 
      ref={setNodeRef}
      className={`border-r border-gray-200 p-1.5 flex flex-col space-y-1.5 min-h-[60vh] transition-colors duration-150 ${isToday ? 'bg-blue-50' : 'bg-white'} ${isOver && isAdmin ? 'bg-blue-100 ring-1 ring-blue-400' : ''} ${isAdmin ? 'cursor-pointer hover:bg-gray-50 focus:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500' : ''}`}
      onClick={handleCellClick}
      onKeyDown={handleCellKeyDown}
      tabIndex={isAdmin ? 0 : -1}
      aria-label={`Schedule for ${day.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}. ${shiftsForDay.length} shifts, ${vacationsForDay.length} vacations.`}
      aria-current={isToday ? "date" : undefined}
    >
      {shiftsForDay.map(s => (
        <ShiftBadge 
            key={s.id + (s.isExceptionInstance ? '-ex-' : '-') + dateString} 
            shift={s} 
            instanceDate={day}
            isConflicting={conflictingShiftIds.has(s.id)}
            viewMode="week"
        />
      ))}
      {shiftsForDay.length === 0 && vacationsForDay.length === 0 && (
          <div className="flex-grow flex items-center justify-center text-xs text-gray-400">
            No shifts
          </div>
      )}
      {vacationsForDay.length > 0 && (
        <div className="mt-auto pt-1"> {/* Push vacation bar to bottom */}
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
  );
};


const WeeklyCalendarGrid: React.FC<WeeklyCalendarGridProps> = ({ currentDate, allShifts, filters, conflictingShiftIds, weekStartsOn }) => {
  const modalContext = useContext(ModalContext);
  const appContext = useContext(AppContext);
  const { isAdmin } = usePermissions();

  if (!modalContext || !appContext) throw new Error("Context not found");
  const { openModal } = modalContext;

  // Helper function to get staff initials for any shift type
  const getStaffInitials = (shift: Shift): string | undefined => {
    if (shift.providerId) {
      const provider = appContext.getProviderById(shift.providerId);
      return getInitials(provider?.name);
    } else if (shift.frontStaffIds && shift.frontStaffIds.length > 0) {
      const frontStaff = appContext.getFrontStaffById(shift.frontStaffIds[0]);
      return getInitials(frontStaff?.name);
    } else if (shift.billingIds && shift.billingIds.length > 0) {
      const billing = appContext.getBillingById(shift.billingIds[0]);
      return getInitials(billing?.name);
    } else if (shift.behavioralHealthIds && shift.behavioralHealthIds.length > 0) {
      const behavioralHealth = appContext.getBehavioralHealthById(shift.behavioralHealthIds[0]);
      return getInitials(behavioralHealth?.name);
    }
    return undefined;
  };

  const weekDays = useMemo(() => getWeekDays(currentDate, weekStartsOn), [currentDate, weekStartsOn]);

  const weeklyData = useMemo(() => {
    const dataByDay = new Map<string, { shifts: Shift[], vacations: Shift[], vacationInitials: string[] }>();
    
    weekDays.forEach(day => {
      dataByDay.set(getISODateString(day), { shifts: [], vacations: [], vacationInitials: [] });
    });

    const relevantShifts = allShifts.filter(shift => {
        // Logic: show only items that are checked (in the filter arrays), or show all if nothing is selected
        const providerMatch = filters.providerIds.length === 0 || (shift.providerId && filters.providerIds.includes(shift.providerId));
        const maMatch = filters.medicalAssistantIds.length === 0 || (shift.medicalAssistantIds && shift.medicalAssistantIds.some(maId => filters.medicalAssistantIds.includes(maId)));
        const clinicMatch = shift.isVacation || filters.clinicTypeIds.length === 0 || (shift.clinicTypeId && filters.clinicTypeIds.includes(shift.clinicTypeId));
        
        // Check new staff types - show only if selected
        const frontStaffMatch = filters.frontStaffIds.length === 0 || (shift.frontStaffIds && shift.frontStaffIds.some(fsId => filters.frontStaffIds.includes(fsId)));
        const billingMatch = filters.billingIds.length === 0 || (shift.billingIds && shift.billingIds.some(bId => filters.billingIds.includes(bId)));
        const behavioralHealthMatch = filters.behavioralHealthIds.length === 0 || (shift.behavioralHealthIds && shift.behavioralHealthIds.some(bhId => filters.behavioralHealthIds.includes(bhId)));
        
        // Vacation logic: show if showVacations is true, hide if false
        const vacationMatchOverall = shift.isVacation ? filters.showVacations : true;
        
        if (shift.isVacation) {
            if (!filters.showVacations) return false;
            // For vacation shifts, apply provider filter if provider is selected
            if (filters.providerIds.length > 0 && shift.providerId && !filters.providerIds.includes(shift.providerId)) return false;
            return true;
        }
        
        return providerMatch && maMatch && clinicMatch && frontStaffMatch && billingMatch && behavioralHealthMatch && vacationMatchOverall;
    });

    relevantShifts.forEach(shift => {
      const occurrences = generateRecurringDates(shift, weekDays[0], weekDays[6], allShifts);
      occurrences.forEach(occurrenceDate => {
        const dateString = getISODateString(occurrenceDate);
        const dayData = dataByDay.get(dateString);
        if (dayData) {
          const shiftForDisplay = { ...shift }; 
          if (shift.isVacation) {
            const initials = getStaffInitials(shift);
            if (initials && !dayData.vacationInitials.includes(initials)) {
              dayData.vacationInitials.push(initials);
            }
            if (!dayData.vacations.find(s => s.id === shiftForDisplay.id && s.startDate === getISODateString(occurrenceDate))) {
                dayData.vacations.push({...shiftForDisplay, startDate: getISODateString(occurrenceDate), endDate: getISODateString(occurrenceDate) });
            }
          } else {
             if (!dayData.shifts.find(s => s.id === shiftForDisplay.id && s.startDate === getISODateString(occurrenceDate))) {
                dayData.shifts.push({...shiftForDisplay, startDate: getISODateString(occurrenceDate), endDate: getISODateString(occurrenceDate) });
            }
          }
        }
      });

       if (shift.isExceptionInstance && shift.exceptionForDate) {
            const dateString = shift.exceptionForDate;
            const dayData = dataByDay.get(dateString);
            if (dayData) {
                if (shift.isVacation) {
                    const initials = getStaffInitials(shift);
                    if (initials && !dayData.vacationInitials.includes(initials)) {
                        dayData.vacationInitials.push(initials);
                    }
                     if (!dayData.vacations.find(s => s.id === shift.id)) { dayData.vacations.push(shift); }
                } else {
                    if (!dayData.shifts.find(s => s.id === shift.id)) { dayData.shifts.push(shift); }
                }
            }
        }
    });

    dataByDay.forEach(dayData => {
      dayData.shifts.sort((a, b) => (a.startTime || "00:00").localeCompare(b.startTime || "00:00"));
        const uniqueNonVacationShifts = new Map<string, Shift>();
        dayData.shifts.forEach(s => {
          const key = `${s.id}-${s.startDate}`; 
          if (!uniqueNonVacationShifts.has(key)) {
            uniqueNonVacationShifts.set(key, s);
          }
        });
        dayData.shifts = Array.from(uniqueNonVacationShifts.values());
        
        const uniqueVacationShifts = new Map<string, Shift>();
        dayData.vacations.forEach(s => {
          const key = `${s.id}-${s.startDate}`;
          if (!uniqueVacationShifts.has(key)) {
            uniqueVacationShifts.set(key, s);
          }
        });
        dayData.vacations = Array.from(uniqueVacationShifts.values());
    });

    return dataByDay;
  }, [allShifts, filters, weekDays, appContext]);


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


  const todayString = getISODateString(getTodayInEasternTime());
  const orderedDaysOfWeek = [...DAYS_OF_WEEK.slice(weekStartsOn), ...DAYS_OF_WEEK.slice(0, weekStartsOn)];

  return (
    <div className="bg-white shadow-lg rounded-lg p-1 md:p-2">
      <div className="grid grid-cols-7 gap-px border-l border-t border-gray-200" role="grid">
        {weekDays.map((day, index) => (
          <div key={index} role="columnheader" className="py-2 text-center font-semibold text-xs sm:text-sm text-gray-600 bg-gray-50 border-r border-b border-gray-200">
            <div>{orderedDaysOfWeek[index]}</div>
            <div className={`mt-0.5 text-gray-500 ${getISODateString(day) === todayString ? 'text-blue-600 font-bold' : ''}`}>
              {day.getDate()}
            </div>
          </div>
        ))}
      
        {weekDays.map(day => {
          const dateString = getISODateString(day);
          const dayData = weeklyData.get(dateString) || { shifts: [], vacations: [], vacationInitials: [] };
          return (
            <WeeklyDayColumn
              key={dateString}
              day={day}
              isToday={dateString === todayString}
              shiftsForDay={dayData.shifts}
              vacationsForDay={dayData.vacations}
              vacationProviderInitials={dayData.vacationInitials}
              conflictingShiftIds={conflictingShiftIds}
              openShiftFormForNewShift={openShiftFormForNewShiftCb}
              openShiftDetailsModal={openShiftDetailsModalCb}
              handleVacationBarClick={handleVacationBarClickCb}
            />
          );
        })}
      </div>
    </div>
  );
};

export default WeeklyCalendarGrid;