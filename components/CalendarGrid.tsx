import React, { useMemo, useContext, useCallback } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Shift, FilterState, Provider, RecurringFrequency } from '../types';
import { DAYS_OF_WEEK } from '../constants';
import { getISODateString, generateRecurringDates, addDays, getInitials, getTodayInEasternTime } from '../utils/dateUtils';
import ShiftBadge from './ShiftBadge';
import VacationBar from './VacationBar';
import { ModalContext, AppContext } from '../App';
import { usePermissions } from '../hooks/useAuth';

interface CalendarGridProps {
  currentDate: Date;
  allShifts: Shift[];
  filters: FilterState;
  conflictingShiftIds: Set<string>;
  weekStartsOn: 0 | 1; // 0 for Sunday, 1 for Monday
}

const MAX_SHIFTS_DISPLAYED = 12;

interface DailyShiftMapEntry {
  nonVacationShifts: Shift[];
  vacationShifts: Shift[]; 
  vacationProviderInitials: string[];
}

interface CalendarDayCellProps {
  day: Date | null;
  isCurrentMonth: boolean;
  isToday: boolean;
  dayData: DailyShiftMapEntry;
  conflictingShiftIds: Set<string>;
  openShiftFormForNewShift: (date: Date) => void;
  openShiftDetailsModal: (shifts: Shift[], date: Date, title?: string) => void;
  handleVacationBarClick: (vacationShifts: Shift[], dayDate: Date) => void;
  personnelCount: number;
}

const CalendarDayCell: React.FC<CalendarDayCellProps> = ({
  day,
  isCurrentMonth,
  isToday,
  dayData,
  conflictingShiftIds,
  openShiftFormForNewShift,
  openShiftDetailsModal,
  handleVacationBarClick,
  personnelCount
}) => {
  const { isAdmin } = usePermissions();

  if (!day) return <div role="gridcell" className="border-r border-b border-gray-200 bg-gray-50 min-h-[6rem] sm:min-h-[5rem]"></div>;
  
  const dateString = getISODateString(day);
  const { nonVacationShifts, vacationShifts, vacationProviderInitials } = dayData;

  const { setNodeRef, isOver } = useDroppable({
    id: `droppable-day-${dateString}`,
    data: {
      type: 'dayCell',
      dateString: dateString,
    },
    disabled: !isAdmin || !isCurrentMonth, // Only admins can drop on current month days
  });

  const shiftsToDisplay = nonVacationShifts.slice(0, MAX_SHIFTS_DISPLAYED);
  const remainingShiftsCount = nonVacationShifts.length - MAX_SHIFTS_DISPLAYED;
  
  const cellClasses = [
    "border-r border-b border-gray-200 relative flex flex-col transition-colors duration-150 min-h-[5.5rem] sm:min-h-[4.5rem]",
    isCurrentMonth ? 'bg-white' : 'bg-gray-50 text-gray-400',
    isAdmin && isCurrentMonth ? 'focus:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset' : '',
    isOver && isAdmin && isCurrentMonth ? 'bg-blue-100 ring-2 ring-blue-500 ring-inset' : '', // Highlight on drop over
    dayData.nonVacationShifts.length > 0 || dayData.vacationShifts.length > 0 || (isAdmin && isCurrentMonth) ? 'cursor-pointer hover:bg-gray-100' : '',
  ].filter(Boolean).join(' ');


  const handleCellClick = () => {
    if (!isCurrentMonth) return;
    if (dayData.nonVacationShifts.length > 0 || dayData.vacationShifts.length > 0) {
      openShiftDetailsModal(
        [...dayData.nonVacationShifts, ...dayData.vacationShifts], 
        day, 
        `Full Schedule for ${day.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`
      );
    } else if (isAdmin) {
      openShiftFormForNewShift(day);
    }
  };

  const handleCellKeyDown = (event: React.KeyboardEvent) => {
    if (!isCurrentMonth) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleCellClick();
    }
  };
  
  return (
    <div
      ref={setNodeRef}
      key={dateString}
      role="gridcell"
      aria-label={`${day.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}. ${personnelCount} providers. ${nonVacationShifts.length} shifts, ${vacationShifts.length} vacations.`}
      tabIndex={isCurrentMonth && isAdmin ? 0 : -1}
      className={cellClasses}
      onClick={handleCellClick}
      onKeyDown={handleCellKeyDown}
      aria-current={isToday ? "date" : undefined}
    >
      <div className={`p-1 text-xs sm:text-sm font-medium self-start mb-0.5 flex items-center ${isToday ? 'bg-blue-500 text-white rounded-full h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center' : (isCurrentMonth ? 'text-gray-700' : 'text-gray-400')}`}>
        {day.getDate()}
         {isCurrentMonth && personnelCount > 0 && !isToday && (
           <span className="ml-1 text-gray-500 text-[0.6rem] sm:text-[0.65rem]">({personnelCount}P)</span>
         )}
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-6 grid-rows-4 sm:grid-rows-2 gap-0.5 px-0.5 flex-grow">
        {shiftsToDisplay.map(s => (
          <ShiftBadge 
            key={s.id + (s.isExceptionInstance ? '-ex' : '') + dateString} 
            shift={s} 
            instanceDate={day}
            isConflicting={conflictingShiftIds.has(s.id)}
            viewMode="month"
          />
        ))}
         {Array(MAX_SHIFTS_DISPLAYED - shiftsToDisplay.length).fill(0).map((_, i) => (
          <div key={`empty-slot-${i}`} className="w-full h-full rounded-sm"></div> 
        ))}
      </div>
       {remainingShiftsCount > 0 && (
        <button 
             className="text-center text-[0.6rem] sm:text-xs text-blue-600 py-0.5 cursor-pointer hover:underline focus:outline-none focus:ring-1 focus:ring-blue-500 rounded-sm" 
             onClick={(e) => { 
                 e.stopPropagation(); 
                 openShiftDetailsModal(
                    [...dayData.nonVacationShifts, ...dayData.vacationShifts], 
                    day, 
                    `Full Schedule for ${day.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`
                 );
             }}
             aria-label={`View ${remainingShiftsCount} more shifts for ${day.toLocaleDateString()}`}
        >
          +{remainingShiftsCount} more
        </button>
      )}
      {vacationShifts.length > 0 && (
        <VacationBar 
          vacationingProviderInitials={vacationProviderInitials} 
          onClick={(e) => {
            e.stopPropagation();
            handleVacationBarClick(vacationShifts, day);
          }}
        />
      )}
    </div>
  );
};


