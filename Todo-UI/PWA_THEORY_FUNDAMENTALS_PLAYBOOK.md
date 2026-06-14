# PWA Theory And Fundamentals Playbook

This document is a theory-first tutorial and notes file for Progressive Web App
development.

Use it when you want to understand:

- what a PWA really is
- what browser features make it work
- why offline-first apps are harder than normal CRUD apps
- what problems each PWA building block actually solves
- how the theory connects to the `todo-ui` project

This file is intentionally different from the project build guides.

- [BEGINNER_BUILD_GUIDE.md](./BEGINNER_BUILD_GUIDE.md) explains how this project was built
- [BEGINNER_COPY_PASTE_PLAYBOOK.md](./BEGINNER_COPY_PASTE_PLAYBOOK.md) gives implementation checkpoints
- [PWA_LEARNING_PLAN_PLAYBOOK.md](./PWA_LEARNING_PLAN_PLAYBOOK.md) gives a learning roadmap
- this file focuses on concepts, vocabulary, and mental models

## 1. What A PWA Is

A Progressive Web App is a web application that uses modern browser features to
feel more app-like.

Usually that means:

- installable
- works better on mobile
- can load some parts offline
- can keep local data
- may support push notifications
- may support background sync-like behavior

Important:

A PWA is not one single feature.

It is the combination of:

- a normal web app
- a web app manifest
- a service worker
- a good mobile/responsive experience
- secure delivery over HTTPS in production

## 2. Why It Is Called “Progressive”

“Progressive” means the app should still work even if some advanced browser
features are missing.

Examples:

- if install prompt is unavailable, the website should still work
- if push is unsupported, the core task app should still work
- if the user is offline, maybe task data can still show from cache

This is a very important mindset:

Do not build a PWA where one unsupported feature makes the whole app useless.

## 3. Core PWA Building Blocks

### 3.1 The Web App Itself

Before anything else, you need a good web application:

- clear UI
- responsive layout
- useful core flow
- stable navigation

If the normal web app is weak, the PWA layer will not save it.

### 3.2 Web App Manifest

The manifest is a JSON-style config file that tells the browser how the app
should look when installed.

It usually includes:

- app name
- short name
- icons
- theme color
- background color
- display mode
- start URL

What it does:

- helps browsers understand install metadata
- controls icon/title behavior on home screen or app launcher

What it does not do:

- it does not give offline support by itself
- it does not cache data

### 3.3 Service Worker

The service worker is a background script that the browser can run separately
from the page.

It can:

- intercept network requests
- cache static files
- react to push events
- help with update flows

It cannot magically fix app architecture.

This is one of the biggest beginner misunderstandings.

### 3.4 Client Storage

PWAs often need browser storage beyond normal memory.

Common choices:

- `localStorage`
- `sessionStorage`
- `IndexedDB`
- Cache Storage

Each has a different purpose.

## 4. Manifest Vs Service Worker Vs IndexedDB

This is one of the most important distinctions.

### Manifest

Use for:

- install metadata
- app identity

Do not use for:

- offline data
- caching logic

### Service Worker

Use for:

- app shell caching
- intercepting requests
- push event handling
- update lifecycle

Do not use as your only app-data database.

### IndexedDB

Use for:

- structured offline data
- cached task records
- pending mutation queue
- sync metadata

In this project:

- service worker caches the shell
- IndexedDB stores task data

That separation is a best practice.

## 5. App Shell Vs App Data

Many PWA bugs happen because people confuse these two.

### App Shell

The shell means the static part of the app:

- HTML entry
- JS bundles
- CSS
- icons
- fonts or static assets

Why cache it:

- the app can open faster
- the installed app can still launch offline after first visit

### App Data

The data means user-specific content:

- tasks
- profile data
- notifications preferences
- user-specific backend responses

Why it is different:

- it changes often
- it may be private
- different users must not see each other’s data

This is why blindly caching protected API responses in the service worker is
dangerous.

