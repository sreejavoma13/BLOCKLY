import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import MainArea from '../components/MainArea';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext.jsx';

const Dashboard = () => {
  const { darkMode } = useTheme();
  const activePageId = useSelector(state => state.pages.activePageId);
  const navigate = useNavigate();
  const [welcomeMessage, setWelcomeMessage] = useState(""); //Store welcome message

  useEffect(() => {
    const userString = localStorage.getItem("user");
    let user = null;

    if (userString) {
      user = JSON.parse(userString);

      // ✅ Check if new user
      const createdAtSeconds = user.createdAt._seconds;
      const lastLoginSeconds = user.lastLogin._seconds;

      if (createdAtSeconds === lastLoginSeconds) {
        setWelcomeMessage(`🎉 Welcome to Blockly, ${user.name}!`);
      } else {
        setWelcomeMessage(`👋 Welcome back, ${user.name}!`);
      }
    } else {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div  key={darkMode} className={`${darkMode ? 'dark' : ''}`}>
      <div className="flex h-screen bg-gray-300 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Topbar />
          <div className="flex-1 overflow-auto">
            {activePageId ? (
              // Show MainArea when page selected
              <MainArea />
            ) : (
              // Show welcome by default
              <div className="p-4 flex flex-col justify-center items-center">
                <h1 className="text-2xl font-bold">{welcomeMessage}</h1>
                <p>Select a page or create a new one to get started.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
