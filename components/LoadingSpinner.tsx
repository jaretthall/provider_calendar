import React from 'react';
import SpinnerIcon from './icons/SpinnerIcon';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  className?: string;
  overlay?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  message, 
  className = '',
  overlay = false 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const content = (
    <div className={`flex items-center justify-center space-x-2 ${className}`}>
      <SpinnerIcon className={`${sizeClasses[size]} text-blue-600 animate-spin`} />
      {message && (
        <span className={`${textSizeClasses[size]} text-gray-700 font-medium`}>
          {message}
        </span>
      )}
    </div>
  );

  if (overlay) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 shadow-xl">
          {content}
        </div>
      </div>
    );
  }

  return content;
};

export default LoadingSpinner; 