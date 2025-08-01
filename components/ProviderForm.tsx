import React, { useState, useEffect, useContext } from 'react';
import { Provider } from '../types';
import ColorPicker from './ColorPicker';
import { PREDEFINED_COLORS } from '../constants';
import { AppContext, ToastContext } from '../App'; 
import SpinnerIcon from './icons/SpinnerIcon';
import { validateProviderEnhanced, ValidationResult } from '../utils/validation';

interface ProviderFormProps {
  provider?: Provider | null;
  onClose: () => void;
}

const ProviderForm: React.FC<ProviderFormProps> = ({ provider, onClose }) => {
  const appContext = useContext(AppContext);
  const toastContext = useContext(ToastContext);

  if (!appContext) throw new Error("AppContext not found");
  if (!toastContext) throw new Error("ToastContext not found");

  const { providers, addProvider, updateProvider } = appContext;
  const { addToast } = toastContext;

  const [name, setName] = useState('');
  const [color, setColor] = useState(PREDEFINED_COLORS[0]);
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (provider) {
      setName(provider.name);
      setColor(provider.color);
      setIsActive(provider.isActive);
    } else {
      setName('');
      setColor(PREDEFINED_COLORS[Math.floor(Math.random() * PREDEFINED_COLORS.length)]);
      setIsActive(true);
    }
    // Clear errors when switching between provider edit/create
    setValidationErrors([]);
    setFieldErrors({});
  }, [provider]);

  // Real-time validation
  useEffect(() => {
    if (name || color) {
      const validation = validateProviderEnhanced({
        name,
        color,
        existingProviders: providers.map(p => ({ name: p.name, id: p.id })),
        id: provider?.id
      });
      
      if (!validation.isValid) {
        setValidationErrors(validation.errors);
        // Map errors to specific fields for better UX
        const newFieldErrors: {[key: string]: string} = {};
        validation.errors.forEach(error => {
          if (error.includes('name')) newFieldErrors.name = error;
          if (error.includes('color')) newFieldErrors.color = error;
          if (error.includes('already exists')) newFieldErrors.name = error;
        });
        setFieldErrors(newFieldErrors);
      } else {
        setValidationErrors([]);
        setFieldErrors({});
      }
    }
  }, [name, color, providers, provider?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Final validation before submit
    const validation = validateProviderEnhanced({
      name,
      color,
      existingProviders: providers.map(p => ({ name: p.name, id: p.id })),
      id: provider?.id
    });

    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      addToast(`Please fix the following errors: ${validation.errors.join(', ')}`, 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const providerData = {
        name: name.trim(),
        color,
        isActive,
      };

      if (provider) {
        await updateProvider({ ...provider, ...providerData, updatedAt: new Date().toISOString() });
        addToast('Provider updated successfully', 'success');
      } else {
        await addProvider(providerData);
        addToast('Provider added successfully', 'success');
      }
      onClose();
    } catch (error) {
      console.error("Error saving provider:", error);
      addToast(`Error saving provider: ${error instanceof Error ? error.message : "Unknown error"}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasErrors = validationErrors.length > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Display general validation errors */}
      {hasErrors && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Please fix the following errors:</h3>
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

      <div>
        <label htmlFor="providerName" className="block text-sm font-medium text-gray-700">
          Provider Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="providerName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
            fieldErrors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
          }`}
          placeholder="Enter provider name"
          required
          disabled={isSubmitting}
          maxLength={50}
        />
        {fieldErrors.name && (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.name}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          {name.length}/50 characters • Only letters, numbers, spaces, hyphens, and underscores allowed
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Provider Color <span className="text-red-500">*</span>
        </label>
                 <ColorPicker 
           selectedColor={color} 
           onColorSelect={setColor}
         />
        {fieldErrors.color && (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.color}</p>
        )}
      </div>

      <div className="flex items-center">
        <input
          id="providerIsActive"
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          disabled={isSubmitting}
        />
        <label htmlFor="providerIsActive" className="ml-2 block text-sm text-gray-900">
          Active (unchecked providers won't appear in scheduling options)
        </label>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
          disabled={isSubmitting || hasErrors}
        >
          {isSubmitting && <SpinnerIcon className="mr-2 h-4 w-4" />}
          {isSubmitting ? (provider ? 'Updating...' : 'Adding...') : (provider ? 'Update Provider' : 'Add Provider')}
        </button>
      </div>
    </form>
  );
};

export default ProviderForm;