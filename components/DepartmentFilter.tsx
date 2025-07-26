import React, { useState, useRef, useEffect } from 'react';
import { FilterState } from '../types';
import ChevronDownIcon from './icons/ChevronDownIcon';
import FilterIcon from './icons/FilterIcon';
import CheckIcon from './icons/CheckIcon';

interface DepartmentFilterProps {
  filters: FilterState;
  onFiltersChange: (newFilters: FilterState) => void;
  providerCount: number;
  maCount: number;
  frontStaffCount: number;
  billingCount: number;
  behavioralHealthCount: number;
  buildingCount: number;
  // Data arrays needed for "select all" functionality
  providers: any[];
  medicalAssistants: any[];
  frontStaff: any[];
  billing: any[];
  behavioralHealth: any[];
  clinics: any[];
}

interface FilterPreset {
  name: string;
  description: string;
  departments: string[];
}

const FILTER_PRESETS: FilterPreset[] = [
  {
    name: 'Show All',
    description: 'Show all staff, departments, and vacations',
    departments: []  // Empty means show everything
  },
  {
    name: 'Hide Support Staff',
    description: 'Hide Front Staff, Billing, and Buildings',
    departments: ['frontStaff', 'billing', 'buildings']
  },
  {
    name: 'Hide Administrative',
    description: 'Hide Front Staff and Billing',
    departments: ['frontStaff', 'billing']
  },
  {
    name: 'Hide Medical Staff',
    description: 'Hide Providers and Medical Assistants',
    departments: ['providers', 'medicalAssistants']
  },
  {
    name: 'Hide Vacations',
    description: 'Hide all vacation and time-off entries',
    departments: ['vacations']
  },
  {
    name: 'Medical Only',
    description: 'Show only Providers and Medical Assistants',
    departments: ['frontStaff', 'billing', 'behavioralHealth', 'buildings', 'vacations']
  }
];

