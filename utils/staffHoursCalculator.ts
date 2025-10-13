import { Shift, Provider, FrontStaff, Billing, BehavioralHealth } from '../types';
import { generateRecurringDates, getISODateString } from './dateUtils';

export interface StaffHoursReport {
  staffId: string;
  staffName: string;
  staffType: 'provider' | 'frontStaff' | 'billing' | 'behavioralHealth';
  totalHours: number;
  shifts: {
    date: string;
    startTime: string;
    endTime: string;
    hours: number;
    isVacation: boolean;
  }[];
}

export interface StaffHoursReportOptions {
  startDate: Date;
  endDate: Date;
  staffType: 'all' | 'providers' | 'frontStaff' | 'billing' | 'behavioralHealth';
  includeVacations: boolean;
}

// Calculate hours between two time strings (e.g., "09:00" and "17:00")
function calculateHours(startTime: string, endTime: string): number {
  if (!startTime || !endTime) return 0;
  
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  
  const startMinutes = startHour * 60 + startMin;
  let endMinutes = endHour * 60 + endMin;
  
  // Handle overnight shifts
  if (endMinutes < startMinutes) {
    endMinutes += 24 * 60;
  }
  
  return (endMinutes - startMinutes) / 60;
}

export function calculateStaffHours(
  shifts: Shift[],
  providers: Provider[],
  frontStaff: FrontStaff[],
  billing: Billing[],
  behavioralHealth: BehavioralHealth[],
  options: StaffHoursReportOptions
): StaffHoursReport[] {
  const reports = new Map<string, StaffHoursReport>();
  
  // Helper to add staff to reports map
  const addStaffToReports = (
    staffList: Array<{ id: string; name: string }>,
    staffType: StaffHoursReport['staffType']
  ) => {
    staffList.forEach(staff => {
      reports.set(staff.id, {
        staffId: staff.id,
        staffName: staff.name,
        staffType,
        totalHours: 0,
        shifts: []
      });
    });
  };
  
  // Initialize reports based on staff type filter
  if (options.staffType === 'all' || options.staffType === 'providers') {
    addStaffToReports(providers, 'provider');
  }
  if (options.staffType === 'all' || options.staffType === 'frontStaff') {
    addStaffToReports(frontStaff, 'frontStaff');
  }
  if (options.staffType === 'all' || options.staffType === 'billing') {
    addStaffToReports(billing, 'billing');
  }
  if (options.staffType === 'all' || options.staffType === 'behavioralHealth') {
    addStaffToReports(behavioralHealth, 'behavioralHealth');
  }
  
  // Process shifts
  shifts.forEach(shift => {
    // Skip vacation shifts if not included
    if (shift.isVacation && !options.includeVacations) return;
    
    // Generate occurrences for recurring shifts
    const occurrences = generateRecurringDates(shift, options.startDate, options.endDate, shifts);
    
    occurrences.forEach(date => {
      const dateString = getISODateString(date);
      const hours = shift.isVacation ? 0 : calculateHours(shift.startTime || '', shift.endTime || '');
      
      // Process provider shifts
      if (shift.providerId && reports.has(shift.providerId)) {
        const report = reports.get(shift.providerId)!;
        report.shifts.push({
          date: dateString,
          startTime: shift.startTime || '',
          endTime: shift.endTime || '',
          hours,
          isVacation: shift.isVacation
        });
        if (!shift.isVacation) {
          report.totalHours += hours;
        }
      }
      
      // Process standalone MA shifts (not assigned to providers in the old way)
      if (shift.medicalAssistantIds && !shift.providerId) {
        shift.medicalAssistantIds.forEach(maId => {
          if (reports.has(maId)) {
            const report = reports.get(maId)!;
            report.shifts.push({
              date: dateString,
              startTime: shift.startTime || '',
              endTime: shift.endTime || '',
              hours,
              isVacation: shift.isVacation
            });
            if (!shift.isVacation) {
              report.totalHours += hours;
            }
          }
        });
      }
      
      // Process front staff shifts
      shift.frontStaffIds?.forEach(fsId => {
        if (reports.has(fsId)) {
          const report = reports.get(fsId)!;
          report.shifts.push({
            date: dateString,
            startTime: shift.startTime || '',
            endTime: shift.endTime || '',
            hours,
            isVacation: shift.isVacation
          });
          if (!shift.isVacation) {
            report.totalHours += hours;
          }
        }
      });
      
      // Process billing staff shifts
      shift.billingIds?.forEach(bId => {
        if (reports.has(bId)) {
          const report = reports.get(bId)!;
          report.shifts.push({
            date: dateString,
            startTime: shift.startTime || '',
            endTime: shift.endTime || '',
            hours,
            isVacation: shift.isVacation
          });
          if (!shift.isVacation) {
            report.totalHours += hours;
          }
        }
      });
      
      // Process behavioral health staff shifts
      shift.behavioralHealthIds?.forEach(bhId => {
        if (reports.has(bhId)) {
          const report = reports.get(bhId)!;
          report.shifts.push({
            date: dateString,
            startTime: shift.startTime || '',
            endTime: shift.endTime || '',
            hours,
            isVacation: shift.isVacation
          });
          if (!shift.isVacation) {
            report.totalHours += hours;
          }
        }
      });
    });
  });
  
  // Sort shifts by date for each staff member
  reports.forEach(report => {
    report.shifts.sort((a, b) => a.date.localeCompare(b.date));
  });
  
  // Convert to array and sort by staff name
  return Array.from(reports.values()).sort((a, b) => 
    a.staffName.localeCompare(b.staffName)
  );
}

