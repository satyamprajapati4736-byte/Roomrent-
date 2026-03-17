import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

console.log("Main.tsx: Script started");

const reportError = (msg: string) => {
  console.error("Critical Error:", msg);
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `
      <div style="padding: 40px; color: #ef4444; background: #0f172a; min-height: 100vh; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;">
        <h1 style="font-size: 24px; font-weight: 800; margin-bottom: 16px;">App Failed to Load</h1>
        <p style="font-size: 14px; color: #94a3b8; margin-bottom: 24px;">An error occurred while starting the application:</p>
        <pre style="background: #1e293b; padding: 20px; border-radius: 12px; overflow: auto; font-size: 12px; border: 1px solid #334155; max-width: 90%; text-align: left;">${msg}</pre>
        <button onclick="window.location.reload()" style="margin-top: 24px; background: #3b82f6; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer;">Retry Loading</button>
      </div>
    `;
  }
};

window.onerror = (message) => reportError(String(message));
window.onunhandledrejection = (event) => reportError("Unhandled Promise Rejection: " + String(event.reason));

try {
  const container = document.getElementById('root');
  if (!container) throw new Error("Root element not found");
  
  console.log("Main.tsx: Rendering App");
  const root = createRoot(container);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
} catch (e) {
  reportError(e instanceof Error ? e.message : String(e));
}
