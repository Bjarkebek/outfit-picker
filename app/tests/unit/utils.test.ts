// app/tests/unit/utils.cn.test.ts
import { describe, expect, test } from 'vitest';
import { cn } from '@/lib/utils';

describe('cn()', () => {
  test('merger tailwind-klasser og deduper korrekt (py-2 vs py-3)', () => {
    const out = cn('px-2 py-2', 'py-3', 'text-sm');
    expect(out).toContain('px-2');
    expect(out).toContain('py-3');
    expect(out).toContain('text-sm');
    expect(out).not.toContain('py-2');
  });

  test('ignorerer falsy værdier og arrays/objekter via clsx', () => {
    const out = cn('a', false && 'x', null as any, undefined as any, ['b', { c: true, d: false }]);
    // rækkefølge kan variere; tjek blot indhold
    expect(out.split(' ').sort()).toEqual(expect.arrayContaining(['a', 'b', 'c']));
    expect(out).not.toMatch(/\s{2,}/);
  });

  test('overstyrer konfliktende varianter til sidstnævnte', () => {
    const out = cn('text-sm', 'text-lg');
    expect(out).toContain('text-lg');
    expect(out).not.toContain('text-sm');
  });
});
