import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AuthService } from './core/services/auth.service';
import { ActivityDashboardComponent } from './features/activities/pages/activity-dashboard/activity-dashboard.component';
import { LoginComponent } from './features/auth/pages/login/login.component';
import { AppModalComponent } from './shared/components/app-modal/app-modal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ActivityDashboardComponent, LoginComponent, AppModalComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  readonly auth = inject(AuthService);
}
