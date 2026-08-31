import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// 1. Intercept console.error to silence websocket connection and Vite HMR warnings
const originalConsoleError = console.error;
console.error = function (...args) {
  const argStr = args.map(arg => String(arg || '')).join(' ');
  if (
    argStr.toLowerCase().includes('websocket') || 
    argStr.toLowerCase().includes('vite')
  ) {
    return;
  }
  originalConsoleError.apply(console, args);
};

// 2. Suppress benign window errors & unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  const reasonStr = String(event.reason || '');
  const reasonMessage = event.reason?.message || '';
  if (
    reasonStr.toLowerCase().includes('websocket') || 
    reasonMessage.toLowerCase().includes('websocket') ||
    reasonStr.toLowerCase().includes('vite') ||
    reasonMessage.toLowerCase().includes('vite')
  ) {
    event.preventDefault();
    event.stopPropagation();
  }
});

window.addEventListener('error', (event) => {
  const msg = event.message || '';
  if (
    msg.toLowerCase().includes('websocket') || 
    msg.toLowerCase().includes('vite')
  ) {
    event.preventDefault();
    event.stopPropagation();
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

