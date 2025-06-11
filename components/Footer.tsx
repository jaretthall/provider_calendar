import React from 'react';

interface FooterProps {
  isOnline?: boolean;
  isCheckingConnection?: boolean;
}

const Footer: React.FC<FooterProps> = ({ isOnline = false, isCheckingConnection = false }) => {
  const getStatusDisplay = () => {
    if (isCheckingConnection) {
      return {
        color: 'bg-blue-500',
        text: 'Checking Supabase connection...'
      };
    }
    
    if (isOnline) {
      return {
        color: 'bg-green-500',
        text: 'Connected to Supabase Database'
      };
    }
    
    return {
      color: 'bg-red-500',
      text: '⚠️ LOCAL STORAGE MODE - EXPORT DATA!'
    };
  };

  const status = getStatusDisplay();
  
  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-2 px-4 text-center">
      <div className="flex flex-col items-center space-y-1">
              <p className="text-xs text-gray-500">
        Clinica Provider Schedule v1.0.9
      </p>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${status.color} ${isCheckingConnection ? 'animate-pulse' : ''}`} />
          <span className="text-xs text-gray-500">
            {status.text}
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 