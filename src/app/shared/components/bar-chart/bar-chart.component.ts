import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ChartDay } from '../../../features/activities/models/chart-day.model';
import { formatDate, formatHours } from '../../utils/date.utils';

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  templateUrl: './bar-chart.component.html',
  styleUrl: './bar-chart.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BarChartComponent {
  @Input() kicker = '';
  @Input() title = '';
  @Input() days: ChartDay[] = [];
  @Input() targetHeight = 0;
  @Input() compact = false;
  @Input() dailyTarget = 8;

  formatDate(value: string): string {
    return formatDate(value);
  }

  formatHours(value: number): string {
    return formatHours(value);
  }

  remainingHours(value: number): number {
    return Math.max(this.dailyTarget - value, 0);
  }

  tooltipLabel(day: ChartDay): string {
    return `${this.formatDate(day.date)}. Apontadas: ${this.formatHours(day.hours)} horas. Faltam: ${this.formatHours(this.remainingHours(day.hours))} horas.`;
  }
}
