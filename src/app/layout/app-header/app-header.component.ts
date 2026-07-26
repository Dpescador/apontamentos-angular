import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './app-header.component.html',
  styleUrl: './app-header.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppHeaderComponent {
  @Input() databaseStatus = '';
  @Input() connected = false;
  @Input() loading = false;
  @Input() userEmail = '';

  @Output() refreshDatabase = new EventEmitter<void>();
  @Output() importBackup = new EventEmitter<File>();
  @Output() exportBackup = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      this.importBackup.emit(file);
    }

    input.value = '';
  }
}
