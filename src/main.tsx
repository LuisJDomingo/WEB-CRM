import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Corregimos la ruta para más claridad
import '../index.css'; // Esta es la importación que vale

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
