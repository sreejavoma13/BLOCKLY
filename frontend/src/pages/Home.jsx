import React from 'react';
import landingImage from '../assets/final.png';
import { Sun, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext.jsx';
import img1 from '../assets/Screenshot1.png'
import img2 from '../assets/Screenshot3.png'
import img3 from '../assets/Screenshot5.png'

function Home() {
  const navigate = useNavigate();
  const { darkMode, toggleTheme } = useTheme();

  return (
    <div
    className={`min-h-screen flex flex-col justify-between ${
      darkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-800'
    }`}
  >
    {/* Header */}
    <header
      className={`flex justify-between items-center p-4 border-b ${
        darkMode ? 'border-gray-700' : 'border-gray-200'
      }`}
    >
      <h1
        className={`text-3xl pacifico-font ${
          darkMode ? 'text-gray-100' : 'text-gray-800'
        }`}
      >
        Blockly
      </h1>
      <div>
        <button
          className={`px-4 py-2 ${
            darkMode
              ? 'text-gray-300 hover:text-white'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          onClick={() => navigate('/login')}
        >
          Log In
        </button>
        <button
          className={`ml-3 px-4 py-2 rounded-3xl ${
            darkMode
              ? 'bg-white text-black hover:bg-gray-200'
              : 'bg-black text-white hover:bg-gray-800'
          }`}
          onClick={() => navigate('/signup')}
        >
          Get Started
        </button>
        <button className="ml-4" onClick={toggleTheme}>
          {darkMode ? (
            <Sun size={22} className="relative top-1 text-yellow-400" />
          ) : (
            <Moon size={22} className="relative top-1 text-gray-600" />
          )}
        </button>
      </div>
    </header>

    {/* Hero Section */}
    <main className="flex flex-col items-center justify-center text-center px-4 py-20">
      <div className="flex flex-col md:flex-row items-center">
        <div>
          <img
            src={landingImage}
            className="mt-[-80px]"
            alt="Landing Illustration"
          />
        </div>
        <div className="mt-8 md:mt-0 md:ml-12">
          <h3
            className={`text-4xl shadows-into-light-regular md:text-5xl font-bold mb-6 ${
              darkMode ? 'text-gray-100' : 'text-gray-900'
            }`}
          >
            UNLEASH YOUR CREATIVITY
          </h3>
          <p
            className={`text-lg montserrat-1 md:text-xl mb-8 max-w-2xl ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            Bring all your thoughts, ideas, tasks, and projects into one
            beautifully designed workspace where creativity meets productivity—
            crafted to help you plan, organize, and execute without limits.
          </p>
          <button
            className={`px-6 py-3 montserrat-1 rounded-3xl text-lg ${
              darkMode
                ? 'bg-white text-black hover:bg-gray-200'
                : 'bg-black text-white hover:bg-gray-800'
            }`}
            onClick={() => navigate('/signup')}
          >
            Get Started
          </button>
        </div>
      </div>
    </main>

    {/* Image Row Section */}
    <section
      className={`py-8 ${
        darkMode ? 'bg-gray-900' : 'bg-white'
      } transition-colors`}
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mx-[-40px]">
          <div
            className={`flex flex-col items-center shadow-md rounded-lg overflow-hidden ${
              darkMode ? 'bg-gray-700' : 'bg-white'
            }`}
          >
            <img
              src={img1}
              alt="Image One"
              className="w-full h-48 object-cover"
            />
            <p
              className={`text-center montserrat-1 font-medium p-3 ${
                darkMode ? 'text-gray-200' : 'text-gray-700'
              }`}
            >
              Write and Organize
            </p>
          </div>

          <div
            className={`flex flex-col items-center shadow-md rounded-lg overflow-hidden ${
              darkMode ? 'bg-gray-700' : 'bg-white'
            }`}
          >
            <img
              src={img2}
              alt="Image Two"
              className="w-full h-48 object-cover"
            />
            <p
              className={`text-center montserrat-1 font-medium p-3 ${
                darkMode ? 'text-gray-200' : 'text-gray-700'
              }`}
            >
              Read and Plan
            </p>
          </div>

          <div
            className={`flex flex-col items-center shadow-md rounded-lg overflow-hidden ${
              darkMode ? 'bg-gray-700' : 'bg-white'
            }`}
          >
            <img
              src={img3}
              alt="Image Three"
              className="w-full h-48 object-cover"
            />
            <p
              className={`text-center montserrat-1 font-medium p-3 ${
                darkMode ? 'text-gray-200' : 'text-gray-700'
              }`}
            >
              Collaborate and Work
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>

  );
}

export default Home;

