import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { formatHours } from '../../../../shared/utils/date.utils';

@Component({
  selector: 'app-month-summary',
  standalone: true,
  templateUrl: './month-summary.component.html',
  styleUrl: './month-summary.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MonthSummaryComponent {
  @Input() monthLabel = '';
  @Input() monthTotal = 0;
  @Input() monthExpected = 0;
  @Input() monthProgress = 0;

  @Output() previousMonth = new EventEmitter<void>();
  @Output() nextMonth = new EventEmitter<void>();

  formatHours(value: number): string {
    return formatHours(value);
  }
}
