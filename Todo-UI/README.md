# TaskFlow Todo UI

`todo-ui` is a React + TypeScript task dashboard that now includes real auth,
real task CRUD, protected routing, IndexedDB-backed offline support, queued
offline mutations, sync with conflict handling, PWA install/update support, and
browser push subscription UI.

## Live Links

- Live app: `https://task-manager-pwa-app.netlify.app/login`
- Live API: `https://to-do-backend-jq65.onrender.com/`
- Backend repository:
  `https://github.com/marjanhasan05/to-do-backend`

## Documentation

- Architecture and learning guide:
  [BEGINNER_BUILD_GUIDE.md](./BEGINNER_BUILD_GUIDE.md)
- Step-by-step implementation playbook:
  [BEGINNER_COPY_PASTE_PLAYBOOK.md](./BEGINNER_COPY_PASTE_PLAYBOOK.md)
- Developer architecture documentation:
  [pwa_documentation.md](./pwa_documentation.md)
- PWA learning roadmap and anti-pattern guide:
  [PWA_LEARNING_PLAN_PLAYBOOK.md](./PWA_LEARNING_PLAN_PLAYBOOK.md)
- PWA theory, fundamentals, and tutorial notes:
  [PWA_THEORY_FUNDAMENTALS_PLAYBOOK.md](./PWA_THEORY_FUNDAMENTALS_PLAYBOOK.md)

## What It Includes

- React Router app shell with protected routes
- Redux Toolkit + RTK Query for auth, tasks, sync, and notifications
- Real backend login, register, logout, and session restore
- Real task list/create/update/delete flows
- IndexedDB task cache for offline reads
- Offline operation queue for create, edit, delete, and status changes
- `POST /sync` integration with conflict tracking
- Conflict review UI for queued offline changes
- PWA manifest, install prompt, update prompt, and offline app shell caching
- Browser push notification subscribe/unsubscribe/test flow
- Cache-first task loading with background refresh
- Post-sync refresh protection to avoid temporary task disappearance or unstable ordering
- Dark-only enforced theme for visual consistency across devices

## Environment Variables

Create a local `.env` file from `.env.example`.

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_VAPID_PUBLIC_KEY=your_public_key_here
```

Notes:

- `VITE_API_BASE_URL` is the backend base URL used for auth, tasks, sync, and
  notifications.
- `VITE_VAPID_PUBLIC_KEY` is the public key used by the browser Push API when
  subscribing this device for notifications.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from the example and set your backend values.

3. Start the app:

```bash
npm run dev
```

4. Open the local Vite URL in the browser.

## Useful Commands

```bash
npm run dev
npm run lint
npm run build
npm run preview
```

## Project Structure

```text
src/
  app/                Redux store and typed hooks
  components/         Reusable UI components
  features/
    api/              Shared RTK Query base API
    auth/             Auth API, types, and slice
    notifications/    Push notification API and browser helpers
    offline/          IndexedDB cache, queue, and sync metadata
    sync/             Sync endpoint, queue processor, conflict helpers
    tasks/            Task API and task types
  hooks/              Shared React hooks
  layouts/            Auth/app shell layouts
  pages/              Route-level pages
  pwa/                Install/update prompt helpers
  routes/             Router and route typing
  types/              Shared API utility types
  utils/              Small cross-feature shared types
