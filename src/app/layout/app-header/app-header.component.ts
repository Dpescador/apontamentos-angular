import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './app-header.component.html',
  styleUrl: './app-header.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppHeaderComponent {
  @Input() fileStatus = '';
  @Input() linked = false;

  @Output() connectTxt = new EventEmitter<void>();
  @Output() syncTxt = new EventEmitter<void>();
  @Output() importTxt = new EventEmitter<File>();
  @Output() exportTxt = new EventEmitter<void>();

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      this.importTxt.emit(file);
    }

    input.value = '';
  }
}
