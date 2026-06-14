# TaskFlow PWA Learning Plan Playbook

This playbook is for anyone who wants to learn Progressive Web App development
from scratch and grow into the more advanced topics used in this project.

It is designed to work alongside this repository, not replace it.

Use it when you want:

- a learning roadmap instead of only copy-paste steps
- a beginner-to-advanced progression
- guidance on what to study first
- warnings about mistakes that create messy or legacy-style code
- a practical way to use this project as a learning lab

## Who This Is For

This is a good fit if you are:

- new to React
- new to TypeScript
- new to PWAs
- trying to understand offline-first architecture
- trying to understand why a real PWA becomes more complex than a normal CRUD app

This is also useful for seniors onboarding juniors, because it explains not only
what exists here, but why the order matters.

## How To Use This With The Current Docs

Use the documents in this order:

1. Read [README.md](./README.md) for project overview and setup.
2. Read [BEGINNER_BUILD_GUIDE.md](./BEGINNER_BUILD_GUIDE.md) to understand the architecture.
3. Use [BEGINNER_COPY_PASTE_PLAYBOOK.md](./BEGINNER_COPY_PASTE_PLAYBOOK.md) when you want exact implementation checkpoints.
4. Use this file to decide what to learn first, what to postpone, and what to avoid.

## The Core Mindset For PWA Development

A PWA is not just:

- a React app
- plus a manifest
- plus a service worker

A real PWA usually includes:

- installability
- offline support
- caching strategy
- data consistency strategy
- sync behavior
- background/browser limitations
- platform-specific behavior differences

That means a strong PWA developer needs product thinking, frontend thinking,
and data consistency thinking.

## Recommended Prerequisites

Do not jump into service workers on day one if these are still shaky.

### Stage A: Web Fundamentals

Be comfortable with:

- HTML semantics
- CSS layout
- responsive design basics
- forms and validation
- browser storage basics
- HTTP methods
- JSON request/response flow

Checkpoint:

- you can build a small login form and submit it to a fake endpoint
- you understand the difference between `GET`, `POST`, `PATCH`, and `DELETE`

### Stage B: JavaScript Foundations

Be comfortable with:

- variables, arrays, objects
- async/await
- `fetch`
- array methods like `map`, `filter`, `find`
- error handling with `try/catch`
- basic module imports/exports

Checkpoint:

- you can fetch data, handle loading, and show an error message cleanly

### Stage C: React Foundations

Be comfortable with:

- components
- props
- local state
- conditional rendering
- controlled inputs
- `useEffect`
- lifting state up

Checkpoint:

- you can build a local task list app without backend integration

### Stage D: TypeScript Basics

Be comfortable with:

- type aliases
- interfaces
- union types
- optional fields
- function typing
- basic generic types

Checkpoint:

- you can type a task object, API response, and component props without using `any`

### Stage E: Frontend App Structure

Learn:

- route-based app structure
- reusable components vs route pages
- shared utilities
- environment variables

Checkpoint:

- you understand why this project separates `components/`, `pages/`, `features/`, and `lib/`

## The Learning Roadmap

Follow this order if you want real understanding instead of cargo-cult copying.

## Level 1: Build A Simple Task UI First

Goal:

- build a task UI with local state only

Learn:

- list rendering
- create/edit/delete flows
- form handling
- modal basics
- search and sorting in memory

Do not learn yet:

- Redux
- service workers
- push notifications
- IndexedDB

Why:

If the basic task experience is not solid locally, backend and offline layers
will only hide the real problems.

Use this project to study:

- high-level task flow in [src/App.tsx](./src/App.tsx)
- reusable task UI in [src/components/TaskCard.tsx](./src/components/TaskCard.tsx)
- task form behavior in [src/components/TaskModal.tsx](./src/components/TaskModal.tsx)

## Level 2: Add Routing And Auth Shell

Goal:

- separate public auth screens from protected app screens

Learn:

