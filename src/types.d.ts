import { AppConfig } from './app/core/models/app-config.model';

export {};

declare global {
  interface Window {
    __APP_CONFIG__?: Partial<AppConfig>;
    showSaveFilePicker?: (options?: {
      suggestedName?: string;
      types?: Array<{
        description?: string;
        accept: Record<string, string[]>;
      }>;
    }) => Promise<FileSystemFileHandle>;
  }
}