## 6. Why Offline-First Is Hard

A normal online app can rely on:

- request backend
- get truth
- render truth

An offline-first app cannot.

It must answer harder questions:

- what should render when the network is gone?
- where is the temporary source of truth?
- how do local edits survive refresh?
- what happens when local changes conflict with server changes?
- how do we explain this clearly to users?

That is why offline-first design is not only a coding topic.
It is also a product and data-consistency topic.

## 7. Data Source Mental Model

In a real offline-capable app, there are multiple “truths” at different times.

Examples:

- live backend data
- cached snapshot from earlier
- local pending edits not yet synced

A strong PWA UI should help the user know which one they are looking at.

In this project, that is why labels like these matter:

- `Fresh Backend Data`
- `Cached Snapshot`
- `Offline Cached Snapshot`
- `Local Pending Changes`
- `Refreshing Latest Data`

Without those labels, users think the app is buggy when it may actually be
doing the correct offline-first behavior.

## 8. Storage Choices And Why They Matter

### 8.1 localStorage

Good for:

- tiny settings
- lightweight session persistence

Not good for:

- large structured task caches
- queued offline operations
- serious data modeling

Why:

- synchronous API
- limited structure
- limited scale

### 8.2 IndexedDB

Good for:

- structured records
- larger data sets
- offline app data
- queues and metadata

Why:

- asynchronous
- record-oriented
- far more suitable for offline-first applications

### 8.3 Cache Storage

Good for:

- HTTP response caching controlled by service worker

Not a replacement for:

- relational/record style app data

## 9. Service Worker Lifecycle Basics

This is a common source of confusion.

A service worker generally goes through stages like:

- installing
- waiting
- activating
- active

Important consequence:

You may change your service worker code, but the new version may not take over
immediately in every tab.

That is why PWA update prompts exist.

## 10. Why Dev Mode Can Mislead You

In development mode:

- service worker behavior may differ
- hot reload changes expectations
- install behavior may not reflect production
- push behavior may be inconsistent

For serious PWA testing, use:

```bash
npm run build
npm run preview
```

This project repeatedly reinforced that lesson.

## 11. Installability Fundamentals

To be installable, a PWA usually needs:

- a valid manifest
- suitable icons
- a service worker
- a supported browser environment
- HTTPS in production

But installability is not fully under your control.

Browsers decide:

- whether to show a prompt
- when to show a prompt
- whether only manual install is available

Important beginner lesson:

If the browser does not show a direct prompt, that does not automatically mean
your PWA is broken.

In some platforms, manual “Add to Home Screen” is normal.

## 12. Push Notification Fundamentals

Push notifications on the web involve multiple parts:

1. the browser asks permission
2. the browser creates a push subscription
3. the frontend sends that subscription to the backend
4. the backend sends a web push payload later
5. the service worker receives the push event
6. the service worker shows a notification

If one part fails, the user may not see a real notification.

Important:

A toast inside the app is not the same thing as a system-level push
notification.

### VAPID Public Key

The VAPID public key is used by the browser when creating the push
subscription.

Frontend uses:

- the public key

Backend uses:

- the private key
- push delivery logic

The frontend should never contain the private key.

## 13. Sync Fundamentals

When offline mutations are allowed, sync is the process of replaying local
changes back to the backend.

Typical sync steps:

1. store local operation
2. mark it pending
3. restore it after refresh if needed
4. send it later when online
5. process applied/failed/conflict results
6. update local cache

This project uses a queue-based approach for that reason.

## 14. What A Conflict Really Means

A conflict usually means:

- the local user intended one change
- the server already has a newer or incompatible state

That is not just an error message.

It is a data reconciliation problem.

Safe conflict handling means:

- do not silently delete user intent
- show what changed
- let the user choose a safe resolution

## 15. Common Caching Strategies

You do not need to memorize them all at first, but you should recognize the
ideas.

### Cache-First

Meaning:

