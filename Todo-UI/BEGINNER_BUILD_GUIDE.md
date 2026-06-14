# TaskFlow Beginner Build Guide

This guide shows how to build the current `todo-ui` project from scratch as a beginner.

The goal is not only to copy files, but to understand:

- what to build first
- why each folder exists
- how the pieces connect
- how the app grows from a simple React app into a real offline-first PWA

If you follow the phases in order, you can rebuild the project step by step without getting overwhelmed.

## Project Links

- Live app: `https://task-manager-pwa-app.netlify.app/login`
- Live API: `https://to-do-backend-jq65.onrender.com/`
- Backend repository:
  `https://github.com/marjanhasan05/to-do-backend`
- Practical build companion:
  [BEGINNER_COPY_PASTE_PLAYBOOK.md](./BEGINNER_COPY_PASTE_PLAYBOOK.md)

## Final Result

By the end, you will have a React + TypeScript task app with:

- protected routes
- real auth with Redux Toolkit and RTK Query
- real task CRUD
- IndexedDB task cache
- offline mutation queue
- sync with backend
- conflict handling
- PWA install/update support
- push notification subscription support

## Accuracy Notes

These notes match the current repository and are important for teammates:

- The current task board UI directly exposes `search`, `sort`, `page`, and
  `limit` behavior.
- The backend contract can support more task query params like `status` and
  `priority`, but the current UI intentionally does not show those dropdowns.
- For service worker, install, and push-notification validation, prefer:

```bash
npm run build
npm run preview
```

instead of relying only on `npm run dev`.
- For the more advanced phases, the safest exact source of truth is the current
  repository files themselves. This guide explains the architecture, while the
  playbook points teammates to the exact files to copy.

## Tech Stack

- `React` for UI
- `TypeScript` for safer code
- `Vite` for fast development/build
- `React Router` for pages
- `Redux Toolkit` for global auth state
- `RTK Query` for API calls
- `Tailwind CSS` for styling
- `IndexedDB` for offline local persistence
- `vite-plugin-pwa` for service worker, installability, and offline shell
- `sonner` for toasts
- `sweetalert2` for confirmation dialogs
- `react-hook-form` + `zod` for form validation

## Phase 0: Create the Project

Create the Vite React TypeScript app:

```bash
npm create vite@latest todo-ui -- --template react-ts
cd todo-ui
npm install
```

Install the main packages:

```bash
npm install react-router react-router-dom @reduxjs/toolkit react-redux react-hook-form zod @hookform/resolvers sonner sweetalert2
npm install -D tailwindcss @tailwindcss/vite vite-plugin-pwa
```

## Phase 1: Set Up the Folder Structure

Create a clean structure like this:

```text
src/
  app/
  components/
  features/
    api/
    auth/
    notifications/
    offline/
    sync/
    tasks/
  hooks/
  layouts/
  lib/
  pages/
    app/
    auth/
    not-found/
  pwa/
  routes/
  types/
  utils/
```

### Why this structure?

- `app/` holds Redux setup
- `components/` holds reusable UI blocks
- `features/` groups related business logic
- `pages/` are route-level screens
- `layouts/` wrap route groups like auth pages or app pages
- `lib/` holds small shared helpers like env or storage
- `pwa/` holds install/update helpers

This is more scalable than dumping everything into `src/`.

## Phase 2: Set Up Environment Variables

Create `.env.example`:

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_VAPID_PUBLIC_KEY=your_public_key_here
```

Create `src/lib/env.ts`:

```ts
const fallbackApiBaseUrl = 'http://localhost:3000';

export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || fallbackApiBaseUrl,
  vapidPublicKey: import.meta.env.VITE_VAPID_PUBLIC_KEY || '',
};
```

### Why?

- Vite only exposes variables starting with `VITE_`
- this keeps backend URLs and VAPID config centralized
- if you ever change environments, you only update `.env`

## Phase 3: Set Up Redux Store

Create `src/app/store.ts` and `src/app/hooks.ts`.

The store is used for:

- auth state
- RTK Query API state

`store.ts` usually looks like:

```ts
import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from '../features/api/baseApi';
import authReducer from '../features/auth/authSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

