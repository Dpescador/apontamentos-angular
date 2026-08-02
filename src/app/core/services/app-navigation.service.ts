import { Injectable, signal } from '@angular/core';

export type AppPage = 'dashboard' | 'admin-users';

@Injectable({ providedIn: 'root' })
export class AppNavigationService {
  private readonly pageState = signal<AppPage>('dashboard');

  readonly page = this.pageState.asReadonly();

  openDashboard(): void {
    this.pageState.set('dashboard');
  }

  openAdminUsers(): void {
    this.pageState.set('admin-users');
  }
}
