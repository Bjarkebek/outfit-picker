// app/tests/unit/supabase.server.test.ts
import { beforeEach, describe, expect, test, vi } from 'vitest';

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({ from: vi.fn() })),
}));

describe('lib/supabase.ts', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...OLD_ENV };
  });

  test('kalder createClient med NEXT_PUBLIC_SUPABASE_URL og ANON_KEY', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';

    const { createClient } = await import('@supabase/supabase-js');
    await import('@/lib/supabase');

    expect(createClient).toHaveBeenCalledWith(
      'https://example.supabase.co',
      'anon-key'
    );
  });

  test('hvis env mangler, kaldes createClient med undefined (overvej at gardere i koden)', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const { createClient } = await import('@supabase/supabase-js');
    await import('@/lib/supabase');

    expect(createClient).toHaveBeenCalledWith(undefined, undefined);
  });
});
