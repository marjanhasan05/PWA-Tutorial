import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

const updateSW = registerSW({
  immediate: true,
  onRegisteredSW(swUrl: string, registration: ServiceWorkerRegistration | undefined) {
    console.log('SW registered:', swUrl, registration)
  },
  onNeedRefresh() {
    console.log('A new service worker version is available.')

    const shouldReload = window.confirm('New version available. Reload now?')

    if (shouldReload) {
      console.log('User accepted reload. Updating service worker now.')
      updateSW(true)
    } else {
      console.log('User postponed the service worker update.')
    }
  },
  onOfflineReady() {
    console.log('Offline support is ready. Cached app shell is available.')
  },
  onRegisterError(error: unknown) {
    console.error('SW registration failed:', error)
  },
})
