import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { loadStoredAuthSession } from '../../lib/storage';
import type { AuthSession, AuthUser, PersistedAuthSession } from './authTypes';

export type AuthState = PersistedAuthSession & {
  isAuthenticated: boolean;
  isHydrated: boolean;
  isCheckingSession: boolean;
};

const storedSession = loadStoredAuthSession();
const hasStoredToken = Boolean(
  storedSession.accessToken && storedSession.refreshToken,
);

const initialState: AuthState = {
  ...storedSession,
  isAuthenticated: hasStoredToken,
  isHydrated: !hasStoredToken,
  isCheckingSession: hasStoredToken,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<AuthSession>) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.sessionExpiresAt = action.payload.sessionExpiresAt;
      state.isAuthenticated = true;
      state.isHydrated = true;
      state.isCheckingSession = false;
    },
    setUser: (state, action: PayloadAction<AuthUser>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    finishSessionCheck: (state) => {
      state.isHydrated = true;
      state.isCheckingSession = false;
    },
    clearAuth: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.sessionExpiresAt = null;
      state.isAuthenticated = false;
      state.isHydrated = true;
      state.isCheckingSession = false;
    },
  },
});

export const { clearAuth, finishSessionCheck, setCredentials, setUser } =
  authSlice.actions;

export default authSlice.reducer;
