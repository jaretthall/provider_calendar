import React from 'react';
import { PREDEFINED_COLORS } from '../constants';

interface ColorPickerProps {
  selectedColor: string;
  onColorSelect: (color: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ selectedColor, onColorSelect }) => {
  const getColorName = (colorClass: string) => {
    // Basic name extraction, e.g., "bg-red-500" -> "red"
    const match = colorClass.match(/bg-([a-zA-Z]+)-(\d+)/);
    if (match && match[1]) {
      return match[1].charAt(0).toUpperCase() + match[1].slice(1);
    }
    return colorClass; // Fallback
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
      <div className="grid grid-cols-7 gap-2" role="radiogroup" aria-label="Color options">
        {PREDEFINED_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            role="radio"
            aria-checked={selectedColor === color}
            className={`w-8 h-8 rounded-full ${color} border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${selectedColor === color ? 'ring-2 ring-offset-2 ring-blue-500 border-blue-600' : 'border-transparent hover:border-gray-400'}`}
            onClick={() => onColorSelect(color)}
            aria-label={`Select color ${getColorName(color)}`}
            tabIndex={0} // Make focusable
            onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); onColorSelect(color); }}}
          >
            {selectedColor === color && (
              <span className="sr-only">(Selected)</span> // For screen readers
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ColorPicker;