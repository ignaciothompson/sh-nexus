import { Injectable, Type } from '@angular/core';
import { Dialog, DialogRef, DialogConfig } from '@angular/cdk/dialog';

export type DialogSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface DialogOptions<D = unknown> {
  data?: D;
  size?: DialogSize;
  config?: Partial<DialogConfig<D>>;
}

@Injectable({ providedIn: 'root' })
export class DialogService {
  constructor(private dialog: Dialog) {}

  open<R = unknown, D = unknown, C = unknown>(
    component: Type<C>,
    options?: DialogOptions<D> | D
  ): DialogRef<R, C> {
    let data: D | undefined;
    let size: DialogSize = 'md';
    let extraConfig: Partial<DialogConfig<D>> | undefined;

    if (options && typeof options === 'object' && ('data' in options || 'size' in options || 'config' in options)) {
      const opts = options as DialogOptions<D>;
      data = opts.data;
      size = opts.size || 'md';
      extraConfig = opts.config;
    } else {
      data = options as D | undefined;
    }

    const sizeClass = `sh-modal-${size}`;

    const dialogConfig: DialogConfig<D, DialogRef<R, C>> = {
      data,
      backdropClass: 'cdk-overlay-dark-backdrop',
      panelClass: ['sh-modal', sizeClass],
      ...extraConfig as DialogConfig<D, DialogRef<R, C>>
    };

    return this.dialog.open(component, dialogConfig) as DialogRef<R, C>;
  }
}
