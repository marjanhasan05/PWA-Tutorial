# TaskFlow Copy-Paste Playbook

This document is the practical companion to [BEGINNER_BUILD_GUIDE.md](./BEGINNER_BUILD_GUIDE.md).

Use this file when you want:

- copy-paste starter code
- smaller implementation phases
- checkpoints after every step
- clear expected output notes for juniors and seniors

This playbook is intentionally opinionated. It follows the same architecture the current project uses:

- React + TypeScript + Vite
- Redux Toolkit + RTK Query
- protected routing
- IndexedDB offline cache
- sync queue
- PWA install/update support
- push notification subscription support

## Project Links

- Live app: `https://task-manager-pwa-app.netlify.app/login`
- Live API: `https://to-do-backend-jq65.onrender.com/`
- Backend repository:
  `https://github.com/marjanhasan05/to-do-backend`
- Architecture guide:
  [BEGINNER_BUILD_GUIDE.md](./BEGINNER_BUILD_GUIDE.md)

## What Was Tightened Before Sharing This

I checked the current repository and corrected a few handoff risks:

1. The current UI intentionally exposes `search`, `sort`, `page`, and `limit` behavior directly.
2. The backend can support `status` and `priority` query params, but the current UI does not show those dropdowns.
3. PWA and push should be tested with:

```bash
npm run build
npm run preview
```

4. `App.tsx` is still the main coordinator for task flow. That is intentional in this project and not an accident.
5. For later phases, “exact copy-paste starter code” means teammates should copy
   the exact contents of the linked real project files into the same paths in
   their own working repo.

## How To Use This Playbook

Follow the phases in order.

After each phase:

1. run the command shown
2. compare the app to the expected output checklist
3. only continue when that phase is stable

If a phase links to real project files instead of embedding all code inline,
that is intentional. It keeps the handoff accurate and prevents the docs from
drifting away from the working repository.

## Phase 0: Create the Project

### Step 0.1: Create the app

```bash
npm create vite@latest todo-ui -- --template react-ts
cd todo-ui
npm install
```

### Step 0.2: Install packages

```bash
npm install react-router react-router-dom @reduxjs/toolkit react-redux react-hook-form zod @hookform/resolvers sonner sweetalert2
npm install -D tailwindcss @tailwindcss/vite vite-plugin-pwa
```

### Checkpoint

Run:

```bash
npm run dev
```

Expected output checklist:

- Vite starts successfully
- browser opens the starter React app
- no dependency errors in terminal

Visual target:

- basic starter app is visible

## Phase 1: Create the Base Shell

### Step 1.1: Create folders

Create this structure:

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

### Step 1.2: Create `.env.example`

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_VAPID_PUBLIC_KEY=your_public_key_here
```

### Step 1.3: Create `src/lib/env.ts`

```ts
const fallbackApiBaseUrl = 'http://localhost:3000';

export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || fallbackApiBaseUrl,
  vapidPublicKey: import.meta.env.VITE_VAPID_PUBLIC_KEY || '',
};
```

### Step 1.4: Replace `src/index.css`

```css
@import "tailwindcss";

:root {
  color: #e2e8f0;
  background: #020617;
  font-family: Inter, ui-sans-serif, system-ui, sans-serif;
}

body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(79, 70, 229, 0.22), transparent 28rem),
    radial-gradient(circle at bottom right, rgba(14, 165, 233, 0.16), transparent 30rem),
    #020617;
}

#root {
  min-height: 100vh;
}

