import { z } from 'zod';
import type { ApiSuccessResponse } from '../../types/api';

export const loginSchema = z.object({
  email: z.email('Enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

export const registerSchema = loginSchema.extend({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters.')
    .max(60, 'Name must be 60 characters or fewer.'),
});

export type LoginRequest = z.infer<typeof loginSchema>;
export type RegisterRequest = z.infer<typeof registerSchema>;

export type LogoutRequest = {
  refreshToken: string;
};

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type AuthSession = {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  sessionExpiresAt: string;
};

export type AuthResponse = ApiSuccessResponse<AuthSession>;
export type CurrentUserResponse = ApiSuccessResponse<AuthUser>;

export type PersistedAuthSession = {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  sessionExpiresAt: string | null;
};
