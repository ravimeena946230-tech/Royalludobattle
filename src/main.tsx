import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// 1. Intercept console.error & console.warn to silence websocket connection and Vite HMR warnings
const isIgnorableError = (msg: string) => {
  const lower = msg.toLowerCase();
  return (
    lower.includes('websocket') ||
    lower.includes('vite') ||
    lower.includes('closed without opened') ||
    lower.includes('failed to connect') ||
    lower.includes('connection refused')
  );
};

const originalConsoleError = console.error;
console.error = function (...args) {
  const argStr = args.map(arg => (typeof arg === 'object' ? JSON.stringify(arg) : String(arg || ''))).join(' ');
  if (isIgnorableError(argStr)) return;
  originalConsoleError.apply(console, args);
};

const originalConsoleWarn = console.warn;
console.warn = function (...args) {
  const argStr = args.map(arg => String(arg || '')).join(' ');
  if (isIgnorableError(argStr)) return;
  originalConsoleWarn.apply(console, args);
};

// 2. Suppress benign window errors & unhandled promise rejections in capture phase
const handleRejection = (event: PromiseRejectionEvent) => {
  const reason = event.reason;
  const reasonStr = typeof reason === 'string' ? reason : (reason?.message || reason?.stack || String(reason || ''));
  if (isIgnorableError(reasonStr)) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }
};

const handleError = (event: ErrorEvent) => {
  const msg = event.message || event.error?.message || '';
  if (isIgnorableError(msg)) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }
};

window.addEventListener('unhandledrejection', handleRejection, true);
window.addEventListener('unhandledrejection', handleRejection, false);
window.addEventListener('error', handleError, true);
window.addEventListener('error', handleError, false);


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

