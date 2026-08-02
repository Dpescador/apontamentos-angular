import { Injectable, inject } from '@angular/core';
import { SupabaseService } from '../../../core/services/supabase.service';
import { UserRole } from '../../../core/models/user-profile.model';
import { AdminUserSummary } from '../models/admin-user.model';

interface AdminUserRow {
  id: string;
  email: string | null;
  role: string;
  criado_em: string;
  ultimo_acesso: string | null;
  quantidade_apontamentos: number | string;
  total_horas: number | string;
}

@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private readonly supabase = inject(SupabaseService);

  async listUsers(): Promise<AdminUserSummary[]> {
    const { data, error } = await this.supabase.client.rpc('admin_list_users');

    if (error) {
      throw new Error(this.translateError(error.message));
    }

    return ((data ?? []) as AdminUserRow[]).map((row) => ({
      id: row.id,
      email: row.email ?? 'Usuário sem e-mail',
      role: this.toRole(row.role),
      createdAt: row.criado_em,
      lastSignInAt: row.ultimo_acesso,
      activityCount: Number(row.quantidade_apontamentos),
      totalHours: Number(row.total_horas)
    }));
  }

  private toRole(value: string): UserRole {
    return value === 'ADMIN' ? 'ADMIN' : 'USER';
  }

  private translateError(message: string): string {
    const normalized = message.toLocaleLowerCase('pt-BR');

    if (
      normalized.includes('somente para administradores') ||
      normalized.includes('permission denied') ||
      normalized.includes('42501')
    ) {
      return 'Sua conta não possui permissão de administrador.';
    }

    if (normalized.includes('admin_list_users')) {
      return 'A função administrativa ainda não foi criada. Execute os novos scripts do Liquibase.';
    }

    return message;
  }
}
