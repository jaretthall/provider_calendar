import React, { useState, useEffect, useContext } from 'react';
import { Billing } from '../types';
import ColorPicker from './ColorPicker';
import { PREDEFINED_COLORS } from '../constants';
import { AppContext, ToastContext } from '../App';
import SpinnerIcon from './icons/SpinnerIcon';

interface BillingFormProps {
  billing?: Billing | null;
  onClose: () => void;
}

const BillingForm: React.FC<BillingFormProps> = ({ billing, onClose }) => {
  const appContext = useContext(AppContext);
  const toastContext = useContext(ToastContext);

  if (!appContext) throw new Error("AppContext not found");
  if (!toastContext) throw new Error("ToastContext not found");

  const { billing: allBilling, addBilling, updateBilling } = appContext;
  const { addToast } = toastContext;

  const [name, setName] = useState('');
  const [color, setColor] = useState(PREDEFINED_COLORS[0]);
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (billing) {
      setName(billing.name);
      setColor(billing.color);
      setIsActive(billing.isActive);
    } else {
      setName('');
      setColor(PREDEFINED_COLORS[Math.floor(Math.random() * PREDEFINED_COLORS.length)]);
      setIsActive(true);
    }
    setValidationErrors([]);
    setFieldErrors({});
  }, [billing]);

  // Real-time validation
  useEffect(() => {
    if (name || color) {
      const errors: string[] = [];
      const newFieldErrors: {[key: string]: string} = {};

      // Check name
      if (!name.trim()) {
        errors.push('Name is required');
        newFieldErrors.name = 'Name is required';
      } else if (name.trim().length < 2) {
        errors.push('Name must be at least 2 characters');
        newFieldErrors.name = 'Name must be at least 2 characters';
      } else if (!/^[a-zA-Z0-9\s\-_]+$/.test(name)) {
        errors.push('Name can only contain letters, numbers, spaces, hyphens, and underscores');
        newFieldErrors.name = 'Invalid characters in name';
      }

      // Check for duplicate names
      const duplicate = allBilling.find(b => 
        b.name.toLowerCase() === name.trim().toLowerCase() && 
        b.id !== billing?.id
      );
      if (duplicate) {
        errors.push('A billing staff member with this name already exists');
        newFieldErrors.name = 'This name is already taken';
      }

      // Check color
      if (!color || !color.startsWith('bg-')) {
        errors.push('Please select a valid color');
        newFieldErrors.color = 'Please select a valid color';
      }

      setValidationErrors(errors);
      setFieldErrors(newFieldErrors);
    }
  }, [name, color, allBilling, billing?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validationErrors.length > 0) {
      addToast(`Please fix the following errors: ${validationErrors.join(', ')}`, 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const billingData = {
        name: name.trim(),
        color,
        isActive,
      };

      if (billing) {
        await updateBilling({ ...billing, ...billingData, updatedAt: new Date().toISOString() });
        addToast('Billing staff updated successfully', 'success');
      } else {
        await addBilling(billingData);
        addToast('Billing staff added successfully', 'success');
      }
      onClose();
    } catch (error) {
      console.error("Error saving billing staff:", error);
      addToast(`Error saving billing staff: ${error instanceof Error ? error.message : "Unknown error"}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasErrors = validationErrors.length > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
        <label htmlFor="billingName" className="block text-sm font-medium text-gray-700">
          Billing Staff Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="billingName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
            fieldErrors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
          }`}
          placeholder="Enter billing staff name"
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
          Billing Staff Color <span className="text-red-500">*</span>
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
          id="billingIsActive"
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          disabled={isSubmitting}
        />
        <label htmlFor="billingIsActive" className="ml-2 block text-sm text-gray-900">
          Active (unchecked billing staff won't appear in scheduling options)
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
          {isSubmitting ? (billing ? 'Updating...' : 'Adding...') : (billing ? 'Update Billing Staff' : 'Add Billing Staff')}
        </button>
      </div>
    </form>
  );
};

export default BillingForm;