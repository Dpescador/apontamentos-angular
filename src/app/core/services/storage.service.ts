import { Injectable } from '@angular/core';

const DATABASE_NAME = 'apontamentos-dashboard-db';
const DATABASE_STORE = 'file-handles';

@Injectable({ providedIn: 'root' })
export class StorageService {
  readJson(key: string): unknown {
    const stored = localStorage.getItem(key);
    if (!stored) {
      return null;
    }

    try {
      return JSON.parse(stored) as unknown;
    } catch (error: unknown) {
      console.warn(`O conteúdo armazenado em "${key}" foi ignorado por estar inválido.`, error);
      return null;
    }
  }

  writeJson(key: string, value: unknown): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  remove(key: string): void {
    localStorage.removeItem(key);
  }

  async saveFileHandle(key: string, handle: FileSystemFileHandle): Promise<void> {
    const database = await this.openDatabase();

    try {
      await new Promise<void>((resolve, reject) => {
        const transaction = database.transaction(DATABASE_STORE, 'readwrite');
        transaction.objectStore(DATABASE_STORE).put(handle, key);
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      });
    } finally {
      database.close();
    }
  }

  async loadFileHandle(key: string): Promise<FileSystemFileHandle | null> {
    const database = await this.openDatabase();

    try {
      return await new Promise<FileSystemFileHandle | null>((resolve, reject) => {
        const transaction = database.transaction(DATABASE_STORE, 'readonly');
        const request = transaction.objectStore(DATABASE_STORE).get(key);
        request.onsuccess = () => resolve((request.result as FileSystemFileHandle | undefined) ?? null);
        request.onerror = () => reject(request.error);
      });
    } finally {
      database.close();
    }
  }

  private openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DATABASE_NAME, 1);

      request.onupgradeneeded = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains(DATABASE_STORE)) {
          database.createObjectStore(DATABASE_STORE);
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}
