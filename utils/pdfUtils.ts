import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Provider, Shift, ClinicType, MedicalAssistant, CalendarViewMode } from '../types';
import { getMonthYearString, getWeekRangeString, getISODateString } from './dateUtils';

export interface PdfExportOptions {
  startDate: string;
  endDate: string;
  viewType: 'calendar' | 'list';
  calendarView: CalendarViewMode;
  includeProviderIds: string[];
  includeClinicTypeIds: string[];
  includeMedicalAssistantIds: string[];
  includeVacations: boolean;
  orientation: 'portrait' | 'landscape';
  paperSize: 'a4' | 'letter' | 'legal';
  title?: string;
}

export interface PdfGenerationData {
  shifts: Shift[];
  providers: Provider[];
  clinicTypes: ClinicType[];
  medicalAssistants: MedicalAssistant[];
  options: PdfExportOptions;
}

// Paper size configurations in mm
const PAPER_SIZES = {
  a4: { width: 210, height: 297 },
  letter: { width: 216, height: 279 },
  legal: { width: 216, height: 356 }
};

// Filter shifts based on export options
export const filterShiftsForExport = (
  shifts: Shift[], 
  options: PdfExportOptions
): Shift[] => {
  return shifts.filter(shift => {
    // Date range filter
    const shiftStart = new Date(shift.startDate);
    const shiftEnd = new Date(shift.endDate);
    const exportStart = new Date(options.startDate);
    const exportEnd = new Date(options.endDate);
    
    if (shiftEnd < exportStart || shiftStart > exportEnd) {
      return false;
    }

    // Provider filter
    if (options.includeProviderIds.length > 0 && 
        !options.includeProviderIds.includes(shift.providerId)) {
      return false;
    }

    // Clinic type filter
    if (options.includeClinicTypeIds.length > 0 && 
        shift.clinicTypeId && 
        !options.includeClinicTypeIds.includes(shift.clinicTypeId)) {
      return false;
    }

    // Medical assistant filter
    if (options.includeMedicalAssistantIds.length > 0 && 
        shift.medicalAssistantIds && 
        !shift.medicalAssistantIds.some(maId => options.includeMedicalAssistantIds.includes(maId))) {
      return false;
    }

    // Vacation filter
    if (!options.includeVacations && shift.isVacation) {
      return false;
    }

    return true;
  });
};

