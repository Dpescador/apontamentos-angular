import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TASK_OPTIONS } from '../../constants/task-options.constant';
import { ActivityFormGroup } from '../../models/activity-form.model';

@Component({
  selector: 'app-activity-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './activity-form.component.html',
  styleUrl: './activity-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActivityFormComponent {
  @Input({ required: true }) form!: ActivityFormGroup;
  @Input() editing = false;

  @Output() save = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  readonly taskOptions = TASK_OPTIONS;

  get currentTask(): string {
    return this.form?.controls.task.value ?? '';
  }

  isKnownTask(value: string): boolean {
    return (this.taskOptions as readonly string[]).includes(value);
  }
}
