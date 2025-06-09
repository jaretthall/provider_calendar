import React from 'react';
import { UserProfile } from '../types/userManagement';

interface PendingApprovalProps {
  userProfile: UserProfile | null;
  onRefresh: () => void;
}

const PendingApproval: React.FC<PendingApprovalProps> = ({ userProfile, onRefresh }) => {
  const getStatusMessage = () => {
    switch (userProfile?.status) {
      case 'pending':
        return {
          title: 'Account Pending Approval',
          message: 'Your account has been created and is awaiting administrator approval. You will be able to access the scheduling system once your account has been approved.',
          icon: '⏳',
          color: 'bg-yellow-50 border-yellow-200',
          textColor: 'text-yellow-800',
          iconColor: 'text-yellow-600'
        };
      case 'denied':
        return {
          title: 'Account Access Denied',
          message: 'Your account request has been reviewed and access has been denied. Please contact your administrator if you believe this is an error.',
          icon: '❌',
          color: 'bg-red-50 border-red-200',
          textColor: 'text-red-800',
          iconColor: 'text-red-600'
        };
      case 'suspended':
        return {
          title: 'Account Suspended',
          message: 'Your account has been temporarily suspended. Please contact your administrator for more information.',
          icon: '🚫',
          color: 'bg-red-50 border-red-200',
          textColor: 'text-red-800',
          iconColor: 'text-red-600'
        };
      default:
        return {
          title: 'Account Status Unknown',
          message: 'There appears to be an issue with your account. Please contact your administrator.',
          icon: '❓',
          color: 'bg-gray-50 border-gray-200',
          textColor: 'text-gray-800',
          iconColor: 'text-gray-600'
        };
    }
  };

  const statusInfo = getStatusMessage();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Clinica Provider Schedule
            </h1>
            <p className="text-gray-600">Healthcare Scheduling System</p>
          </div>

          {/* Status Message */}
          <div className={`rounded-lg border p-6 ${statusInfo.color}`}>
            <div className="flex items-start">
              <div className={`text-2xl mr-3 ${statusInfo.iconColor}`}>
                {statusInfo.icon}
              </div>
              <div className="flex-1">
                <h3 className={`text-lg font-semibold mb-2 ${statusInfo.textColor}`}>
                  {statusInfo.title}
                </h3>
                <p className={`text-sm ${statusInfo.textColor} leading-relaxed`}>
                  {statusInfo.message}
                </p>
              </div>
            </div>
          </div>

          {/* User Info */}
          {userProfile && (
            <div className="mt-6 bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Account Information</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <div><span className="font-medium">Email:</span> {userProfile.email}</div>
                {userProfile.full_name && (
                  <div><span className="font-medium">Name:</span> {userProfile.full_name}</div>
                )}
                <div><span className="font-medium">Role:</span> {userProfile.role === 'super_admin' ? 'Super Administrator' : 'Scheduler'}</div>
                <div><span className="font-medium">Status:</span> {userProfile.status.charAt(0).toUpperCase() + userProfile.status.slice(1)}</div>
                <div><span className="font-medium">Created:</span> {new Date(userProfile.created_at).toLocaleDateString()}</div>
              </div>
            </div>
          )}

          {/* Admin Notes */}
          {userProfile?.notes && (
            <div className="mt-4 bg-blue-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-700 mb-2">Administrator Notes</h4>
              <p className="text-sm text-blue-600">{userProfile.notes}</p>
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex flex-col space-y-3">
            <button
              onClick={onRefresh}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
            >
              Refresh Status
            </button>
            
            {userProfile?.status === 'pending' && (
              <div className="text-center">
                <p className="text-xs text-gray-500">
                  Status updates automatically every few minutes
                </p>
              </div>
            )}
          </div>

          {/* Contact Info */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Need help? Contact your system administrator
              </p>
              <div className="mt-2 text-xs text-gray-500">
                Clinica Provider Schedule v_1.0.0
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingApproval; 