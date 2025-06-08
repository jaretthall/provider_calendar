import React from 'react';
import DownloadIcon from './icons/DownloadIcon';
import PrinterIcon from './icons/PrinterIcon';
import SpinnerIcon from './icons/SpinnerIcon';

interface ExportOptionsModalProps {
  onClose: () => void;
  onExportJson: () => void;
  openPdfSetupModal: () => void;
  isSubmitting?: boolean; // Optional prop to indicate if an operation is in progress
}

const ExportOptionsModal: React.FC<ExportOptionsModalProps> = ({ 
  onClose, 
  onExportJson, 
  openPdfSetupModal,
  isSubmitting 
}) => {
  
  const handleJsonExport = () => {
    onExportJson();
    onClose(); // Close modal after initiating JSON export
  };

  const handlePdfSetup = () => {
    openPdfSetupModal(); // This function should handle closing this modal and opening the next
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-700">
        Choose how you want to export your schedule data. You can save all data as a JSON file
        for backup or import, or prepare a customized PDF for printing or sharing.
      </p>

      <div className="space-y-3">
        <button
          type="button"
          onClick={handleJsonExport}
          disabled={isSubmitting}
          className="w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
        >
          {isSubmitting ? (
            <SpinnerIcon className="h-5 w-5 mr-2" />
          ) : (
            <DownloadIcon className="h-5 w-5 mr-2" />
          )}
          Save Data File (JSON)
        </button>

        <button
          type="button"
          onClick={handlePdfSetup}
          disabled={isSubmitting}
          className="w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-teal-400"
        >
          {isSubmitting ? (
             <SpinnerIcon className="h-5 w-5 mr-2" />
          ) : (
            <PrinterIcon className="h-5 w-5 mr-2" />
          )}
          Print / Export to PDF
        </button>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-70"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ExportOptionsModal;