import React from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background:  '#1E2340',
          color:       '#F1F5F9',
          border:      '1px solid rgba(99,102,241,0.3)',
          borderRadius:'12px',
          fontSize:    '14px',
          fontFamily:  'Inter, sans-serif',
        },
        success: { iconTheme: { primary: '#10B981', secondary: '#1E2340' } },
        error:   { iconTheme: { primary: '#EF4444', secondary: '#1E2340' } },
      }}
    />
  </React.StrictMode>
);
