import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivityDashboardComponent } from './features/activities/pages/activity-dashboard/activity-dashboard.component';
import { AppModalComponent } from './shared/components/app-modal/app-modal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ActivityDashboardComponent, AppModalComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {}
