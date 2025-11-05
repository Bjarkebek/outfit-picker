import '@testing-library/jest-dom/vitest';

import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

import { expect } from 'vitest';
import { axe } from 'jest-axe';

const results = await axe(document.body);
expect(results.violations).toHaveLength(0);


afterEach(() => {
  cleanup();
});


class RO {
  observe() {}
  unobserve() {}
  disconnect() {}
}
(global as any).ResizeObserver = (global as any).ResizeObserver || RO;

if (typeof (global as any).PointerEvent === 'undefined') {
  (global as any).PointerEvent = class PointerEvent extends Event {
  } as any;
}

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

if (typeof (global as any).DOMRect === 'undefined') {
  (global as any).DOMRect = class DOMRect {
    x = 0; y = 0; width = 0; height = 0; top = 0; right = 0; bottom = 0; left = 0;
    toJSON() { return this; }
  } as any;
}

const EP = (global as any).Element?.prototype as any;
const HEP = (global as any).HTMLElement?.prototype as any;
if (EP && typeof EP.scrollIntoView !== 'function') {
  EP.scrollIntoView = () => {};
}
if (HEP && typeof HEP.scrollIntoView !== 'function') {
  HEP.scrollIntoView = () => {};
}