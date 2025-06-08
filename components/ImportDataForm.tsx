import React, { useState, useContext, useRef } from 'react';
import { AppContext, ToastContext } from '../App';
import { Provider, ClinicType, Shift, MedicalAssistant } from '../types';
import SpinnerIcon from './icons/SpinnerIcon';
import UploadIcon from './icons/UploadIcon';

interface ImportDataFormProps {
  onClose: () => void;
}

const ImportDataForm: React.FC<ImportDataFormProps> = ({ onClose }) => {
  const appContext = useContext(AppContext);
  const toastContext = useContext(ToastContext);
  if (!appContext || !toastContext) throw new Error("Context not found");

  const { importData } = appContext;
  const { addToast } = toastContext;
  
  const [jsonData, setJsonData] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const exampleProvider: Partial<Provider> = { id:"prov_example_1", name: "Dr. Example", color: "bg-blue-500", isActive: true };
  const exampleClinic: Partial<ClinicType> = { id:"clinic_example_1", name: "Example Clinic", color: "bg-green-500", isActive: true };
  const exampleMA: Partial<MedicalAssistant> = { id:"ma_example_1", name: "MA Example", color: "bg-purple-500", isActive: true };
  const exampleShift: Partial<Shift> = { 
    id:"shift_example_1", 
    providerId: "prov_example_1", 
    clinicTypeId: "clinic_example_1", 
    medicalAssistantIds: ["ma_example_1"],
    startDate: "2024-08-15", 
    endDate: "2024-08-15",
    startTime: "09:00",
    endTime: "17:00",
    isVacation: false 
  };

  const exampleStructure = {
    providers: [exampleProvider],
    clinics: [exampleClinic],
    medicalAssistants: [exampleMA],
    shifts: [exampleShift],
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== "application/json") {
        addToast("Invalid file type. Please select a .json file.", "error");
        setSelectedFileName(null);
        setJsonData(''); 
        if(fileInputRef.current) fileInputRef.current.value = ""; // Reset file input
        return;
      }
      setSelectedFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          JSON.parse(content); // Validate JSON format
          setJsonData(content);
          addToast(`File "${file.name}" loaded successfully. Content is ready for import.`, "info");
        } catch (error) {
          addToast(`Error reading or parsing file "${file.name}": ${error instanceof Error ? error.message : "Invalid JSON content"}`, "error");
          setJsonData('');
          setSelectedFileName(null);
          if(fileInputRef.current) fileInputRef.current.value = "";
        }
      };
      reader.onerror = () => {
        addToast(`Error reading file "${file.name}".`, "error");
        setJsonData('');
        setSelectedFileName(null);
        if(fileInputRef.current) fileInputRef.current.value = "";
      };
      reader.readAsText(file);
    } else {
      setSelectedFileName(null);
      // If file selection is cancelled, don't clear jsonData if it was populated from textarea previously
      // or if it's currently empty.
    }
  };

  const handleImport = async () => {
    if (!jsonData.trim()) {
      addToast('No JSON data to import. Please upload a file or paste JSON content.', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const data = JSON.parse(jsonData);
      // Basic validation for structure
      if (typeof data !== 'object' || data === null) {
        throw new Error('Invalid JSON structure: Must be an object.');
      }
      if (data.providers && !Array.isArray(data.providers)) throw new Error('Providers must be an array.');
      if (data.clinics && !Array.isArray(data.clinics)) throw new Error('Clinics must be an array.');
      if (data.medicalAssistants && !Array.isArray(data.medicalAssistants)) throw new Error('Medical Assistants must be an array.');
      if (data.shifts && !Array.isArray(data.shifts)) throw new Error('Shifts must be an array.');
      
      await importData(data);
      onClose();
    } catch (error) {
      console.error("Import error:", error);
      addToast(`Error importing data: ${error instanceof Error ? error.message : 'Invalid JSON content.'}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="jsonFile" className="block text-sm font-medium text-gray-700 mb-1">
          Upload JSON File
        </label>
        <div className="mt-1 flex items-center space-x-3">
            <input
              type="file"
              id="jsonFile"
              accept=".json,application/json"
              onChange={handleFileChange}
              className="hidden" 
              ref={fileInputRef}
              disabled={isSubmitting}
              aria-describedby="file-upload-status"
            />
            <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSubmitting}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
                <UploadIcon className="h-4 w-4 mr-2" aria-hidden="true" />
                Choose File...
            </button>
            <span id="file-upload-status" className="text-sm text-gray-600 truncate" title={selectedFileName || undefined}>
              {selectedFileName ? selectedFileName : "No file chosen"}
            </span>
        </div>
         <p className="mt-2 text-xs text-gray-500">
          Alternatively, paste JSON content below. If a file is selected above, its content will be used for the import.
        </p>
      </div>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-sm font-medium text-gray-500">OR</span>
        </div>
      </div>

      <div>
        <label htmlFor="jsonDataTextArea" className="block text-sm font-medium text-gray-700">
          Paste JSON Data
        </label>
        <textarea
          id="jsonDataTextArea"
          rows={8}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-mono disabled:bg-gray-100"
          placeholder={`Paste JSON data here. Example:\n${JSON.stringify(exampleStructure, null, 2)}`}
          value={jsonData}
          onChange={(e) => {
            setJsonData(e.target.value);
            // If user types in textarea, deselect file to avoid confusion
            if (selectedFileName || (fileInputRef.current && fileInputRef.current.value)) {
                if (fileInputRef.current) fileInputRef.current.value = "";
                setSelectedFileName(null);
                addToast("File selection cleared as JSON content was manually edited.", "info", 2000);
            }
          }}
          disabled={isSubmitting}
          aria-label="Paste JSON data here"
        />
         <p className="mt-2 text-xs text-gray-500">
          Provide data for 'providers', 'clinics', 'medicalAssistants', and/or 'shifts'. Existing items with the same ID will be updated, others will be added. Ensure dates are in YYYY-MM-DD format and times in HH:mm.
        </p>
      </div>
      <div className="flex justify-end space-x-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-70"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleImport}
          className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
          disabled={isSubmitting || !jsonData.trim()}
          aria-busy={isSubmitting}
        >
          {isSubmitting && <SpinnerIcon className="mr-2 h-4 w-4" aria-hidden="true" />}
          {isSubmitting ? 'Importing...' : 'Import Data'}
        </button>
      </div>
    </div>
  );
};

export default ImportDataForm;