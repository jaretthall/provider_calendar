import React, { useState, useRef, useContext } from 'react';
import { AppContext, ToastContext } from '../App';
import { Provider, ClinicType, Shift, MedicalAssistant } from '../types';
import SpinnerIcon from './icons/SpinnerIcon';
import UploadIcon from './icons/UploadIcon';
import { validateImportFile, validateJSONContent, ValidationResult } from '../utils/validation';

interface ImportDataFormProps {
  onClose: () => void;
}

const ImportDataForm: React.FC<ImportDataFormProps> = ({ onClose }) => {
  const appContext = useContext(AppContext);
  const toastContext = useContext(ToastContext);

  if (!appContext) throw new Error("AppContext not found");
  if (!toastContext) throw new Error("ToastContext not found");

  const { importData } = appContext;
  const { addToast } = toastContext;

  const [jsonData, setJsonData] = useState<string>('');
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationStatus, setValidationStatus] = useState<'none' | 'valid' | 'invalid'>('none');
  const [importPreview, setImportPreview] = useState<{
    providers?: number;
    clinics?: number;
    medicalAssistants?: number;
    shifts?: number;
  } | null>(null);
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

  const validateContent = async (content: string) => {
    if (!content.trim()) {
      setValidationErrors([]);
      setValidationStatus('none');
      setImportPreview(null);
      return;
    }

    setIsValidating(true);
    try {
      const validation = await validateJSONContent(content);
      
      if (validation.isValid) {
        setValidationErrors([]);
        setValidationStatus('valid');
        
        // Generate preview
        const data = JSON.parse(content);
        setImportPreview({
          providers: data.providers?.length || 0,
          clinics: data.clinics?.length || 0,
          medicalAssistants: data.medicalAssistants?.length || 0,
          shifts: data.shifts?.length || 0,
        });
        
        addToast('JSON data is valid and ready for import', 'success');
      } else {
        setValidationErrors(validation.errors);
        setValidationStatus('invalid');
        setImportPreview(null);
      }
    } catch (error) {
      setValidationErrors([`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`]);
      setValidationStatus('invalid');
      setImportPreview(null);
    } finally {
      setIsValidating(false);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setSelectedFileName(null);
      return;
    }

    // Validate file
    const fileValidation = validateImportFile(file);
    if (!fileValidation.isValid) {
      addToast(fileValidation.error!, "error");
      setSelectedFileName(null);
      setJsonData('');
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setSelectedFileName(file.name);
    setIsValidating(true);
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        setJsonData(content);
        await validateContent(content);
        addToast(`File "${file.name}" loaded successfully`, "info");
      } catch (error) {
        addToast(`Error reading file "${file.name}": ${error instanceof Error ? error.message : "Unknown error"}`, "error");
        setJsonData('');
        setSelectedFileName(null);
        setValidationErrors([]);
        setValidationStatus('none');
        setImportPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } finally {
        setIsValidating(false);
      }
    };
    
    reader.onerror = () => {
      addToast(`Error reading file "${file.name}"`, "error");
      setJsonData('');
      setSelectedFileName(null);
      setValidationErrors([]);
      setValidationStatus('none');
      setImportPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setIsValidating(false);
    };
    
    reader.readAsText(file);
  };

  const handleTextareaChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const content = e.target.value;
    setJsonData(content);
    setSelectedFileName(null); // Clear file selection when typing
    
    // Debounce validation for textarea input
    if (content.trim()) {
      setTimeout(() => validateContent(content), 500);
    } else {
      setValidationErrors([]);
      setValidationStatus('none');
      setImportPreview(null);
    }
  };

  const handleImport = async () => {
    if (!jsonData.trim()) {
      addToast('No JSON data to import. Please upload a file or paste JSON content.', 'error');
      return;
    }

    if (validationStatus === 'invalid') {
      addToast('Please fix validation errors before importing', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      // Final validation
      const validation = await validateJSONContent(jsonData);
      if (!validation.isValid) {
        setValidationErrors(validation.errors);
        addToast(`Validation failed: ${validation.errors.join(', ')}`, 'error');
        return;
      }

      const data = JSON.parse(jsonData);
      await importData(data);
      
      addToast('Data imported successfully!', 'success');
      onClose();
    } catch (error) {
      console.error("Import error:", error);
      addToast(`Error importing data: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearData = () => {
    setJsonData('');
    setSelectedFileName(null);
    setValidationErrors([]);
    setValidationStatus('none');
    setImportPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const hasValidationErrors = validationErrors.length > 0;
  const canImport = jsonData.trim() && validationStatus === 'valid' && !isValidating && !isSubmitting;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Import Schedule Data</h3>
        <p className="text-sm text-gray-600">
          Upload a JSON file or paste JSON content to import providers, clinic types, medical assistants, and shifts.
        </p>
      </div>

      {/* Validation Status */}
      {isValidating && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex items-center">
            <SpinnerIcon className="h-5 w-5 text-blue-600 mr-3" />
            <span className="text-sm text-blue-800">Validating data...</span>
          </div>
        </div>
      )}

      {/* Validation Errors */}
      {hasValidationErrors && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Validation Errors:</h3>
              <div className="mt-2 text-sm text-red-700">
                <ul className="list-disc pl-5 space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Preview */}
      {importPreview && validationStatus === 'valid' && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <h3 className="text-sm font-medium text-green-800 mb-2">Import Preview:</h3>
          <div className="text-sm text-green-700 grid grid-cols-2 gap-2">
            <div>Providers: {importPreview.providers}</div>
            <div>Clinic Types: {importPreview.clinics}</div>
            <div>Medical Assistants: {importPreview.medicalAssistants}</div>
            <div>Shifts: {importPreview.shifts}</div>
          </div>
        </div>
      )}

      {/* File Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload JSON File
        </label>
        <div className="flex items-center space-x-3">
                     <input
             ref={fileInputRef}
             type="file"
             accept=".json,application/json"
             onChange={handleFileChange}
             className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
             disabled={isSubmitting || isValidating}
             aria-label="Upload JSON file"
           />
          {selectedFileName && (
            <span className="text-sm text-green-600 font-medium">
              {selectedFileName}
            </span>
          )}
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Maximum file size: 10MB. Only .json files are accepted.
        </p>
      </div>

      {/* Manual JSON Input */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Or Paste JSON Content
          </label>
          {jsonData && (
            <button
              type="button"
              onClick={clearData}
              className="text-xs text-gray-500 hover:text-gray-700"
              disabled={isSubmitting || isValidating}
            >
              Clear
            </button>
          )}
        </div>
        <textarea
          value={jsonData}
          onChange={handleTextareaChange}
          placeholder='Paste your JSON data here, e.g., {"providers": [...], "clinics": [...], ...}'
          className={`w-full h-40 px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-mono ${
            hasValidationErrors ? 'border-red-300 bg-red-50' : 
            validationStatus === 'valid' ? 'border-green-300 bg-green-50' : 'border-gray-300'
          }`}
          disabled={isSubmitting || isValidating}
        />
        <div className="flex justify-between mt-1">
          <p className="text-xs text-gray-500">
            {jsonData.length} characters
          </p>
          {validationStatus === 'valid' && (
            <p className="text-xs text-green-600">✓ Valid JSON</p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
          disabled={isSubmitting || isValidating}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleImport}
          className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
          disabled={!canImport}
        >
          {isSubmitting && <SpinnerIcon className="mr-2 h-4 w-4" />}
          {isSubmitting ? 'Importing...' : 'Import Data'}
        </button>
      </div>
    </div>
  );
};

export default ImportDataForm;