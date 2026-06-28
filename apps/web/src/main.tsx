import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import Auth from './Auth';
import './index.css';

const qc = new QueryClient();

const Root = () => {
  const [logged, setLogged] = useState(!!localStorage.getItem('token'));
  return logged ? <App onLogout={() => { localStorage.removeItem('token'); setLogged(false); }} /> : <Auth onLogged={() => setLogged(true)} />;
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={qc}>
      <Root />
    </QueryClientProvider>
  </React.StrictMode>,
);