Typed hooks in `hooks.ts` help avoid repeating types:

```ts
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from './store';

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
```

Wrap the app in `main.tsx`:

```tsx
<Provider store={store}>
  <App />
</Provider>
```

### Why Redux here?

This project does not put task UI state into Redux yet. It mainly uses Redux for:

- auth session
- RTK Query caching

That keeps the app simple.

## Phase 4: Set Up RTK Query Base API

Create `src/features/api/baseApi.ts`.

This is the shared API layer all features use.

Main jobs:

- use the backend base URL
- add auth token to requests
- define common tag types

Typical idea:

```ts
baseQuery: fetchBaseQuery({
  baseUrl: env.apiBaseUrl,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
})
```

### Why?

Without this, every API file would repeat:

- the base URL
- auth header logic

This is a major best practice.

## Phase 5: Add Routing

Create:

- `src/routes/AppRouter.tsx`
- `src/routes/ProtectedRoute.tsx`
- `src/layouts/AuthLayout.tsx`
- `src/layouts/AppLayout.tsx`

Suggested routes:

- `/login`
- `/register`
- `/app`
- `/app/tasks`
- `/app/tasks/new`
- `/app/tasks/:taskId`
- `/app/profile`
- `*`

### Why separate router and layouts?

- `AppRouter.tsx` owns route structure
- `ProtectedRoute.tsx` decides whether a route needs auth
- `AuthLayout.tsx` wraps login/register pages
- `AppLayout.tsx` wraps the logged-in app shell

This is easier to maintain than putting all route logic in `App.tsx`.

## Phase 6: Build Auth

Create:

- `src/features/auth/authTypes.ts`
- `src/features/auth/authSlice.ts`
- `src/features/auth/authApi.ts`
- `src/lib/storage.ts`

### Auth types

Define:

- `AuthUser`
- login/register request types
- login/register response types

### Auth slice

Store:

- `user`
- `accessToken`
- `refreshToken`
- `sessionExpiresAt`
- `isAuthenticated`
- hydration/session-check flags

### Auth API