// Generate list-style PDF content
export const generateListPdfContent = (data: PdfGenerationData): string => {
  const { shifts, providers, clinicTypes, medicalAssistants, options } = data;
  const filteredShifts = filterShiftsForExport(shifts, options);
  
  const getProviderName = (id: string) => providers.find(p => p.id === id)?.name || 'Unknown Provider';
  const getClinicName = (id: string) => clinicTypes.find(c => c.id === id)?.name || 'N/A';
  const getMaNames = (ids?: string[]) => 
    ids?.map(id => medicalAssistants.find(ma => ma.id === id)?.name).filter(Boolean).join(', ') || 'None';

  // Sort shifts by date and provider
  const sortedShifts = filteredShifts.sort((a, b) => {
    const dateCompare = a.startDate.localeCompare(b.startDate);
    if (dateCompare !== 0) return dateCompare;
    return getProviderName(a.providerId).localeCompare(getProviderName(b.providerId));
  });

  const title = options.title || `Schedule Report - ${options.startDate} to ${options.endDate}`;
  
  let html = `
    <div style="font-family: Arial, sans-serif; font-size: 12px; line-height: 1.4;">
      <h1 style="text-align: center; margin-bottom: 30px; font-size: 18px; color: #333;">${title}</h1>
      <div style="margin-bottom: 20px; text-align: center; font-size: 10px; color: #666;">
        Generated on ${new Date().toLocaleDateString('en-US', { timeZone: 'America/New_York' })} at ${new Date().toLocaleTimeString('en-US', { timeZone: 'America/New_York' })}
      </div>
  `;

  if (sortedShifts.length === 0) {
    html += '<p style="text-align: center; color: #666; font-style: italic;">No shifts found for the selected criteria.</p>';
  } else {
    html += '<table style="width: 100%; border-collapse: collapse; margin-top: 20px;">';
    html += `
      <thead>
        <tr style="background-color: #f8f9fa; border-bottom: 2px solid #dee2e6;">
          <th style="padding: 8px; text-align: left; font-weight: bold; border: 1px solid #dee2e6;">Date</th>
          <th style="padding: 8px; text-align: left; font-weight: bold; border: 1px solid #dee2e6;">Provider</th>
          <th style="padding: 8px; text-align: left; font-weight: bold; border: 1px solid #dee2e6;">Time</th>
          <th style="padding: 8px; text-align: left; font-weight: bold; border: 1px solid #dee2e6;">Clinic</th>
          <th style="padding: 8px; text-align: left; font-weight: bold; border: 1px solid #dee2e6;">Medical Assistants</th>
          <th style="padding: 8px; text-align: left; font-weight: bold; border: 1px solid #dee2e6;">Notes</th>
        </tr>
      </thead>
      <tbody>
    `;

    // Add rows with page-break-inside: avoid for better printing
    sortedShifts.forEach((shift, index) => {
      const isVacation = shift.isVacation;
      const backgroundColor = index % 2 === 0 ? '#ffffff' : '#f8f9fa';
      const vacationStyle = isVacation ? 'background-color: #fef2f2; color: #dc2626;' : '';
      
      html += `
        <tr style="border-bottom: 1px solid #dee2e6; page-break-inside: avoid; ${vacationStyle}">
          <td style="padding: 8px; border: 1px solid #dee2e6; ${vacationStyle || `background-color: ${backgroundColor};`}">
            ${new Date(shift.startDate).toLocaleDateString('en-US', { timeZone: 'America/New_York' })}${shift.startDate !== shift.endDate ? ` - ${new Date(shift.endDate).toLocaleDateString('en-US', { timeZone: 'America/New_York' })}` : ''}
          </td>
          <td style="padding: 8px; border: 1px solid #dee2e6; ${vacationStyle || `background-color: ${backgroundColor};`}">
            ${getProviderName(shift.providerId)}
          </td>
          <td style="padding: 8px; border: 1px solid #dee2e6; ${vacationStyle || `background-color: ${backgroundColor};`}">
            ${isVacation ? 'All Day' : `${shift.startTime || ''} - ${shift.endTime || ''}`}
          </td>
          <td style="padding: 8px; border: 1px solid #dee2e6; ${vacationStyle || `background-color: ${backgroundColor};`}">
            ${isVacation ? 'Vacation' : getClinicName(shift.clinicTypeId || '')}
          </td>
          <td style="padding: 8px; border: 1px solid #dee2e6; ${vacationStyle || `background-color: ${backgroundColor};`}">
            ${isVacation ? '-' : getMaNames(shift.medicalAssistantIds)}
          </td>
          <td style="padding: 8px; border: 1px solid #dee2e6; ${vacationStyle || `background-color: ${backgroundColor};`}">
            ${shift.notes || '-'}
          </td>
        </tr>
      `;
    });

    html += '</tbody></table>';
  }

  html += `
      <div style="margin-top: 30px; font-size: 10px; color: #666; border-top: 1px solid #dee2e6; padding-top: 10px; page-break-inside: avoid;">
        <p><strong>Summary:</strong></p>
        <ul style="margin: 5px 0; padding-left: 20px;">
          <li>Total shifts: ${sortedShifts.length}</li>
          <li>Work shifts: ${sortedShifts.filter(s => !s.isVacation).length}</li>
          <li>Vacation/Time-off: ${sortedShifts.filter(s => s.isVacation).length}</li>
          <li>Date range: ${options.startDate} to ${options.endDate}</li>
        </ul>
      </div>
    </div>
  `;

  return html;
};

// Convert HTML to PDF using html2canvas and jsPDF with better page handling
export const generatePdfFromHtml = async (
  htmlContent: string, 
  options: PdfExportOptions,
  filename?: string
): Promise<void> => {
  try {
    // Get paper dimensions
    const paperConfig = PAPER_SIZES[options.paperSize];
    const isLandscape = options.orientation === 'landscape';
    const pageWidth = isLandscape ? paperConfig.height : paperConfig.width;
    const pageHeight = isLandscape ? paperConfig.width : paperConfig.height;

    // Create PDF first
    const pdf = new jsPDF({
      orientation: options.orientation,
      unit: 'mm',
      format: options.paperSize
    });

    // Create a temporary container with print styles
    const container = document.createElement('div');
    container.innerHTML = `
      <style>
        @media print {
          table { page-break-inside: auto; }
          tr { page-break-inside: avoid; page-break-after: auto; }
          thead { display: table-header-group; }
          tfoot { display: table-footer-group; }
        }
      </style>
      ${htmlContent}
    `;
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    container.style.width = `${(pageWidth - 20) * 3.7795}px`; // Convert mm to px (assuming 96 DPI)
    container.style.padding = '20px';
    container.style.backgroundColor = '#ffffff';
    document.body.appendChild(container);

    // Generate canvas from HTML
    const canvas = await html2canvas(container, {
      scale: 2, // Higher quality
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });

    // Remove temporary container
    document.body.removeChild(container);

    // Get paper dimensions
    const paperConfig = PAPER_SIZES[options.paperSize];
    const isLandscape = options.orientation === 'landscape';
    const pageWidth = isLandscape ? paperConfig.height : paperConfig.width;
    const pageHeight = isLandscape ? paperConfig.width : paperConfig.height;

    // Create PDF
    const pdf = new jsPDF({
      orientation: options.orientation,
      unit: 'mm',
      format: options.paperSize
    });

    // Calculate dimensions with margins
    const margin = 15; // 15mm margins
    const contentWidth = pageWidth - (2 * margin);
    const contentHeight = pageHeight - (2 * margin);
    
    // Calculate scale to fit width
    const scale = contentWidth / (canvas.width / 3.7795); // Convert px to mm
    const scaledHeight = (canvas.height / 3.7795) * scale;
    
    // Add image to PDF with proper page breaks
    const imgData = canvas.toDataURL('image/png');
    const totalPages = Math.ceil(scaledHeight / contentHeight);
    
    for (let page = 0; page < totalPages; page++) {
      if (page > 0) {
        pdf.addPage();
      }
      
      const yOffset = -page * contentHeight;
      pdf.addImage(
        imgData, 
        'PNG', 
        margin, 
        margin + yOffset, 
        contentWidth, 
        scaledHeight
      );
    }

    // Generate filename
    const defaultFilename = `schedule_${options.startDate}_to_${options.endDate}_${new Date().getTime()}.pdf`;
    const finalFilename = filename || defaultFilename;

    // Save PDF
    pdf.save(finalFilename);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF. Please try again.');
  }
};

