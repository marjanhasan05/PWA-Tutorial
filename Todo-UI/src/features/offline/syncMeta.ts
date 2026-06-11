import {
  offlineDbStores,
  requestToPromise,
  runOfflineTransaction,
} from './indexedDb';
import { DEFAULT_SYNC_META, type SyncMetaRecord } from './offlineTypes';

export async function getSyncMeta(userId: string) {
  return runOfflineTransaction(offlineDbStores.meta, 'readonly', async (_tx, getStore) => {
    const store = getStore(offlineDbStores.meta);
    const record = (await requestToPromise(
      store.get(userId),
    )) as SyncMetaRecord | undefined;

    return record ?? { ...DEFAULT_SYNC_META, userId };
  });
}

export async function saveSyncMeta(syncMeta: SyncMetaRecord) {
  await runOfflineTransaction(offlineDbStores.meta, 'readwrite', async (_tx, getStore) => {
    const store = getStore(offlineDbStores.meta);
    await requestToPromise(store.put(syncMeta));
  });
}
