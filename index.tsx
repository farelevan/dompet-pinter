import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

console.log("App starting initialization...");

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error("Root element not found in DOM");
  throw new Error("Could not find root element to mount to");
}

try {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log("React render cycle initiated");
} catch (error) {
  console.error("Mount error:", error);
  rootElement.innerHTML = `<div style="padding: 20px; color: red;">Failed to start app: ${error}</div>`;
}