button,
input,
select,
textarea {
  font: inherit;
}
```

### Step 1.5: Replace `src/main.tsx`

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

### Step 1.6: Replace `src/App.tsx`

```tsx
export default function App() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-10 text-slate-100">
      <div className="w-full max-w-xl rounded-3xl border border-slate-800 bg-slate-950/80 p-8 shadow-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-indigo-400">
          TaskFlow
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight">
          React + TypeScript starter shell
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          This is the first checkpoint. We have the app running with our own shell,
          styling, and environment setup.
        </p>
      </div>
    </main>
  );
}
```

### Checkpoint

Run:

```bash
npm run dev
```

Expected output checklist:

- dark full-screen shell is visible
- `TaskFlow` heading appears
- no build errors

Visual target:

- centered card on a dark gradient background

## Phase 2: Add Shared Types, Store, and RTK Query

### Step 2.1: Create `src/types/api.ts`

```ts
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { SerializedError } from '@reduxjs/toolkit';

export type ApiSuccessResponse<T> = {
  success: true;
  message: string;
  data: T;
  serverTime: string;
};

export type ApiValidationError = {
  field?: string;
  message: string;
};

export type ApiErrorResponse = {
  success?: false;
  message?: string;
  error?: string;
  errors?: ApiValidationError[];
  statusCode?: number;
};

function isFetchBaseQueryError(
  error: unknown,
): error is FetchBaseQueryError & { data?: ApiErrorResponse } {
  return typeof error === 'object' && error !== null && 'status' in error;
}

function isSerializedError(error: unknown): error is SerializedError {
  return typeof error === 'object' && error !== null && 'message' in error;
}

export function getApiErrorMessage(
  error: unknown,
  fallbackMessage: string,
): string {
  if (isFetchBaseQueryError(error)) {
    const response = error.data;
    if (response?.message) return response.message;
    if (response?.error) return response.error;
    if (response?.errors?.length) return response.errors[0]?.message || fallbackMessage;
    if (typeof error.status === 'number') return `Request failed with status ${error.status}.`;
  }

  if (isSerializedError(error) && error.message) {
    return error.message;
  }

  return fallbackMessage;
}
```

### Step 2.2: Create `src/features/api/baseApi.ts`

```ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { env } from '../../lib/env';
import type { RootState } from '../../app/store';

export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: fetchBaseQuery({
    baseUrl: env.apiBaseUrl,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.accessToken;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Task', 'Notification'],
  endpoints: () => ({}),
});
```

### Step 2.3: Create `src/features/auth/authSlice.ts`

```ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  sessionExpiresAt: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  isCheckingSession: boolean;
};

const initialState: AuthState = {
  accessToken: null,
  refreshToken: null,
  sessionExpiresAt: null,
  user: null,
  isAuthenticated: false,
  isHydrated: false,
  isCheckingSession: true,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setSession(
      state,
      action: PayloadAction<{
        accessToken: string;
        refreshToken: string;
        sessionExpiresAt: string;
        user: AuthUser | null;
      }>,
    ) {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.sessionExpiresAt = action.payload.sessionExpiresAt;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.isHydrated = true;
      state.isCheckingSession = false;
    },
    setUser(state, action: PayloadAction<AuthUser | null>) {
      state.user = action.payload;
      state.isAuthenticated = Boolean(action.payload && state.accessToken);
    },
    finishSessionCheck(state) {
      state.isHydrated = true;
      state.isCheckingSession = false;
    },
    clearAuth(state) {
      state.accessToken = null;
      state.refreshToken = null;
      state.sessionExpiresAt = null;
      state.user = null;
      state.isAuthenticated = false;
      state.isHydrated = true;
      state.isCheckingSession = false;
    },
  },
});

export const { clearAuth, finishSessionCheck, setSession, setUser } =
  authSlice.actions;

export default authSlice.reducer;
```

### Step 2.4: Create `src/app/store.ts`

```ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import { baseApi } from '../features/api/baseApi';

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

### Step 2.5: Create `src/app/hooks.ts`

```ts
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from './store';

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
```

### Step 2.6: Update `src/main.tsx`

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import App from './App';
import './index.css';
import { store } from './app/store';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
);
```

### Checkpoint

Run:

```bash
npm run dev
```

Expected output checklist:

- app still renders
- Redux provider compiles successfully
- no circular import or base API errors

Visual target:

- same shell as Phase 1

## Phase 3: Add Auth Storage and API

### Step 3.1: Create `src/lib/storage.ts`

```ts
const AUTH_STORAGE_KEY = 'taskflow_auth_session';

