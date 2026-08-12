import { type ReactNode } from 'react';

import '@/assets/styles/globals.css';

import { Providers } from '@/components/providers';

export const metadata = {
  title: 'Whitechain dApp',
  description:
    'Next + Reown dApp starter for Whitechain. Wallet connect and on-chain Storage reads/writes.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
