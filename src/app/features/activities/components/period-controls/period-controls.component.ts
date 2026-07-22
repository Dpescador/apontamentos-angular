import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-period-controls',
  standalone: true,
  templateUrl: './period-controls.component.html',
  styleUrl: './period-controls.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PeriodControlsComponent {
  @Input() weekLabel = '';
  @Input() referenceDate = '';
  @Input() showWeekends = false;

  @Output() toggleWeekends = new EventEmitter<void>();
  @Output() previousWeek = new EventEmitter<void>();
  @Output() nextWeek = new EventEmitter<void>();
  @Output() referenceDateChange = new EventEmitter<string>();

  onReferenceDateChange(event: Event): void {
    this.referenceDateChange.emit((event.target as HTMLInputElement).value);
  }
}
