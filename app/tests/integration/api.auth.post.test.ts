// app/tests/integration/api.auth.post.test.ts
import { beforeEach, describe, expect, test, vi } from 'vitest';

type Auth = {
  setSession: (args: { access_token: string; refresh_token: string }) => Promise<void>;
  signOut: () => Promise<void>;
};

// Mock-objekt med korrekte typer
const mockAuth: Auth = {
  // vi.fn tager ét type-argument: funktionssignaturen
  setSession: vi.fn<Auth['setSession']>().mockResolvedValue(void 0),
  signOut: vi.fn<Auth['signOut']>().mockResolvedValue(void 0),
};

vi.mock('@supabase/ssr', () => {
  return {
    createServerClient: vi.fn(() => ({
      auth: mockAuth,
    })),
  };
});

beforeEach(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://project.supabase.co';
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon';

  // nulstil kald mellem tests
  (mockAuth.setSession as unknown as jest.Mock | ReturnType<typeof vi.fn>).mockClear?.();
  (mockAuth.signOut as unknown as jest.Mock | ReturnType<typeof vi.fn>).mockClear?.();
});

describe('POST /api/auth', () => {
  test('SIGNED_IN: kalder setSession og returnerer { ok: true }', async () => {
    const { POST } = await import('@/app/api/auth/route');

    const req: any = {
      json: async () => ({
        event: 'SIGNED_IN',
        session: { access_token: 'acc', refresh_token: 'ref' },
      }),
      cookies: { get: () => ({ value: 'cookie' }) },
    };

    const res = await POST(req);
    expect(mockAuth.setSession).toHaveBeenCalledWith({ access_token: 'acc', refresh_token: 'ref' });
    expect(mockAuth.signOut).not.toHaveBeenCalled();
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true });
  });

  test('TOKEN_REFRESHED: kalder setSession', async () => {
    const { POST } = await import('@/app/api/auth/route');

    const req: any = {
      json: async () => ({
        event: 'TOKEN_REFRESHED',
        session: { access_token: 'new-acc', refresh_token: 'new-ref' },
      }),
      cookies: { get: () => ({ value: 'cookie' }) },
    };

    const res = await POST(req);
    expect(mockAuth.setSession).toHaveBeenCalledWith({ access_token: 'new-acc', refresh_token: 'new-ref' });
    expect(mockAuth.signOut).not.toHaveBeenCalled();
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true });
  });

  test('SIGNED_OUT: kalder signOut', async () => {
    const { POST } = await import('@/app/api/auth/route');

    const req: any = { json: async () => ({ event: 'SIGNED_OUT' }), cookies: { get: () => ({ value: 'cookie' }) } };

    const res = await POST(req);
    expect(mockAuth.signOut).toHaveBeenCalledTimes(1);
    expect(mockAuth.setSession).not.toHaveBeenCalled();
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true });
  });

  test('ukendt event: ingen auth-kald', async () => {
    const { POST } = await import('@/app/api/auth/route');

    const req: any = { json: async () => ({ event: 'SOMETHING_ELSE' }), cookies: { get: () => ({ value: 'cookie' }) } };

    const res = await POST(req);
    expect(mockAuth.signOut).not.toHaveBeenCalled();
    expect(mockAuth.setSession).not.toHaveBeenCalled();
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true });
  });
});
