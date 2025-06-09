import React from 'react';

interface UserManagementDashboardProps {
  onClose: () => void;
}

const UserManagementDashboard: React.FC<UserManagementDashboardProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl h-3/4 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="text-center py-8">
          <p className="text-gray-600">User Management Dashboard - Implementation in progress</p>
          <p className="text-sm text-gray-500 mt-2">This will allow you to manage user access and permissions</p>
        </div>
      </div>
    </div>
  );
};

export default UserManagementDashboard; 