export type StoredAuthSession = {
  accessToken: string;
  refreshToken: string;
  sessionExpiresAt: string;
};

export function saveAuthSession(session: StoredAuthSession) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

export function readAuthSession(): StoredAuthSession | null {
  const rawValue = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!rawValue) return null;

  try {
    return JSON.parse(rawValue) as StoredAuthSession;
  } catch {
    return null;
  }
}

export function clearAuthSession() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}
```

### Step 3.2: Create `src/features/auth/authTypes.ts`

```ts
export type AuthUser = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type RegisterRequest = {
  email: string;
  password: string;
  name: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type AuthResponseData = {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  sessionExpiresAt: string;
};
```

### Step 3.3: Create `src/features/auth/authApi.ts`

```ts
import { baseApi } from '../api/baseApi';
import type { ApiSuccessResponse } from '../../types/api';
import type {
  AuthResponseData,
  AuthUser,
  LoginRequest,
  RegisterRequest,
} from './authTypes';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<ApiSuccessResponse<AuthResponseData>, RegisterRequest>({
      query: (body) => ({
        url: '/auth/register',
        method: 'POST',
        body,
      }),
    }),
    login: builder.mutation<ApiSuccessResponse<AuthResponseData>, LoginRequest>({
      query: (body) => ({
        url: '/auth/login',
        method: 'POST',
        body,
      }),
    }),
    logout: builder.mutation<ApiSuccessResponse<null>, { refreshToken: string }>({
      query: (body) => ({
        url: '/auth/logout',
        method: 'POST',
        body,
      }),
    }),
    getCurrentUser: builder.query<ApiSuccessResponse<AuthUser>, void>({
      query: () => ({
        url: '/users/me',
        method: 'GET',
      }),
    }),
  }),
});

export const {
  useGetCurrentUserQuery,
  useLazyGetCurrentUserQuery,
  useLoginMutation,
  useLogoutMutation,
  useRegisterMutation,
} = authApi;
```

### Checkpoint

Expected output checklist:

- auth API file compiles
- store still compiles with baseApi
- no runtime changes yet

Visual target:

- app still shows the base shell

## Phase 4: Add Router and Auth Pages

### Step 4.1: Create `src/layouts/AuthLayout.tsx`

```tsx
import { Navigate, Outlet } from 'react-router-dom';

export default function AuthLayout({
  isAuthenticated,
}: {
  isAuthenticated: boolean;
}) {
  if (isAuthenticated) {
    return <Navigate replace to="/app" />;
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-10 text-slate-100">
      <Outlet />
    </main>
  );
}
```

### Step 4.2: Create `src/layouts/AppLayout.tsx`

```tsx
import { NavLink, Outlet } from 'react-router-dom';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <h1 className="text-lg font-black">TaskFlow</h1>
          <nav className="flex items-center gap-3 text-sm">
            <NavLink to="/app">Dashboard</NavLink>
            <NavLink to="/app/tasks">Tasks</NavLink>
            <NavLink to="/app/profile">Profile</NavLink>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
