import { Injectable } from '@angular/core';

export type FilePermissionMode = 'read' | 'readwrite';

@Injectable({ providedIn: 'root' })
export class FileSystemService {
  supportsFilePicker(): boolean {
    return typeof window.showSaveFilePicker === 'function';
  }

  pickTextFile(suggestedName = 'apontamentos.txt'): Promise<FileSystemFileHandle> {
    if (!window.showSaveFilePicker) {
      throw new Error('O navegador não oferece suporte ao seletor de arquivos.');
    }

    return window.showSaveFilePicker({
      suggestedName,
      types: [
        {
          description: 'Arquivo de apontamentos',
          accept: {
            'text/plain': ['.txt'],
            'application/json': ['.json']
          }
        }
      ]
    });
  }

  async readText(handle: FileSystemFileHandle): Promise<string> {
    const file = await handle.getFile();
    return file.text();
  }

  async writeText(handle: FileSystemFileHandle, content: string): Promise<void> {
    const permission = await this.ensurePermission(handle, 'readwrite');
    if (permission !== 'granted') {
      throw new Error('Permissão de gravação não concedida.');
    }

    const writable = await handle.createWritable();
    await writable.write(content);
    await writable.close();
  }

  downloadText(filename: string, content: string): void {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  queryPermission(handle: FileSystemFileHandle, mode: FilePermissionMode): Promise<PermissionState> {
    const permissionHandle = handle as FileSystemFileHandle & {
      queryPermission: (descriptor: { mode: FilePermissionMode }) => Promise<PermissionState>;
    };

    return permissionHandle.queryPermission({ mode });
  }

  requestPermission(handle: FileSystemFileHandle, mode: FilePermissionMode): Promise<PermissionState> {
    const permissionHandle = handle as FileSystemFileHandle & {
      requestPermission: (descriptor: { mode: FilePermissionMode }) => Promise<PermissionState>;
    };

    return permissionHandle.requestPermission({ mode });
  }

  isAbortError(error: unknown): boolean {
    return error instanceof DOMException && error.name === 'AbortError';
  }

  private async ensurePermission(
    handle: FileSystemFileHandle,
    mode: FilePermissionMode
  ): Promise<PermissionState> {
    const current = await this.queryPermission(handle, mode);
    return current === 'granted' ? current : this.requestPermission(handle, mode);
  }
}
