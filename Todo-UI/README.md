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
- Offline create/edit/delete/status changes are stored locally and queued.
- When the browser comes back online, queued operations can sync through
  `POST /sync`.
- Conflicts stay visible until the user resolves them.

### PWA

- The app shell and static assets are cached by the service worker.
- Protected API responses are not blindly cached in the service worker.
- IndexedDB remains the source of offline task data.

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

## Known Limitations

- Browser push support varies by browser and platform.
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