```

### Step 4.3: Create `src/routes/ProtectedRoute.tsx`

```tsx
import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute({
  isAuthReady,
  isAuthenticated,
}: {
  isAuthReady: boolean;
  isAuthenticated: boolean;
}) {
  if (!isAuthReady) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-100">
        Loading session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate replace to="/login" />;
  }

  return <Outlet />;
}
```

### Step 4.4: Create page placeholders

`src/pages/auth/LoginPage.tsx`

```tsx
export default function LoginPage() {
  return (
    <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-950/80 p-8 shadow-2xl">
      <h2 className="text-2xl font-black">Login</h2>
      <p className="mt-2 text-sm text-slate-400">
        Auth form will be added in the next phase.
      </p>
    </div>
  );
}
```

`src/pages/auth/RegisterPage.tsx`

```tsx
export default function RegisterPage() {
  return (
    <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-950/80 p-8 shadow-2xl">
      <h2 className="text-2xl font-black">Register</h2>
      <p className="mt-2 text-sm text-slate-400">
        Registration form will be added in the next phase.
      </p>
    </div>
  );
}
```

`src/pages/app/DashboardPage.tsx`

```tsx
export default function DashboardPage() {
  return <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">Dashboard page</div>;
}
```

`src/pages/app/TasksPage.tsx`

```tsx
export default function TasksPage() {
  return <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">Tasks page</div>;
}
```

`src/pages/app/CreateTaskPage.tsx`

```tsx
export default function CreateTaskPage() {
  return <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">Create task page</div>;
}
```

`src/pages/app/TaskDetailsPage.tsx`

```tsx
export default function TaskDetailsPage() {
  return <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">Task details page</div>;
}
```

`src/pages/app/ProfilePage.tsx`

```tsx
export default function ProfilePage() {
  return <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">Profile page</div>;
}
```

`src/pages/not-found/NotFoundPage.tsx`

```tsx
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 text-slate-100">
      <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-8 shadow-2xl">
        <h1 className="text-2xl font-black">Page not found</h1>
        <Link className="mt-4 inline-block text-indigo-400" to="/login">
          Back to app
        </Link>
      </div>
    </div>
  );
}
```

### Step 4.5: Create `src/routes/AppRouter.tsx`

```tsx
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import AuthLayout from '../layouts/AuthLayout';
import CreateTaskPage from '../pages/app/CreateTaskPage';
import DashboardPage from '../pages/app/DashboardPage';
import ProfilePage from '../pages/app/ProfilePage';
import TaskDetailsPage from '../pages/app/TaskDetailsPage';
import TasksPage from '../pages/app/TasksPage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import NotFoundPage from '../pages/not-found/NotFoundPage';
import ProtectedRoute from './ProtectedRoute';

export default function AppRouter({
  isAuthReady,
  isAuthenticated,
}: {
  isAuthReady: boolean;
  isAuthenticated: boolean;
}) {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthLayout isAuthenticated={isAuthenticated} />}>
          <Route element={<LoginPage />} path="/login" />
          <Route element={<RegisterPage />} path="/register" />
        </Route>

        <Route
          element={
            <ProtectedRoute
              isAuthReady={isAuthReady}
              isAuthenticated={isAuthenticated}
            />
          }
        >
          <Route element={<AppLayout />}>
            <Route element={<DashboardPage />} path="/app" />
            <Route element={<TasksPage />} path="/app/tasks" />
            <Route element={<CreateTaskPage />} path="/app/tasks/new" />
            <Route element={<TaskDetailsPage />} path="/app/tasks/:taskId" />
            <Route element={<ProfilePage />} path="/app/profile" />
          </Route>
        </Route>

        <Route
          element={<Navigate replace to={isAuthenticated ? '/app' : '/login'} />}
          path="/"
        />
        <Route element={<NotFoundPage />} path="*" />
      </Routes>
    </BrowserRouter>
  );
}
```

### Step 4.6: Replace `src/App.tsx`

```tsx
import AppRouter from './routes/AppRouter';

