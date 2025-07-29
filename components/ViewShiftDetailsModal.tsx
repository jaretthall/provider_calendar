import React, { useContext } from 'react';
import { Shift, RecurringFrequency, MedicalAssistant, FrontStaff, Billing, BehavioralHealth } from '../types';
import { AppContext, ModalContext } from '../App';
import { formatTime, getISODateString, getInitials } from '../utils/dateUtils';
import { RECURRING_FREQUENCY_OPTIONS, DAYS_OF_WEEK } from '../constants';
import EditIcon from './icons/EditIcon';
import { usePermissions } from '../hooks/useAuth';
import TrashIcon from './icons/TrashIcon';
import { formatDateInEasternTime } from '../utils/dateUtils';


interface ViewShiftDetailsModalProps {
  shift?: Shift; 
  shifts?: Shift[]; 
  date?: Date; 
  isListView?: boolean;
  listTitle?: string;
  onClose: () => void;
}

const ViewShiftDetailsModal: React.FC<ViewShiftDetailsModalProps> = ({ 
    shift: singleShift, 
    shifts: multipleShifts, 
    date: instanceDateContext, 
    isListView, 
    listTitle, 
    onClose 
}) => {
  const appContext = useContext(AppContext);
  const modalContext = useContext(ModalContext);
  const { isAdmin } = usePermissions();

  if (!appContext || !modalContext) throw new Error("Context not found");
  
  const { getProviderById, getClinicTypeById, getMedicalAssistantById, getFrontStaffById, getBillingById, getBehavioralHealthById } = appContext;
  const { openModal, closeModal: closeThisModal } = modalContext;

  // Helper function to get primary staff member for any shift
  const getPrimaryStaffInfo = (shift: Shift) => {
    if (shift.providerId) {
      const provider = getProviderById(shift.providerId);
      return { staff: provider, name: provider?.name || 'Provider', type: 'Provider' };
    } else if (shift.frontStaffIds && shift.frontStaffIds.length > 0) {
      const frontStaff = getFrontStaffById(shift.frontStaffIds[0]);
      const name = shift.frontStaffIds.length > 1 
        ? `${frontStaff?.name || 'Front Staff'} +${shift.frontStaffIds.length - 1} more`
        : frontStaff?.name || 'Front Staff';
      return { staff: frontStaff, name, type: 'Front Staff' };
    } else if (shift.billingIds && shift.billingIds.length > 0) {
      const billing = getBillingById(shift.billingIds[0]);
      const name = shift.billingIds.length > 1 
        ? `${billing?.name || 'Billing'} +${shift.billingIds.length - 1} more`
        : billing?.name || 'Billing';
      return { staff: billing, name, type: 'Billing' };
    } else if (shift.behavioralHealthIds && shift.behavioralHealthIds.length > 0) {
      const behavioralHealth = getBehavioralHealthById(shift.behavioralHealthIds[0]);
      const name = shift.behavioralHealthIds.length > 1 
        ? `${behavioralHealth?.name || 'Behavioral Health'} +${shift.behavioralHealthIds.length - 1} more`
        : behavioralHealth?.name || 'Behavioral Health';
      return { staff: behavioralHealth, name, type: 'Behavioral Health' };
    }
    return { staff: null, name: 'Unknown Staff', type: 'Unknown' };
  };


  const formatDateRange = (start: string, end: string) => {
    const s = new Date(start + 'T00:00:00');
    const e = new Date(end + 'T00:00:00');
    if (start === end) return s.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
    return `${s.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - ${e.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };
  
  const getRecurringDescription = (currentShift: Shift) => {
    if (!currentShift.recurringRule || currentShift.recurringRule.frequency === RecurringFrequency.NONE) return 'Does not repeat';
    
    const freqLabel = RECURRING_FREQUENCY_OPTIONS.find(opt => opt.value === currentShift.recurringRule?.frequency)?.label || currentShift.recurringRule?.frequency;
    let details = '';
    if (currentShift.recurringRule.frequency === RecurringFrequency.WEEKLY || currentShift.recurringRule.frequency === RecurringFrequency.BI_WEEKLY) {
        details = currentShift.recurringRule.daysOfWeek?.map(d => DAYS_OF_WEEK[d]).join(', ') || '';
    } else if (currentShift.recurringRule.frequency === RecurringFrequency.MONTHLY) {
        details = `on day ${currentShift.recurringRule.dayOfMonth}`;
    }
    const endDateStr = currentShift.recurringRule.endDate ? `until ${new Date(currentShift.recurringRule.endDate  + 'T00:00:00').toLocaleDateString()}` : 'indefinitely';
    return `${freqLabel}${details ? ` (${details})` : ''}, ${endDateStr}`;
  };

  const handleEditShiftFromList = (shiftToEdit: Shift) => {
    if (!instanceDateContext) return;
    closeThisModal(); 
    openModal('SHIFT_FORM', { 
        shift: shiftToEdit, 
        instanceDate: getISODateString(instanceDateContext) 
    });
  };

  const handleNewShiftFromList = () => {
    if (!instanceDateContext) return;
    closeThisModal();
    openModal('SHIFT_FORM', { 
        initialDate: getISODateString(instanceDateContext) 
    });
  };

  if (isListView && multipleShifts && multipleShifts.length > 0) {
    return (
        <div className="space-y-3">
            {multipleShifts.map((s, index) => {
                const primaryStaffInfo = getPrimaryStaffInfo(s);
                const clinic = s.clinicTypeId ? getClinicTypeById(s.clinicTypeId) : undefined;
                const assignedMAs = (s.medicalAssistantIds || []).map(id => getMedicalAssistantById(id)).filter(Boolean) as MedicalAssistant[];
                
                let title = s.isVacation 
                    ? `${primaryStaffInfo.name} - Vacation` 
                    : `${primaryStaffInfo.name} @ ${clinic?.name || 'N/A'}`;
                
                if (assignedMAs.length > 0 && !s.isVacation) {
                    title += ` (w/ ${assignedMAs.map(ma => getInitials(ma.name)).join(', ')})`;
                }


                return (
                    <div key={s.id + index} className="p-3 bg-gray-50 rounded-md shadow-sm border border-gray-200 hover:bg-gray-100 transition-colors">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="font-semibold text-gray-800">{title}</p>
                                <p className="text-xs text-gray-500">
                                    {s.startDate === s.endDate ? s.startDate : `${s.startDate} to ${s.endDate}`}
                                    {!s.isVacation && s.startTime && s.endTime ? ` from ${formatTime(s.startTime)} to ${formatTime(s.endTime)}` : ''}
                                </p>
                                {s.notes && <p className="text-xs text-gray-500 mt-1 truncate">Notes: {s.notes}</p>}
                            </div>
                            {s.isVacation && isAdmin && (
                                <button 
                                    onClick={() => handleEditShiftFromList(s)}
                                    className="p-2 text-blue-600 hover:text-blue-800 rounded-md hover:bg-blue-100"
                                    title="Edit this shift/vacation"
                                >
                                    <EditIcon className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </div>
                );
            })}
             <div className="flex justify-between items-center pt-4">
                {instanceDateContext && isAdmin && (
                    <button 
                        type="button" 
                        onClick={handleNewShiftFromList}
                        className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        + Shift
                    </button>
                )}
                <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">Close</button>
            </div>
        </div>
    );
  }
  
  if (!singleShift) {
    return <p className="text-center text-gray-500">No shift details to display.</p>;
  }

  const primaryStaffInfo = getPrimaryStaffInfo(singleShift);
  const clinic = singleShift.clinicTypeId ? getClinicTypeById(singleShift.clinicTypeId) : undefined;
  const assignedMAs = (singleShift.medicalAssistantIds || []).map(id => getMedicalAssistantById(id)).filter(Boolean) as MedicalAssistant[];

  return (
    <div className="space-y-4 text-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-3" style={{ color: singleShift.color && !singleShift.color.startsWith('bg-') ? singleShift.color : undefined }}>
        {singleShift.title || (singleShift.isVacation ? "Vacation / Time Off" : "Scheduled Shift")}
      </h3>

      <div className="grid grid-cols-3 gap-x-4 gap-y-2">
        <strong className="text-gray-600 col-span-1">{primaryStaffInfo.type}:</strong>
        <p className="text-gray-800 col-span-2">{primaryStaffInfo.name}</p>

        {!singleShift.isVacation && clinic && (
          <>
            <strong className="text-gray-600 col-span-1">Clinic:</strong>
            <p className="text-gray-800 col-span-2">{clinic.name}</p>
          </>
        )}

        {!singleShift.isVacation && assignedMAs.length > 0 && (
          <>
            <strong className="text-gray-600 col-span-1">Medical Assistants:</strong>
            <p className="text-gray-800 col-span-2">{assignedMAs.map(ma => ma.name).join(', ')}</p>
          </>
        )}

        <strong className="text-gray-600 col-span-1">Date(s):</strong>
        <p className="text-gray-800 col-span-2">{formatDateRange(singleShift.startDate, singleShift.endDate)}</p>

        {!singleShift.isVacation && singleShift.startTime && singleShift.endTime && (
          <>
            <strong className="text-gray-600 col-span-1">Time:</strong>
            <p className="text-gray-800 col-span-2">{formatTime(singleShift.startTime)} - {formatTime(singleShift.endTime)}</p>
          </>
        )}
        
        <strong className="text-gray-600 col-span-1">Type:</strong>
        <p className="text-gray-800 col-span-2">{singleShift.isVacation ? 'Vacation / Time Off' : 'Clinic Shift'}</p>

        {singleShift.recurringRule && singleShift.recurringRule.frequency !== 'NONE' && (
             <>
                <strong className="text-gray-600 col-span-1">Recurs:</strong>
                <p className="text-gray-800 col-span-2">{getRecurringDescription(singleShift)}</p>
            </>
        )}

        {singleShift.notes && (
          <>
            <strong className="text-gray-600 col-span-1">Notes:</strong>
            <p className="text-gray-800 col-span-2 whitespace-pre-wrap">{singleShift.notes}</p>
          </>
        )}
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ViewShiftDetailsModal;