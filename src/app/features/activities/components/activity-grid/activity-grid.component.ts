import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { formatDate, formatHours } from '../../../../shared/utils/date.utils';
import { Activity } from '../../models/activity.model';

@Component({
  selector: 'app-activity-grid',
  standalone: true,
  templateUrl: './activity-grid.component.html',
  styleUrl: './activity-grid.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActivityGridComponent {
  @Input() activities: Activity[] = [];
  @Input() filteredCount = 0;
  @Input() totalFilteredHours = 0;
  @Input() currentPage = 1;
  @Input() totalPages = 1;
  @Input() paginationStart = 0;
  @Input() paginationEnd = 0;

  @Output() searchChange = new EventEmitter<string>();
  @Output() editActivity = new EventEmitter<Activity>();
  @Output() removeActivity = new EventEmitter<Activity>();
  @Output() pageChange = new EventEmitter<number>();

  onSearch(event: Event): void {
    this.searchChange.emit((event.target as HTMLInputElement).value);
  }

  formatDate(value: string): string {
    return formatDate(value);
  }

  formatHours(value: number): string {
    return formatHours(value);
  }
}
