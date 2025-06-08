import React, { useState, useEffect, useContext } from 'react';
import { MedicalAssistant } from '../types';
import ColorPicker from './ColorPicker';
import { PREDEFINED_COLORS } from '../constants';
import { AppContext, ToastContext } from '../App';
import SpinnerIcon from './icons/SpinnerIcon';

interface MedicalAssistantFormProps {
  medicalAssistant?: MedicalAssistant | null;
  onClose: () => void;
}

const MedicalAssistantForm: React.FC<MedicalAssistantFormProps> = ({ medicalAssistant, onClose }) => {
  const appContext = useContext(AppContext);
  const toastContext = useContext(ToastContext);

  if (!appContext) throw new Error("AppContext not found");
  if (!toastContext) throw new Error("ToastContext not found");

  const { addMedicalAssistant, updateMedicalAssistant } = appContext;
  const { addToast } = toastContext;

  const [name, setName] = useState('');
  const [color, setColor] = useState(PREDEFINED_COLORS[0]);
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (medicalAssistant) {
      setName(medicalAssistant.name);
      setColor(medicalAssistant.color);
      setIsActive(medicalAssistant.isActive);
    } else {
      setName('');
      setColor(PREDEFINED_COLORS[Math.floor(Math.random() * PREDEFINED_COLORS.length)]);
      setIsActive(true);
    }
  }, [medicalAssistant]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      addToast("Medical Assistant name cannot be empty.", 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const maData = {
        name: name.trim(),
        color,
        isActive,
      };

      if (medicalAssistant) {
        await updateMedicalAssistant({ ...medicalAssistant, ...maData, updatedAt: new Date().toISOString() });
      } else {
        await addMedicalAssistant(maData);
      }
      onClose();
    } catch (error) {
      console.error("Error saving medical assistant:", error);
      addToast(`Error saving medical assistant: ${error instanceof Error ? error.message : "Unknown error"}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="maName" className="block text-sm font-medium text-gray-700">
          Medical Assistant Name
        </label>
        <input
          type="text"
          id="maName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          required
          disabled={isSubmitting}
        />
      </div>

      <ColorPicker selectedColor={color} onColorSelect={setColor} />

      <div className="flex items-center">
        <input
          id="maIsActive"
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          disabled={isSubmitting}
        />
        <label htmlFor="maIsActive" className="ml-2 block text-sm text-gray-900">
          Active
        </label>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
        >
          {isSubmitting && <SpinnerIcon className="mr-2 h-4 w-4" />}
          {isSubmitting ? (medicalAssistant ? 'Updating...' : 'Adding...') : (medicalAssistant ? 'Update MA' : 'Add MA')}
        </button>
      </div>
    </form>
  );
};

export default MedicalAssistantForm;