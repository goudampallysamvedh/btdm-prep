import { useRegisterSW } from 'virtual:pwa-register/react'
import { Button } from './ui'

/** Shows a small banner when the app is ready offline or a new version is available. */
export function UpdatePrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  if (!offlineReady && !needRefresh) return null
  return (
    <div
      role="status"
      className="card fixed inset-x-3 bottom-24 z-40 mx-auto flex max-w-md flex-wrap items-center gap-3 p-3 animate-rise md:bottom-6"
    >
      <span className="flex-1 text-sm">
        {needRefresh ? 'A new version of Sell-Through is ready.' : 'Ready to work offline.'}
      </span>
      {needRefresh && (
        <Button size="sm" onClick={() => updateServiceWorker(true)}>
          Update
        </Button>
      )}
      <Button
        size="sm"
        variant="quiet"
        onClick={() => {
          setOfflineReady(false)
          setNeedRefresh(false)
        }}
      >
        Dismiss
      </Button>
    </div>
  )
}
