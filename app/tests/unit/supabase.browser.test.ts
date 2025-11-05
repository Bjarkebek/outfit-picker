// app/tests/unit/supabase.browser.test.ts
import { beforeEach, describe, expect, test, vi } from 'vitest';

vi.mock('@supabase/ssr', () => ({
  createBrowserClient: vi.fn(() => ({ auth: { getSession: vi.fn() } })),
}));

describe('lib/supabase-browser.ts', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...OLD_ENV };
  });

  test('createBrowserClient bruger NEXT_PUBLIC env', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://public.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon';

    const { createBrowserClient } = await import('@supabase/ssr');
    const { supabaseBrowser } = await import('@/lib/supabase-browser');

    const client = supabaseBrowser();
    expect(client).toBeTruthy();
    expect(createBrowserClient).toHaveBeenCalledWith(
      'https://public.supabase.co',
      'anon'
    );
  });

  test('manglende env → createBrowserClient får undefined', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const { createBrowserClient } = await import('@supabase/ssr');
    const { supabaseBrowser } = await import('@/lib/supabase-browser');

    supabaseBrowser();
    expect(createBrowserClient).toHaveBeenCalledWith(undefined, undefined);
  });
});
