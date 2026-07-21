export type ModalVariant = 'success' | 'danger' | 'warning' | 'info';

export interface ModalOptions {
  title: string;
  message: string;
  variant?: ModalVariant;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
}

export interface ModalState {
  title: string;
  message: string;
  variant: ModalVariant;
  confirmText: string;
  cancelText: string;
  showCancel: boolean;
}