- React Router basics
- layouts
- protected routes
- auth redirects

Use this project to study:

- [src/routes/AppRouter.tsx](./src/routes/AppRouter.tsx)
- [src/routes/ProtectedRoute.tsx](./src/routes/ProtectedRoute.tsx)
- [src/layouts/AuthLayout.tsx](./src/layouts/AuthLayout.tsx)
- [src/layouts/AppLayout.tsx](./src/layouts/AppLayout.tsx)

Checkpoint:

- unauthenticated users go to `/login`
- authenticated users cannot stay on `/login`

## Level 3: Add Real Backend Auth

Goal:

- replace fake auth with real login/register/session restore

Learn:

- access tokens
- refresh/session concepts
- protected requests
- auth persistence

Use this project to study:

- [src/features/auth/authApi.ts](./src/features/auth/authApi.ts)
- [src/features/auth/authSlice.ts](./src/features/auth/authSlice.ts)
- [src/lib/storage.ts](./src/lib/storage.ts)
- [src/features/api/baseApi.ts](./src/features/api/baseApi.ts)

Checkpoint:

- login survives refresh
- logout clears the session cleanly

## Level 4: Add Real Task CRUD

Goal:

- replace local task reads and writes with backend-driven data

Learn:

- query params
- server pagination
- mutation flows
- optimistic vs non-optimistic thinking

Use this project to study:

- [src/features/tasks/tasksApi.ts](./src/features/tasks/tasksApi.ts)
- [src/features/tasks/taskTypes.ts](./src/features/tasks/taskTypes.ts)
- task coordination in [src/App.tsx](./src/App.tsx)

Checkpoint:

- create/edit/delete work with real API data
- search and sorting go through backend params

## Level 5: Learn Offline Data Foundations

Goal:

- understand why caching app data is different from caching app shell files

Learn:

- IndexedDB basics
- cached task snapshots
- pending operation records
- sync metadata

Use this project to study:

- [src/features/offline/indexedDb.ts](./src/features/offline/indexedDb.ts)
- [src/features/offline/taskCache.ts](./src/features/offline/taskCache.ts)
- [src/features/offline/syncQueue.ts](./src/features/offline/syncQueue.ts)
- [src/features/offline/syncMeta.ts](./src/features/offline/syncMeta.ts)

Checkpoint:

- online fetches save task snapshots locally
- offline mode can still show cached tasks

## Level 6: Add Offline Mutations

Goal:

- let users keep working while offline

Learn:

- temporary client ids
- queued create/update/delete operations
- local-first UI updates
- sync-state labeling

Use this project to study:

- [src/hooks/useOnlineStatus.ts](./src/hooks/useOnlineStatus.ts)
- offline queue handling in [src/App.tsx](./src/App.tsx)
- sync badges in [src/components/OnlineIndicator.tsx](./src/components/OnlineIndicator.tsx)

Checkpoint:

- create/edit/delete still update the UI while offline
- queued work survives page refresh

## Level 7: Add Sync

Goal:

- reconcile offline work with the backend safely

Learn:

- sync payload design
- applied vs failed vs conflict operations
- merge behavior
- last-sync metadata

Use this project to study:

- [src/features/sync/syncApi.ts](./src/features/sync/syncApi.ts)
- [src/features/sync/syncManager.ts](./src/features/sync/syncManager.ts)
- [src/features/sync/useSync.ts](./src/features/sync/useSync.ts)

Checkpoint:

- offline operations sync when the browser returns online
- applied operations leave the queue
- changed server tasks merge back into cache

## Level 8: Learn Conflict Handling

Goal:

- preserve user intent instead of silently overwriting data

Learn:

- version mismatch thinking
- safe resolution choices
- why conflicts are a product problem, not only a code problem

Use this project to study:

- [src/features/sync/conflictManager.ts](./src/features/sync/conflictManager.ts)
- [src/components/ConflictModal.tsx](./src/components/ConflictModal.tsx)

Checkpoint:

