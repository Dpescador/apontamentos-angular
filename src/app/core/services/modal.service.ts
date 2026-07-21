import { Injectable, signal } from '@angular/core';
import { ModalOptions, ModalState } from '../models/modal.model';

@Injectable({ providedIn: 'root' })
export class ModalService {
  private readonly stateSignal = signal<ModalState | null>(null);
  private resolver: ((confirmed: boolean) => void) | null = null;

  readonly state = this.stateSignal.asReadonly();

  alert(options: ModalOptions): Promise<boolean> {
    return this.open({
      ...options,
      showCancel: false,
      confirmText: options.confirmText ?? 'Entendi'
    });
  }

  confirm(options: ModalOptions): Promise<boolean> {
    return this.open({
      ...options,
      showCancel: true,
      confirmText: options.confirmText ?? 'Confirmar',
      cancelText: options.cancelText ?? 'Cancelar'
    });
  }

  accept(): void {
    this.close(true);
  }

  cancel(): void {
    this.close(false);
  }

  private open(options: ModalOptions): Promise<boolean> {
    if (this.resolver) {
      this.resolver(false);
      this.resolver = null;
    }

    this.stateSignal.set({
      title: options.title,
      message: options.message,
      variant: options.variant ?? 'info',
      confirmText: options.confirmText ?? 'Entendi',
      cancelText: options.cancelText ?? 'Cancelar',
      showCancel: options.showCancel ?? false
    });

    return new Promise<boolean>((resolve) => {
      this.resolver = resolve;
    });
  }

  private close(confirmed: boolean): void {
    const resolve = this.resolver;
    this.resolver = null;
    this.stateSignal.set(null);
    resolve?.(confirmed);
  }
}
