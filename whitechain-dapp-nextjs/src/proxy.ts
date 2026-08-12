import { NextResponse, type NextFetchEvent, type NextRequest } from 'next/server';

// Next 16 middleware (the file is named `proxy.ts`). It sets a Content-Security-
// Policy and a baseline of security headers on every HTML response.
//
// This is a deliberately MINIMAL baseline: only `'self'` plus the directives a
// plain app needs. When you add an integration (analytics, an embedded video, an
// external image host, another API) you must widen the matching directive here,
// and ONLY that directive. Keep the allow-list tight; every extra source is
// attack surface.

// Hosts the app is allowed to talk to / load from — everything the Reown wallet
// modal and the Whitechain RPC need. Add yours here as you integrate more.
const allowedSources: string[] = [
  // Reown AppKit / WalletConnect: relays, wallet registry, logos, connectors.
  'wss://*.walletconnect.com',
  'wss://*.walletconnect.org',
  'https://*.walletconnect.com',
  'https://*.walletconnect.org',
  'https://*.reown.com',
  'https://api.web3modal.org',
  'https://imagedelivery.net',
  // Whitechain testnet JSON-RPC — on-chain reads/writes via viem.
  'https://rpc.testnet.whitechain.io',
];

const sources = allowedSources.join(' ');

// WalletConnect's Verify API renders in an iframe (frame-src); the Reown modal
// loads its brand fonts from fonts.reown.com (font-src). Neither is covered by
// the shared `sources` list, which feeds script/img/connect only.
const frameSources = ['https://verify.walletconnect.com', 'https://verify.walletconnect.org'].join(
  ' ',
);
const fontSources = 'https://fonts.reown.com';

export function proxy(_req: NextRequest, _event: NextFetchEvent) {
  // React uses eval() in development only (for debugging features like
  // reconstructing callstacks); it never does in production. So allow
  // 'unsafe-eval' in `script-src` in dev and keep it strict in production, where
  // NODE_ENV is 'production'. Without this, dev logs a CSP eval() error.
  const scriptSrc =
    process.env.NODE_ENV === 'production'
      ? `'self' 'unsafe-inline'`
      : `'self' 'unsafe-inline' 'unsafe-eval'`;
  const cspHeader = `
    default-src 'self';
    script-src ${scriptSrc}${sources ? ` ${sources}` : ''};
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data:${sources ? ` ${sources}` : ''};
    font-src 'self' data: ${fontSources};
    connect-src 'self'${sources ? ` ${sources}` : ''};
    frame-src 'self' ${frameSources};
    worker-src 'self' blob:;
    frame-ancestors 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    upgrade-insecure-requests;
  `;

  // Set headers on the response only. Do NOT pass `request.headers` into
  // NextResponse.next(): that would forward this CSP-only Headers object as the
  // request headers and drop the real incoming ones (cookies, auth, …).
  const response = NextResponse.next();

  response.headers.set('Content-Security-Policy', cspHeader.replace(/\s{2,}/g, ' ').trim());
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return response;
}

export const config = {
  // Run on pages, not on API routes or static assets, and skip prefetches.
  matcher: [
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