const DepartmentFilter: React.FC<DepartmentFilterProps> = ({
  filters,
  onFiltersChange,
  providerCount,
  maCount,
  frontStaffCount,
  billingCount,
  behavioralHealthCount,
  buildingCount,
  providers,
  medicalAssistants,
  frontStaff,
  billing,
  behavioralHealth,
  clinics
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'departments' | 'presets'>('departments');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const departments = [
    {
      key: 'providers',
      label: 'Providers',
      count: providerCount,
      hasItems: filters.providerIds.length > 0,
      icon: '👨‍⚕️'
    },
    {
      key: 'medicalAssistants',
      label: 'Medical Assistants',
      count: maCount,
      hasItems: filters.medicalAssistantIds.length > 0,
      icon: '🩺'
    },
    {
      key: 'frontStaff',
      label: 'Front Staff',
      count: frontStaffCount,
      hasItems: filters.frontStaffIds.length > 0,
      icon: '🗂️'
    },
    {
      key: 'billing',
      label: 'Billing',
      count: billingCount,
      hasItems: filters.billingIds.length > 0,
      icon: '💰'
    },
    {
      key: 'behavioralHealth',
      label: 'Behavioral Health',
      count: behavioralHealthCount,
      hasItems: filters.behavioralHealthIds.length > 0,
      icon: '🧠'
    },
    {
      key: 'buildings',
      label: 'Buildings',
      count: buildingCount,
      hasItems: filters.clinicTypeIds.length > 0,
      icon: '🏥'
    },
    {
      key: 'vacations',
      label: 'Vacations / Time-off',
      count: 0, // Vacations don't have a count like staff
      hasItems: filters.showVacations,
      icon: '🏖️'
    }
  ];

  const activeFiltersCount = departments.filter(d => d.hasItems).length;
  const totalActiveItems = filters.providerIds.length + 
                           filters.medicalAssistantIds.length + 
                           filters.frontStaffIds.length + 
                           filters.billingIds.length + 
                           filters.behavioralHealthIds.length + 
                           filters.clinicTypeIds.length;

  const clearAllFilters = () => {
    onFiltersChange({
      ...filters,
      providerIds: [],
      medicalAssistantIds: [],
      frontStaffIds: [],
      billingIds: [],
      behavioralHealthIds: [],
      clinicTypeIds: [],
      showVacations: true  // Show vacations when showing all
    });
  };

  const selectAllInDepartment = (departmentKey: string) => {
    const newFilters = { ...filters };
    switch (departmentKey) {
      case 'providers':
        newFilters.providerIds = providers.map(p => p.id);
        break;
      case 'medicalAssistants':
        newFilters.medicalAssistantIds = medicalAssistants.map(ma => ma.id);
        break;
      case 'frontStaff':
        newFilters.frontStaffIds = frontStaff.map(fs => fs.id);
        break;
      case 'billing':
        newFilters.billingIds = billing.map(b => b.id);
        break;
      case 'behavioralHealth':
        newFilters.behavioralHealthIds = behavioralHealth.map(bh => bh.id);
        break;
      case 'buildings':
        newFilters.clinicTypeIds = clinics.map(c => c.id);
        break;
      case 'vacations':
        newFilters.showVacations = true;
        break;
    }
    onFiltersChange(newFilters);
  };

  const clearDepartment = (departmentKey: string) => {
    const newFilters = { ...filters };
    switch (departmentKey) {
      case 'providers':
        newFilters.providerIds = [];
        break;
      case 'medicalAssistants':
        newFilters.medicalAssistantIds = [];
        break;
      case 'frontStaff':
        newFilters.frontStaffIds = [];
        break;
      case 'billing':
        newFilters.billingIds = [];
        break;
      case 'behavioralHealth':
        newFilters.behavioralHealthIds = [];
        break;
      case 'buildings':
        newFilters.clinicTypeIds = [];
        break;
      case 'vacations':
        newFilters.showVacations = false;
        break;
    }
    onFiltersChange(newFilters);
  };

  const applyPreset = (preset: FilterPreset) => {
    // Clear all filters first and show vacations by default
    const newFilters: FilterState = {
      ...filters,
      providerIds: [],
      medicalAssistantIds: [],
      frontStaffIds: [],
      billingIds: [],
      behavioralHealthIds: [],
      clinicTypeIds: [],
      showVacations: true
    };

    // Hide departments specified in the preset
    preset.departments.forEach(dept => {
      switch (dept) {
        case 'providers':
          newFilters.providerIds = providers.map(p => p.id);
          break;
        case 'medicalAssistants':
          newFilters.medicalAssistantIds = medicalAssistants.map(ma => ma.id);
          break;
        case 'frontStaff':
          newFilters.frontStaffIds = frontStaff.map(fs => fs.id);
          break;
        case 'billing':
          newFilters.billingIds = billing.map(b => b.id);
          break;
        case 'behavioralHealth':
          newFilters.behavioralHealthIds = behavioralHealth.map(bh => bh.id);
          break;
        case 'buildings':
          newFilters.clinicTypeIds = clinics.map(c => c.id);
          break;
        case 'vacations':
          newFilters.showVacations = false;  // Hide vacations if specified
          break;
      }
    });
    
    onFiltersChange(newFilters);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Filter Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 px-3 py-2.5 md:py-2 text-sm font-medium rounded-md border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors touch-manipulation ${
          activeFiltersCount > 0
            ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
        }`}
      >
        <FilterIcon className="h-4 w-4" />
        <span>Filter Departments</span>
        {activeFiltersCount > 0 && (
          <span className="bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {totalActiveItems}
          </span>
        )}
        <ChevronDownIcon className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {/* Header with tabs */}
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('departments')}
                className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 ${
                  activeTab === 'departments'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                By Department
              </button>
              <button
                onClick={() => setActiveTab('presets')}
                className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 ${
                  activeTab === 'presets'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Quick Presets
              </button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {activeTab === 'departments' && (
              <div className="p-4">
                {/* Quick Actions */}
                <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-700">Quick Actions:</span>
                  <button
                    onClick={clearAllFilters}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium py-1 px-2 rounded touch-manipulation"
                    disabled={activeFiltersCount === 0}
                  >
                    Show All
                  </button>
                </div>

                {/* Department List */}
                <div className="space-y-3">
                  {departments.map((dept) => (
                    <div key={dept.key} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{dept.icon}</span>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-900">
                              {dept.label}
                            </span>
                            {dept.hasItems && (
                              <CheckIcon className="h-4 w-4 text-green-500" />
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            {dept.key === 'vacations' 
                              ? (dept.hasItems ? 'Visible' : 'Hidden')
                              : `${dept.hasItems ? 'Hidden' : 'Visible'} • ${dept.count} total`
                            }
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        {dept.key === 'vacations' ? (
                          // Special handling for vacations toggle
                          <>
                            {!dept.hasItems && (
                              <button
                                onClick={() => selectAllInDepartment(dept.key)}
                                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded"
                              >
                                Show
                              </button>
                            )}
                            {dept.hasItems && (
                              <button
                                onClick={() => clearDepartment(dept.key)}
                                className="text-xs text-red-600 hover:text-red-800 px-2 py-1 rounded"
                              >
                                Hide
                              </button>
                            )}
                          </>
                        ) : (
                          // Normal handling for staff departments with inverted logic
                          <>
                            {!dept.hasItems && (
                              <button
                                onClick={() => selectAllInDepartment(dept.key)}
                                className="text-xs text-red-600 hover:text-red-800 px-2 py-1 rounded"
                              >
                                Hide
                              </button>
                            )}
                            {dept.hasItems && (
                              <button
                                onClick={() => clearDepartment(dept.key)}
                                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded"
                              >
                                Show
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'presets' && (
              <div className="p-4">
                <div className="space-y-2">
                  {FILTER_PRESETS.map((preset, index) => (
                    <button
                      key={index}
                      onClick={() => applyPreset(preset)}
                      className="w-full text-left p-3 rounded-md hover:bg-gray-50 border border-gray-100 hover:border-gray-200 transition-colors"
                    >
                      <div className="font-medium text-sm text-gray-900">
                        {preset.name}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {preset.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-4 py-3 bg-gray-50 rounded-b-lg">
            <div className="text-xs text-gray-500 text-center">
              {activeFiltersCount === 0 
                ? 'All departments visible' 
                : `${activeFiltersCount} departments hidden • ${totalActiveItems} items filtered out`
              }
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentFilter;