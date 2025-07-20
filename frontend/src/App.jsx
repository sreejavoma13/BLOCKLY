import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

import Signup from './pages/Signup';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home'
import Page from './pages/Page';

import { Toaster } from 'react-hot-toast';

import ProtectedRoute from './components/ProtectedRoute';
import { useNavigate } from 'react-router-dom';
import { useState,useEffect } from 'react';
import CollabEditor from './components/CollabEditor';

function App() {
  return (
    <>
     <div>
      <Toaster  position='top-center'></Toaster>
     </div>
    <Router>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Home/>} />
        <Route path="/page/:pageId" element={<Page />} />
        <Route path="/collabeditor" element={<CollabEditor/>}/>

      </Routes>
    </Router>
    </>
  );
}
export default App;

