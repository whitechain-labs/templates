import type { NextFetchEvent, NextRequest } from 'next/server';
import { describe, expect, it, vi } from 'vitest';

import { config, proxy } from '@/proxy';

function runProxy() {
  return proxy(
    new Request('http://localhost:3000/') as unknown as NextRequest,
    {} as NextFetchEvent,
  );
}

describe('proxy (middleware)', () => {
  it('keeps the strict baseline directives', () => {
    const csp = runProxy().headers.get('content-security-policy') ?? '';
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("frame-ancestors 'self'");
    expect(csp).toContain("base-uri 'self'");
    expect(csp).toContain('upgrade-insecure-requests');
  });

  it('allow-lists the web3 (Reown/WalletConnect) and Whitechain RPC hosts', () => {
    const csp = runProxy().headers.get('content-security-policy') ?? '';
    // WalletConnect relays reach connect-src; verify iframe reaches frame-src.
    expect(csp).toContain('wss://*.walletconnect.com');
    expect(csp).toContain('https://rpc.testnet.whitechain.io');
    expect(csp).toMatch(/frame-src 'self'[^;]*verify\.walletconnect\.com/);
    // The allow-list stays scoped: no bare wildcard `*` source.
    expect(csp).not.toMatch(/(?:^|\s)\*(?:\s|;|$)/);
  });

  it('allows eval only outside production (React needs it in dev)', () => {
    // Dev/test: React's dev-mode eval() must be allowed or the console errors.
    expect(runProxy().headers.get('content-security-policy')).toContain("'unsafe-eval'");
    // Production: script-src stays strict.
    vi.stubEnv('NODE_ENV', 'production');
    expect(runProxy().headers.get('content-security-policy')).not.toContain("'unsafe-eval'");
    vi.unstubAllEnvs();
  });

  it('collapses the multiline CSP template into a single-line header value', () => {
    const csp = runProxy().headers.get('content-security-policy') ?? '';
    expect(csp).not.toMatch(/\n/);
    expect(csp).not.toMatch(/\s{2,}/);
  });

  it('sets the baseline security headers on every response', () => {
    const headers = runProxy().headers;
    expect(headers.get('x-content-type-options')).toBe('nosniff');
    expect(headers.get('x-frame-options')).toBe('SAMEORIGIN');
    expect(headers.get('referrer-policy')).toBe('strict-origin-when-cross-origin');
    expect(headers.get('permissions-policy')).toBe('camera=(), microphone=(), geolocation=()');
  });

  it('matches pages but skips API routes, static assets and prefetches', () => {
    const [matcher] = config.matcher;
    expect(matcher?.source).toContain('(?!api|_next/static|_next/image|favicon.ico)');
    expect(matcher?.missing).toEqual(
      expect.arrayContaining([{ type: 'header', key: 'next-router-prefetch' }]),
    );
  });
});
