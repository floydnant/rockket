export const isTouchDevice = () =>
    'ontouchstart' in window || navigator.maxTouchPoints > 0 || (navigator as any).msMaxTouchPoints > 0;

export const repeatAfterDelay = (callback: () => void, delays: number[]) =>
    delays.forEach(delay => setTimeout(callback, delay));

export const moveToMacroQueue = (callback: () => void) => setTimeout(callback, 0);

export * from './objects';
export * from './string-utils';
export * from './time-formatting';
