import React from 'react';
import { Bell, Star } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext.jsx';

const Topbar = () => {
  const { darkMode, toggleDarkMode } = useTheme(); // get darkMode state

  return (
    <div
      className={`flex justify-between items-center p-2 transition-colors duration-300 
        ${darkMode ? 'bg-gray-900 text-gray-100 border-b border-gray-700' : 'bg-gray-300 text-gray-900 border-b border-gray-400'}
      `}
    >
      <h1 className="text-2xl pacifico-font">
        Blockly
      </h1>
      <div className="flex space-x-4">
        <button>
          <Bell size={20} />
        </button>
      </div>
    </div>
  );
};

export default Topbar;