- use cached content first
- go to network later if needed

Good for:

- static shell assets

### Network-First

Meaning:

- try the network first
- fall back to cache if needed

Good for:

- some dynamic content when freshness matters most

### Stale-While-Revalidate

Meaning:

- show cached content immediately
- fetch fresh content in the background
- update afterward

This project uses that feel for task loading.

It gives a better perceived experience than always waiting on the network.

## 16. Why User Experience Honesty Matters

PWA complexity becomes user confusion unless the UI explains what is happening.

Good examples:

- show loading state
- show offline state
- show pending changes
- show last synced time
- show conflict count
- show whether data is cached or fresh

Bad examples:

- silently showing stale data
- silently dropping offline changes
- showing disabled install UI with no explanation

## 17. Beginner Mistakes To Avoid

- Jumping straight to service workers before building a solid web app
- Treating the manifest as if it provides offline data behavior
- Storing complex offline data only in `localStorage`
- Mixing storage, sync, UI, and network logic in the same component
- Assuming Chrome desktop behavior matches iPhone Safari
- Testing push only once and assuming the flow is complete
- Ignoring logout cleanup for local cached data
- Trusting only one browser for validation

## 18. Legacy-Code Traps To Avoid

These create pain later even if they feel convenient now.

### Dead Feature UI

Example:

- a disabled install button that teaches users the feature is broken

Better:

- real prompt when available
- manual guidance otherwise

### Hidden State Source

Example:

- the user sees tasks but cannot tell whether they are cached or fresh

Better:

- explicit sync and data-source labels

### Overloaded Root Coordinator

Example:

- every feature keeps growing inside one main file forever

Better:

- keep orchestration shallow
- move durable logic to feature modules

### Fake Architecture That Lasts Too Long

Example:

- fake auth or fake tasks survive so long that later layers are built on lies

Better:

- replace mock flows once the structural phase is complete

### Blind Service Worker Data Caching

Example:

- protected API responses become stale or leak across users

Better:

- shell in service worker
- app data in IndexedDB with explicit cleanup rules

## 19. How This Project Demonstrates The Theory

This repository is a good study case because it includes:

- real auth
- protected routes
- real task CRUD
- IndexedDB cache
- offline operation queue
- sync flow
- conflict handling
- install/update support
- push subscription flow

Map theory to code like this:

- manifest/PWA config:
  [vite.config.ts](./vite.config.ts)
- service worker:
  [src/sw.ts](./src/sw.ts)
- install flow:
  [src/pwa/InstallPrompt.tsx](./src/pwa/InstallPrompt.tsx)
- update flow:
  [src/pwa/PwaUpdatePrompt.tsx](./src/pwa/PwaUpdatePrompt.tsx)
- offline storage:
  [src/features/offline/](./src/features/offline)
- sync:
  [src/features/sync/](./src/features/sync)
- push subscription:
  [src/features/notifications/](./src/features/notifications)

## 20. Good Questions To Ask While Learning

- What is cached in the service worker and why?
- What is stored in IndexedDB and why?
- What happens if the user edits data while offline?
- What happens if two versions of the same task exist?
- How does the app explain cached vs fresh data?
- What actually causes a real push notification to appear?
- Which parts are browser-dependent and not fully app-controlled?

## 21. A Simple Mental Model To Remember

Think of a PWA as four layers:

1. normal app experience
2. local device capability
3. offline data strategy
4. sync/reconciliation strategy

If layer 1 is weak, the app is weak.
If layer 2 is missing, it is not very app-like.
If layer 3 is weak, offline behavior feels broken.
If layer 4 is weak, user trust breaks.

## 22. Final Notes

The best way to learn PWAs is not by memorizing APIs first.

Learn in this order:

1. strong normal frontend basics
2. real API-driven app structure
3. offline data modeling
4. service worker behavior
5. sync and reconciliation
6. push and platform-specific behavior

That order is slower at first, but much safer and much closer to real-world
engineering.
