/** True when animation is turned off (see Settings → Motion; applied as <html data-motion>). */
export function prefersReducedMotion(): boolean {
  return typeof document !== 'undefined' && document.documentElement.dataset.motion === 'reduced'
}