- user can see conflicts
- user can resolve conflicts without silent data loss

## Level 9: Add True PWA Features

Goal:

- make the app installable and resilient

Learn:

- manifest
- service worker registration
- app shell caching
- update flow
- install flow differences by platform

Use this project to study:

- [vite.config.ts](./vite.config.ts)
- [src/sw.ts](./src/sw.ts)
- [src/pwa/pwaRegistration.ts](./src/pwa/pwaRegistration.ts)
- [src/pwa/InstallPrompt.tsx](./src/pwa/InstallPrompt.tsx)
- [src/pwa/PwaUpdatePrompt.tsx](./src/pwa/PwaUpdatePrompt.tsx)

Checkpoint:

- app can be installed
- app shell loads offline after first visit
- update prompt appears on new builds

Important:

- test serious PWA behavior with `npm run build` and `npm run preview`
- do not trust `npm run dev` alone for service worker and push validation

## Level 10: Add Push Notifications

Goal:

- understand the frontend responsibilities for web push

Learn:

- Notification API
- Push API
- PushManager subscription
- VAPID public key usage
- service worker push event handling

Use this project to study:

- [src/features/notifications/usePushNotifications.ts](./src/features/notifications/usePushNotifications.ts)
- [src/features/notifications/pushUtils.ts](./src/features/notifications/pushUtils.ts)
- [src/features/notifications/notificationsApi.ts](./src/features/notifications/notificationsApi.ts)
- [public/push-sw.js](./public/push-sw.js)

Checkpoint:

- browser permission can be requested
- device can subscribe
- backend receives the subscription
- service worker can display a real notification

## Level 11: Production Thinking

Goal:

- move from “it works on my machine” to “this is dependable”

Learn:

- loading state honesty
- empty state clarity
- destructive action confirmation
- logout correctness
- multi-user session safety
- mobile testing
- platform differences

Use this project to study:

- confirmation flows in the task UI
- cached snapshot labeling
- install guidance fallback behavior
- auth/session cleanup behavior

Checkpoint:

- users understand what state the app is in
- changing users does not leak old task data
- destructive actions are guarded

## Things To Avoid As A Beginner

- Trying to learn routing, Redux, service workers, offline sync, and push all at once
- Adding every package you find before understanding the browser APIs first
- Mixing backend logic directly into UI components
- Using `any` to escape TypeScript instead of fixing the model
- Testing only the happy path while online
- Treating mobile browsers like they behave exactly like desktop Chrome
- Assuming a notification popup means true push is working everywhere

## Things To Avoid Because They Become Legacy Problems

These are especially important because this project either faced them directly
or was intentionally adjusted to avoid them.

### 1. Letting `App.tsx` Become A Permanent Dumping Ground

This project still uses `App.tsx` as a coordinator, which is acceptable here,
but that pattern must stay intentional. If every new feature keeps piling into
one file forever, it becomes harder to reason about.

What to do instead:

- keep orchestration there only when it helps
- move durable business rules into feature modules
- avoid putting storage and sync algorithms into visual components

### 2. Keeping Fake Auth Or Fake Data Too Long

Starter data is useful, but if fake auth or sample tasks survive too long, your
routing and state flow start depending on a lie.

What to do instead:

- replace fake auth as soon as routing is stable
- replace fake task reads before designing offline sync

### 3. Caching Protected API Responses Blindly In The Service Worker

This is one of the biggest PWA mistakes.

Why it is dangerous:

- user-specific data can become stale in surprising ways
- logout/login with another user can leak old state
- debugging becomes painful

What to do instead:

- cache the app shell in the service worker
- keep authenticated task data in IndexedDB under app-controlled logic

### 4. Not Clearing User-Specific Local State On Logout

If you do not clear session-related local data, one user can see another user’s
cached tasks.

What to do instead:

- clear auth storage
- reset query state when appropriate
- clear user-owned offline cache when the session ends

### 5. Hiding Data Source State From The User

