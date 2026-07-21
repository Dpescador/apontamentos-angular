import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  ViewChild,
  effect,
  inject
} from '@angular/core';
import { ModalVariant } from '../../../core/models/modal.model';
import { ModalService } from '../../../core/services/modal.service';

@Component({
  selector: 'app-modal',
  standalone: true,
  templateUrl: './app-modal.component.html',
  styleUrl: './app-modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppModalComponent {
  readonly modal = inject(ModalService);
  private lastFocusedElement: HTMLElement | null = null;
  private wasOpen = false;

  @ViewChild('primaryButton') primaryButton?: ElementRef<HTMLButtonElement>;
  @ViewChild('modalPanel') modalPanel?: ElementRef<HTMLElement>;

  constructor() {
    effect(() => {
      const opened = this.modal.state() !== null;
      document.body.classList.toggle('modal-open', opened);

      if (opened && !this.wasOpen) {
        this.lastFocusedElement = document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
        window.setTimeout(() => this.primaryButton?.nativeElement.focus());
      } else if (!opened && this.wasOpen) {
        window.setTimeout(() => this.lastFocusedElement?.focus());
      }

      this.wasOpen = opened;
    });
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboard(event: KeyboardEvent): void {
    const state = this.modal.state();
    if (!state) {
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      state.showCancel ? this.modal.cancel() : this.modal.accept();
      return;
    }

    if (event.key === 'Tab') {
      this.keepFocusInsideModal(event);
    }
  }

  iconClassFor(variant: ModalVariant): string {
    const icons: Record<ModalVariant, string> = {
      success: 'bi-check-lg',
      danger: 'bi-x-octagon-fill',
      warning: 'bi-exclamation-triangle-fill',
      info: 'bi-info-lg'
    };
    return icons[variant];
  }

  confirmIconClass(variant: ModalVariant): string {
    const icons: Record<ModalVariant, string> = {
      success: 'bi-check-lg',
      danger: 'bi-trash3',
      warning: 'bi-check-lg',
      info: 'bi-check-lg'
    };
    return icons[variant];
  }

  titleClass(variant: ModalVariant): string {
    return `modal-variant-${variant}`;
  }

  confirmButtonClass(variant: ModalVariant): string {
    const classes: Record<ModalVariant, string> = {
      success: 'btn-success',
      danger: 'btn-danger',
      warning: 'btn-warning',
      info: 'btn-primary'
    };
    return classes[variant];
  }

  private keepFocusInsideModal(event: KeyboardEvent): void {
    const panel = this.modalPanel?.nativeElement;
    if (!panel) {
      return;
    }

    const focusable = Array.from(
      panel.querySelectorAll<HTMLElement>('button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])')
    );

    if (!focusable.length) {
      event.preventDefault();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }
}
