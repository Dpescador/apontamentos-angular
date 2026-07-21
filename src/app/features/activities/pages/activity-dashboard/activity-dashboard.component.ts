import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AppHeaderComponent } from '../../../../layout/app-header/app-header.component';
import { BarChartComponent } from '../../../../shared/components/bar-chart/bar-chart.component';
import { ActivityFormComponent } from '../../components/activity-form/activity-form.component';
import { ActivityGridComponent } from '../../components/activity-grid/activity-grid.component';
import { MonthSummaryComponent } from '../../components/month-summary/month-summary.component';
import { PeriodControlsComponent } from '../../components/period-controls/period-controls.component';
import { SummaryCardsComponent } from '../../components/summary-cards/summary-cards.component';
import { Activity } from '../../models/activity.model';
import { ActivityDashboardFacade } from '../../services/activity-dashboard.facade';

@Component({
  selector: 'app-activity-dashboard-page',
  standalone: true,
  imports: [
    AppHeaderComponent,
    PeriodControlsComponent,
    SummaryCardsComponent,
    BarChartComponent,
    MonthSummaryComponent,
    ActivityFormComponent,
    ActivityGridComponent
  ],
  templateUrl: './activity-dashboard.component.html',
  styleUrl: './activity-dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActivityDashboardComponent {
  readonly facade = inject(ActivityDashboardFacade);

  edit(activity: Activity): void {
    this.facade.edit(activity);
    window.setTimeout(() => {
      document.querySelector('#activity-form')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    });
  }
}
