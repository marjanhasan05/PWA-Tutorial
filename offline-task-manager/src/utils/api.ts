export const getApiBaseUrl = (): string => {
  return (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:3000';
};

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  serverTime: string;
}

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

interface FetchOptions extends RequestInit {
  token?: string | null;
}

export async function apiFetch<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<ApiResponse<T>> {
  const baseUrl = getApiBaseUrl().replace(/\/$/, '');
  const url = `${baseUrl}${endpoint}`;

  const headers = new Headers(options.headers || {});
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Inject token if provided or retrieve dynamically from memory/auth slice
  if (options.token) {
    headers.set('Authorization', `Bearer ${options.token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return {
      success: true,
      message: 'No Content',
      data: null as unknown as T,
      serverTime: new Date().toISOString(),
    };
  }

  const result = await response.json().catch(() => ({
    success: false,
    message: 'Failed to parse JSON response',
  }));

  if (!response.ok) {
    throw new Error(result.message || `API error: ${response.status} ${response.statusText}`);
  }

  return result as ApiResponse<T>;
}
