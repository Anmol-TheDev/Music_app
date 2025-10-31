// Define a basic type for a Song object
interface Song {
  id: string;
  [key: string]: unknown;
}

export interface PlaybackData {
  id: string;
  // FIX: Replaced 'any' with the specific 'Song' type
  currentSong: Song | null;
}

export class IndexedDBUtils {
  private dbName: string;
  private version: number;
  private db: IDBDatabase | null = null;

  constructor(dbName = "MusicAppDB", version = 1) {
    this.dbName = dbName;
    this.version = version;
  }

  async init(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains("playback")) {
          db.createObjectStore("playback", { keyPath: "id" });
        }
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onerror = () => reject(request.error);
    });
  }

  async save<T>(store: string, data: T): Promise<void> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(store, "readwrite");
      tx.objectStore(store).put(data);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async get<T>(store: string, id: string): Promise<T | null> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(store, "readonly");
      const req = tx.objectStore(store).get(id);
      req.onsuccess = () => resolve((req.result as T) ?? null);
      req.onerror = () => reject(req.error);
    });
  }

  async clear(store: string): Promise<void> {
    const db = await this.init();
    const tx = db.transaction(store, "readwrite");
    tx.objectStore(store).clear();
  }
}

export const indexedDBUtils = new IndexedDBUtils();
