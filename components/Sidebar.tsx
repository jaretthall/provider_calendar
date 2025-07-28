import React, { useContext, useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

import { AppContext, ModalContext, ToastContext } from '../App';
import { Provider, ClinicType, FilterState, MedicalAssistant, FrontStaff, Billing, BehavioralHealth } from '../types';
import { usePermissions } from '../hooks/useAuth';

import PlusIcon from './icons/PlusIcon';
import EditIcon from './icons/EditIcon';
import TrashIcon from './icons/TrashIcon';
import UsersIcon from './icons/UsersIcon';
import UsersGroupIcon from './icons/UsersGroupIcon';
import BriefcaseIcon from './icons/BriefcaseIcon';
import ChevronRightIcon from './icons/ChevronRightIcon';
import EyeIcon from './icons/EyeIcon';
import EyeSlashIcon from './icons/EyeSlashIcon';
import SelectAllIcon from './icons/SelectAllIcon';


interface SidebarProps {
  filters: FilterState;
  onFiltersChange: (newFilters: FilterState) => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

interface DraggableProviderItemProps {
  provider: Provider;
  filters: FilterState;
  onFilterChange: (providerId: string) => void;
  onEdit: (provider: Provider) => void;
  onDelete: (provider: Provider) => void;
  isAdmin: boolean;
}

const DraggableProviderItem: React.FC<DraggableProviderItemProps> = ({ provider, filters, onFilterChange, onEdit, onDelete, isAdmin }) => {
  const {attributes, listeners, setNodeRef, transform, isDragging} = useDraggable({
    id: `draggable-provider-${provider.id}`,
    data: {
      type: 'provider',
      providerId: provider.id,
      providerName: provider.name, // For DragOverlay
      providerColor: provider.color, // For DragOverlay
      provider // Pass the full provider object for easy access in onDragStart
    },
    disabled: !isAdmin, // Only admins can drag providers to create shifts
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1, // Dim original item while dragging
    touchAction: 'none', // Recommended for dnd-kit
  };

  return (
    <li 
      ref={setNodeRef} 
      style={style}
      className={`p-2 md:p-1.5 rounded-md group ${provider.isActive ? (isAdmin ? 'hover:bg-gray-700 cursor-grab' : 'hover:bg-gray-700') : 'opacity-60 hover:bg-gray-700'} ${isDragging ? 'shadow-lg' : ''}`}
      {...attributes} // Spread attributes for accessibility, etc.
      // Conditionally spread listeners only if admin, to disable drag for non-admins
      {...(isAdmin ? listeners : {})} 
    >
      <div className="flex items-center justify-between">
        <label className="flex items-center text-xs cursor-pointer w-full min-h-[24px] md:min-h-[20px]">
          <input
            type="checkbox"
            aria-labelledby={`provider-name-${provider.id}`}
            checked={filters.providerIds.includes(provider.id)}
            onChange={() => onFilterChange(provider.id)}
            className="h-4 w-4 md:h-3 md:w-3 text-blue-500 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-offset-gray-800 mr-2 md:mr-1.5 flex-shrink-0 touch-manipulation"
          />
          <span className={`w-3 h-3 md:w-2.5 md:h-2.5 rounded-full mr-2 md:mr-1.5 flex-shrink-0 ${provider.color}`} aria-hidden="true"></span>
          <span id={`provider-name-${provider.id}`} className="truncate" title={provider.name}>{provider.name}</span>
          {!provider.isActive && <span className="ml-1 text-[10px] text-gray-400">(Inactive)</span>}
        </label>
        {isAdmin && (
          <div className="flex items-center space-x-1 md:space-x-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            <button onClick={() => onEdit(provider)} className="p-1.5 md:p-0.5 text-gray-400 hover:text-white rounded-md focus:outline-none focus:ring-1 focus:ring-white touch-manipulation" title="Edit Provider" aria-label={`Edit provider ${provider.name}`}>
              <EditIcon className="w-4 h-4 md:w-3 md:h-3" />
            </button>
            <button onClick={() => onDelete(provider)} className="p-1.5 md:p-0.5 text-red-400 hover:text-red-300 rounded-md focus:outline-none focus:ring-1 focus:ring-white touch-manipulation" title="Delete Provider" aria-label={`Delete provider ${provider.name}`}>
              <TrashIcon className="w-4 h-4 md:w-3 md:h-3" />
            </button>
          </div>
        )}
      </div>
    </li>
  );
};


const Sidebar: React.FC<SidebarProps> = ({ filters, onFiltersChange, isSidebarOpen, toggleSidebar }) => {
  const appContext = useContext(AppContext);
  const modalContext = useContext(ModalContext);
  const toastContext = useContext(ToastContext);

  if (!appContext || !modalContext || !toastContext) throw new Error("Context not found");

  const { providers, clinics, medicalAssistants, frontStaff, billing, behavioralHealth, deleteProvider, deleteClinicType, deleteMedicalAssistant, deleteFrontStaff, deleteBilling, deleteBehavioralHealth } = appContext;


  const { openModal } = modalContext;
  const { isAdmin } = usePermissions();
  
  const [providersOpen, setProvidersOpen] = useState(true);
  const [clinicsOpen, setClinicsOpen] = useState(true);
  const [medicalAssistantsOpen, setMedicalAssistantsOpen] = useState(true);
  const [frontStaffOpen, setFrontStaffOpen] = useState(true);
  const [billingOpen, setBillingOpen] = useState(true);
  const [behavioralHealthOpen, setBehavioralHealthOpen] = useState(true);
  const [optionsOpen, setOptionsOpen] = useState(true);
  const [showUserManagement, setShowUserManagement] = useState(false);
  
  const optionsSectionId = "options-section";
  const providersSectionId = "providers-section";
  const clinicsSectionId = "clinics-section";
  const medicalAssistantsSectionId = "ma-section";
  const frontStaffSectionId = "front-staff-section";
  const billingSectionId = "billing-section";
  const behavioralHealthSectionId = "behavioral-health-section";


  const handleProviderFilterChange = (providerId: string) => {
    const newProviderIds = filters.providerIds.includes(providerId)
      ? filters.providerIds.filter(id => id !== providerId)
      : [...filters.providerIds, providerId];
    onFiltersChange({ ...filters, providerIds: newProviderIds });
  };

  const handleClinicFilterChange = (clinicId: string) => {
    const newClinicIds = filters.clinicTypeIds.includes(clinicId)
      ? filters.clinicTypeIds.filter(id => id !== clinicId)
      : [...filters.clinicTypeIds, clinicId];
    onFiltersChange({ ...filters, clinicTypeIds: newClinicIds });
  };
  
  const handleMAFilterChange = (maId: string) => {
    const newMAIds = filters.medicalAssistantIds.includes(maId)
      ? filters.medicalAssistantIds.filter(id => id !== maId)
      : [...filters.medicalAssistantIds, maId];
    onFiltersChange({ ...filters, medicalAssistantIds: newMAIds });
  };

  const handleFrontStaffFilterChange = (fsId: string) => {
    const newFSIds = filters.frontStaffIds.includes(fsId)
      ? filters.frontStaffIds.filter(id => id !== fsId)
      : [...filters.frontStaffIds, fsId];
    onFiltersChange({ ...filters, frontStaffIds: newFSIds });
  };

  const handleBillingFilterChange = (billingId: string) => {
    const newBillingIds = filters.billingIds.includes(billingId)
      ? filters.billingIds.filter(id => id !== billingId)
      : [...filters.billingIds, billingId];
    onFiltersChange({ ...filters, billingIds: newBillingIds });
  };

  const handleBehavioralHealthFilterChange = (bhId: string) => {
    const newBHIds = filters.behavioralHealthIds.includes(bhId)
      ? filters.behavioralHealthIds.filter(id => id !== bhId)
      : [...filters.behavioralHealthIds, bhId];
    onFiltersChange({ ...filters, behavioralHealthIds: newBHIds });
  };

  const handleShowVacationsChange = (show: boolean) => {
    onFiltersChange({ ...filters, showVacations: show });
  };

  // Select All functions
  const handleSelectAllProviders = () => {
    const activeProviderIds = providers.filter(p => p.isActive).map(p => p.id);
    const allSelected = activeProviderIds.every(id => filters.providerIds.includes(id));
    
    const newFilters = { ...filters };
    if (allSelected) {
      // Deselect all
      newFilters.providerIds = filters.providerIds.filter(id => !activeProviderIds.includes(id));
    } else {
      // Select all active providers that aren't already selected
      const newSelections = activeProviderIds.filter(id => !filters.providerIds.includes(id));
      newFilters.providerIds = [...filters.providerIds, ...newSelections];
    }
    onFiltersChange(newFilters);
  };

  const handleSelectAllClinics = () => {
    const activeClinicIds = clinics.filter(c => c.isActive).map(c => c.id);
    const allSelected = activeClinicIds.every(id => filters.clinicTypeIds.includes(id));
    
    const newFilters = { ...filters };
    if (allSelected) {
      // Deselect all
      newFilters.clinicTypeIds = filters.clinicTypeIds.filter(id => !activeClinicIds.includes(id));
    } else {
      // Select all active clinics that aren't already selected
      const newSelections = activeClinicIds.filter(id => !filters.clinicTypeIds.includes(id));
      newFilters.clinicTypeIds = [...filters.clinicTypeIds, ...newSelections];
    }
    onFiltersChange(newFilters);
  };

  const handleSelectAllMAs = () => {
    const activeMaIds = medicalAssistants.filter(ma => ma.isActive).map(ma => ma.id);
    const allSelected = activeMaIds.every(id => filters.medicalAssistantIds.includes(id));
    
    const newFilters = { ...filters };
    if (allSelected) {
      // Deselect all
      newFilters.medicalAssistantIds = filters.medicalAssistantIds.filter(id => !activeMaIds.includes(id));
    } else {
      // Select all active MAs that aren't already selected
      const newSelections = activeMaIds.filter(id => !filters.medicalAssistantIds.includes(id));
      newFilters.medicalAssistantIds = [...filters.medicalAssistantIds, ...newSelections];
    }
    onFiltersChange(newFilters);
  };

  const handleSelectAllFrontStaff = () => {
    const activeFrontStaffIds = frontStaff.filter(fs => fs.isActive).map(fs => fs.id);
    const allSelected = activeFrontStaffIds.every(id => filters.frontStaffIds.includes(id));
    
    const newFilters = { ...filters };
    if (allSelected) {
      // Deselect all
      newFilters.frontStaffIds = filters.frontStaffIds.filter(id => !activeFrontStaffIds.includes(id));
    } else {
      // Select all active front staff that aren't already selected
      const newSelections = activeFrontStaffIds.filter(id => !filters.frontStaffIds.includes(id));
      newFilters.frontStaffIds = [...filters.frontStaffIds, ...newSelections];
    }
    onFiltersChange(newFilters);
  };

  const handleSelectAllBilling = () => {
    const activeBillingIds = billing.filter(b => b.isActive).map(b => b.id);
    const allSelected = activeBillingIds.every(id => filters.billingIds.includes(id));
    
    const newFilters = { ...filters };
    if (allSelected) {
      // Deselect all
      newFilters.billingIds = filters.billingIds.filter(id => !activeBillingIds.includes(id));
    } else {
      // Select all active billing staff that aren't already selected
      const newSelections = activeBillingIds.filter(id => !filters.billingIds.includes(id));
      newFilters.billingIds = [...filters.billingIds, ...newSelections];
    }
    onFiltersChange(newFilters);
  };

  const handleSelectAllBehavioralHealth = () => {
    const activeBehavioralHealthIds = behavioralHealth.filter(bh => bh.isActive).map(bh => bh.id);
    const allSelected = activeBehavioralHealthIds.every(id => filters.behavioralHealthIds.includes(id));
    
    const newFilters = { ...filters };
    if (allSelected) {
      // Deselect all
      newFilters.behavioralHealthIds = filters.behavioralHealthIds.filter(id => !activeBehavioralHealthIds.includes(id));
    } else {
      // Select all active behavioral health staff that aren't already selected
      const newSelections = activeBehavioralHealthIds.filter(id => !filters.behavioralHealthIds.includes(id));
      newFilters.behavioralHealthIds = [...filters.behavioralHealthIds, ...newSelections];
    }
    onFiltersChange(newFilters);
  };

  const handleDeleteProviderFlow = (provider: Provider) => {
    openModal('CONFIRMATION_MODAL', {
        title: 'Delete Provider',
        message: `Are you sure you want to delete provider "${provider.name}"? This will also delete all their associated shifts.`,
        onConfirm: async () => { 
            await deleteProvider(provider.id);
        },
        confirmText: 'Delete Provider',
        confirmButtonClass: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
    });
  };

  const handleDeleteClinicTypeFlow = (clinic: ClinicType) => {
    openModal('CONFIRMATION_MODAL', {
        title: 'Delete Clinic Type',
        message: `Are you sure you want to delete clinic type "${clinic.name}"? This will unassign it from all shifts.`,
        onConfirm: async () => { 
            await deleteClinicType(clinic.id);
        },
        confirmText: 'Delete Clinic Type',
        confirmButtonClass: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
    });
  };

  const handleDeleteMedicalAssistantFlow = (ma: MedicalAssistant) => {
    openModal('CONFIRMATION_MODAL', {
        title: 'Delete Medical Assistant',
        message: `Are you sure you want to delete Medical Assistant "${ma.name}"? This will unassign them from all shifts.`,
        onConfirm: async () => {
            await deleteMedicalAssistant(ma.id);
        },
        confirmText: 'Delete MA',
        confirmButtonClass: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
    });
  };

  const handleDeleteFrontStaffFlow = (fs: FrontStaff) => {
    openModal('CONFIRMATION_MODAL', {
        title: 'Delete Front Staff',
        message: `Are you sure you want to delete Front Staff "${fs.name}"? This will unassign them from all shifts.`,
        onConfirm: async () => {
            await deleteFrontStaff(fs.id);
        },
        confirmText: 'Delete Front Staff',
        confirmButtonClass: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
    });
  };

  const handleDeleteBillingFlow = (billing: Billing) => {
    openModal('CONFIRMATION_MODAL', {
        title: 'Delete Billing Staff',
        message: `Are you sure you want to delete Billing Staff "${billing.name}"? This will unassign them from all shifts.`,
        onConfirm: async () => {
            await deleteBilling(billing.id);
        },
        confirmText: 'Delete Billing Staff',
        confirmButtonClass: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
    });
  };

  const handleDeleteBehavioralHealthFlow = (bh: BehavioralHealth) => {
    openModal('CONFIRMATION_MODAL', {
        title: 'Delete Behavioral Health Staff',
        message: `Are you sure you want to delete Behavioral Health Staff "${bh.name}"? This will unassign them from all shifts.`,
        onConfirm: async () => {
            await deleteBehavioralHealth(bh.id);
        },
        confirmText: 'Delete BH Staff',
        confirmButtonClass: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
    });
  };


  return (
    <>
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={toggleSidebar}
          aria-hidden="true" 
        ></div>
      )}
      <aside 
        className={`fixed lg:static top-0 left-0 h-full bg-gray-800 text-white w-64 md:w-72 space-y-6 py-7 px-2 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out z-50 shadow-lg flex flex-col`}
        aria-label="Filters and Management Sidebar"
      >
          <div className="px-4 mb-4 flex justify-between items-center">
             <h2 className="text-xl font-semibold">Filters & Manage</h2>
             <button 
                onClick={toggleSidebar} 
                className="lg:hidden text-gray-300 hover:text-white p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-white"
                aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
                aria-expanded={isSidebarOpen}
              >
                <ChevronRightIcon className="w-6 h-6 transform rotate-180" />
            </button>
          </div>

        <nav className="flex-grow overflow-y-auto pr-1" aria-label="Main navigation filters">
          {/* Options Section */}
          <div className="px-3 mb-2">
              <button 
                onClick={() => setOptionsOpen(!optionsOpen)} 
                className="flex items-center justify-between w-full text-sm font-medium text-gray-100 hover:text-white mb-1 py-1 px-1 rounded-md focus:outline-none focus:ring-1 focus:ring-white"
                aria-expanded={optionsOpen}
                aria-controls={optionsSectionId}
              >
                View Options
                <ChevronRightIcon className={`w-4 h-4 transform transition-transform ${optionsOpen ? 'rotate-90' : ''}`} />
              </button>
              {optionsOpen && (
                <div id={optionsSectionId} className="space-y-1 pl-1">
                   <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="showVacationsFilter"
                      checked={filters.showVacations}
                      onChange={(e) => handleShowVacationsChange(e.target.checked)}
                      className="h-3 w-3 text-blue-500 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-offset-gray-800"
                    />
                    <label htmlFor="showVacationsFilter" className="ml-2 text-xs text-gray-300">Show Vacations / Time-off</label>
                  </div>
                </div>
              )}
          </div>

          {/* Building Section */}
          <div className="px-3 mb-2">
            <div className="flex items-center justify-between">
              <button 
                onClick={() => setClinicsOpen(!clinicsOpen)} 
                className="flex items-center text-sm font-medium text-gray-100 hover:text-white mb-1 py-1 px-1 rounded-md focus:outline-none focus:ring-1 focus:ring-white w-full text-left"
                aria-expanded={clinicsOpen}
                aria-controls={clinicsSectionId}
              >
                 <BriefcaseIcon className="w-4 h-4 mr-1 flex-shrink-0" /> Building
                 <ChevronRightIcon className={`w-4 h-4 ml-auto transform transition-transform flex-shrink-0 ${clinicsOpen ? 'rotate-90' : ''}`} />
              </button>
              {isAdmin && (
                <button
                  onClick={() => openModal('CLINIC_TYPE_FORM')}
                  className="p-1 text-blue-400 hover:text-blue-300 rounded-md focus:outline-none focus:ring-1 focus:ring-white flex-shrink-0 ml-1"
                   title="Add Building"
                   aria-label="Add New Building"
                >
                  <PlusIcon className="w-4 h-4" />
                </button>
              )}
            </div>
            {clinicsOpen && (
              <div>
                {clinics.length > 1 && (
                  <div className="mb-2 px-1">
                    <button
                      onClick={handleSelectAllClinics}
                      className="flex items-center text-xs text-blue-400 hover:text-blue-300 py-1 px-2 rounded-md hover:bg-gray-700 transition-colors"
                      title="Select/Deselect All Active Buildings"
                    >
                      <SelectAllIcon className="w-3 h-3 mr-1.5" />
                      <span>Select All</span>
                    </button>
                  </div>
                )}
                <ul id={clinicsSectionId} className="space-y-0.5 max-h-80 overflow-y-auto pr-1">
                  {clinics.map(clinic => (
                  <li key={clinic.id} className={`p-1.5 rounded-md group ${clinic.isActive ? 'hover:bg-gray-700' : 'opacity-60 hover:bg-gray-700'}`}>
                    <div className="flex items-center justify-between">
                      <label className="flex items-center text-xs cursor-pointer w-full">
                        <input
                          type="checkbox"
                          aria-labelledby={`clinic-name-${clinic.id}`}
                          checked={filters.clinicTypeIds.includes(clinic.id)}
                          onChange={() => handleClinicFilterChange(clinic.id)}
                          className="h-3 w-3 text-blue-500 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-offset-gray-800 mr-1.5 flex-shrink-0"
                        />
                        <span className={`w-2.5 h-2.5 rounded-full mr-1.5 flex-shrink-0 ${clinic.color}`} aria-hidden="true"></span>
                        <span id={`clinic-name-${clinic.id}`} className="truncate" title={clinic.name}>{clinic.name}</span>
                        {!clinic.isActive && <span className="ml-1 text-[10px] text-gray-400">(Inactive)</span>}
                      </label>
                       {isAdmin && (
                        <div className="flex items-center space-x-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                          <button onClick={() => openModal('CLINIC_TYPE_FORM', { clinicType: clinic })} className="p-0.5 text-gray-400 hover:text-white rounded-md focus:outline-none focus:ring-1 focus:ring-white" title="Edit Building" aria-label={`Edit building ${clinic.name}`}>
                            <EditIcon className="w-3 h-3" />
                          </button>
                           <button onClick={() => handleDeleteClinicTypeFlow(clinic)} className="p-0.5 text-red-400 hover:text-red-300 rounded-md focus:outline-none focus:ring-1 focus:ring-white" title="Delete Building" aria-label={`Delete building ${clinic.name}`}>
                            <TrashIcon className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
                   {clinics.length === 0 && <li className="text-xs text-gray-400 italic pl-1">No buildings yet.</li>}
                </ul>
              </div>
            )}
          </div>

          {/* Providers Section */}
          <div className="px-3 mb-2">
            <div className="flex items-center justify-between">
              <button 
                onClick={() => setProvidersOpen(!providersOpen)} 
                className="flex items-center text-sm font-medium text-gray-100 hover:text-white mb-1 py-1 px-1 rounded-md focus:outline-none focus:ring-1 focus:ring-white w-full text-left"
                aria-expanded={providersOpen}
                aria-controls={providersSectionId}
              >
                <UsersIcon className="w-4 h-4 mr-1 flex-shrink-0" /> Providers
                <ChevronRightIcon className={`w-4 h-4 ml-auto transform transition-transform flex-shrink-0 ${providersOpen ? 'rotate-90' : ''}`} />
              </button>
              {isAdmin && (
                <button
                  onClick={() => openModal('PROVIDER_FORM')}
                  className="p-1.5 md:p-1 text-blue-400 hover:text-blue-300 rounded-md focus:outline-none focus:ring-1 focus:ring-white flex-shrink-0 ml-1 touch-manipulation"
                  title="Add Provider"
                  aria-label="Add New Provider"
                >
                  <PlusIcon className="w-4 h-4" />
                </button>
              )}
            </div>
            {providersOpen && (
              <div>
                {providers.length > 1 && (
                  <div className="mb-2 px-1">
                    <button
                      onClick={handleSelectAllProviders}
                      className="flex items-center text-xs text-blue-400 hover:text-blue-300 py-1 px-2 rounded-md hover:bg-gray-700 transition-colors"
                      title="Select/Deselect All Active Providers"
                    >
                      <SelectAllIcon className="w-3 h-3 mr-1.5" />
                      <span>Select All</span>
                    </button>
                  </div>
                )}
                <ul id={providersSectionId} className="space-y-0.5 max-h-80 overflow-y-auto pr-1">
                  {providers.map(provider => (
                   <DraggableProviderItem
                      key={provider.id}
                      provider={provider}
                      filters={filters}
                      onFilterChange={handleProviderFilterChange}
                      onEdit={(p) => openModal('PROVIDER_FORM', { provider: p })}
                      onDelete={handleDeleteProviderFlow}
                      isAdmin={isAdmin}
                    />
                ))}
                  {providers.length === 0 && <li className="text-xs text-gray-400 italic pl-1">No providers yet.</li>}
                </ul>
              </div>
            )}
          </div>

          {/* Medical Assistants Section */}
          <div className="px-3 mb-2">
            <div className="flex items-center justify-between">
              <button 
                onClick={() => setMedicalAssistantsOpen(!medicalAssistantsOpen)} 
                className="flex items-center text-sm font-medium text-gray-100 hover:text-white mb-1 py-1 px-1 rounded-md focus:outline-none focus:ring-1 focus:ring-white w-full text-left"
                aria-expanded={medicalAssistantsOpen}
                aria-controls={medicalAssistantsSectionId}
              >
                <UsersGroupIcon className="w-4 h-4 mr-1 flex-shrink-0" /> Medical Assistants
                <ChevronRightIcon className={`w-4 h-4 ml-auto transform transition-transform flex-shrink-0 ${medicalAssistantsOpen ? 'rotate-90' : ''}`} />
              </button>
              {isAdmin && (
                <button
                  onClick={() => openModal('MEDICAL_ASSISTANT_FORM')}
                  className="p-1 text-blue-400 hover:text-blue-300 rounded-md focus:outline-none focus:ring-1 focus:ring-white flex-shrink-0 ml-1"
                  title="Add Medical Assistant"
                  aria-label="Add New Medical Assistant"
                >
                  <PlusIcon className="w-4 h-4" />
                </button>
              )}
            </div>
            {medicalAssistantsOpen && (
              <div>
                {medicalAssistants.length > 1 && (
                  <div className="mb-2 px-1">
                    <button
                      onClick={handleSelectAllMAs}
                      className="flex items-center text-xs text-blue-400 hover:text-blue-300 py-1 px-2 rounded-md hover:bg-gray-700 transition-colors"
                      title="Select/Deselect All Active Medical Assistants"
                    >
                      <SelectAllIcon className="w-3 h-3 mr-1.5" />
                      <span>Select All</span>
                    </button>
                  </div>
                )}
                <ul id={medicalAssistantsSectionId} className="space-y-0.5 max-h-80 overflow-y-auto pr-1">
                  {medicalAssistants.map(ma => (
                  <li key={ma.id} className={`p-1.5 rounded-md group ${ma.isActive ? 'hover:bg-gray-700' : 'opacity-60 hover:bg-gray-700'}`}>
                    <div className="flex items-center justify-between">
                      <label className="flex items-center text-xs cursor-pointer w-full">
                        <input
                          type="checkbox"
                          aria-labelledby={`ma-name-${ma.id}`}
                          checked={filters.medicalAssistantIds.includes(ma.id)}
                          onChange={() => handleMAFilterChange(ma.id)}
                          className="h-3 w-3 text-blue-500 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-offset-gray-800 mr-1.5 flex-shrink-0"
                        />
                        <span className={`w-2.5 h-2.5 rounded-full mr-1.5 flex-shrink-0 ${ma.color}`} aria-hidden="true"></span>
                        <span id={`ma-name-${ma.id}`} className="truncate" title={ma.name}>{ma.name}</span>
                        {!ma.isActive && <span className="ml-1 text-[10px] text-gray-400">(Inactive)</span>}
                      </label>
                      {isAdmin && (
                        <div className="flex items-center space-x-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                          <button onClick={() => openModal('MEDICAL_ASSISTANT_FORM', { medicalAssistant: ma })} className="p-0.5 text-gray-400 hover:text-white rounded-md focus:outline-none focus:ring-1 focus:ring-white" title="Edit MA" aria-label={`Edit Medical Assistant ${ma.name}`}>
                            <EditIcon className="w-3 h-3" />
                          </button>
                          <button onClick={() => handleDeleteMedicalAssistantFlow(ma)} className="p-0.5 text-red-400 hover:text-red-300 rounded-md focus:outline-none focus:ring-1 focus:ring-white" title="Delete MA" aria-label={`Delete Medical Assistant ${ma.name}`}>
                            <TrashIcon className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
                  {medicalAssistants.length === 0 && <li className="text-xs text-gray-400 italic pl-1">No MAs yet.</li>}
                </ul>
              </div>
            )}
          </div>

          {/* Front Staff Section */}
          <div className="px-3 mb-2">
            <div className="flex items-center justify-between">
              <button 
                onClick={() => setFrontStaffOpen(!frontStaffOpen)} 
                className="flex items-center text-sm font-medium text-gray-100 hover:text-white mb-1 py-1 px-1 rounded-md focus:outline-none focus:ring-1 focus:ring-white w-full text-left"
                aria-expanded={frontStaffOpen}
                aria-controls={frontStaffSectionId}
              >
                <UsersIcon className="w-4 h-4 mr-1 flex-shrink-0" /> Front Staff
                <ChevronRightIcon className={`w-4 h-4 ml-auto transform transition-transform flex-shrink-0 ${frontStaffOpen ? 'rotate-90' : ''}`} />
              </button>
              {isAdmin && (
                <button
                  onClick={() => openModal('FRONT_STAFF_FORM')}
                  className="p-1 text-blue-400 hover:text-blue-300 rounded-md focus:outline-none focus:ring-1 focus:ring-white flex-shrink-0 ml-1"
                  title="Add Front Staff"
                  aria-label="Add New Front Staff"
                >
                  <PlusIcon className="w-4 h-4" />
                </button>
              )}
            </div>
            {frontStaffOpen && (
              <div>
                {frontStaff.length > 1 && (
                  <div className="mb-2 px-1">
                    <button
                      onClick={handleSelectAllFrontStaff}
                      className="flex items-center text-xs text-blue-400 hover:text-blue-300 py-1 px-2 rounded-md hover:bg-gray-700 transition-colors"
                      title="Select/Deselect All Active Front Staff"
                    >
                      <SelectAllIcon className="w-3 h-3 mr-1.5" />
                      <span>Select All</span>
                    </button>
                  </div>
                )}
                <ul id={frontStaffSectionId} className="space-y-0.5 max-h-80 overflow-y-auto pr-1">
                  {frontStaff.map(fs => (
                  <li key={fs.id} className={`p-1.5 rounded-md group ${fs.isActive ? 'hover:bg-gray-700' : 'opacity-60 hover:bg-gray-700'}`}>
                    <div className="flex items-center justify-between">
                      <label className="flex items-center text-xs cursor-pointer w-full">
                        <input
                          type="checkbox"
                          aria-labelledby={`fs-name-${fs.id}`}
                          checked={filters.frontStaffIds.includes(fs.id)}
                          onChange={() => handleFrontStaffFilterChange(fs.id)}
                          className="h-3 w-3 text-blue-500 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-offset-gray-800 mr-1.5 flex-shrink-0"
                        />
                        <span className={`w-2.5 h-2.5 rounded-full mr-1.5 flex-shrink-0 ${fs.color}`} aria-hidden="true"></span>
                        <span id={`fs-name-${fs.id}`} className="truncate" title={fs.name}>{fs.name}</span>
                        {!fs.isActive && <span className="ml-1 text-[10px] text-gray-400">(Inactive)</span>}
                      </label>
                      {isAdmin && (
                        <div className="flex items-center space-x-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                          <button onClick={() => openModal('FRONT_STAFF_FORM', { frontStaff: fs })} className="p-0.5 text-gray-400 hover:text-white rounded-md focus:outline-none focus:ring-1 focus:ring-white" title="Edit Front Staff" aria-label={`Edit Front Staff ${fs.name}`}>
                            <EditIcon className="w-3 h-3" />
                          </button>
                          <button onClick={() => handleDeleteFrontStaffFlow(fs)} className="p-0.5 text-red-400 hover:text-red-300 rounded-md focus:outline-none focus:ring-1 focus:ring-white" title="Delete Front Staff" aria-label={`Delete Front Staff ${fs.name}`}>
                            <TrashIcon className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
                  {frontStaff.length === 0 && <li className="text-xs text-gray-400 italic pl-1">No front staff yet.</li>}
                </ul>
              </div>
            )}
          </div>

          {/* Billing Section */}
          <div className="px-3 mb-2">
            <div className="flex items-center justify-between">
              <button 
                onClick={() => setBillingOpen(!billingOpen)} 
                className="flex items-center text-sm font-medium text-gray-100 hover:text-white mb-1 py-1 px-1 rounded-md focus:outline-none focus:ring-1 focus:ring-white w-full text-left"
                aria-expanded={billingOpen}
                aria-controls={billingSectionId}
              >
                <BriefcaseIcon className="w-4 h-4 mr-1 flex-shrink-0" /> Billing
                <ChevronRightIcon className={`w-4 h-4 ml-auto transform transition-transform flex-shrink-0 ${billingOpen ? 'rotate-90' : ''}`} />
              </button>
              {isAdmin && (
                <button
                  onClick={() => openModal('BILLING_FORM')}
                  className="p-1 text-blue-400 hover:text-blue-300 rounded-md focus:outline-none focus:ring-1 focus:ring-white flex-shrink-0 ml-1"
                  title="Add Billing Staff"
                  aria-label="Add New Billing Staff"
                >
                  <PlusIcon className="w-4 h-4" />
                </button>
              )}
            </div>
            {billingOpen && (
              <div>
                {billing.length > 1 && (
                  <div className="mb-2 px-1">
                    <button
                      onClick={handleSelectAllBilling}
                      className="flex items-center text-xs text-blue-400 hover:text-blue-300 py-1 px-2 rounded-md hover:bg-gray-700 transition-colors"
                      title="Select/Deselect All Active Billing Staff"
                    >
                      <SelectAllIcon className="w-3 h-3 mr-1.5" />
                      <span>Select All</span>
                    </button>
                  </div>
                )}
                <ul id={billingSectionId} className="space-y-0.5 max-h-80 overflow-y-auto pr-1">
                  {billing.map(b => (
                  <li key={b.id} className={`p-1.5 rounded-md group ${b.isActive ? 'hover:bg-gray-700' : 'opacity-60 hover:bg-gray-700'}`}>
                    <div className="flex items-center justify-between">
                      <label className="flex items-center text-xs cursor-pointer w-full">
                        <input
                          type="checkbox"
                          aria-labelledby={`billing-name-${b.id}`}
                          checked={filters.billingIds.includes(b.id)}
                          onChange={() => handleBillingFilterChange(b.id)}
                          className="h-3 w-3 text-blue-500 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-offset-gray-800 mr-1.5 flex-shrink-0"
                        />
                        <span className={`w-2.5 h-2.5 rounded-full mr-1.5 flex-shrink-0 ${b.color}`} aria-hidden="true"></span>
                        <span id={`billing-name-${b.id}`} className="truncate" title={b.name}>{b.name}</span>
                        {!b.isActive && <span className="ml-1 text-[10px] text-gray-400">(Inactive)</span>}
                      </label>
                      {isAdmin && (
                        <div className="flex items-center space-x-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                          <button onClick={() => openModal('BILLING_FORM', { billing: b })} className="p-0.5 text-gray-400 hover:text-white rounded-md focus:outline-none focus:ring-1 focus:ring-white" title="Edit Billing Staff" aria-label={`Edit Billing Staff ${b.name}`}>
                            <EditIcon className="w-3 h-3" />
                          </button>
                          <button onClick={() => handleDeleteBillingFlow(b)} className="p-0.5 text-red-400 hover:text-red-300 rounded-md focus:outline-none focus:ring-1 focus:ring-white" title="Delete Billing Staff" aria-label={`Delete Billing Staff ${b.name}`}>
                            <TrashIcon className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
                  {billing.length === 0 && <li className="text-xs text-gray-400 italic pl-1">No billing staff yet.</li>}
                </ul>
              </div>
            )}
          </div>

          {/* Behavioral Health Section */}
          <div className="px-3 mb-2">
            <div className="flex items-center justify-between">
              <button 
                onClick={() => setBehavioralHealthOpen(!behavioralHealthOpen)} 
                className="flex items-center text-sm font-medium text-gray-100 hover:text-white mb-1 py-1 px-1 rounded-md focus:outline-none focus:ring-1 focus:ring-white w-full text-left"
                aria-expanded={behavioralHealthOpen}
                aria-controls={behavioralHealthSectionId}
              >
                <UsersGroupIcon className="w-4 h-4 mr-1 flex-shrink-0" /> Behavioral Health
                <ChevronRightIcon className={`w-4 h-4 ml-auto transform transition-transform flex-shrink-0 ${behavioralHealthOpen ? 'rotate-90' : ''}`} />
              </button>
              {isAdmin && (
                <button
                  onClick={() => openModal('BEHAVIORAL_HEALTH_FORM')}
                  className="p-1 text-blue-400 hover:text-blue-300 rounded-md focus:outline-none focus:ring-1 focus:ring-white flex-shrink-0 ml-1"
                  title="Add Behavioral Health Staff"
                  aria-label="Add New Behavioral Health Staff"
                >
                  <PlusIcon className="w-4 h-4" />
                </button>
              )}
            </div>
            {behavioralHealthOpen && (
              <div>
                {behavioralHealth.length > 1 && (
                  <div className="mb-2 px-1">
                    <button
                      onClick={handleSelectAllBehavioralHealth}
                      className="flex items-center text-xs text-blue-400 hover:text-blue-300 py-1 px-2 rounded-md hover:bg-gray-700 transition-colors"
                      title="Select/Deselect All Active Behavioral Health Staff"
                    >
                      <SelectAllIcon className="w-3 h-3 mr-1.5" />
                      <span>Select All</span>
                    </button>
                  </div>
                )}
                <ul id={behavioralHealthSectionId} className="space-y-0.5 max-h-80 overflow-y-auto pr-1">
                  {behavioralHealth.map(bh => (
                  <li key={bh.id} className={`p-1.5 rounded-md group ${bh.isActive ? 'hover:bg-gray-700' : 'opacity-60 hover:bg-gray-700'}`}>
                    <div className="flex items-center justify-between">
                      <label className="flex items-center text-xs cursor-pointer w-full">
                        <input
                          type="checkbox"
                          aria-labelledby={`bh-name-${bh.id}`}
                          checked={filters.behavioralHealthIds.includes(bh.id)}
                          onChange={() => handleBehavioralHealthFilterChange(bh.id)}
                          className="h-3 w-3 text-blue-500 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-offset-gray-800 mr-1.5 flex-shrink-0"
                        />
                        <span className={`w-2.5 h-2.5 rounded-full mr-1.5 flex-shrink-0 ${bh.color}`} aria-hidden="true"></span>
                        <span id={`bh-name-${bh.id}`} className="truncate" title={bh.name}>{bh.name}</span>
                        {!bh.isActive && <span className="ml-1 text-[10px] text-gray-400">(Inactive)</span>}
                      </label>
                      {isAdmin && (
                        <div className="flex items-center space-x-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                          <button onClick={() => openModal('BEHAVIORAL_HEALTH_FORM', { behavioralHealth: bh })} className="p-0.5 text-gray-400 hover:text-white rounded-md focus:outline-none focus:ring-1 focus:ring-white" title="Edit Behavioral Health Staff" aria-label={`Edit Behavioral Health Staff ${bh.name}`}>
                            <EditIcon className="w-3 h-3" />
                          </button>
                          <button onClick={() => handleDeleteBehavioralHealthFlow(bh)} className="p-0.5 text-red-400 hover:text-red-300 rounded-md focus:outline-none focus:ring-1 focus:ring-white" title="Delete Behavioral Health Staff" aria-label={`Delete Behavioral Health Staff ${bh.name}`}>
                            <TrashIcon className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
                  {behavioralHealth.length === 0 && <li className="text-xs text-gray-400 italic pl-1">No behavioral health staff yet.</li>}
                </ul>
              </div>
            )}
          </div>

          {/* User Management Section - Admin Only */}
          {isAdmin && (
            <div className="px-3 mt-4 border-t border-gray-700 pt-4">
              <button
                onClick={() => setShowUserManagement(!showUserManagement)}
                className="flex items-center text-sm font-medium text-gray-100 hover:text-white py-2 px-1 rounded-md focus:outline-none focus:ring-1 focus:ring-white w-full text-left"
              >
                <UsersIcon className="w-4 h-4 mr-1 flex-shrink-0" /> User Management
                <ChevronRightIcon className={`w-4 h-4 ml-auto transform transition-transform flex-shrink-0 ${showUserManagement ? 'rotate-90' : ''}`} />
              </button>
              {showUserManagement && (
                <div className="mt-2">
                  <button
                    onClick={() => openModal('USER_MANAGEMENT')}
                    className="w-full text-left text-xs px-2 py-1.5 rounded-md hover:bg-gray-700 text-gray-200"
                  >
                    Manage Users
                  </button>
                </div>
              )}
            </div>
          )}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;