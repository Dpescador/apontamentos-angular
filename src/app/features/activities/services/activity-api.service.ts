import { Injectable, inject } from '@angular/core';
import { Database } from '../../../core/models/database.types';
import { SupabaseService } from '../../../core/services/supabase.service';
import { Activity } from '../models/activity.model';

type ActivityRow = Database['public']['Tables']['apontamentos']['Row'];
type ActivityInsert = Database['public']['Tables']['apontamentos']['Insert'];
type ActivityUpdate = Database['public']['Tables']['apontamentos']['Update'];

@Injectable({ providedIn: 'root' })
export class ActivityApiService {
  private readonly supabase = inject(SupabaseService);

  async findAll(): Promise<Activity[]> {
    const { data, error } = await this.supabase.client
      .from('apontamentos')
      .select('*')
      .order('data', { ascending: false })
      .order('criado_em', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []).map((row: ActivityRow) => this.mapRow(row));
  }

  async create(activity: Activity): Promise<Activity> {
    const payload: ActivityInsert = this.toInsert(activity);
    const { data, error } = await this.supabase.client
      .from('apontamentos')
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return this.mapRow(data);
  }

  async update(activity: Activity): Promise<Activity> {
    const payload: ActivityUpdate = this.toUpdate(activity);
    const { data, error } = await this.supabase.client
      .from('apontamentos')
      .update(payload)
      .eq('id', activity.id)
      .select('*')
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return this.mapRow(data);
  }

  async remove(id: string): Promise<void> {
    const { error } = await this.supabase.client
      .from('apontamentos')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
  }

  async upsertMany(activities: readonly Activity[]): Promise<Activity[]> {
    if (!activities.length) {
      return [];
    }

    const payload = activities.map((activity) => this.toInsert(activity));
    const { data, error } = await this.supabase.client
      .from('apontamentos')
      .upsert(payload, { onConflict: 'id' })
      .select('*');

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []).map((row: ActivityRow) => this.mapRow(row));
  }

  private toInsert(activity: Activity): ActivityInsert {
    return {
      id: activity.id,
      data: activity.date,
      sprint: activity.sprint || null,
      id_tarefa: activity.taskId,
      tarefa: activity.task,
      itens_trabalhados: activity.itemsWorked || null,
      horas: activity.hours,
      criado_em: activity.createdAt,
      atualizado_em: activity.updatedAt
    };
  }

  private toUpdate(activity: Activity): ActivityUpdate {
    return {
      data: activity.date,
      sprint: activity.sprint || null,
      id_tarefa: activity.taskId,
      tarefa: activity.task,
      itens_trabalhados: activity.itemsWorked || null,
      horas: activity.hours,
      atualizado_em: activity.updatedAt
    };
  }

  private mapRow(row: ActivityRow): Activity {
    return {
      id: row.id,
      date: row.data,
      sprint: row.sprint ?? '',
      taskId: row.id_tarefa,
      task: row.tarefa,
      itemsWorked: row.itens_trabalhados ?? '',
      hours: Number(row.horas),
      createdAt: row.criado_em,
      updatedAt: row.atualizado_em
    };
  }
}
