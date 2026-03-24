import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';

import App from './App';
import './index.css';
import { AuthProvider } from './auth/AuthContext';

// 🔹 Enregistrement du Service Worker
registerSW({
  onNeedRefresh() {
    console.log('Nouvelle version disponible');
  },
  onOfflineReady() {
    console.log('App prête en offline');
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
);


// import { StrictMode } from 'react';
// import { createRoot } from 'react-dom/client';
// import App from './App';
// import './index.css';
// import { AuthProvider } from './auth/AuthContext';

// createRoot(document.getElementById('root')!).render(
//   <StrictMode>
//     <AuthProvider>
//       <App />
//     </AuthProvider>
//   </StrictMode>
// );
