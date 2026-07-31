/// <reference types="vite/client" />

interface Window {
  wx?: {
    config: (options: Record<string, unknown>) => void
    ready: (callback: () => void) => void
    error: (callback: (error: unknown) => void) => void
    updateAppMessageShareData: (options: Record<string, unknown>) => void
    updateTimelineShareData: (options: Record<string, unknown>) => void
  }
}