const CalendarGrid: React.FC<CalendarGridProps> = ({ currentDate, allShifts, filters, conflictingShiftIds, weekStartsOn }) => {
  const modalContext = useContext(ModalContext);
  const appContext = useContext(AppContext);
  const { isAdmin } = usePermissions();

  if (!modalContext || !appContext) throw new Error("Context not found");
  const { openModal } = modalContext;
  const { getProviderById } = appContext;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const orderedDayHeaders = useMemo(() => {
    const headers = [...DAYS_OF_WEEK.slice(weekStartsOn), ...DAYS_OF_WEEK.slice(0, weekStartsOn)];
    console.log('Calendar headers:', headers);
    console.log('DAYS_OF_WEEK:', DAYS_OF_WEEK);
    console.log('weekStartsOn:', weekStartsOn);
    return headers;
  }, [weekStartsOn]);

  const monthGridDays = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const grid: (Date | null)[] = [];
    
    const firstDayActual = firstDayOfMonth.getDay(); // 0 for Sun, 1 for Mon...
    const paddingDaysCount = (firstDayActual - weekStartsOn + 7) % 7;
    
    console.log('Month grid generation:', {
      year,
      month,
      firstDayOfMonth: firstDayOfMonth.toDateString(),
      lastDayOfMonth: lastDayOfMonth.toDateString(),
      firstDayActual,
      weekStartsOn,
      paddingDaysCount
    });

    for (let i = 0; i < paddingDaysCount; i++) {
      grid.push(addDays(new Date(firstDayOfMonth), -(paddingDaysCount - i)));
    }
    
    let day = new Date(firstDayOfMonth);
    while (day.getMonth() === month) {
      grid.push(new Date(day));
      day.setDate(day.getDate() + 1);
    }
    
    const totalCells = grid.length <= 35 ? 35 : 42; // Ensure 5 or 6 weeks display
    const cellsToFill = totalCells - grid.length; 
    for (let i = 1; i <= cellsToFill; i++) {
        grid.push(addDays(new Date(lastDayOfMonth), i));
    }
    
    console.log('Final grid:', {
      gridLength: grid.length,
      totalCells,
      cellsToFill,
      firstDay: grid[0]?.toDateString(),
      lastDay: grid[grid.length - 1]?.toDateString()
    });
    
    return grid;
  }, [year, month, weekStartsOn]);

  const gridStartDate = monthGridDays[0] || new Date();
  const gridEndDate = monthGridDays[monthGridDays.length - 1] || new Date();

  const dailyShiftData = useMemo(() => {
    const map = new Map<string, DailyShiftMapEntry>();

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
        const occurrences: Date[] = generateRecurringDates(shift, gridStartDate, gridEndDate, allShifts);
        
        occurrences.forEach(date => {
            const dateString = getISODateString(date);
            if (!map.has(dateString)) {
                map.set(dateString, { nonVacationShifts: [], vacationShifts: [], vacationProviderInitials: [] });
            }
            const dayData = map.get(dateString)!;
            const shiftForDisplay = { ...shift };

            if (shiftForDisplay.isVacation) {
                const provider = getProviderById(shiftForDisplay.providerId);
                const initials = getInitials(provider?.name);
                if (initials && !dayData.vacationProviderInitials.includes(initials)) {
                     dayData.vacationProviderInitials.push(initials);
                }
                if (!dayData.vacationShifts.find(s => s.id === shiftForDisplay.id && s.startDate === getISODateString(date))) { 
                    dayData.vacationShifts.push({...shiftForDisplay, startDate: getISODateString(date), endDate: getISODateString(date) });
                }
            } else {
                if (!dayData.nonVacationShifts.find(s => s.id === shiftForDisplay.id && s.startDate === getISODateString(date))) {
                   dayData.nonVacationShifts.push({...shiftForDisplay, startDate: getISODateString(date), endDate: getISODateString(date) });
                }
            }
        });

        if (shift.isExceptionInstance && shift.exceptionForDate) {
            const dateString = shift.exceptionForDate;
             if (new Date(dateString + "T00:00:00") >= gridStartDate && new Date(dateString + "T00:00:00") <= gridEndDate) {
                if (!map.has(dateString)) {
                    map.set(dateString, { nonVacationShifts: [], vacationShifts: [], vacationProviderInitials: [] });
                }
                const dayData = map.get(dateString)!;
                if (shift.isVacation) {
                    const provider = getProviderById(shift.providerId);
                    const initials = getInitials(provider?.name);
                    if (initials && !dayData.vacationProviderInitials.includes(initials)) {
                        dayData.vacationProviderInitials.push(initials);
                    }
                    if (!dayData.vacationShifts.find(s => s.id === shift.id)) {
                        dayData.vacationShifts.push(shift);
                    }
                } else {
                    if (!dayData.nonVacationShifts.find(s => s.id === shift.id)) {
                        dayData.nonVacationShifts.push(shift);
                    }
                }
            }
        }
    });

    map.forEach(dayData => {
        dayData.nonVacationShifts.sort((a, b) => (a.startTime || "00:00").localeCompare(b.startTime || "00:00"));
        const uniqueNonVacationShifts = new Map<string, Shift>();
        dayData.nonVacationShifts.forEach(s => {
          const key = `${s.id}-${s.startDate}`;
          if (!uniqueNonVacationShifts.has(key)) {
            uniqueNonVacationShifts.set(key, s);
          }
        });
        dayData.nonVacationShifts = Array.from(uniqueNonVacationShifts.values());
        
        const uniqueVacationShifts = new Map<string, Shift>();
        dayData.vacationShifts.forEach(s => {
          const key = `${s.id}-${s.startDate}`;
          if (!uniqueVacationShifts.has(key)) {
            uniqueVacationShifts.set(key, s);
          }
        });
        dayData.vacationShifts = Array.from(uniqueVacationShifts.values());
    });
    return map;
  }, [allShifts, filters, gridStartDate, gridEndDate, getProviderById]);

  const personnelCountPerDay = useMemo(() => {
    const counts = new Map<string, number>();
    dailyShiftData.forEach((dayEntry, dateString) => {
      const uniqueProviderIds = new Set<string>();
      dayEntry.nonVacationShifts.forEach(s => uniqueProviderIds.add(s.providerId));
      dayEntry.vacationShifts.forEach(s => uniqueProviderIds.add(s.providerId));
      counts.set(dateString, uniqueProviderIds.size);
    });
    return counts;
  }, [dailyShiftData]);


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
      openModal('SHIFT_FORM', { 
        shift: singleVacationShift, 
        instanceDate: getISODateString(dayDate) 
      });
    } else if (vacationShiftsForDay.length > 1) {
      openShiftDetailsModalCb(vacationShiftsForDay, dayDate, `Vacations on ${dayDate.toLocaleDateString()}`);
    }
  }, [isAdmin, openModal, openShiftDetailsModalCb]);

  const todayString = getISODateString(getTodayInEasternTime());

  return (
    <div className="bg-white shadow-lg rounded-lg p-1 md:p-2">
      <div className="grid grid-cols-7 gap-px border-l border-t border-gray-200" role="rowgroup">
        {orderedDayHeaders.map((day, index) => {
          console.log(`Rendering header ${index}:`, day);
          return (
            <div key={day} role="columnheader" className="py-2 text-center font-semibold text-xs sm:text-sm text-gray-600 bg-gray-50 border-r border-b border-gray-200">
              {day}
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-7 auto-rows-fr gap-px border-l border-gray-200 min-h-[75vh]" role="rowgroup">
        {monthGridDays.map((dayObj, index) => {
           const dateStr = dayObj ? getISODateString(dayObj) : `empty-${index}`; // Ensure unique key for empty cells
           const dayD = dayObj ? dailyShiftData.get(dateStr) || { nonVacationShifts: [], vacationShifts: [], vacationProviderInitials: [] } : { nonVacationShifts: [], vacationShifts: [], vacationProviderInitials: [] };
           const personnelC = dayObj ? personnelCountPerDay.get(dateStr) || 0 : 0;

          return (
            <CalendarDayCell
              key={dateStr}
              day={dayObj}
              isCurrentMonth={dayObj ? dayObj.getMonth() === month : false}
              isToday={dayObj ? dateStr === todayString : false}
              dayData={dayD}
              conflictingShiftIds={conflictingShiftIds}
              openShiftFormForNewShift={openShiftFormForNewShiftCb}
              openShiftDetailsModal={openShiftDetailsModalCb}
              handleVacationBarClick={handleVacationBarClickCb}
              personnelCount={personnelC}
            />
          );
        })}
      </div>
    </div>
  );
};

export default CalendarGrid;