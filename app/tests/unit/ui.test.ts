// app/tests/unit/ui.test.ts
import { describe, expect, test } from 'vitest';
import { cardClass, pillMuted, inputClass, buttonPrimary, buttonSub } from '@/lib/ui';

describe('lib/ui.ts', () => {
  test('cardClass indeholder centrale utility-klasser', () => {
    expect(cardClass).toMatch(/rounded-xl/);
    expect(cardClass).toMatch(/border/);
    expect(cardClass).toMatch(/shadow-sm/);
  });

  test('pillMuted har små “pill” styles', () => {
    expect(pillMuted).toMatch(/text-xs/);
    expect(pillMuted).toMatch(/rounded-full/);
  });

  test('inputClass har fokus-ringe og mørkt tema varianter', () => {
    expect(inputClass).toMatch(/w-full/);
    expect(inputClass).toMatch(/focus:ring-2/);
    expect(inputClass).toMatch(/dark:/);
  });

  test('buttonPrimary ligner primær CTA', () => {
    expect(buttonPrimary).toMatch(/bg-blue-600/);
    expect(buttonPrimary).toMatch(/hover:bg-blue-700/);
    expect(buttonPrimary).toMatch(/disabled:opacity-60/);
  });

  test('buttonSub er neutral sekundær', () => {
    expect(buttonSub).toMatch(/bg-gray-100/);
    expect(buttonSub).toMatch(/hover:bg-gray-200/);
  });
});
