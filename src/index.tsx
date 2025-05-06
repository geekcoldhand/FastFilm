import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './Main';
import { ControlsProvider } from './hooks/create-controls-context';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <ControlsProvider>
  <React.StrictMode>
   <App></App> 
  </React.StrictMode>
  </ControlsProvider>
);

