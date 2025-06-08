import React from 'react';
import { VACATION_COLOR } from '../constants';

interface VacationBarProps {
  vacationingProviderInitials: string[];
  onClick?: (e: React.MouseEvent) => void; // Optional: if bar click should do something
}

const VacationBar: React.FC<VacationBarProps> = ({ vacationingProviderInitials, onClick }) => {
  if (!vacationingProviderInitials || vacationingProviderInitials.length === 0) {
    return null;
  }

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.stopPropagation(); // Prevent day click if bar has its own action
      onClick(e);
    }
  };

  return (
    <div
      className={`w-full ${VACATION_COLOR} text-white text-[0.6rem] sm:text-xs font-medium py-0.5 px-1 text-center truncate rounded-b-sm`}
      title={`On Vacation: ${vacationingProviderInitials.join(', ')}`}
      onClick={handleClick} // Add cursor-pointer if clickable
      style={{ lineHeight: '1.2' }} // Adjust line height for small text
      aria-label={`Vacation bar for ${vacationingProviderInitials.join(', ')}`}
    >
      {vacationingProviderInitials.join(', ')}
    </div>
  );
};

export default VacationBar;