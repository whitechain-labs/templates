/** @type {import('next').NextConfig} */
const config = {
  // Standalone Node server output. Deploy as a Node server (`node
  // .next/standalone/server.js`) or swap to your preferred hosting.
  output: 'standalone',
  reactStrictMode: true,
  poweredByHeader: false,

  // wagmi's connector barrel statically references optional wallet SDKs this app
  // never installs. Map them to an empty module so Turbopack resolves them
  // cleanly. Keep this list in sync with the wallet SDKs your connector set does
  // NOT use.
  turbopack: {
    resolveAlias: {
      accounts: './src/empty-module.ts',
      '@metamask/connect-evm': './src/empty-module.ts',
      porto: './src/empty-module.ts',
      'porto/internal': './src/empty-module.ts',
      '@walletconnect/ethereum-provider': './src/empty-module.ts',
    },
  },
};

export default config;
