// Matcher som: toBeInTheDocument()
import '@testing-library/jest-dom/vitest';

import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// A11y matcher: toHaveNoViolations()
import { expect } from 'vitest';
import { axe } from 'jest-axe';

const results = await axe(document.body);
expect(results.violations).toHaveLength(0);

/* eslint-disable @typescript-eslint/no-explicit-any */


// Rydder DOM mellem tests (forhindrer “Found multiple elements …”)
afterEach(() => {
  cleanup();
});

// --- Radix/PointerEvent polyfills for jsdom ---
// ResizeObserver (no-op)
class RO {
  observe() {}
  unobserve() {}
  disconnect() {}
}
(global as any).ResizeObserver = (global as any).ResizeObserver || RO;

// PointerEvent findes ikke i jsdom
if (typeof (global as any).PointerEvent === 'undefined') {
  (global as any).PointerEvent = class PointerEvent extends Event {
    // du kan udvide med felter, hvis noget kræver det
  } as any;
}

// hasPointerCapture / setPointerCapture / releasePointerCapture (no-op)
const hp = (global as any).HTMLElement?.prototype as any;
if (hp && typeof hp.hasPointerCapture !== 'function') {
  hp.hasPointerCapture = () => false;
}
if (hp && typeof hp.setPointerCapture !== 'function') {
  hp.setPointerCapture = () => {};
}
if (hp && typeof hp.releasePointerCapture !== 'function') {
  hp.releasePointerCapture = () => {};
}

// (valgfrit) stabil getBoundingClientRect til menu/portal beregninger
if (typeof (global as any).DOMRect === 'undefined') {
  (global as any).DOMRect = class DOMRect {
    x = 0; y = 0; width = 0; height = 0; top = 0; right = 0; bottom = 0; left = 0;
    toJSON() { return this; }
  } as any;
}

// --- scrollIntoView polyfill (no-op i jsdom) ---
const EP = (global as any).Element?.prototype as any;
const HEP = (global as any).HTMLElement?.prototype as any;
if (EP && typeof EP.scrollIntoView !== 'function') {
  EP.scrollIntoView = () => {};
}
if (HEP && typeof HEP.scrollIntoView !== 'function') {
  HEP.scrollIntoView = () => {};
}