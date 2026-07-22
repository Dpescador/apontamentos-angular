import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { formatHours } from '../../../../shared/utils/date.utils';

@Component({
  selector: 'app-summary-cards',
  standalone: true,
  templateUrl: './summary-cards.component.html',
  styleUrl: './summary-cards.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SummaryCardsComponent {
  @Input() weekTotal = 0;
  @Input() weekBalance = 0;
  @Input() weekActiveDays = 0;
  @Input() weekAverage = 0;
  @Input() showWeekends = false;

  formatHours(value: number): string {
    return formatHours(value);
  }
}
