import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { securityShield } from './security/SecurityGuard';
import './index.css';

// Initialize AIMPRO Cyber Security & Anti-Tamper Shield
securityShield.init();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
