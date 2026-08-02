import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { AppNavigationService } from '../../../../core/services/app-navigation.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ModalService } from '../../../../core/services/modal.service';
import { AdminUserSummary } from '../../models/admin-user.model';
import { AdminApiService } from '../../services/admin-api.service';

@Component({
  selector: 'app-admin-users-page',
  standalone: true,
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminUsersComponent {
  readonly auth = inject(AuthService);
  readonly navigation = inject(AppNavigationService);
  private readonly api = inject(AdminApiService);
  private readonly modal = inject(ModalService);

  readonly users = signal<AdminUserSummary[]>([]);
  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly searchTerm = signal('');

  readonly filteredUsers = computed(() => {
    const search = this.normalize(this.searchTerm());

    if (!search) {
      return this.users();
    }

    return this.users().filter((user) =>
      [user.email, user.role, user.id]
        .map((value) => this.normalize(value))
        .some((value) => value.includes(search))
    );
  });

  readonly adminCount = computed(() =>
    this.users().filter((user) => user.role === 'ADMIN').length
  );

  readonly totalActivities = computed(() =>
    this.users().reduce((total, user) => total + user.activityCount, 0)
  );

  readonly totalHours = computed(() =>
    this.users().reduce((total, user) => total + user.totalHours, 0)
  );

  constructor() {
    void this.loadUsers();
  }

  async loadUsers(): Promise<void> {
    this.loading.set(true);
    this.errorMessage.set('');

    try {
      this.users.set(await this.api.listUsers());
    } catch (error: unknown) {
      console.error('Falha ao carregar usuários administrativos.', error);
      this.errorMessage.set(
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar a lista de usuários.'
      );
    } finally {
      this.loading.set(false);
    }
  }

  changeSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }

  formatDate(value: string | null): string {
    if (!value) {
      return 'Nunca acessou';
    }

    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(new Date(value));
  }

  formatHours(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(value);
  }

  async logout(): Promise<void> {
    const confirmed = await this.modal.confirm({
      title: 'Sair do sistema?',
      message: 'Sua sessão administrativa será encerrada neste dispositivo.',
      variant: 'warning',
      confirmText: 'Sair',
      cancelText: 'Cancelar'
    });

    if (confirmed) {
      this.navigation.openDashboard();
      await this.auth.signOut();
    }
  }

  private normalize(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase('pt-BR')
      .trim();
  }
}
