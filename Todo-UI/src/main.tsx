import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { Toaster } from 'sonner';
import { store } from './app/store';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
      <Toaster
        position="top-right"
        richColors
        theme="dark"
        toastOptions={{
          className:
            'border border-slate-800 bg-[#11141B] text-slate-100 shadow-2xl',
        }}
      />
    </Provider>
  </StrictMode>,
);
