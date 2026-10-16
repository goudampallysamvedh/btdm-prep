import { useEffect } from 'react'
import { useStore, type Theme } from './store'

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
