import React, { useEffect, useState } from 'react';
import { ToastMessage } from '../types';
import PlusIcon from './icons/PlusIcon'; // Using Plus as a close icon example

interface ToastProps extends ToastMessage {
  onDismiss: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ id, message, type, duration = 3000, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onDismiss(id), 300); // Wait for fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onDismiss]);

  const baseClasses = "p-4 rounded-md shadow-lg text-white transition-all duration-300 ease-in-out transform";
  const typeClasses = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-yellow-500 text-gray-800', 
  };
  const visibilityClasses = isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4";
  const closeButtonColorClass = type === 'warning' ? 'text-gray-700 hover:text-gray-900' : 'text-white hover:text-gray-200';
  const ariaRole = type === 'error' ? 'alert' : 'status';

  return (
    <div 
      className={`${baseClasses} ${typeClasses[type]} ${visibilityClasses} flex justify-between items-center`}
      role={ariaRole}
      aria-live={type === 'error' ? 'assertive' : 'polite'} // Assertive for errors, polite for others
    >
      <span>{message}</span>
      <button 
        onClick={() => { setIsVisible(false); setTimeout(() => onDismiss(id), 300);}} 
        className={`ml-4 ${closeButtonColorClass}`}
        aria-label="Dismiss toast"
        >
        <PlusIcon className="h-5 w-5 transform rotate-45" /> {/* Close icon */}
      </button>
    </div>
  );
};

interface ToastContainerProps {
  toasts: ToastMessage[];
  dismissToast: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, dismissToast }) => {
  return (
    <div 
      className="fixed bottom-5 right-5 z-[100] space-y-3"
      // aria-live="polite" // Removed individual aria-live from here as it's on each Toast
      // aria-relevant="additions" // Not strictly needed if individual toasts handle their announcements
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onDismiss={dismissToast} />
      ))}
    </div>
  );
};