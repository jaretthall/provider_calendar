import React from 'react';

export type EditRecurrenceChoice = 'single' | 'series' | 'cancel';

interface EditRecurrenceChoiceModalProps {
  instanceDate: string; // YYYY-MM-DD formatted date
  onComplete: (choice: EditRecurrenceChoice) => void;
  onClose: () => void; // Added for explicit close/cancel
}

const EditRecurrenceChoiceModal: React.FC<EditRecurrenceChoiceModalProps> = ({ instanceDate, onComplete, onClose }) => {
  const formattedDate = new Date(instanceDate + 'T00:00:00').toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-4">
      <p className="text-gray-700 text-sm">
        This shift is part of a recurring series.
        How would you like to edit the occurrence on <strong className="font-semibold">{formattedDate}</strong>?
      </p>
      <div className="flex flex-col space-y-3 pt-2">
        <button
          onClick={() => onComplete('single')}
          className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Edit Only This Occurrence
        </button>
        <button
          onClick={() => onComplete('series')}
          className="w-full px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
        >
          Edit The Entire Series
        </button>
        <button
          type="button"
          onClick={() => { onComplete('cancel'); onClose(); }}
          className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default EditRecurrenceChoiceModal;