Use RTK Query for:

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /users/me`

### Storage helper

Store auth data in one place instead of spreading `localStorage` calls everywhere.

That file should be responsible for:

- saving session
- reading session
- clearing session

### Why?

This makes auth predictable and easier to replace later with safer token handling.

## Phase 7: Build Task CRUD

Create:

- `src/features/tasks/taskTypes.ts`
- `src/features/tasks/tasksApi.ts`

Task types should define:

- `Task`
- `TaskFormValues`
- `TaskListMeta`
- sort/query types

Task API should define endpoints for:

- `GET /tasks`
- `GET /tasks/:id`
- `POST /tasks`
- `PATCH /tasks/:id`
- `DELETE /tasks/:id`

### Important idea

Keep task types in one place.

That means:

- pages
- components
- offline cache
- sync queue

all read the same `Task` shape instead of inventing local variations.

## Phase 8: Build the UI Shell

Key UI pieces:

- `TaskBoard.tsx`
- `TaskCard.tsx`
- `TaskModal.tsx`
- `AnalyticsPanel.tsx`
- `OnlineIndicator.tsx`
- `ConflictModal.tsx`
- `NotificationSettings.tsx`

### Best practice here

Keep presentational components mostly dumb.

That means:

- buttons call handlers from props
- components receive already-shaped data
- API logic stays outside the UI

The app currently uses `App.tsx` as the main coordinator for task flow. That is okay for this project because it reduces premature complexity.

## Phase 9: Add Login and Register Forms

Create:

- `src/components/LoginView.tsx`
- `src/components/RegisterView.tsx`
- `src/pages/auth/LoginPage.tsx`
- `src/pages/auth/RegisterPage.tsx`

Use:

- `react-hook-form`
- `zod`

### Why?

Beginners often validate forms with many `useState` calls. That gets messy fast.

`react-hook-form` handles:

- field state
- submit state
- errors

`zod` keeps validation rules in one schema.

## Phase 10: Add Offline Task Cache

Create:

- `src/features/offline/indexedDb.ts`
- `src/features/offline/taskCache.ts`
- `src/features/offline/syncMeta.ts`
- `src/features/offline/syncQueue.ts`
- `src/features/offline/offlineTypes.ts`

Store 3 kinds of data:

1. cached tasks
2. pending operations
3. sync metadata

### Why IndexedDB?

`localStorage` is too limited for a serious offline task app:

- very small storage
- synchronous API
- awkward for structured data

IndexedDB is the correct browser storage layer for cached app data.

## Phase 11: Make the App Offline-First

The app should:

- load cached tasks quickly
- fetch fresh tasks in the background
- update UI after fetch success

This project now uses a cache-first/stale-while-revalidate style:

1. read cached tasks from IndexedDB
2. show them immediately if available
3. fetch from backend in the background
4. replace the visible tasks when fresh data arrives
5. update the cache

### Why this matters

This feels much better in PWAs than showing a blank loading screen every time.

## Phase 12: Add Offline Mutations

When the browser is offline, the app should still allow:

- create
- edit
- delete
- status toggle

Instead of failing immediately, it should:

1. update cached tasks
2. create a queued operation
3. mark it pending

### Important design idea

Do not keep offline mutation logic inside button components.

This project keeps that logic in:

- cache helpers
- queue helpers
- sync manager

That is much safer.

## Phase 13: Add Sync

Create:

- `src/features/sync/syncApi.ts`
- `src/features/sync/syncTypes.ts`
- `src/features/sync/syncManager.ts`
- `src/features/sync/useSync.ts`

The sync flow is:

1. read pending operations from IndexedDB
2. send them to `POST /sync`
3. remove applied operations
4. update cached tasks from server response
5. keep conflicts visible
6. update sync metadata

### Why not sync automatically inside every mutation?

Because offline apps need a single clear place that owns reconciliation logic.

That is what `syncManager.ts` does.

## Phase 14: Add Conflict Handling

Create:

- `src/features/sync/conflictManager.ts`
- conflict UI in `ConflictModal.tsx`

When the backend returns a conflict, do not silently overwrite local intent.

This app supports choices like:

- keep server version
- retry local change
- dismiss safely

### Why?

Silent conflict resolution can destroy user work.

For a task app, preserving user intent is more important than pretending sync is always simple.

## Phase 15: Turn It Into a PWA

Use `vite-plugin-pwa`.

Important files:

- `vite.config.ts`
- `src/sw.ts`
- `src/pwa/pwaRegistration.ts`
- `src/pwa/PwaUpdatePrompt.tsx`
- `src/pwa/InstallPrompt.tsx`
- `src/pwa/useInstallPrompt.ts`

### What the PWA layer does

- creates the web app manifest
- registers a service worker
- caches the app shell
- allows install
- supports update prompts

### Important best practice

Do not blindly cache protected API responses in the service worker.

This project keeps:

- static shell in service worker cache
- real task data in IndexedDB

That is the safer architecture.

## Phase 16: Add Push Notification Subscription

Create:

- `src/features/notifications/notificationTypes.ts`
- `src/features/notifications/notificationsApi.ts`
- `src/features/notifications/pushUtils.ts`
- `src/features/notifications/usePushNotifications.ts`
- `src/components/NotificationSettings.tsx`

The flow is:

1. request permission
2. ensure the service worker is ready
3. subscribe with `PushManager`
4. send the subscription to the backend
5. backend stores it
6. backend later sends a real web push
7. service worker receives it and shows notification

### Important beginner note

A toast is not a push notification.

This:

```ts
toast.success('Sent')
```

is just UI feedback.

A real push notification is shown by:

```ts
self.registration.showNotification(...)
```

inside the service worker.

## Phase 17: Make the UI Honest

A good offline-first app should tell the user what kind of data they are seeing.

This project now clearly labels:

- `Fresh Backend Data`
- `Cached Snapshot`
- `Local Pending Changes`
- `Offline Cached Snapshot`

### Why?

This prevents confusion like:

- “Did my changes sync?”
- “Am I seeing stale data?”
- “Why is the app refreshing?”

Trust matters.

## Phase 18: Clean Up the UX

Production-minded improvements included in this project:

- direct logout
- confirmation for destructive actions
- cache-first task loading
- task sync state badges
- mobile navigation
- install/update prompts
- better empty states
- form validation messages

These are small details, but they matter a lot in real apps.

## Important Files to Study First

If you are reading the real codebase and want the shortest path to understanding it, start here:

1. `src/App.tsx`
2. `src/routes/AppRouter.tsx`
3. `src/features/api/baseApi.ts`
4. `src/features/auth/authSlice.ts`
5. `src/features/tasks/tasksApi.ts`
6. `src/features/offline/taskCache.ts`
7. `src/features/offline/syncQueue.ts`
8. `src/features/sync/useSync.ts`
9. `src/sw.ts`
10. `src/features/notifications/usePushNotifications.ts`

## What `App.tsx` Is Doing

This is the main coordinator of the app right now.

It is responsible for:

- session restore
- loading cached offline data
- calling the task list query
- deciding whether to show cached data or live data
- task create/edit/delete/status actions
- sync trigger wiring
- modal state
- conflict UI state

### Why keep this coordination in one place?

For this project, it is a practical compromise:

- the app stays understandable
- task logic does not get scattered too early
- you can still refactor later if the project grows

## Common Beginner Mistakes This Project Avoids

### 1. Mixing API calls directly into button components

Bad:

- harder to test
- harder to reuse
- harder to debug

Better:

- UI triggers handlers
- handlers call feature logic

### 2. Using `localStorage` for everything

Bad for:

- task cache
- pending queues
- structured offline state

Better:

- use IndexedDB

### 3. Treating offline support like just “show an error”

Better:

- read cache
- queue changes
- sync later

### 4. Hiding sync/conflict state

Better:

- show sync badges
- show queue count
- show conflict count

### 5. Blindly caching API responses in the service worker

Better:

- cache static shell in service worker
- store app data in IndexedDB

## Suggested Learning Order

If you want to rebuild this project yourself, use this order:

1. Create the Vite React TypeScript project
2. Add Tailwind
3. Build the task dashboard UI with static data
4. Add routing
5. Add Redux store
6. Add real auth
7. Add real task CRUD
8. Add IndexedDB cache
9. Add offline queue
10. Add sync
11. Add conflicts
12. Add PWA support
13. Add push notifications
14. Add polish and cleanup

This order is much easier than trying to do offline sync and push too early.

## Commands You Will Use Often

```bash
npm run dev
npm run lint
npm run build
npm run preview
```

## How to Test the Final App

### Development

```bash
npm run dev
```

Good for:

- ordinary UI development
- routing
- form work
- Redux work

### Production-like PWA test

```bash
npm run build
npm run preview
```

Better for:

- service worker behavior
- install flow
- push notifications
- real PWA behavior

## Final Advice for Beginners

Build the app in layers.

Do not try to make:

- auth
- tasks
- offline
- sync
- PWA
- push

all at once.

A solid order is:

1. working UI
2. working routes
3. working auth
4. working task CRUD
5. working offline cache
6. working queue
7. working sync
8. working PWA
9. working push

That is exactly how this project became manageable.

## Credits

Author:

- Marjan Hasan Moon
- GitHub: `https://github.com/marjanhasan05`
- LinkedIn: `https://www.linkedin.com/in/marjanhasan/`

Huge shout out to the backend developer:

- Arifur Rahman
- LinkedIn: `https://www.linkedin.com/in/arifur-rahman223`
- GitHub: `https://github.com/arif1101`

Backend repository:

- `https://github.com/marjanhasan05/to-do-backend`

## Related Project Files

- [README.md](./README.md)
- [.env.example](./.env.example)
- [src/App.tsx](./src/App.tsx)
- [src/sw.ts](./src/sw.ts)
