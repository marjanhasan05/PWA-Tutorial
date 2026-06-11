import type { PersistedAuthSession } from '../features/auth/authTypes';

const AUTH_STORAGE_KEY = 'todo-ui.auth.session';

const emptySession: PersistedAuthSession = {
  user: null,
  accessToken: null,
  refreshToken: null,
  sessionExpiresAt: null,
};

export function loadStoredAuthSession(): PersistedAuthSession {
  if (typeof window === 'undefined') {
    return emptySession;
  }

  try {
    const rawValue = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!rawValue) {
      return emptySession;
    }

    const parsed = JSON.parse(rawValue) as Partial<PersistedAuthSession>;

    return {
      user: parsed.user ?? null,
      accessToken: parsed.accessToken ?? null,
      refreshToken: parsed.refreshToken ?? null,
      sessionExpiresAt: parsed.sessionExpiresAt ?? null,
    };
  } catch {
    return emptySession;
  }
}

export function persistAuthSession(session: PersistedAuthSession) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

export function clearStoredAuthSession() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}
