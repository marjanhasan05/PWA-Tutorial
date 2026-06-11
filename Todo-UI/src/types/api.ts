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
    if (response?.message) {
      return response.message;
    }

    if (response?.error) {
      return response.error;
    }

    if (response?.errors?.length) {
      return response.errors[0]?.message || fallbackMessage;
    }

    if (typeof error.status === 'number') {
      return `Request failed with status ${error.status}.`;
    }
  }

  if (isSerializedError(error) && error.message) {
    return error.message;
  }

  return fallbackMessage;
}