// Generate calendar-style PDF (captures specified calendar view)
export const generateCalendarPdf = async (
  calendarElementId: string,
  options: PdfExportOptions,
  data: PdfGenerationData,
  filename?: string
): Promise<void> => {
  try {
    // First, we need to ensure the calendar is showing the right view
    // The calendar should already be in the correct view based on user selection
    const calendarElement = document.getElementById(calendarElementId);
    if (!calendarElement) {
      throw new Error('Calendar element not found');
    }

    // For week/day views, we might want landscape by default
    const recommendedOrientation = options.calendarView === 'month' ? 'portrait' : 'landscape';
    const actualOrientation = options.orientation || recommendedOrientation;

    // Generate canvas from calendar element with better quality
    const canvas = await html2canvas(calendarElement, {
      scale: 3, // Higher quality for better text rendering
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false
    });

    // Get paper dimensions
    const paperConfig = PAPER_SIZES[options.paperSize];
    const isLandscape = actualOrientation === 'landscape';
    const pageWidth = isLandscape ? paperConfig.height : paperConfig.width;
    const pageHeight = isLandscape ? paperConfig.width : paperConfig.height;

    // Create PDF
    const pdf = new jsPDF({
      orientation: actualOrientation,
      unit: 'mm',
      format: options.paperSize
    });

    // Add title with view type
    const viewLabel = options.calendarView.charAt(0).toUpperCase() + options.calendarView.slice(1);
    const dateRange = options.calendarView === 'month' 
      ? new Date(options.startDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      : `${options.startDate} to ${options.endDate}`;
    const title = options.title || `${viewLabel} View - ${dateRange}`;
    
    pdf.setFontSize(14);
    pdf.text(title, pageWidth / 2, 12, { align: 'center' });
    
    // Add subtitle with generation info
    pdf.setFontSize(9);
    pdf.setTextColor(100);
    pdf.text(
      `Generated on ${new Date().toLocaleDateString('en-US')} at ${new Date().toLocaleTimeString('en-US')}`,
      pageWidth / 2, 
      18, 
      { align: 'center' }
    );
    pdf.setTextColor(0);

    // Calculate image dimensions with margins
    const margin = 15;
    const maxWidth = pageWidth - (2 * margin);
    const maxHeight = pageHeight - 30; // Space for title and margins
    
    // Calculate scale to fit
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const widthScale = maxWidth / (imgWidth / 3.7795); // Convert px to mm
    const heightScale = maxHeight / (imgHeight / 3.7795);
    const scale = Math.min(widthScale, heightScale);
    
    const finalWidth = (imgWidth / 3.7795) * scale;
    const finalHeight = (imgHeight / 3.7795) * scale;
    
    // Center the image
    const xOffset = (pageWidth - finalWidth) / 2;
    const yOffset = 25; // Below title

    // Add image
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', xOffset, yOffset, finalWidth, finalHeight);

    // Add footer with filter information
    const activeProviders = data.providers.filter(p => options.includeProviderIds.includes(p.id));
    if (activeProviders.length < data.providers.length) {
      pdf.setFontSize(8);
      pdf.setTextColor(100);
      const footerY = pageHeight - 10;
      pdf.text(
        `Showing: ${activeProviders.map(p => p.name).join(', ')}`,
        pageWidth / 2,
        footerY,
        { align: 'center' }
      );
    }

    // Generate filename
    const defaultFilename = `calendar_${options.calendarView}_${new Date().getTime()}.pdf`;
    const finalFilename = filename || defaultFilename;

    // Save PDF
    pdf.save(finalFilename);
  } catch (error) {
    console.error('Error generating calendar PDF:', error);
    throw new Error('Failed to generate calendar PDF. Please try again.');
  }
};

// Main PDF export function
export const exportToPdf = async (
  data: PdfGenerationData,
  calendarElementId?: string
): Promise<void> => {
  const { options } = data;
  
  if (options.viewType === 'list') {
    const htmlContent = generateListPdfContent(data);
    await generatePdfFromHtml(htmlContent, options);
  } else {
    // Calendar view
    if (!calendarElementId) {
      throw new Error('Calendar element ID is required for calendar view export');
    }
    await generateCalendarPdf(calendarElementId, options, data);
  }
}; 