export default function App() {
  return <AppRouter isAuthReady isAuthenticated={false} />;
}
```

### Checkpoint

Run:

```bash
npm run dev
```

Expected output checklist:

- `/login` opens
- `/register` opens
- `/app` redirects to `/login`
- `/app/tasks` redirects to `/login`

Visual target:

- login/register card centered on screen

## Phase 5: Add Real Login and Register Forms

At this point, copy-paste starter code should focus on architecture, not visual polish. The current repository already has working auth views and page wrappers.

Use these real project files as the next copy source:

- `src/components/LoginView.tsx`
- `src/components/RegisterView.tsx`
- `src/pages/auth/LoginPage.tsx`
- `src/pages/auth/RegisterPage.tsx`
- `src/App.tsx`

### Why this phase points to existing repo files

Auth is where validation, storage, backend responses, routing, and session restore start to interact. Reusing the working repo code here is better than giving a fake simplified version that teammates will later have to unlearn.

### Checkpoint

Expected output checklist:

- login form has validation
- register form has validation
- successful login redirects into app shell
- refreshing the page restores session

Visual target:

- centered auth form with email, password, and validation feedback

## Phase 6: Add Task Types and Task API

### Step 6.1: Create `src/features/tasks/taskTypes.ts`

Use the current project file directly as your source of truth:

- [src/features/tasks/taskTypes.ts](./src/features/tasks/taskTypes.ts)

### Step 6.2: Create `src/features/tasks/tasksApi.ts`

Use the current project file directly:

- [src/features/tasks/tasksApi.ts](./src/features/tasks/tasksApi.ts)

### Why copy the real repo files here?

The task API layer already contains:

- query param shaping
- response normalization
- RTK Query tags
- single-task and list-task contracts

Those are important enough that teammates should build from the real version, not a reduced tutorial mock.

### Checkpoint

Expected output checklist:

- `GET /tasks` can be called
- create/update/delete endpoints compile
- task response normalization works

Visual target:

- none yet, but task API should be ready for the board

## Phase 7: Add the Task Board UI

Use these real repo files as the starter set:

- `src/components/TaskBoard.tsx`
- `src/components/TaskCard.tsx`
- `src/components/TaskModal.tsx`
- `src/components/AnalyticsPanel.tsx`
- `src/pages/app/DashboardPage.tsx`
- `src/pages/app/TasksPage.tsx`
- `src/pages/app/CreateTaskPage.tsx`
- `src/pages/app/TaskDetailsPage.tsx`
- `src/pages/app/ProfilePage.tsx`

### Checkpoint

Expected output checklist:

- `/app` shows a dashboard shell
- `/app/tasks` shows the task workspace
- search and sort controls appear
- task cards appear when data is available
- delete uses confirmation

Visual target:

- polished card-based task board

## Phase 8: Add IndexedDB Offline Foundation

Use the current project files directly:

- [src/features/offline/indexedDb.ts](./src/features/offline/indexedDb.ts)
- [src/features/offline/offlineTypes.ts](./src/features/offline/offlineTypes.ts)
- [src/features/offline/taskCache.ts](./src/features/offline/taskCache.ts)
- [src/features/offline/syncQueue.ts](./src/features/offline/syncQueue.ts)
- [src/features/offline/syncMeta.ts](./src/features/offline/syncMeta.ts)

### Checkpoint

Expected output checklist:

- fetched tasks are written to IndexedDB
- cached tasks can be read back
- pending operation records can be stored
- sync metadata can be stored

Visual target:

- app still looks the same
- offline support is architectural, not visual yet

## Phase 9: Add Sync and Conflict Handling

Use the current project files directly:

- [src/features/sync/syncTypes.ts](./src/features/sync/syncTypes.ts)
- [src/features/sync/syncApi.ts](./src/features/sync/syncApi.ts)
- [src/features/sync/syncManager.ts](./src/features/sync/syncManager.ts)
- [src/features/sync/useSync.ts](./src/features/sync/useSync.ts)
- [src/features/sync/conflictManager.ts](./src/features/sync/conflictManager.ts)
- [src/components/ConflictModal.tsx](./src/components/ConflictModal.tsx)

### Checkpoint

Expected output checklist:

- offline operations are queued
- `POST /sync` can be triggered
- applied operations clear from queue
- conflict count appears when conflicts are returned
- user can choose keep-server or retry-local

Visual target:

- sync/conflict UI appears in the shell

## Phase 10: Add the Main Coordinator

Now use the real coordinator:

- [src/App.tsx](./src/App.tsx)

This is the most important file in the current app because it connects:

- auth restore
- cached task reads
- live task fetches
- stale-while-revalidate behavior
- offline mutation queueing
- sync updates
- modal state
- router props

### Checkpoint

Expected output checklist:

- app loads cached tasks quickly
- app refreshes backend data in the background
- offline create/edit/delete works locally
- online create/edit/delete uses backend
- sync state is visible

Visual target:

- full dashboard behavior feels cohesive

## Phase 11: Add PWA Support

Use these real files:

- [vite.config.ts](./vite.config.ts)
- [src/sw.ts](./src/sw.ts)
- [src/pwa/pwaRegistration.ts](./src/pwa/pwaRegistration.ts)
- [src/pwa/PwaUpdatePrompt.tsx](./src/pwa/PwaUpdatePrompt.tsx)
- [src/pwa/InstallPrompt.tsx](./src/pwa/InstallPrompt.tsx)
- [src/pwa/useInstallPrompt.ts](./src/pwa/useInstallPrompt.ts)
- [public/_redirects](./public/_redirects)

### Checkpoint

Run:

```bash
npm run build
npm run preview
```

Expected output checklist:

- service worker registers
- install section appears
- update prompt can appear on new builds
- app shell can reopen offline after first visit

Visual target:

- app shows install/update sections in the shell

## Phase 12: Add Push Notifications

Use these real files:

- [src/features/notifications/notificationTypes.ts](./src/features/notifications/notificationTypes.ts)
- [src/features/notifications/notificationsApi.ts](./src/features/notifications/notificationsApi.ts)
- [src/features/notifications/pushUtils.ts](./src/features/notifications/pushUtils.ts)
- [src/features/notifications/usePushNotifications.ts](./src/features/notifications/usePushNotifications.ts)
- [src/components/NotificationSettings.tsx](./src/components/NotificationSettings.tsx)

### Checkpoint

Run:

```bash
npm run build
npm run preview
```

Expected output checklist:

- notification permission can be requested
- `Subscribe Device` works
- backend stores subscription
- `Send Test Notification` hits backend
- service worker can show real push notifications

Visual target:

- profile/settings page includes push controls

## Phase 13: Final Polish

Use the current repo files for the final integrated version:

- `src/components/OnlineIndicator.tsx`
- `src/layouts/AppLayout.tsx`
- `src/routes/AppRouter.tsx`
- `src/pages/app/TasksPage.tsx`
- `src/pages/app/DashboardPage.tsx`
- `README.md`
- `.env.example`

### Final checklist

- login/register works
- protected routes work
- task list loads from backend
- cached snapshot appears quickly
- offline mutations queue safely
- sync works
- conflicts are visible
- install prompt works
- push subscription works
- lint passes
- build passes

## Which Commands To Use During Development

Use this during ordinary feature work:

```bash
npm run dev
```

Use this for PWA and push verification:

```bash
npm run build
npm run preview
```

## Expected Output Reference

Since this document is text-only, use these as your screenshot targets:

1. Auth screen
   - centered login/register form
   - validation messages visible

2. App shell
   - top navigation
   - sync/data-source status bar
   - install/update sections

3. Tasks screen
   - search input
   - sort dropdown
   - task card grid
   - pagination

4. Offline state
   - cached snapshot or local pending changes label
   - queue count visible

5. Conflict state
   - conflict count visible
   - conflict modal can open

6. Notification settings
   - permission status
   - subscription status
   - subscribe / unsubscribe / test buttons

There are no bundled screenshots in the repository right now, so these visual
targets act as screenshot substitutes for handoff and review.

## Handoff Recommendation

For teammates:

1. Read [BEGINNER_BUILD_GUIDE.md](./BEGINNER_BUILD_GUIDE.md) first for the architecture story.
2. Then use this playbook for implementation order and starter code.
3. Then open the actual referenced project files when they reach each phase.

That combination is much safer than handing someone only raw source files.

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
