import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import '@forgegis/ui/styles/tokens.css';
import '@forgegis/ui/styles/theme.css';

const rootEl = document.getElementById('root');
if (rootEl) {
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
