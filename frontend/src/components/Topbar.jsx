import React from 'react';
import { Bell, Star,Share } from 'lucide-react';
import { Users } from "lucide-react";
import { useTheme } from '../contexts/ThemeContext.jsx';
import { useNavigate } from 'react-router-dom';

const Topbar = () => {
  const { darkMode, toggleDarkMode } = useTheme(); // get darkMode state
  const navigate=useNavigate()

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
         <button
              onClick={() => navigate("/collabeditor")}
              className={`flex items-center px-3 py-1 rounded hover:opacity-90 ${
                darkMode
                  ? "bg-purple-600 text-white"
                  : "bg-purple-500 text-white"
              }`}
            >
              <Users size={16} className="mr-1" />
              Collab
        </button>
        <button>
          <Bell size={20} />
        </button>
      </div>
    </div>
  );
};

export default Topbar;