// Export staff hours to CSV
export function exportStaffHoursToCSV(
  reports: StaffHoursReport[],
  startDate: Date,
  endDate: Date
): void {
  // Create CSV header
  const headers = ['Staff Name', 'Staff Type', 'Total Hours', 'Date', 'Start Time', 'End Time', 'Hours', 'Is Vacation'];
  const csvRows = [headers.join(',')];
  
  // Add data rows
  reports.forEach(report => {
    if (report.shifts.length === 0) {
      // Add a row for staff with no shifts
      csvRows.push([
        `"${report.staffName}"`,
        report.staffType,
        report.totalHours.toFixed(2),
        '',
        '',
        '',
        '',
        ''
      ].join(','));
    } else {
      // Add a row for each shift
      report.shifts.forEach(shift => {
        csvRows.push([
          `"${report.staffName}"`,
          report.staffType,
          report.totalHours.toFixed(2),
          shift.date,
          shift.startTime,
          shift.endTime,
          shift.hours.toFixed(2),
          shift.isVacation ? 'Yes' : 'No'
        ].join(','));
      });
    }
  });
  
  // Create blob and download
  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const dateRange = `${getISODateString(startDate)}_to_${getISODateString(endDate)}`;
  link.download = `staff_hours_report_${dateRange}.csv`;
  link.href = URL.createObjectURL(blob);
  link.click();
  URL.revokeObjectURL(link.href);
}

// Export summary only (name and total hours)
export function exportStaffHoursSummaryToCSV(
  reports: StaffHoursReport[],
  startDate: Date,
  endDate: Date
): void {
  // Create CSV header
  const headers = ['Staff Name', 'Staff Type', 'Total Hours'];
  const csvRows = [headers.join(',')];
  
  // Add data rows
  reports.forEach(report => {
    csvRows.push([
      `"${report.staffName}"`,
      report.staffType,
      report.totalHours.toFixed(2)
    ].join(','));
  });
  
  // Add totals row
  const grandTotal = reports.reduce((sum, report) => sum + report.totalHours, 0);
  csvRows.push(['', 'TOTAL', grandTotal.toFixed(2)].join(','));
  
  // Create blob and download
  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const dateRange = `${getISODateString(startDate)}_to_${getISODateString(endDate)}`;
  link.download = `staff_hours_summary_${dateRange}.csv`;
  link.href = URL.createObjectURL(blob);
  link.click();
  URL.revokeObjectURL(link.href);
}