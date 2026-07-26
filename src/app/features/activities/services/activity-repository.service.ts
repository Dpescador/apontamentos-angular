import { Injectable, effect, inject, signal } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { Activity } from '../models/activity.model';
import { ActivityApiService } from './activity-api.service';
import { ActivityFileService } from './activity-file.service';

@Injectable({ providedIn: 'root' })
export class ActivityRepositoryService {
  private readonly auth = inject(AuthService);
  private readonly api = inject(ActivityApiService);
  private readonly activityFile = inject(ActivityFileService);

  private readonly activitiesState = signal<Activity[]>([]);
  private loadedUserId: string | null = null;

  readonly activities = this.activitiesState.asReadonly();
  readonly status = signal('Aguardando autenticação...');
  readonly loading = signal(false);
  readonly connected = signal(false);

  constructor() {
    effect(() => {
      const user = this.auth.user();

      if (!user) {
        this.loadedUserId = null;
        this.activitiesState.set([]);
        this.connected.set(false);
        this.status.set('Entre com sua conta para carregar os apontamentos.');
        return;
      }

      if (this.loadedUserId !== user.id) {
        this.loadedUserId = user.id;
        void this.refresh().catch((error: unknown) => {
          console.error('Falha ao carregar os apontamentos do Supabase.', error);
        });
      }
    });
  }

  findById(id: string): Activity | undefined {
    return this.activitiesState().find((activity) => activity.id === id);
  }

  async refresh(): Promise<void> {
    if (!this.auth.user()) {
      return;
    }

    this.loading.set(true);
    this.status.set('Carregando apontamentos do Supabase...');

    try {
      const activities = await this.api.findAll();
      this.activitiesState.set(activities);
      this.connected.set(true);
      this.status.set(
        activities.length
          ? `${activities.length} apontamento(s) carregado(s) do Supabase.`
          : 'Banco conectado. Nenhum apontamento cadastrado.'
      );
    } catch (error: unknown) {
      this.connected.set(false);
      this.status.set('Não foi possível carregar os dados do Supabase.');
      throw error;
    } finally {
      this.loading.set(false);
    }
  }

  async upsert(activity: Activity): Promise<void> {
    this.loading.set(true);

    try {
      const existing = this.findById(activity.id);
      const saved = existing
        ? await this.api.update(activity)
        : await this.api.create(activity);

      this.activitiesState.update((current) =>
        existing
          ? current.map((item) => (item.id === saved.id ? saved : item))
          : [...current, saved]
      );
      this.connected.set(true);
      this.status.set('Alterações gravadas no Supabase.');
    } catch (error: unknown) {
      this.connected.set(false);
      this.status.set('Falha ao gravar o apontamento no Supabase.');
      throw error;
    } finally {
      this.loading.set(false);
    }
  }

  async remove(id: string): Promise<void> {
    this.loading.set(true);

    try {
      await this.api.remove(id);
      this.activitiesState.update((current) =>
        current.filter((activity) => activity.id !== id)
      );
      this.connected.set(true);
      this.status.set('Apontamento excluído do Supabase.');
    } catch (error: unknown) {
      this.connected.set(false);
      this.status.set('Falha ao excluir o apontamento no Supabase.');
      throw error;
    } finally {
      this.loading.set(false);
    }
  }

  async importBackup(file: File): Promise<number> {
    this.loading.set(true);

    try {
      const imported = await this.activityFile.readFile(file);
      await this.api.upsertMany(imported);
      await this.refresh();
      this.status.set(`${imported.length} registro(s) importado(s) para o Supabase.`);
      return imported.length;
    } catch (error: unknown) {
      this.connected.set(false);
      this.status.set('Falha ao importar o backup para o Supabase.');
      throw error;
    } finally {
      this.loading.set(false);
    }
  }

  exportBackup(): void {
    this.activityFile.download(this.activitiesState());
    this.status.set('Backup TXT/JSON exportado.');
  }
}
