import { FormControl, FormGroup } from '@angular/forms';

export interface ActivityFormControls {
  date: FormControl<string>;
  sprint: FormControl<string>;
  taskId: FormControl<string>;
  task: FormControl<string>;
  itemsWorked: FormControl<string>;
  hours: FormControl<number>;
}

export type ActivityFormGroup = FormGroup<ActivityFormControls>;
