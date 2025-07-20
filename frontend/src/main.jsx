import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider } from './contexts/AuthContext.jsx';
import {ThemeProvider} from './contexts/ThemeContext.jsx'
import './styles/index.css';
import App from './App.jsx';
import { Provider } from "react-redux";
import {store} from "./redux/store";
import "@blocknote/mantine/style.css";


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <AuthProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>   
      </AuthProvider>
    </Provider>
  </React.StrictMode>
);