Offline-first apps feel broken when the UI does not explain itself.

We hit this kind of issue in practice:

- users saw cached data but expected fresh data
- users saw post-sync refresh behavior and thought tasks were disappearing

What to do instead:

- label cached snapshot vs fresh backend data
- show pending queue count
- show sync-in-progress state clearly

### 6. Designing Filters The Backend Supports But The UI Does Not Truly Use

This creates confusion and drifting expectations.

What to do instead:

- only expose filters that are truly wired
- document intentionally hidden backend capabilities

### 7. Leaving Dead Disabled Install UI

An install button that stays disabled teaches users to ignore the feature.

What to do instead:

- use the real browser prompt when available
- otherwise show platform-specific manual install guidance

### 8. Trusting Only Dev Mode For PWA Or Push Testing

This caused confusion during development.

What to do instead:

- use `npm run build`
- use `npm run preview`
- test install, service worker, and push behavior there

### 9. Shipping A Half-Finished Theme Variant

We saw that partial light-mode support can make the app feel visually broken.

What to do instead:

- ship one stable theme first
- only add another theme when the full surface area is designed and tested

## How To Use This Project To Learn Properly

Do not just read files from top to bottom.

Use this workflow:

### Pass 1: Run The App As A User

Do:

- register/login
- create tasks
- edit tasks
- delete tasks
- go offline
- create offline changes
- come back online
- test sync
- test install flow

Goal:

- understand the product behavior before reading code

### Pass 2: Read By Feature, Not By File Count

Study in this order:

1. `src/App.tsx`
2. `src/routes/`
3. `src/features/auth/`
4. `src/features/tasks/`
5. `src/features/offline/`
6. `src/features/sync/`
7. `src/pwa/`
8. `src/features/notifications/`

Goal:

- understand the vertical slice of one feature before reading the next

### Pass 3: Use Browser DevTools As Part Of Learning

Inspect:

- Network tab for auth/task/sync requests
- Application tab for IndexedDB
- Application tab for service worker state
- notification permission state

Goal:

- connect the UI behavior to browser/runtime behavior

### Pass 4: Break Small Things On Purpose

Try:

- remove internet and create a task
- deny notification permission
- create a sync conflict
- login as one user, logout, and login as another

Goal:

- learn the edge cases that make PWAs difficult

### Pass 5: Rebuild One Layer Yourself

Do not clone the full project mentally forever.

Choose one area and rebuild it in a small sandbox:

- only auth
- only cached tasks
- only install prompt
- only push subscription

Goal:

- prove you understand the mechanism, not just the codebase

## Suggested Weekly Learning Plan

### Week 1

- learn React basics
- learn TypeScript basics
- build a local-only task UI

### Week 2

- add routing
- add auth pages
- learn API calling patterns

### Week 3

- add real auth
- add real task CRUD
- learn query params and pagination

### Week 4

- learn IndexedDB
- cache fetched tasks
- show cached tasks offline

### Week 5

- add offline mutations
- add queued operations
- add sync metadata

### Week 6

- add sync
- add conflict handling
- learn why versioning matters

### Week 7

- add manifest and service worker
- test install flow
- test offline shell

### Week 8

- add push notifications
- test on desktop and mobile
- learn browser/platform limits

## Signs You Are Ready For Advanced PWA Work

- you can explain the difference between cached shell and cached data
- you can explain why IndexedDB is used here instead of localStorage
- you can explain why sync conflicts cannot be silently ignored
- you can explain why dev mode is not enough for final PWA validation
- you can debug a broken install or notification flow with DevTools
- you can separate user experience bugs from browser platform limitations

## Final Advice

Build in layers.

Do not treat PWA development like a checklist where you jump straight to:

- service worker
- push notifications
- sync

without first mastering:

- normal CRUD behavior
- routing
- auth
- predictable frontend state

The strongest PWA developers are usually the ones who understand ordinary web
app behavior deeply before they add offline and installability on top.
