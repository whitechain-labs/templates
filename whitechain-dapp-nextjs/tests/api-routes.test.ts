import { describe, expect, it } from 'vitest';

import { GET as healthzRoute } from '@/app/api/healthz/route';

describe('GET /api/healthz', () => {
  it('answers ok without touching any dependency', async () => {
    const res = healthzRoute();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: 'ok' });
  });
});