```

## How The App Works

### Auth

- Login and register call the backend directly.
- Auth session is restored from local storage on refresh.
- Protected routes redirect unauthenticated users to `/login`.

### Tasks

- Online task reads and mutations use RTK Query.
- Task list search, sorting, and pagination use backend query params.
- The current UI intentionally keeps only search and sort controls visible,
  even though the backend contract can support more filters later.
- Task deletes require confirmation.

### Offline + Sync

- Tasks are cached in IndexedDB after successful fetches.
- Cached tasks can render immediately while the backend refresh happens in the
  background.
- Offline create/edit/delete/status changes are stored locally and queued.
- When the browser comes back online, queued operations can sync through
  `POST /sync`.
- After sync, the app keeps showing the synced cached state until the fresh
  backend refetch has truly settled, which avoids temporary disappearance or
  unstable ordering on slower/mobile devices.
- Conflicts stay visible until the user resolves them.

### PWA

- The app shell and static assets are cached by the service worker.
- Protected API responses are not blindly cached in the service worker.
- IndexedDB remains the source of offline task data.
- The install section always exposes an `Install App` action while the app is
  not installed, and falls back to manual install instructions when the browser
  does not expose a direct prompt.
- Browsers do not all expose the same install flow. On iPhone/iPad Safari and
  some Android/browser combinations, manual "Add to Home Screen" guidance is
  expected behavior rather than a bug.

### Push Notifications

- The browser must support service workers, Push API, and Notification API.
- The app subscribes using the configured VAPID public key.
- The subscription is sent to the backend for storage.

## Checks

If dependencies are installed correctly, run:

```bash
npm run lint
npm run build
```

## Push Notification Test Checklist

Use this checklist when you want to verify that install flow, device
subscription, backend delivery, and real system notifications are working
properly.

### Android Checklist

1. Deploy the app on HTTPS.
2. Open it in Chrome on Android.
3. Make sure the app loads normally and the service worker installs.
4. Install the app from the browser menu if available.
5. Open the installed app.
6. Login.
7. Go to the notification settings or profile area.
8. Click `Subscribe Device`.
9. Confirm notification permission is granted.
10. Confirm the UI shows subscribed.
11. Click `Send Test Notification`.
12. Check for a real system notification in the notification tray.
13. Lock the phone and send another test.
14. Background the app and send another test.
15. Tap the notification and confirm it opens or focuses the app.

### iPhone Checklist

1. Deploy the app on HTTPS.
2. Open it in Safari.
3. Use `Share -> Add to Home Screen`.
4. Open the app from the Home Screen icon.
5. Confirm you are not testing inside the Safari tab.
6. Login.
7. Go to the notification settings or profile area.
8. Click `Subscribe Device`.
9. Allow notifications when iOS asks.
10. Confirm the UI shows subscribed.
11. Click `Send Test Notification`.
12. Check Notification Center or the lock screen for the real notification.
13. Background the app and test again.
14. Lock the phone and test again.
15. Tap the notification and confirm it opens the app.

### Backend Checklist

1. `POST /notifications/subscriptions` succeeds.
2. The subscription is saved in the backend.
3. `POST /notifications/test` succeeds.
4. The backend actually sends web push to the saved subscription.
5. The backend uses the correct VAPID key pair.

### If It Fails

1. Check notification permission status.
2. Check the app is really installed on iPhone.
3. Check the device is subscribed.
4. Check the backend saved the subscription endpoint.
5. Check the backend test API returns success.
6. Check the service worker is active.
7. Check system notification settings are enabled for the browser or app.

## Known Limitations

- Browser push support varies by browser and platform.
- The app currently enforces a dark-only theme. A fully designed light theme is
  still a future improvement.
- Because the app is offline-first, the UI may intentionally show a cached task
  snapshot first and then replace it with fresh backend data after the network
  request completes.
- Conflict resolution currently focuses on safe keep-server or retry-local
  flows rather than advanced field-by-field merge tooling.
- Offline task data is intentionally handled through IndexedDB, not through
  service worker API response caching.
- The production build currently shows a large bundle warning from Vite; the
  app still builds successfully, but route-level code-splitting would be a good
  future improvement.


## Credits

Author:

- Marjan Hasan Moon
- GitHub: `https://github.com/marjanhasan05`
- LinkedIn: `https://www.linkedin.com/in/marjanhasan/`

Huge shout out to the backend developer:

- Arifur Rahman
- LinkedIn: `https://www.linkedin.com/in/arifur-rahman223`
- GitHub: `https://github.com/arif1101`

Backend used for this app:

- `https://github.com/marjanhasan05/to-do-backend`
