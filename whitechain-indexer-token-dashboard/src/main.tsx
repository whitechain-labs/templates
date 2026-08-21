import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { TokenPage } from '@/components/token-page';

import '@/assets/styles/globals.css';

const root = document.getElementById('root');
if (!root) throw new Error('#root not found');

createRoot(root).render(
  <StrictMode>
    <TokenPage />
  </StrictMode>,
);
