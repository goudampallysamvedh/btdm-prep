import { useEffect } from 'react'
import { useStore, type Motion, type Theme } from './store'

function apply(theme: Theme) {
  const dark = theme === 'dark' || (theme === 'system' && matchMedia('(prefers-color-scheme: dark)').matches)
  document.documentElement.dataset.theme = dark ? 'dark' : 'light'
  try {
    localStorage.setItem('st-theme', JSON.stringify(theme))
  } catch {
    /* storage blocked: theme still applies for this visit */
  }
}

/** Keeps <html data-theme> in sync with the saved setting and the OS preference. */
export function useThemeSync() {
  const theme = useStore((s) => s.settings.theme)
  useEffect(() => {
    apply(theme)
    if (theme !== 'system') return
    const mq = matchMedia('(prefers-color-scheme: dark)')
    const on = () => apply('system')
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [theme])
}

function applyMotion(motion: Motion) {
  const reduced = motion === 'off' || (motion === 'device' && matchMedia('(prefers-reduced-motion: reduce)').matches)
  document.documentElement.dataset.motion = reduced ? 'reduced' : 'full'
  try {
    localStorage.setItem('st-motion', JSON.stringify(motion))
  } catch {
    /* storage blocked: setting still applies for this visit */
  }
}

/** Keeps <html data-motion> in sync with the Motion setting (and the device, when set to follow it). */
export function useMotionSync() {
  const motion = useStore((s) => s.settings.motion ?? 'on')
  useEffect(() => {
    applyMotion(motion)
    if (motion !== 'device') return
    const mq = matchMedia('(prefers-reduced-motion: reduce)')
    const on = () => applyMotion('device')
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [motion])
}
