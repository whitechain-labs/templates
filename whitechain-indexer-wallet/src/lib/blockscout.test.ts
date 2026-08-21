import { describe, expect, it } from 'vitest';

import { readRestError, toQuery, type PageParams } from '@/lib/blockscout';

describe('toQuery', () => {
  it('passes a next_page_params object through as query parameters', () => {
    // The keys differ per endpoint; transactions page by block_number and index.
    const next: PageParams = { block_number: 2427207, index: 1 };
    expect(toQuery(next)).toEqual({ block_number: '2427207', index: '1' });
  });

  it('drops null entries so they never reach the URL', () => {
    expect(toQuery({ block_number: 100, items_count: null })).toEqual({ block_number: '100' });
  });

  it('treats a null cursor as the last page', () => {
    expect(toQuery(null)).toEqual({});
  });
});

describe('readRestError', () => {
  it('surfaces the detail from a 422 errors array', async () => {
    const res = new Response(
      JSON.stringify({
        errors: [
          {
            title: 'Invalid value',
            source: { pointer: '/address_hash_param' },
            detail: 'Invalid format. Expected ~r/^0x([A-Fa-f0-9]{40})$/',
          },
        ],
      }),
      { status: 422, statusText: 'Unprocessable Entity' },
    );

    await expect(readRestError(res, '/addresses/0xnope')).resolves.toBe(
      'REST v2 /addresses/0xnope → 422: Invalid value: Invalid format. Expected ~r/^0x([A-Fa-f0-9]{40})$/',
    );
  });

  it('falls back to the status line when the body is not JSON', async () => {
    const res = new Response('gateway down', { status: 502, statusText: 'Bad Gateway' });
    await expect(readRestError(res, '/stats')).resolves.toBe('REST v2 /stats → 502 Bad Gateway');
  });
});
