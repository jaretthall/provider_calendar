import React, { useContext, useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

import { AppContext, ModalContext, ToastContext } from '../App';
import { Provider, ClinicType, FilterState, MedicalAssistant } from '../types';
import { usePermissions } from '../hooks/useAuth';
import { getInitials } from '../utils/dateUtils';
import PlusIcon from './icons/PlusIcon';
import EditIcon from './icons/EditIcon';
import TrashIcon from './icons/TrashIcon';
import UsersIcon from './icons/UsersIcon';
import UsersGroupIcon from './icons/UsersGroupIcon';
import BriefcaseIcon from './icons/BriefcaseIcon';
import ChevronRightIcon from './icons/ChevronRightIcon';
import EyeIcon from './icons/EyeIcon';
import EyeSlashIcon from './icons/EyeSlashIcon';
import ChevronDownIcon from './icons/ChevronDownIcon';
import MenuIcon from './icons/MenuIcon';
import XIcon from './icons/XIcon';
import PencilIcon from './icons/PencilIcon';

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
      className={`p-1.5 rounded-md group ${provider.isActive ? (isAdmin ? 'hover:bg-gray-700 cursor-grab' : 'hover:bg-gray-700') : 'opacity-60 hover:bg-gray-700'} ${isDragging ? 'shadow-lg' : ''}`}
      {...attributes} // Spread attributes for accessibility, etc.
      // Conditionally spread listeners only if admin, to disable drag for non-admins
      {...(isAdmin ? listeners : {})} 
    >
      <div className="flex items-center justify-between">
        <label className="flex items-center text-xs cursor-pointer w-full">
          <input
            type="checkbox"
            aria-labelledby={`provider-name-${provider.id}`}
            checked={filters.providerIds.includes(provider.id)}
            onChange={() => onFilterChange(provider.id)}
            className="h-3 w-3 text-blue-500 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-offset-gray-800 mr-1.5 flex-shrink-0"
          />
          <span className={`w-2.5 h-2.5 rounded-full mr-1.5 flex-shrink-0 ${provider.color}`} aria-hidden="true"></span>
          <span id={`provider-name-${provider.id}`} className="truncate" title={provider.name}>{provider.name}</span>
          {!provider.isActive && <span className="ml-1 text-[10px] text-gray-400">(Inactive)</span>}
        </label>
        {isAdmin && (
          <div className="flex items-center space-x-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            <button onClick={() => onEdit(provider)} className="p-0.5 text-gray-400 hover:text-white rounded-md focus:outline-none focus:ring-1 focus:ring-white" title="Edit Provider" aria-label={`Edit provider ${provider.name}`}>
              <EditIcon className="w-3 h-3" />
            </button>
            <button onClick={() => onDelete(provider)} className="p-0.5 text-red-400 hover:text-red-300 rounded-md focus:outline-none focus:ring-1 focus:ring-white" title="Delete Provider" aria-label={`Delete provider ${provider.name}`}>
              <TrashIcon className="w-3 h-3" />
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

  const { providers, clinics, medicalAssistants, deleteProvider, deleteClinicType, deleteMedicalAssistant } = appContext;
  const { getProviderById, getClinicTypeById, getMedicalAssistantById } = appContext;
  const { addToast } = toastContext;
  const { openModal } = modalContext;
  const { isAdmin } = usePermissions();
  
  const [providersOpen, setProvidersOpen] = useState(true);
  const [clinicsOpen, setClinicsOpen] = useState(true);
  const [medicalAssistantsOpen, setMedicalAssistantsOpen] = useState(true);
  const [optionsOpen, setOptionsOpen] = useState(true);
  
  const optionsSectionId = "options-section";
  const providersSectionId = "providers-section";
  const clinicsSectionId = "clinics-section";
  const medicalAssistantsSectionId = "ma-section";


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

  const handleShowVacationsChange = (show: boolean) => {
    onFiltersChange({ ...filters, showVacations: show });
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
        className={`fixed lg:static top-0 left-0 h-full bg-gray-800 text-white w-64 md:w-72 space-y-6 py-7 px-2 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out z-40 shadow-lg flex flex-col`}
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
                  className="p-1 text-blue-400 hover:text-blue-300 rounded-md focus:outline-none focus:ring-1 focus:ring-white flex-shrink-0 ml-1"
                  title="Add Provider"
                  aria-label="Add New Provider"
                >
                  <PlusIcon className="w-4 h-4" />
                </button>
              )}
            </div>
            {providersOpen && (
              <ul id={providersSectionId} className="space-y-0.5 mt-1 max-h-80 overflow-y-auto pr-1">
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
              <ul id={medicalAssistantsSectionId} className="space-y-0.5 mt-1 max-h-80 overflow-y-auto pr-1">
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
            )}
          </div>


          {/* Clinic Types Section */}
          <div className="px-3">
            <div className="flex items-center justify-between">
              <button 
                onClick={() => setClinicsOpen(!clinicsOpen)} 
                className="flex items-center text-sm font-medium text-gray-100 hover:text-white mb-1 py-1 px-1 rounded-md focus:outline-none focus:ring-1 focus:ring-white w-full text-left"
                aria-expanded={clinicsOpen}
                aria-controls={clinicsSectionId}
              >
                 <BriefcaseIcon className="w-4 h-4 mr-1 flex-shrink-0" /> Clinic Types
                 <ChevronRightIcon className={`w-4 h-4 ml-auto transform transition-transform flex-shrink-0 ${clinicsOpen ? 'rotate-90' : ''}`} />
              </button>
              {isAdmin && (
                <button
                  onClick={() => openModal('CLINIC_TYPE_FORM')}
                  className="p-1 text-blue-400 hover:text-blue-300 rounded-md focus:outline-none focus:ring-1 focus:ring-white flex-shrink-0 ml-1"
                   title="Add Clinic Type"
                   aria-label="Add New Clinic Type"
                >
                  <PlusIcon className="w-4 h-4" />
                </button>
              )}
            </div>
            {clinicsOpen && (
              <ul id={clinicsSectionId} className="space-y-0.5 mt-1 max-h-80 overflow-y-auto pr-1">
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
                          <button onClick={() => openModal('CLINIC_TYPE_FORM', { clinicType: clinic })} className="p-0.5 text-gray-400 hover:text-white rounded-md focus:outline-none focus:ring-1 focus:ring-white" title="Edit Clinic Type" aria-label={`Edit clinic type ${clinic.name}`}>
                            <EditIcon className="w-3 h-3" />
                          </button>
                           <button onClick={() => handleDeleteClinicTypeFlow(clinic)} className="p-0.5 text-red-400 hover:text-red-300 rounded-md focus:outline-none focus:ring-1 focus:ring-white" title="Delete Clinic Type" aria-label={`Delete clinic type ${clinic.name}`}>
                            <TrashIcon className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
                 {clinics.length === 0 && <li className="text-xs text-gray-400 italic pl-1">No clinic types yet.</li>}
              </ul>
            )}
          </div>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;