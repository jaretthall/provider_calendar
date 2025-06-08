import React from 'react';
import { Shift } from '../types';
import { getInitials } from '../utils/dateUtils'; // Assuming getInitials exists

interface ShiftDragOverlayPreviewProps {
  shiftData?: Partial<Shift>;
  providerInitials?: string;
  shiftColor?: string;
  maIndicators?: {initials: string, color: string}[];
}

const MAX_MA_DISPLAY_OVERLAY = 1; // Max MAs to show in overlay for simplicity

const ShiftDragOverlayPreview: React.FC<ShiftDragOverlayPreviewProps> = ({
  shiftData,
  providerInitials,
  shiftColor,
  maIndicators,
}) => {
  if (!shiftData) {
    return (
      <div className="p-2 rounded text-sm font-semibold shadow-lg cursor-grabbing bg-gray-300 text-gray-700">
        Loading preview...
      </div>
    );
  }

  const displayInitials = providerInitials || (shiftData.providerId ? getInitials(shiftData.providerId) : '??');
  const color = shiftColor || shiftData.color || 'bg-gray-400';
  
  // Determine text color based on background for better contrast if needed, simple version:
  const isDarkBg = color.includes('700') || color.includes('800') || color.includes('900') || color.includes('slate') || color.includes('gray');
  const textColorClass = isDarkBg ? 'text-white' : 'text-gray-800';


  return (
    <div 
        className={`flex items-center p-1.5 rounded text-xs font-semibold shadow-lg cursor-grabbing ${color} ${textColorClass} border border-black/20`}
        style={{ minWidth: '80px', opacity: 0.9 }}
    >
      <span className="truncate flex-shrink min-w-0">{displayInitials}</span>
      {maIndicators && maIndicators.length > 0 && (
        <div className="flex items-center ml-1 space-x-0.5 flex-shrink-0">
          {maIndicators.slice(0, MAX_MA_DISPLAY_OVERLAY).map((ma, index) => (
            <div 
              key={index}
              title={`MA: ${ma.initials}`}
              className={`w-2 h-2 rounded-full flex items-center justify-center text-[0.5rem] ${ma.color} border border-white/70`}
              style={{ color: 'white' }} // Keep MA initial white for visibility on their color
            >
              {ma.initials[0]}
            </div>
          ))}
          {maIndicators.length > MAX_MA_DISPLAY_OVERLAY && (
            <span className="text-[0.5rem] ml-0.5 opacity-80">+{maIndicators.length - MAX_MA_DISPLAY_OVERLAY}</span>
          )}
        </div>
      )}
    </div>
  );
};

export default ShiftDragOverlayPreview;