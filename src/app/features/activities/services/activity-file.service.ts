import { Injectable, inject } from '@angular/core';
import { FileSystemService } from '../../../core/services/file-system.service';
import { createId } from '../../../shared/utils/id.utils';
import { Activity, ActivityFile } from '../models/activity.model';

@Injectable({ providedIn: 'root' })
export class ActivityFileService {
  private readonly fileSystem = inject(FileSystemService);

  serialize(activities: readonly Activity[]): string {
    const payload: ActivityFile = {
      version: 1,
      exportedAt: new Date().toISOString(),
      activities: [...activities]
    };

    return JSON.stringify(payload, null, 2);
  }

  parse(text: string): Activity[] {
    const parsed: unknown = JSON.parse(text);
    const rawActivities = Array.isArray(parsed)
      ? parsed
      : typeof parsed === 'object' && parsed !== null && 'activities' in parsed
        ? (parsed as { activities: unknown }).activities
        : null;

    if (!Array.isArray(rawActivities)) {
      throw new Error('Formato de arquivo inválido.');
    }

    return this.normalizeMany(rawActivities);
  }

  normalizeMany(values: readonly unknown[]): Activity[] {
    return values.map((value) => this.normalize(value));
  }

  normalize(value: unknown): Activity {
    if (typeof value !== 'object' || value === null) {
      throw new Error('Há um registro inválido no arquivo.');
    }

    const item = value as Partial<Activity> & {
      itensTrabalhados?: unknown;
      itens_trabalhados?: unknown;
      items?: unknown;
    };
    const hours = Number(item.hours);

    if (!item.date || !item.taskId || !Number.isFinite(hours) || hours <= 0) {
      throw new Error('Há um registro sem data, tarefa ou horas válidas.');
    }

    const now = new Date().toISOString();
    const itemsWorked = [
      item.itemsWorked,
      item.itensTrabalhados,
      item.itens_trabalhados,
      item.items
    ].find((candidate): candidate is string => typeof candidate === 'string')?.trim() ?? '';

    return {
      id: item.id || createId(),
      date: item.date,
      sprint: item.sprint?.trim() || '',
      taskId: item.taskId.trim(),
      task: item.task?.trim() || '',
      itemsWorked,
      hours,
      createdAt: item.createdAt || now,
      updatedAt: item.updatedAt || now
    };
  }

  merge(current: readonly Activity[], imported: readonly Activity[]): Activity[] {
    const byId = new Map<string, Activity>();

    for (const activity of imported) {
      byId.set(activity.id, activity);
    }

    for (const activity of current) {
      const existing = byId.get(activity.id);
      if (!existing || activity.updatedAt >= existing.updatedAt) {
        byId.set(activity.id, activity);
      }
    }

    return [...byId.values()];
  }

  async readFile(file: File): Promise<Activity[]> {
    return this.parse(await file.text());
  }

  download(activities: readonly Activity[]): void {
    this.fileSystem.downloadText('apontamentos.txt', this.serialize(activities));
  }
}
