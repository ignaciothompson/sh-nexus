import { Injectable, Type } from '@angular/core';
import { Dialog, DialogRef, DialogConfig } from '@angular/cdk/dialog';

/** Available modal sizes */
export type DialogSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

/** Extended dialog options */
export interface DialogOptions<D = unknown> {
  data?: D;
  size?: DialogSize;
  config?: Partial<DialogConfig<D>>;
}

@Injectable({ providedIn: 'root' })
export class DialogService {
  constructor(private dialog: Dialog) {}

  /**
   * Opens a dialog with the given component and options.
   * @param component The component to render inside the dialog
   * @param options Dialog options including data and size
   * @returns DialogRef for subscribing to close events and getting return values
   */
  open<R = unknown, D = unknown, C = unknown>(
    component: Type<C>,
    options?: DialogOptions<D> | D
  ): DialogRef<R, C> {
    // Support both old signature (just data) and new signature (options object)
    let data: D | undefined;
    let size: DialogSize = 'md';
    let extraConfig: Partial<DialogConfig<D>> | undefined;

    if (options && typeof options === 'object' && ('data' in options || 'size' in options || 'config' in options)) {
      // New options object format
      const opts = options as DialogOptions<D>;
      data = opts.data;
      size = opts.size || 'md';
      extraConfig = opts.config;
    } else {
      // Old format: options is just the data
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
