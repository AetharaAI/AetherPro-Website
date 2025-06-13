// src/components/ToolButton.tsx
import React from 'react';

interface ToolButtonProps {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  isActive?: boolean;
}

const ToolButton: React.FC<ToolButtonProps> = ({ icon: Icon, label, onClick, disabled, isActive }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex flex-col items-center justify-center space-y-2 p-4 rounded-lg w-32 h-32 transition-all duration-200
        ${isActive 
          ? 'bg-blue-600 text-white shadow-lg scale-105' 
          : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'}
        ${disabled 
          ? 'opacity-50 cursor-not-allowed' 
          : ''}
      `}
    >
      <Icon className="w-8 h-8" />
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
};

export default ToolButton;