import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import { baseApi } from '../features/api/baseApi';
import {
  clearStoredAuthSession,
  persistAuthSession,
} from '../lib/storage';

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

store.subscribe(() => {
  const { accessToken, isAuthenticated, refreshToken, sessionExpiresAt, user } =
    store.getState().auth;

  if (isAuthenticated && accessToken && refreshToken) {
    persistAuthSession({
      user,
      accessToken,
      refreshToken,
      sessionExpiresAt,
    });
    return;
  }

  clearStoredAuthSession();
});
