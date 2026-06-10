import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiFetch, ApiResponse } from '../utils/api';
import { offlineDB, AuthSession } from '../utils/db';

interface AuthState {
  user: {
    id: string;
    email: string;
    name: string;
    createdAt?: string;
    updatedAt?: string;
  } | null;
  accessToken: string | null;
  refreshToken: string | null;
  sessionExpiresAt: string | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  authError: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  sessionExpiresAt: null,
  isAuthenticated: false,
  isAuthLoading: true, // starts true during bootstrap load session
  authError: null,
};

export const bootstrapAuth = createAsyncThunk(
  'auth/bootstrap',
  async (_, { rejectWithValue }) => {
    try {
      const session = await offlineDB.getKeyValue<AuthSession>('auth_session');
      if (session && session.accessToken) {
        // Optionally verify session token or fetch latest profile
        try {
          const profileRes = await apiFetch<AuthSession['user']>('/users/me', {
            method: 'GET',
            token: session.accessToken,
          });
          if (profileRes.success && profileRes.data) {
            // Update session if we fetched successfully
            const updatedSession = { ...session, user: profileRes.data };
            await offlineDB.setKeyValue('auth_session', updatedSession);
            return updatedSession;
          }
        } catch (err) {
          console.warn('Could not verify profile with server, using local session state:', err);
        }
        return session;
      }
      return null;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed load local session');
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: Record<string, string>, { rejectWithValue }) => {
    try {
      const result = await apiFetch<{
        user: NonNullable<AuthSession['user']>;
        accessToken: string;
        refreshToken: string;
        sessionExpiresAt: string;
      }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      if (result.success && result.data) {
        const session: AuthSession = {
          user: result.data.user,
          accessToken: result.data.accessToken,
          refreshToken: result.data.refreshToken,
          sessionExpiresAt: result.data.sessionExpiresAt,
        };
        await offlineDB.setKeyValue('auth_session', session);
        return session;
      }
      return rejectWithValue(result.message || 'Invalid server response structure');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (details: Record<string, string>, { rejectWithValue }) => {
    try {
      const result = await apiFetch<{
        user: NonNullable<AuthSession['user']>;
        accessToken: string;
        refreshToken: string;
        sessionExpiresAt: string;
      }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(details),
      });

      if (result.success && result.data) {
        const session: AuthSession = {
          user: result.data.user,
          accessToken: result.data.accessToken,
          refreshToken: result.data.refreshToken,
          sessionExpiresAt: result.data.sessionExpiresAt,
        };
        await offlineDB.setKeyValue('auth_session', session);
        return session;
      }
      return rejectWithValue(result.message || 'Registar failed');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Registration failed');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      const token = state.auth.accessToken;
      const refreshToken = state.auth.refreshToken;

      if (token && refreshToken) {
        try {
          await apiFetch('/auth/logout', {
            method: 'POST',
            token,
            body: JSON.stringify({ refreshToken }),
          });
        } catch (e) {
          console.warn('Logout endpoint failed, proceeding with local cleanup:', e);
        }
      }

      await offlineDB.deleteKeyValue('auth_session');
      await offlineDB.clearTasks();
      await offlineDB.clearSyncQueue();
      return null;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Logout failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError(state) {
      state.authError = null;
    },
  },
  extraReducers: (builder) => {
    // Bootstrap
    builder.addCase(bootstrapAuth.pending, (state) => {
      state.isAuthLoading = true;
    });
    builder.addCase(bootstrapAuth.fulfilled, (state, action: PayloadAction<AuthSession | null>) => {
      state.isAuthLoading = false;
      if (action.payload) {
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.sessionExpiresAt = action.payload.sessionExpiresAt;
        state.isAuthenticated = true;
      } else {
        state.isAuthenticated = false;
      }
    });
    builder.addCase(bootstrapAuth.rejected, (state, action) => {
      state.isAuthLoading = false;
      state.isAuthenticated = false;
      state.authError = action.payload as string;
    });

    // Login
    builder.addCase(loginUser.pending, (state) => {
      state.isAuthLoading = true;
      state.authError = null;
    });
    builder.addCase(loginUser.fulfilled, (state, action: PayloadAction<AuthSession>) => {
      state.isAuthLoading = false;
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.sessionExpiresAt = action.payload.sessionExpiresAt;
      state.isAuthenticated = true;
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.isAuthLoading = false;
      state.isAuthenticated = false;
      state.authError = action.payload as string;
    });

    // Register
    builder.addCase(registerUser.pending, (state) => {
      state.isAuthLoading = true;
      state.authError = null;
    });
    builder.addCase(registerUser.fulfilled, (state, action: PayloadAction<AuthSession>) => {
      state.isAuthLoading = false;
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.sessionExpiresAt = action.payload.sessionExpiresAt;
      state.isAuthenticated = true;
    });
    builder.addCase(registerUser.rejected, (state, action) => {
      state.isAuthLoading = false;
      state.isAuthenticated = false;
      state.authError = action.payload as string;
    });

    // Logout
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.sessionExpiresAt = null;
      state.isAuthenticated = false;
      state.isAuthLoading = false;
    });
  },
});

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;
