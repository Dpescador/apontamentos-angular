import { Injectable, inject, signal } from '@angular/core';
import { FileSystemService } from '../../../core/services/file-system.service';
import { StorageService } from '../../../core/services/storage.service';
import { INITIAL_ACTIVITIES } from '../data/initial-activities';
import { Activity } from '../models/activity.model';
import { ActivityFileService } from './activity-file.service';

const STORAGE_KEY = 'apontamentos-dashboard.activities.v1';
const HANDLE_KEY = 'activities-txt';

@Injectable({ providedIn: 'root' })
export class ActivityRepositoryService {
  private readonly storage = inject(StorageService);
  private readonly fileSystem = inject(FileSystemService);
  private readonly activityFile = inject(ActivityFileService);

  private readonly activitiesState = signal<Activity[]>([]);
  private fileHandle: FileSystemFileHandle | null = null;

  readonly activities = this.activitiesState.asReadonly();
  readonly fileStatus = signal('Carregando dados...');
  readonly isFileLinked = signal(false);

  constructor() {
    void this.initialize();
  }

  findById(id: string): Activity | undefined {
    return this.activitiesState().find((activity) => activity.id === id);
  }

  async upsert(activity: Activity): Promise<void> {
    const existing = this.activitiesState().some((item) => item.id === activity.id);
    const next = existing
      ? this.activitiesState().map((item) => (item.id === activity.id ? activity : item))
      : [...this.activitiesState(), activity];

    await this.commit(next);
  }

  async remove(id: string): Promise<void> {
    await this.commit(this.activitiesState().filter((activity) => activity.id !== id));
  }

  async connectTxt(): Promise<void> {
    if (!this.fileSystem.supportsFilePicker()) {
      this.fileStatus.set('Seu navegador não permite vincular um TXT. Use Importar/Exportar TXT.');
      this.exportTxt();
      return;
    }

    try {
      const handle = await this.fileSystem.pickTextFile();
      this.fileHandle = handle;
      await this.storage.saveFileHandle(HANDLE_KEY, handle);

      const selectedText = await this.fileSystem.readText(handle);
      if (selectedText.trim()) {
        const imported = this.activityFile.parse(selectedText);
        const merged = this.activityFile.merge(this.activitiesState(), imported);
        this.setActivities(merged);
      }

      await this.writeLinkedFile();
      this.isFileLinked.set(true);
      this.fileStatus.set(`TXT vinculado: ${handle.name}`);
    } catch (error: unknown) {
      if (!this.fileSystem.isAbortError(error)) {
        console.error(error);
        this.fileStatus.set('Não foi possível vincular o arquivo TXT.');
      }
    }
  }

  async syncNow(): Promise<void> {
    if (!this.fileHandle) {
      await this.connectTxt();
      return;
    }

    try {
      await this.writeLinkedFile();
      this.fileStatus.set(`TXT atualizado: ${this.fileHandle.name}`);
    } catch (error: unknown) {
      console.error(error);
      this.fileStatus.set('O navegador precisa de permissão para atualizar o TXT.');
    }
  }

  async importTxt(file: File): Promise<void> {
    const imported = await this.activityFile.readFile(file);
    await this.commit(imported);
    this.fileStatus.set(`Dados importados de ${file.name}`);
  }

  exportTxt(): void {
    this.activityFile.download(this.activitiesState());
    this.fileStatus.set('Cópia do TXT exportada.');
  }

  private async initialize(): Promise<void> {
    const localData = this.readStoredActivities();
    this.setActivities(localData.length ? localData : INITIAL_ACTIVITIES);

    try {
      this.fileHandle = await this.storage.loadFileHandle(HANDLE_KEY);
      if (!this.fileHandle) {
        this.fileStatus.set('Dados salvos no navegador. Vincule um TXT para gravação direta.');
        return;
      }

      const permission = await this.fileSystem.queryPermission(this.fileHandle, 'read');
      if (permission !== 'granted') {
        this.fileStatus.set('TXT conhecido, mas a permissão precisa ser renovada em Sincronizar.');
        return;
      }

      const text = await this.fileSystem.readText(this.fileHandle);
      if (text.trim()) {
        const imported = this.activityFile.parse(text);
        this.setActivities(this.activityFile.merge(this.activitiesState(), imported));
      }

      this.isFileLinked.set(true);
      this.fileStatus.set(`TXT vinculado: ${this.fileHandle.name}`);
    } catch (error: unknown) {
      console.warn('Não foi possível recuperar o TXT vinculado.', error);
      this.fileStatus.set('Dados salvos no navegador. Vincule um TXT para gravação direta.');
    }
  }

  private async commit(activities: Activity[]): Promise<void> {
    this.setActivities(activities);

    if (!this.fileHandle) {
      this.fileStatus.set('Salvo no navegador. Vincule um TXT para gravação direta.');
      return;
    }

    try {
      await this.writeLinkedFile();
      this.fileStatus.set(`Alterações gravadas em ${this.fileHandle.name}`);
    } catch (error: unknown) {
      console.warn('Alteração salva localmente, mas não no TXT.', error);
      this.fileStatus.set('Salvo no navegador. Clique em Sincronizar para atualizar o TXT.');
    }
  }

  private async writeLinkedFile(): Promise<void> {
    if (!this.fileHandle) {
      return;
    }

    await this.fileSystem.writeText(
      this.fileHandle,
      this.activityFile.serialize(this.activitiesState())
    );
    this.isFileLinked.set(true);
  }

  private setActivities(activities: Activity[]): void {
    this.activitiesState.set(activities);
    this.storage.writeJson(STORAGE_KEY, activities);
  }

  private readStoredActivities(): Activity[] {
    const stored = this.storage.readJson(STORAGE_KEY);
    if (!Array.isArray(stored)) {
      return [];
    }

    try {
      return this.activityFile.normalizeMany(stored);
    } catch (error: unknown) {
      console.warn('Dados locais ignorados por estarem inválidos.', error);
      return [];
    }
  }
}
