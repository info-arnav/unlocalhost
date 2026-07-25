import { AsyncLocalStorage } from 'node:async_hooks';

export interface RequestStore {
  rid: string;
  userId?: string;
}

const storage = new AsyncLocalStorage<RequestStore>();

export function runWithContext<T>(store: RequestStore, fn: () => T): T {
  return storage.run(store, fn);
}

export function getStore(): RequestStore | undefined {
  return storage.getStore();
}

export function getRequestId(): string {
  return storage.getStore()?.rid ?? 'n/a';
}
