import { useSyncExternalStore } from 'react';
import { registerSW } from 'virtual:pwa-register';

type PwaRegistrationState = {
  error: string | null;
  needRefresh: boolean;
  offlineReady: boolean;
};

let state: PwaRegistrationState = {
  error: null,
  needRefresh: false,
  offlineReady: false,
};

const listeners = new Set<() => void>();
let isInitialized = false;
let updateServiceWorkerRef: ((reloadPage?: boolean) => Promise<void>) | null =
  null;
let registrationRef: ServiceWorkerRegistration | null = null;
let registrationPromise: Promise<ServiceWorkerRegistration> | null = null;

function emitChange() {
  listeners.forEach((listener) => listener());
}

function setState(nextState: Partial<PwaRegistrationState>) {
  state = {
    ...state,
    ...nextState,
  };
  emitChange();
}

export function initializePwaRegistration() {
  if (isInitialized || typeof window === 'undefined') {
    return updateServiceWorkerRef;
  }

  isInitialized = true;
  registrationPromise = new Promise<ServiceWorkerRegistration>(
    (resolve, reject) => {
      updateServiceWorkerRef = registerSW({
        immediate: true,
        onNeedRefresh() {
          setState({
            error: null,
            needRefresh: true,
            offlineReady: false,
          });
        },
        onOfflineReady() {
          setState({
            error: null,
            offlineReady: true,
          });
        },
        onRegisteredSW(_swUrl, registration) {
          if (!registration) {
            const error = new Error(
              'Service worker registration completed without a registration object.',
            );

            isInitialized = false;
            registrationPromise = null;
            setState({
              error: error.message,
            });
            reject(error);
            return;
          }

          registrationRef = registration;
          setState({
            error: null,
          });
          resolve(registration);
        },
        onRegisterError(error) {
          const normalizedError =
            error instanceof Error
              ? error
              : new Error('Service worker registration failed.');

          registrationRef = null;
          isInitialized = false;
          registrationPromise = null;
          setState({
            error: normalizedError.message,
          });
          reject(normalizedError);
        },
      });
    },
  );

  return updateServiceWorkerRef;
}

export function dismissPwaRegistrationState() {
  setState({
    error: null,
    needRefresh: false,
    offlineReady: false,
  });
}

export function getPwaUpdateServiceWorker() {
  return updateServiceWorkerRef;
}

export function getPwaServiceWorkerRegistration() {
  return registrationRef;
}

export async function waitForPwaServiceWorkerRegistration() {
  if (registrationRef) {
    return registrationRef;
  }

  initializePwaRegistration();

  if (!registrationPromise) {
    throw new Error('Service worker registration could not be started.');
  }

  return registrationPromise;
}

export function usePwaRegistrationState() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },
    () => state,
    () => state,
  );
}
