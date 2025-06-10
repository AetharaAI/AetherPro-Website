// src/components/ToolShortcuts.tsx
import React from 'react';
import { FileUp, Search, Paintbrush, Languages, Clipboard, Code } from 'lucide-react';

interface ToolShortcutsProps {
  onFileUploadClick: () => void;
  onSummarizeClick: () => void;
  onTranslateClick: () => void;
  // Add more handlers for other tools
}

const ToolShortcuts: React.FC<ToolShortcutsProps> = ({ 
  onFileUploadClick, 
  onSummarizeClick, 
  onTranslateClick 
}) => {
  return (
    <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
      <button 
        type="button"
        onClick={onFileUploadClick} 
        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        title="Upload Files"
      >
        <FileUp className="w-5 h-5" />
      </button>
      <button 
        type="button"
        onClick={onSummarizeClick} 
        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        title="Summarize Text"
      >
        <Clipboard className="w-5 h-5" />
      </button>
      <button 
        type="button"
        onClick={onTranslateClick} 
        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        title="Translate Text"
      >
        <Languages className="w-5 h-5" />
      </button>
      {/* Add more tool buttons here */}
    </div>
  );
};

export default ToolShortcuts;