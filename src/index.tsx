import 'bootstrap/dist/css/bootstrap.min.css'; // <-- Importa Bootstrap aquí primero
import './index.css'; // <-- Tu CSS propio después (si lo tienes)

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
