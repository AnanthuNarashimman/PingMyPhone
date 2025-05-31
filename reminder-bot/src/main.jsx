import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { UserProvider } from '../src/Context/UserContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <UserProvider> {/* Wrap App with UserProvider */}
      <App />
    </UserProvider>
  </StrictMode>
);
