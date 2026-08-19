import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { WalletPage } from '@/components/wallet-page';

import '@/assets/styles/globals.css';

const root = document.getElementById('root');
if (!root) throw new Error('#root not found');

createRoot(root).render(
  <StrictMode>
    <WalletPage />
  </StrictMode>,
);
