import React from 'react';

interface FooterProps {
  isOnline?: boolean;
}

const Footer: React.FC<FooterProps> = ({ isOnline = false }) => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-2 px-4 text-center">
      <div className="flex flex-col items-center space-y-1">
        <p className="text-xs text-gray-500">
          Clinica Provider Schedule v1.0.3
        </p>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-yellow-500'}`} />
          <span className="text-xs text-gray-500">
            {isOnline ? 'Connected to Supabase' : 'Local Storage Mode'}
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 