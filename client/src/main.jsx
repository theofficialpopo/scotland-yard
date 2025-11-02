import React from 'react';
import ReactDOM from 'react-dom/client';
import MapTest from './MapTest.jsx';
import './index.css';

// Using MapTest for map infrastructure testing
// Switch back to App.jsx for the full game
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MapTest />
  </React.StrictMode>
);
